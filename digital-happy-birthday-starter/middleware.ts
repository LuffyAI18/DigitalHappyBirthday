import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------
// Applies CSP and security headers to all responses.
// Protects /admin routes with ADMIN_TOKEN.
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    // --- Security Headers ---
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
    );

    // Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.buymeacoffee.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://www.buymeacoffee.com",
        "frame-src 'self' https://www.buymeacoffee.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self' https://www.buymeacoffee.com",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);

    // --- Admin route protection ---
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        const token =
            request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.nextUrl.searchParams.get('token') ||
            request.cookies.get('admin_token')?.value;

        if (token !== process.env.ADMIN_TOKEN) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            // Redirect to home for page routes
            const loginUrl = new URL('/', request.url);
            loginUrl.searchParams.set('admin', 'required');
            return NextResponse.redirect(loginUrl);
        }
    }

    return response;
}

export const config = {
    matcher: [
        // Match everything except static files and _next
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
