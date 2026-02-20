import { NextRequest, NextResponse } from 'next/server';
import { listCards, getPaymentAuditLog } from '@/lib/db';

// ---------------------------------------------------------------------------
// Admin API: GET /api/admin/cards
// ---------------------------------------------------------------------------
// Lists recent cards and payment audit log. Protected by ADMIN_TOKEN.
// ---------------------------------------------------------------------------

function verifyAdmin(request: NextRequest): boolean {
    const token =
        request.headers.get('authorization')?.replace('Bearer ', '') ||
        request.nextUrl.searchParams.get('token');
    return token === process.env.ADMIN_TOKEN;
}

export async function GET(request: NextRequest) {
    if (!verifyAdmin(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const limit = parseInt(
            request.nextUrl.searchParams.get('limit') || '50'
        );
        const offset = parseInt(
            request.nextUrl.searchParams.get('offset') || '0'
        );

        const cards = listCards(limit, offset);
        const payments = getPaymentAuditLog(limit);

        return NextResponse.json({
            cards: cards.map((c) => ({
                ...c,
                card_json: JSON.parse(c.card_json),
            })),
            payments,
            total: cards.length,
        });
    } catch (error) {
        console.error('Admin list error:', error);
        return NextResponse.json(
            { error: 'Failed to list cards' },
            { status: 500 }
        );
    }
}
