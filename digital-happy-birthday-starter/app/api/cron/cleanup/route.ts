import { NextResponse } from 'next/server';
import { purgeExpiredData } from '@/lib/db';

// ---------------------------------------------------------------------------
// GET /api/cron/cleanup — Purge data older than 7 days
// ---------------------------------------------------------------------------
// Runs automatically via Vercel Cron (configured in vercel.json).
// Vercel sends: Authorization: Bearer <CRON_SECRET>
//
// To set up:
//   1. Add CRON_SECRET env var in Vercel Dashboard → Settings → Environment Variables
//   2. Deploy — the cron runs daily at 3 AM UTC automatically
//
// Manual trigger: GET /api/cron/cleanup?token=YOUR_CRON_SECRET
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;

    if (!secret) {
        return NextResponse.json(
            { error: 'CRON_SECRET not configured. Add it to your Vercel environment variables.' },
            { status: 500 }
        );
    }

    // Check Vercel cron auth header OR manual query param token
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryToken = searchParams.get('token');

    const isAuthorized =
        authHeader === `Bearer ${secret}` || queryToken === secret;

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await purgeExpiredData();
        return NextResponse.json({
            ok: true,
            message: 'Cleanup completed — rows older than 7 days deleted',
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Cron cleanup error:', err);
        return NextResponse.json(
            { error: 'Cleanup failed', details: String(err) },
            { status: 500 }
        );
    }
}

