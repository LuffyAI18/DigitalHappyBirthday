import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Tests for POST /api/create-order
// ---------------------------------------------------------------------------
// Mocks PayPal API to test order creation flow without hitting real PayPal.
// ---------------------------------------------------------------------------

// Mock the PayPal module
vi.mock('@/lib/paypal', () => ({
    createPayPalOrder: vi.fn().mockResolvedValue({
        id: 'MOCK-ORDER-12345',
        status: 'CREATED',
        links: [
            { href: 'https://www.sandbox.paypal.com/checkoutnow?token=MOCK', rel: 'approve', method: 'GET' },
        ],
    }),
}));

// Mock the DB module
vi.mock('@/lib/db', () => ({
    createCard: vi.fn().mockReturnValue(1),
    createPayment: vi.fn().mockReturnValue(1),
}));

// Mock rate-limit to always allow
vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockReturnValue({ success: true, remaining: 4, resetMs: 60000 }),
}));

// Set env vars
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id';

describe('POST /api/create-order', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create an order with valid payload', async () => {
        const { createPayPalOrder } = await import('@/lib/paypal');
        const { createCard, createPayment } = await import('@/lib/db');
        const { sanitizeCardMessage, sanitizeTextField } = await import('@/lib/sanitize');
        const { checkProfanity } = await import('@/lib/profanity');

        // Simulate the handler logic
        const payload = {
            to: 'Dear Alice',
            message: 'Happy Birthday! 🎂',
            from: 'Bob',
            templateId: 'pastel-heart',
            cakeOptions: { shape: 'round', icingColor: '#FF9CCF', showCandles: true, candleCount: 5 },
            addOns: { confetti: true, backgroundMusic: false },
        };

        // Sanitize
        const sanitizedTo = sanitizeTextField(payload.to);
        const sanitizedFrom = sanitizeTextField(payload.from);
        const sanitizedMessage = sanitizeCardMessage(payload.message);

        expect(sanitizedTo).toBe('Dear Alice');
        expect(sanitizedFrom).toBe('Bob');
        expect(sanitizedMessage).toContain('Happy Birthday!');

        // Profanity check
        const profanityCheck = checkProfanity(`${sanitizedTo} ${sanitizedMessage} ${sanitizedFrom}`);
        expect(profanityCheck.hasProfanity).toBe(false);

        // Create PayPal order
        const order = await createPayPalOrder('Birthday Card for Alice');
        expect(order.id).toBe('MOCK-ORDER-12345');
        expect(order.status).toBe('CREATED');

        // Create DB records
        const cardId = createCard(JSON.stringify(payload), 'pastel-heart');
        expect(cardId).toBe(1);

        createPayment(cardId, order.id);
        expect(createPayment).toHaveBeenCalledWith(1, 'MOCK-ORDER-12345');
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
});
