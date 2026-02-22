// ---------------------------------------------------------------------------
// Client-Side Currency Detection
// ---------------------------------------------------------------------------
// Uses IP-based geo detection (via free ipapi.co API) as primary method,
// falls back to navigator.language and timezone.
//
// Supported currencies: INR (default), USD, EUR
// ---------------------------------------------------------------------------

export type SupportedCurrency = 'INR' | 'USD' | 'EUR';

export interface DonationOption {
  amount: number;
  label: string;
}

export const DONATION_AMOUNTS: Record<SupportedCurrency, DonationOption[]> = {
  INR: [
    { amount: 19, label: 'Donate ₹19' },
    { amount: 29, label: 'Donate ₹29' },
    { amount: 49, label: 'Donate ₹49' },
  ],
  USD: [
    { amount: 1, label: 'Donate $1' },
    { amount: 3, label: 'Donate $3' },
    { amount: 5, label: 'Donate $5' },
  ],
  EUR: [
    { amount: 1, label: 'Donate €1' },
    { amount: 3, label: 'Donate €3' },
    { amount: 5, label: 'Donate €5' },
  ],
};

export function getCurrencySymbol(currency: SupportedCurrency): string {
  switch (currency) {
    case 'INR':
      return '₹';
    case 'EUR':
      return '€';
    case 'USD':
    default:
      return '$';
  }
}

// Country codes that use EUR
const EUR_COUNTRIES = new Set([
  'DE', 'FR', 'ES', 'NL', 'IT', 'PT', 'AT', 'BE', 'FI', 'IE', 'GR',
  'SK', 'SI', 'EE', 'LV', 'LT', 'MT', 'CY', 'LU', 'HR',
]);

// Map country code → currency
function countryToCurrency(countryCode: string): SupportedCurrency {
  if (countryCode === 'IN') return 'INR';
  if (countryCode === 'US') return 'USD';
  if (EUR_COUNTRIES.has(countryCode)) return 'EUR';
  return 'USD'; // Default to USD for international users
}

// Map of common timezones to currencies (fallback)
const TIMEZONE_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  'Asia/Kolkata': 'INR',
  'Asia/Calcutta': 'INR',
  'Asia/Mumbai': 'INR',
  'America/New_York': 'USD',
  'America/Chicago': 'USD',
  'America/Denver': 'USD',
  'America/Los_Angeles': 'USD',
  'America/Phoenix': 'USD',
  'America/Anchorage': 'USD',
  'Pacific/Honolulu': 'USD',
  'Europe/Berlin': 'EUR',
  'Europe/Paris': 'EUR',
  'Europe/Madrid': 'EUR',
  'Europe/Rome': 'EUR',
  'Europe/Amsterdam': 'EUR',
  'Europe/Brussels': 'EUR',
  'Europe/Vienna': 'EUR',
  'Europe/Helsinki': 'EUR',
  'Europe/Lisbon': 'EUR',
  'Europe/Dublin': 'EUR',
  'Europe/Athens': 'EUR',
};

/**
 * Detect currency via IP-based geolocation (network-based).
 * Uses the free ipapi.co API — no API key required.
 * Returns null if detection fails (caller should use fallback).
 */
export async function detectCurrencyByIP(): Promise<SupportedCurrency | null> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000), // 3s timeout
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.country_code) {
      return countryToCurrency(data.country_code);
    }
    // ipapi.co also returns currency directly
    if (data.currency === 'INR') return 'INR';
    if (data.currency === 'USD') return 'USD';
    if (data.currency === 'EUR') return 'EUR';
    return null;
  } catch {
    return null;
  }
}

/**
 * Fallback: detect currency from browser locale and timezone.
 */
export function detectCurrencyFromBrowser(): SupportedCurrency {
  if (typeof navigator === 'undefined') return 'INR';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lang: string = navigator.language || (navigator as any).userLanguage || 'en-IN';

  // 1. Check language subtag for country hints
  if (lang.includes('-IN') || lang.toLowerCase() === 'hi' || lang.toLowerCase().startsWith('hi-')) {
    return 'INR';
  }
  if (lang.includes('-US') || lang === 'en-US') {
    return 'USD';
  }
  // Common EUR language subtags
  if (
    lang.includes('-DE') ||
    lang.includes('-FR') ||
    lang.includes('-ES') ||
    lang.includes('-NL') ||
    lang.includes('-IT') ||
    lang.includes('-PT') ||
    lang.includes('-AT') ||
    lang.includes('-BE') ||
    lang.includes('-FI') ||
    lang.includes('-IE') ||
    lang.includes('-GR')
  ) {
    return 'EUR';
  }

  // 2. Try timezone detection as fallback
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_CURRENCY_MAP[tz]) {
      return TIMEZONE_CURRENCY_MAP[tz];
    }
  } catch {
    // Intl not available — fall through
  }

  // 3. Default to USD for international users
  return 'USD';
}

/**
 * Legacy sync function — returns browser-based detection immediately.
 * Use detectCurrencyAsync() for IP-based detection.
 */
export function detectCurrency(): SupportedCurrency {
  return detectCurrencyFromBrowser();
}

/**
 * Async currency detection — tries IP geolocation first, then browser fallback.
 * This gives the most accurate result based on the user's actual network location.
 */
export async function detectCurrencyAsync(): Promise<SupportedCurrency> {
  // Try IP-based detection first (network location)
  const ipCurrency = await detectCurrencyByIP();
  if (ipCurrency) return ipCurrency;

  // Fallback to browser locale
  return detectCurrencyFromBrowser();
}
