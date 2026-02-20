import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paypal';
import {
    getPaymentByOrderId,
    markPaymentCompleted,
    assignSlug,
} from '@/lib/db';
import { generateUniqueSlug } from '@/lib/slug';

// ---------------------------------------------------------------------------
// POST /api/paypal-webhook
// ---------------------------------------------------------------------------
// Verifies PayPal webhook signature and processes payment events.
// Implements idempotency — ignores already-processed orders.
//
// PayPal webhook events handled:
//   CHECKOUT.ORDER.APPROVED
//   PAYMENT.CAPTURE.COMPLETED
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();

        // --- Extract PayPal headers ---
        const headers: Record<string, string> = {};
        const requiredHeaders = [
            'paypal-auth-algo',
            'paypal-cert-url',
            'paypal-transmission-id',
            'paypal-transmission-sig',
            'paypal-transmission-time',
        ];

        for (const header of requiredHeaders) {
            const value = request.headers.get(header);
            if (!value) {
                console.error(`Missing PayPal header: ${header}`);
                return NextResponse.json(
                    { error: `Missing required header: ${header}` },
                    { status: 400 }
                );
            }
            headers[header] = value;
        }

        // --- Verify webhook signature ---
        const verification = await verifyWebhookSignature(headers, body);

        if (verification.verification_status !== 'SUCCESS') {
            console.error('Webhook signature verification failed');
            return NextResponse.json(
                { error: 'Webhook signature verification failed' },
                { status: 401 }
            );
        }

        // --- Process the event ---
        const event = JSON.parse(body);
        const eventType = event.event_type;

        console.log(`PayPal webhook event: ${eventType}`);

        if (
            eventType === 'PAYMENT.CAPTURE.COMPLETED' ||
            eventType === 'CHECKOUT.ORDER.APPROVED'
        ) {
            // Extract order ID from the event
            let orderId: string | null = null;

            if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
                // The supplementary_data contains the order ID
                orderId =
                    event.resource?.supplementary_data?.related_ids?.order_id ||
                    event.resource?.id;
            } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
                orderId = event.resource?.id;
            }

            if (!orderId) {
                console.error('Could not extract order ID from webhook event');
                return NextResponse.json(
                    { error: 'Could not extract order ID' },
                    { status: 400 }
                );
            }

            // --- Idempotency check ---
            const existingPayment = getPaymentByOrderId(orderId);
            if (!existingPayment) {
                console.warn(`Payment not found for order: ${orderId}`);
                // Still return 200 to prevent PayPal retries
                return NextResponse.json({ status: 'ignored', reason: 'unknown order' });
            }

            if (existingPayment.status === 'completed') {
                console.log(`Order ${orderId} already processed (idempotent)`);
                return NextResponse.json({ status: 'already_processed' });
            }

            // --- Mark payment as completed ---
            const payerEmail = event.resource?.payer?.email_address || null;
            markPaymentCompleted(orderId, payerEmail, JSON.stringify(event));

            // --- Generate slug if not already assigned ---
            const db = await import('@/lib/db');
            const card = db.getCardById(existingPayment.card_id);
            if (card && !card.slug) {
                const slug = generateUniqueSlug();
                assignSlug(existingPayment.card_id, slug);
                console.log(`Card ${existingPayment.card_id} assigned slug: ${slug}`);
            }

            return NextResponse.json({ status: 'processed' });
        }

        // Unhandled event type — acknowledge receipt
        return NextResponse.json({ status: 'ignored', eventType });
    } catch (error) {
        console.error('Webhook error:', error);
        // Return 200 to prevent PayPal retries for processing errors
        return NextResponse.json(
            { status: 'error', message: 'Internal processing error' },
            { status: 200 }
        );
    }
}
