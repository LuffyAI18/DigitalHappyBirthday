import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify admin token from request headers, query params, or cookies.
 * Use this in admin API routes and pages instead of middleware/proxy.
 *
 * @returns NextResponse with 401 if unauthorized, or null if authorized
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
    const token =
        request.headers.get('authorization')?.replace('Bearer ', '') ||
        request.nextUrl.searchParams.get('token') ||
        request.cookies.get('admin_token')?.value;

    if (token !== process.env.ADMIN_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return null; // Authorized — continue
}
