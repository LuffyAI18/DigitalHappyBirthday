import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize native Node modules that can't be bundled
  serverExternalPackages: ['better-sqlite3'],

  // Security headers (moved from middleware/proxy for Vercel compatibility)
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
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
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
