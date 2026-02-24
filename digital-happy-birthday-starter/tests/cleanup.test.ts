import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Tests: Cleanup endpoint (purgeExpiredData + deletion audit)
// ---------------------------------------------------------------------------

// Mock db module
const mockPurgeExpiredData = vi.fn();
vi.mock('@/lib/db', () => ({
    purgeExpiredData: (...args: unknown[]) => mockPurgeExpiredData(...args),
}));

// Import the route handler after mocking
const { GET } = await import('@/app/api/cron/cleanup/route');

describe('POST /api/cron/cleanup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = 'test-secret-123';
    });

    it('rejects unauthorized requests', async () => {
        const request = new Request('http://localhost/api/cron/cleanup');
        // @ts-expect-error - NextRequest typing
        const response = await GET(request);
        expect(response.status).toBe(401);
    });

    it('accepts ?token= auth and returns purge results', async () => {
        mockPurgeExpiredData.mockResolvedValueOnce({
            cards_deleted: 3,
            replies_deleted: 0,
            payments_deleted: 1,
            donation_clicks_deleted: 5,
        });

        const request = new Request(
            'http://localhost/api/cron/cleanup?token=test-secret-123'
        );
        // @ts-expect-error - NextRequest typing
        const response = await GET(request);
        expect(response.status).toBe(200);

        const json = await response.json();
        expect(json.ok).toBe(true);
        expect(json.cards_deleted).toBe(3);
        expect(json.donation_clicks_deleted).toBe(5);
        expect(json.timestamp).toBeDefined();
    });

    it('accepts Authorization: Bearer header', async () => {
        mockPurgeExpiredData.mockResolvedValueOnce({
            cards_deleted: 0,
            replies_deleted: 0,
            payments_deleted: 0,
            donation_clicks_deleted: 0,
        });

        const request = new Request('http://localhost/api/cron/cleanup', {
            headers: { authorization: 'Bearer test-secret-123' },
        });
        // @ts-expect-error - NextRequest typing
        const response = await GET(request);
        expect(response.status).toBe(200);
    });

    it('returns 500 on purge failure', async () => {
        mockPurgeExpiredData.mockRejectedValueOnce(new Error('DB gone'));

        const request = new Request(
            'http://localhost/api/cron/cleanup?token=test-secret-123'
        );
        // @ts-expect-error - NextRequest typing
        const response = await GET(request);
        expect(response.status).toBe(500);

        const json = await response.json();
        expect(json.error).toBe('Cleanup failed');
    });
});
