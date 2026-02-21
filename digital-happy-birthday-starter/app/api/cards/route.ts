import { NextRequest, NextResponse } from 'next/server';
import { createCardWithSlug } from '@/lib/db';
import { sanitizeCardMessage, sanitizeTextField } from '@/lib/sanitize';
import { checkProfanity } from '@/lib/profanity';
import { rateLimit } from '@/lib/rate-limit';
import { generateUniqueSlug } from '@/lib/slug';

// ---------------------------------------------------------------------------
// POST /api/cards
// ---------------------------------------------------------------------------
// Free card creation (no payment required):
// 1. Rate-limits by IP
// 2. Validates and sanitizes card payload
// 3. Checks for profanity (flags but still allows creation)
// 4. Generates a unique 8-char base62 slug
// 5. Persists card to SQLite with status 'active'
// 6. Returns { slug } — client redirects to /card/[slug]/donate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
    try {
        // --- Rate limiting ---
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const rateLimitResult = rateLimit(ip, 5, 60 * 1000); // 5 cards per minute
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

        // --- Generate unique slug ---
        const slug = await generateUniqueSlug();

        // --- Save card to DB with slug (active status, no payment needed) ---
        await createCardWithSlug(
            JSON.stringify(cardPayload),
            templateId,
            slug
        );

        return NextResponse.json({ slug });
    } catch (error) {
        console.error('Create card error:', error);
        return NextResponse.json(
            { error: 'Failed to create card. Please try again.' },
            { status: 500 }
        );
    }
}
