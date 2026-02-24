import { NextRequest, NextResponse } from 'next/server';
import { getCardBySlug } from '@/lib/db';

// ---------------------------------------------------------------------------
// GET /api/card/[slug]
// ---------------------------------------------------------------------------
// Fetches card JSON by slug for SSR and client rendering.
// ---------------------------------------------------------------------------

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        if (!slug || slug.length < 4) {
            return NextResponse.json(
                { error: 'Invalid slug' },
                { status: 400 }
            );
        }

        const card = await getCardBySlug(slug);

        if (!card) {
            return NextResponse.json(
                { error: 'Card not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            slug: card.slug,
            templateId: card.template_id,
            card: JSON.parse(card.card_json),
            status: card.status,
            createdAt: card.created_at,
            expiresAt: card.expires_at,
        });
    } catch (error) {
        console.error('Get card error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch card' },
            { status: 500 }
        );
    }
}
