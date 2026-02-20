import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import {
    getPaymentByOrderId,
    markPaymentCompleted,
    assignSlug,
} from '@/lib/db';
import { generateUniqueSlug } from '@/lib/slug';

// ---------------------------------------------------------------------------
// POST /api/capture-order
// ---------------------------------------------------------------------------
// Called after client-side PayPal approval. Captures the payment and
// generates a unique slug for the card page.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Missing orderId' },
                { status: 400 }
            );
        }

        // --- Check idempotency ---
        const existingPayment = getPaymentByOrderId(orderId);
        if (!existingPayment) {
            return NextResponse.json(
                { error: 'Payment record not found. Create order first.' },
                { status: 404 }
            );
        }

        if (existingPayment.status === 'completed') {
            // Already processed — return existing slug
            // Find the card
            const db = await import('@/lib/db');
            const card = db.getCardById(existingPayment.card_id);
            return NextResponse.json({
                slug: card?.slug,
                alreadyProcessed: true,
            });
        }

        // --- Capture the PayPal order ---
        const captureResult = await capturePayPalOrder(orderId);

        if (captureResult.status !== 'COMPLETED') {
            return NextResponse.json(
                { error: 'Payment capture failed', status: captureResult.status },
                { status: 400 }
            );
        }

        // --- Mark payment as completed ---
        const payerEmail =
            captureResult.payer?.email_address || null;
        markPaymentCompleted(orderId, payerEmail, JSON.stringify(captureResult));

        // --- Generate unique slug and activate card ---
        const slug = generateUniqueSlug();
        assignSlug(existingPayment.card_id, slug);

        return NextResponse.json({
            slug,
            message: 'Payment successful! Your card is ready.',
        });
    } catch (error) {
        console.error('Capture order error:', error);
        return NextResponse.json(
            { error: 'Failed to capture payment. Please contact support.' },
            { status: 500 }
        );
    }
}
