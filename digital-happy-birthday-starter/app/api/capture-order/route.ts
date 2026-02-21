import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// FEATURE_FLAG_PAYPAL — DISABLED
// ---------------------------------------------------------------------------
// This endpoint was part of the original PayPal ₹19 checkout flow.
// It has been replaced by the free card creation flow (POST /api/cards).
//
// To re-enable PayPal payments:
// 1. Set FEATURE_FLAG_PAYPAL=true in your .env
// 2. Uncomment the capture logic below
// 3. Ensure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set
// ---------------------------------------------------------------------------

export async function POST() {
    return NextResponse.json(
        {
            error: 'PayPal capture is disabled. Cards are now created free via POST /api/cards.',
            migration: 'This endpoint has been replaced by POST /api/cards',
        },
        { status: 410 } // HTTP 410 Gone
    );
}

/* --- Original PayPal capture-order code (preserved for re-enablement) ---
import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { getPaymentByOrderId, markPaymentCompleted, assignSlug } from '@/lib/db';
import { generateUniqueSlug } from '@/lib/slug';

export async function POST(request: NextRequest) {
    // ... original PayPal capture logic ...
    // See git history for full implementation
}
--- */
