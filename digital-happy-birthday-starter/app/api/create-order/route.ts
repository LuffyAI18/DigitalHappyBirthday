import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';
import { createCard, createPayment } from '@/lib/db';
import { sanitizeCardMessage, sanitizeTextField } from '@/lib/sanitize';
import { checkProfanity } from '@/lib/profanity';
import { rateLimit } from '@/lib/rate-limit';

// ---------------------------------------------------------------------------
// POST /api/create-order
// ---------------------------------------------------------------------------
// 1. Rate-limits by IP
// 2. Validates and sanitizes card payload
// 3. Checks for profanity
// 4. Creates PayPal order (INR 19.00)
// 5. Stores pending card + payment in SQLite
// 6. Returns orderId for client PayPal SDK
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
    try {
        // --- Rate limiting ---
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const rateLimitResult = rateLimit(ip, 5, 60 * 1000); // 5 orders per minute
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a moment and try again.' },
                { status: 429 }
            );
        }

        // --- Parse and validate payload ---
        const body = await request.json();
        const { to, message, from, templateId, cakeOptions, addOns, colorPalette, fontChoice } = body;

        if (!to || !message || !from || !templateId) {
            return NextResponse.json(
                { error: 'Missing required fields: to, message, from, templateId' },
                { status: 400 }
            );
        }

        // --- Sanitize ---
        const sanitizedTo = sanitizeTextField(to);
        const sanitizedFrom = sanitizeTextField(from);
        const sanitizedMessage = sanitizeCardMessage(message);

        // --- Profanity check ---
        const profanityCheck = checkProfanity(
            `${sanitizedTo} ${sanitizedMessage} ${sanitizedFrom}`
        );

        const cardPayload = {
            to: sanitizedTo,
            message: sanitizedMessage,
            from: sanitizedFrom,
            templateId,
            cakeOptions: cakeOptions || {},
            addOns: addOns || {},
            colorPalette: colorPalette || null,
            fontChoice: fontChoice || null,
            flagged: profanityCheck.hasProfanity,
            flaggedWords: profanityCheck.flaggedWords,
            createdAt: new Date().toISOString(),
        };

        // --- Save card to DB (pending status) ---
        const cardId = createCard(
            JSON.stringify(cardPayload),
            templateId
        );

        // --- Create PayPal order ---
        const order = await createPayPalOrder(
            `Birthday Card for ${sanitizedTo}`
        );

        // --- Save payment record ---
        createPayment(cardId, order.id);

        return NextResponse.json({
            orderId: order.id,
            cardId,
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: 'Failed to create order. Please try again.' },
            { status: 500 }
        );
    }
}
