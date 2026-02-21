import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// FEATURE_FLAG_PAYPAL — DISABLED
// ---------------------------------------------------------------------------
// This endpoint was part of the original PayPal webhook verification flow.
// It has been replaced by the free card creation flow (POST /api/cards)
// and donation tracking (POST /api/donations/track).
//
// To re-enable PayPal webhooks:
// 1. Set FEATURE_FLAG_PAYPAL=true in your .env
// 2. Uncomment the webhook logic below
// 3. Ensure PAYPAL_WEBHOOK_ID is set
// ---------------------------------------------------------------------------

export async function POST() {
    return NextResponse.json(
        {
            error: 'PayPal webhooks are disabled.',
            migration: 'Payment flow replaced by free card creation.',
        },
        { status: 410 }
    );
}

/* --- Original PayPal webhook code (preserved for re-enablement) ---
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paypal';
import { getPaymentByOrderId, markPaymentCompleted, assignSlug, getCardById } from '@/lib/db';
import { generateUniqueSlug } from '@/lib/slug';

export async function POST(request: NextRequest) {
    // ... original webhook verification and processing ...
    // See git history for full implementation
}
--- */
