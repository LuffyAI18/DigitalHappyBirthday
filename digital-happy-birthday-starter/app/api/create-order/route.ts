import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// FEATURE_FLAG_PAYPAL — DISABLED
// ---------------------------------------------------------------------------
// This endpoint was part of the original PayPal ₹19 checkout flow.
// It has been replaced by POST /api/cards (free card creation).
//
// To re-enable PayPal payments:
// 1. Set FEATURE_FLAG_PAYPAL=true in your .env
// 2. Uncomment the PayPal integration code below
// 3. Ensure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set
// ---------------------------------------------------------------------------

export async function POST() {
    return NextResponse.json(
        {
            error: 'PayPal checkout is disabled. Use POST /api/cards for free card creation.',
            migration: 'This endpoint has been replaced by POST /api/cards',
        },
        { status: 410 } // HTTP 410 Gone
    );
}

/* --- Original PayPal create-order code (preserved for re-enablement) ---
import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';
import { createCard, createPayment } from '@/lib/db';
import { sanitizeCardMessage, sanitizeTextField } from '@/lib/sanitize';
import { checkProfanity } from '@/lib/profanity';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    // ... original PayPal order creation logic ...
    // See git history for full implementation
}
--- */
