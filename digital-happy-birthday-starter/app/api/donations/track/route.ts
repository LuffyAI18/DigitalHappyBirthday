import { NextRequest, NextResponse } from 'next/server';
import { trackDonationClick } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// POST /api/donations/track
// ---------------------------------------------------------------------------
// Logs anonymous donation button clicks for analytics.
// No financial data is processed or stored here — donations are handled
// entirely by the external provider (Buy Me a Coffee / PayPal / Stripe).
//
// Stored data: slug, provider, currency, amount, hashed IP, user agent.
// ---------------------------------------------------------------------------

// Server-side salt for IP anonymization — regenerated on restart
const IP_SALT = crypto.randomBytes(16).toString('hex');

function hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip + IP_SALT).digest('hex').slice(0, 16);
}

export async function POST(request: NextRequest) {
    try {
        // --- Rate limiting (generous, since this is just analytics) ---
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const rateLimitResult = rateLimit(`donate-${ip}`, 30, 60 * 1000);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        // --- Parse body ---
        const body = await request.json();
        const { slug, currency, amount, provider } = body;

        if (!slug || !currency || !amount || !provider) {
            return NextResponse.json(
                { error: 'Missing required fields: slug, currency, amount, provider' },
                { status: 400 }
            );
        }

        // Validate provider
        const allowedProviders = ['bmac', 'paypal', 'stripe'];
        if (!allowedProviders.includes(provider)) {
            return NextResponse.json(
                { error: 'Invalid provider' },
                { status: 400 }
            );
        }

        // --- Anonymize IP ---
        const ipHash = hashIp(ip);
        const userAgent = request.headers.get('user-agent')?.slice(0, 200) || null;

        // --- Track click ---
        trackDonationClick(
            slug,
            provider,
            currency,
            String(amount),
            ipHash,
            userAgent || undefined
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Donation track error:', error);
        return NextResponse.json(
            { error: 'Failed to track donation click' },
            { status: 500 }
        );
    }
}
