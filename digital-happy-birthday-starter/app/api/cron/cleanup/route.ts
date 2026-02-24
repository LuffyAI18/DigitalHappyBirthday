import { NextRequest, NextResponse } from 'next/server';
import { purgeExpiredData } from '@/lib/db';

// ---------------------------------------------------------------------------
// GET & POST /api/cron/cleanup
// ---------------------------------------------------------------------------
// Deletes card data older than 7 days (based on expires_at).
// Protected by CRON_SECRET via:
//   - ?token=SECRET query param (manual trigger)
//   - Authorization: Bearer SECRET header (Vercel Cron / GitHub Actions)
//
// Vercel Cron: configured in vercel.json → runs daily at 03:00 UTC
// GitHub Actions: .github/workflows/cleanup.yml → runs daily
// ---------------------------------------------------------------------------

function isAuthorized(request: NextRequest): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;

    // Check query parameter
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (token === secret) return true;

    // Check Authorization header (Vercel Cron uses this)
    const authHeader = request.headers.get('authorization');
    if (authHeader === `Bearer ${secret}`) return true;

    return false;
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json(
            { error: 'Unauthorized — provide ?token= or Authorization: Bearer header' },
            { status: 401 }
        );
    }

    try {
        const result = await purgeExpiredData();
        return NextResponse.json({
            ok: true,
            message: 'Cleanup completed — expired cards soft-deleted',
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Cleanup error:', err);
        return NextResponse.json(
            { error: 'Cleanup failed', details: String(err) },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    // POST method for GitHub Actions compatibility
    return GET(request);
}
