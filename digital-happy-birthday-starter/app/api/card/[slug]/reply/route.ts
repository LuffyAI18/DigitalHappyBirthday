import { NextRequest, NextResponse } from 'next/server';
import { getCardBySlug, addReply } from '@/lib/db';
import { sanitizeTextField } from '@/lib/sanitize';
import { checkProfanity } from '@/lib/profanity';
import { rateLimit } from '@/lib/rate-limit';

// ---------------------------------------------------------------------------
// POST /api/card/[slug]/reply
// ---------------------------------------------------------------------------
// Saves a short typed reply from the card recipient.
// ---------------------------------------------------------------------------

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // --- Rate limiting ---
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const rateLimitResult = rateLimit(`reply-${ip}`, 10, 60 * 1000);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many replies. Please wait a moment.' },
                { status: 429 }
            );
        }

        const card = await getCardBySlug(slug);
        if (!card) {
            return NextResponse.json(
                { error: 'Card not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { message, sender } = body;

        if (!message || message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const sanitizedMessage = sanitizeTextField(message);
        const sanitizedSender = sender ? sanitizeTextField(sender) : 'Anonymous';

        // Check profanity
        const profanityCheck = checkProfanity(
            `${sanitizedMessage} ${sanitizedSender}`
        );

        const replyId = await addReply(
            card.id,
            profanityCheck.hasProfanity
                ? profanityCheck.filtered
                : sanitizedMessage,
            sanitizedSender
        );

        return NextResponse.json({
            id: replyId,
            message: 'Reply saved!',
        });
    } catch (error) {
        console.error('Reply error:', error);
        return NextResponse.json(
            { error: 'Failed to save reply' },
            { status: 500 }
        );
    }
}
