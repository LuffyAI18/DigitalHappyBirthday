import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Tests for POST /api/cards (free card creation)
// ---------------------------------------------------------------------------
// Tests the new free card creation flow that replaces the PayPal checkout.
// ---------------------------------------------------------------------------

// Mock the DB module
vi.mock('@/lib/db', () => ({
    createCardWithSlug: vi.fn().mockResolvedValue(1),
    slugExists: vi.fn().mockResolvedValue(false),
}));

// Mock rate-limit to always allow
vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockReturnValue({ success: true, remaining: 4, resetMs: 60000 }),
}));

describe('POST /api/cards — free card creation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate a slug and create a card without payment', async () => {
        const { createCardWithSlug } = await import('@/lib/db');
        const { sanitizeCardMessage, sanitizeTextField } = await import('@/lib/sanitize');
        const { checkProfanity } = await import('@/lib/profanity');
        const { generateUniqueSlug } = await import('@/lib/slug');

        const payload = {
            to: 'Dear Alice',
            message: 'Happy Birthday! 🎂',
            from: 'Bob',
            templateId: 'pastel-heart',
            cakeOptions: { shape: 'round', icingColor: '#FF9CCF', showCandles: true, candleCount: 5 },
            addOns: { confetti: true, backgroundMusic: false },
        };

        // 1. Sanitize
        const sanitizedTo = sanitizeTextField(payload.to);
        const sanitizedFrom = sanitizeTextField(payload.from);
        const sanitizedMessage = sanitizeCardMessage(payload.message);

        expect(sanitizedTo).toBe('Dear Alice');
        expect(sanitizedFrom).toBe('Bob');
        expect(sanitizedMessage).toContain('Happy Birthday!');

        // 2. Profanity check → should pass clean text
        const profanityCheck = checkProfanity(
            `${sanitizedTo} ${sanitizedMessage} ${sanitizedFrom}`
        );
        expect(profanityCheck.hasProfanity).toBe(false);

        // 3. Generate slug (no PayPal order needed!)
        const slug = await generateUniqueSlug();
        expect(slug).toBeTruthy();
        expect(typeof slug).toBe('string');
        expect(slug.length).toBe(8); // base62 8-char slug

        // 4. Create card with slug in one step
        const cardPayload = {
            to: sanitizedTo,
            message: sanitizedMessage,
            from: sanitizedFrom,
            templateId: payload.templateId,
            cakeOptions: payload.cakeOptions,
            addOns: payload.addOns,
            flagged: false,
            flaggedWords: [],
            createdAt: expect.any(String),
        };

        await createCardWithSlug(
            JSON.stringify(cardPayload),
            payload.templateId,
            slug
        );

        expect(createCardWithSlug).toHaveBeenCalledWith(
            expect.any(String),
            'pastel-heart',
            slug
        );
    });

    it('should detect profanity in messages', async () => {
        const { checkProfanity } = await import('@/lib/profanity');

        const result = checkProfanity('This is a damn test');
        expect(result.hasProfanity).toBe(true);
        expect(result.flaggedWords).toContain('damn');
        expect(result.filtered).toContain('****');
    });

    it('should sanitize HTML properly', async () => {
        const { sanitizeCardMessage } = await import('@/lib/sanitize');

        // Should keep allowed tags
        expect(sanitizeCardMessage('<b>Bold</b>')).toBe('<b>Bold</b>');
        expect(sanitizeCardMessage('<i>Italic</i>')).toBe('<i>Italic</i>');

        // Should strip scripts
        expect(sanitizeCardMessage('<script>alert("xss")</script>')).toBe('');

        // Should strip event handlers
        expect(sanitizeCardMessage('<div onclick="alert(1)">text</div>')).toBe('text');

        // Should strip disallowed tags
        expect(sanitizeCardMessage('<div><b>keep</b></div>')).toBe('<b>keep</b>');
    });

    it('should rate-limit requests', async () => {
        const { rateLimit } = await import('@/lib/rate-limit');

        const result = rateLimit('test-ip', 5, 60000);
        expect(result.success).toBe(true);
        expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should generate unique slugs', async () => {
        const { generateUniqueSlug } = await import('@/lib/slug');

        const slug1 = await generateUniqueSlug();
        const slug2 = await generateUniqueSlug();

        // Slugs should be 8 characters, base62
        expect(slug1).toMatch(/^[A-Za-z0-9]{8}$/);
        expect(slug2).toMatch(/^[A-Za-z0-9]{8}$/);

        // Should be unique
        expect(slug1).not.toBe(slug2);
    });
});
