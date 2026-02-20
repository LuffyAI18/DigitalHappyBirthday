import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// GET /api/snapshot/[slug]
// ---------------------------------------------------------------------------
// Placeholder endpoint for PNG snapshot generation.
//
// ⚠️  PRODUCTION IMPLEMENTATION:
// For production, use Puppeteer or Playwright to render the card page
// as a PNG image. This requires additional configuration for serverless
// environments:
//
// 1. Install: npm install puppeteer-core @sparticuz/chromium
//
// 2. Example implementation:
//    const chromium = require('@sparticuz/chromium');
//    const puppeteer = require('puppeteer-core');
//
//    const browser = await puppeteer.launch({
//      args: chromium.args,
//      executablePath: await chromium.executablePath(),
//      headless: 'new',
//    });
//    const page = await browser.newPage();
//    await page.setViewport({ width: 1200, height: 630 });
//    await page.goto(`${BASE_URL}/card/${slug}`, { waitUntil: 'networkidle0' });
//    const screenshot = await page.screenshot({ type: 'png' });
//    await browser.close();
//
// 3. Cache the generated PNG in /storage or S3 for reuse.
//
// 4. For Vercel, you may need to use @vercel/og for simpler OG images,
//    or use an external screenshot service.
// ---------------------------------------------------------------------------

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    // In production, this would return a cached or generated PNG screenshot.
    // For now, return a JSON placeholder with instructions.
    return NextResponse.json(
        {
            message: 'Snapshot generation is not enabled in dev mode.',
            slug,
            instructions: [
                'Install puppeteer-core and @sparticuz/chromium',
                'Implement headless browser screenshot of /card/[slug]',
                'Cache the resulting PNG in /storage or S3',
                'Return the cached image with Content-Type: image/png',
            ],
            alternativeForVercel:
                'Use @vercel/og with React components for simpler OG image generation.',
        },
        { status: 501 }
    );
}
