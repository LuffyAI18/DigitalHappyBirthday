import { NextRequest, NextResponse } from 'next/server';
import { getCardById, deleteCard, flagCard, hardDeleteCard } from '@/lib/db';

// ---------------------------------------------------------------------------
// Admin API: /api/admin/card/[id]
// ---------------------------------------------------------------------------
// GET — view card details with payment audit
// DELETE — soft-delete or hard-delete a card (GDPR compliance)
// PATCH — flag/unflag a card
// ---------------------------------------------------------------------------

function verifyAdmin(request: NextRequest): boolean {
    const token =
        request.headers.get('authorization')?.replace('Bearer ', '') ||
        request.nextUrl.searchParams.get('token');
    return token === process.env.ADMIN_TOKEN;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!verifyAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const cardId = parseInt(id);

    if (isNaN(cardId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const card = await getCardById(cardId);
    if (!card) {
        return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({
        ...card,
        card_json: JSON.parse(card.card_json),
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!verifyAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const cardId = parseInt(id);

    if (isNaN(cardId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const hard = request.nextUrl.searchParams.get('hard') === 'true';

    if (hard) {
        // GDPR: permanently delete all card data including payments and replies
        await hardDeleteCard(cardId);
        return NextResponse.json({
            message: 'Card permanently deleted (GDPR)',
        });
    } else {
        // Soft delete — mark as deleted but retain for audit
        await deleteCard(cardId);
        return NextResponse.json({
            message: 'Card soft-deleted',
        });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!verifyAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const cardId = parseInt(id);

    if (isNaN(cardId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();

    if (body.action === 'flag') {
        await flagCard(cardId);
        return NextResponse.json({ message: 'Card flagged' });
    }

    return NextResponse.json(
        { error: 'Unknown action' },
        { status: 400 }
    );
}
