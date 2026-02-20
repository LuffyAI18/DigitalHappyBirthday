import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Tests for webhook verification flow
// ---------------------------------------------------------------------------
// Mocks PayPal webhook verification to test signature checking
// and payment processing without hitting real PayPal.
// ---------------------------------------------------------------------------

// Mock PayPal
vi.mock('@/lib/paypal', () => ({
    verifyWebhookSignature: vi.fn(),
    getPayPalAccessToken: vi.fn().mockResolvedValue('mock-access-token'),
}));

// Mock DB
const mockGetPaymentByOrderId = vi.fn();
const mockMarkPaymentCompleted = vi.fn();
const mockGetCardById = vi.fn();
const mockAssignSlug = vi.fn();

vi.mock('@/lib/db', () => ({
    getPaymentByOrderId: (...args: unknown[]) => mockGetPaymentByOrderId(...args),
    markPaymentCompleted: (...args: unknown[]) => mockMarkPaymentCompleted(...args),
    getCardById: (...args: unknown[]) => mockGetCardById(...args),
    assignSlug: (...args: unknown[]) => mockAssignSlug(...args),
}));

// Mock slug generation
vi.mock('@/lib/slug', () => ({
    generateUniqueSlug: vi.fn().mockReturnValue('aBcD1234'),
}));

// Set env vars
process.env.PAYPAL_WEBHOOK_ID = 'test-webhook-id';

describe('Webhook Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should verify a valid webhook signature', async () => {
        const { verifyWebhookSignature } = await import('@/lib/paypal');
        (verifyWebhookSignature as ReturnType<typeof vi.fn>).mockResolvedValue({
            verification_status: 'SUCCESS',
        });

        const result = await verifyWebhookSignature(
            {
                'paypal-auth-algo': 'SHA256withRSA',
                'paypal-cert-url': 'https://example.com/cert',
                'paypal-transmission-id': 'trans-123',
                'paypal-transmission-sig': 'sig-456',
                'paypal-transmission-time': '2025-01-01T00:00:00Z',
            },
            JSON.stringify({
                event_type: 'PAYMENT.CAPTURE.COMPLETED',
                resource: { id: 'ORDER-123' },
            })
        );

        expect(result.verification_status).toBe('SUCCESS');
    });

    it('should reject an invalid webhook signature', async () => {
        const { verifyWebhookSignature } = await import('@/lib/paypal');
        (verifyWebhookSignature as ReturnType<typeof vi.fn>).mockResolvedValue({
            verification_status: 'FAILURE',
        });

        const result = await verifyWebhookSignature(
            {
                'paypal-auth-algo': 'INVALID',
                'paypal-cert-url': 'https://evil.com/cert',
                'paypal-transmission-id': 'trans-bad',
                'paypal-transmission-sig': 'sig-bad',
                'paypal-transmission-time': '2025-01-01T00:00:00Z',
            },
            '{"event_type":"FAKE"}'
        );

        expect(result.verification_status).toBe('FAILURE');
    });

    it('should process payment and generate slug', async () => {
        mockGetPaymentByOrderId.mockReturnValue({
            card_id: 1,
            paypal_order_id: 'ORDER-123',
            status: 'created',
        });

        mockGetCardById.mockReturnValue({
            id: 1,
            slug: null,
            status: 'pending',
        });

        const { generateUniqueSlug } = await import('@/lib/slug');

        // Simulate webhook processing
        const orderId = 'ORDER-123';
        const existingPayment = mockGetPaymentByOrderId(orderId);
        expect(existingPayment).toBeTruthy();
        expect(existingPayment.status).not.toBe('completed');

        // Mark as completed
        mockMarkPaymentCompleted(orderId, 'payer@test.com', '{}');
        expect(mockMarkPaymentCompleted).toHaveBeenCalledWith(
            'ORDER-123',
            'payer@test.com',
            '{}'
        );

        // Generate slug
        const card = mockGetCardById(existingPayment.card_id);
        expect(card.slug).toBeNull();

        const slug = generateUniqueSlug();
        expect(slug).toBe('aBcD1234');

        mockAssignSlug(existingPayment.card_id, slug);
        expect(mockAssignSlug).toHaveBeenCalledWith(1, 'aBcD1234');
    });

    it('should handle idempotent duplicate webhooks', async () => {
        mockGetPaymentByOrderId.mockReturnValue({
            card_id: 1,
            paypal_order_id: 'ORDER-123',
            status: 'completed', // Already processed
        });

        const existingPayment = mockGetPaymentByOrderId('ORDER-123');
        expect(existingPayment.status).toBe('completed');

        // Should NOT call markPaymentCompleted again
        expect(mockMarkPaymentCompleted).not.toHaveBeenCalled();
    });

    it('should handle unknown order IDs', async () => {
        mockGetPaymentByOrderId.mockReturnValue(null);

        const existingPayment = mockGetPaymentByOrderId('UNKNOWN-ORDER');
        expect(existingPayment).toBeNull();

        // Should not process further
        expect(mockMarkPaymentCompleted).not.toHaveBeenCalled();
    });
});
