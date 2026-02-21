// ---------------------------------------------------------------------------
// Client-Side Currency Detection
// ---------------------------------------------------------------------------
// Uses navigator.language and timezone to infer the visitor's region and
// select appropriate donation amounts. No API key required.
//
// Supported currencies: INR, USD, EUR
// Falls back to USD if detection is ambiguous.
// ---------------------------------------------------------------------------

export type SupportedCurrency = 'INR' | 'USD' | 'EUR';

export interface DonationOption {
  amount: number;
  label: string;
}

export const DONATION_AMOUNTS: Record<SupportedCurrency, DonationOption[]> = {
  INR: [
    { amount: 9, label: 'Donate ₹9' },
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

// Map of common timezones to currencies (fallback when language tag is ambiguous)
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
 * Detect the visitor's likely currency based on browser locale and timezone.
 *
 * Priority:
 * 1. navigator.language country subtag (e.g. en-IN → INR)
 * 2. Intl.DateTimeFormat timezone → currency mapping
 * 3. Default: USD
 */
export function detectCurrency(): SupportedCurrency {
  if (typeof navigator === 'undefined') return 'USD';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lang: string = navigator.language || (navigator as any).userLanguage || 'en-US';

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

  // 3. Default
  return 'USD';
}
