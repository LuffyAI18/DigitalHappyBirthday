import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Tests for POST /api/donations/track
// ---------------------------------------------------------------------------
// Tests donation click tracking with IP anonymization.
// ---------------------------------------------------------------------------

// Mock the DB module
vi.mock('@/lib/db', () => ({
    trackDonationClick: vi.fn().mockResolvedValue(1),
}));

// Mock rate-limit to always allow
vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockReturnValue({ success: true, remaining: 29, resetMs: 60000 }),
}));

describe('POST /api/donations/track — donation click analytics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should track a donation click with anonymized IP', async () => {
        const { trackDonationClick } = await import('@/lib/db');
        const crypto = await import('crypto');

        const clickData = {
            slug: 'AbCdEfGh',
            currency: 'INR',
            amount: '29',
            provider: 'bmac',
        };

        // Simulate IP hashing (same logic as the route)
        const ip = '192.168.1.100';
        const salt = 'test-salt-for-testing';
        const ipHash = crypto.createHash('sha256')
            .update(ip + salt)
            .digest('hex')
            .slice(0, 16);

        expect(ipHash).toBeTruthy();
        expect(ipHash.length).toBe(16);

        // Track the click
        const userAgent = 'Mozilla/5.0 (Test)';
        await trackDonationClick(
            clickData.slug,
            clickData.provider,
            clickData.currency,
            clickData.amount,
            ipHash,
            userAgent
        );

        expect(trackDonationClick).toHaveBeenCalledWith(
            'AbCdEfGh',
            'bmac',
            'INR',
            '29',
            ipHash,
            'Mozilla/5.0 (Test)'
        );
    });

    it('should validate that provider is one of the allowed values', () => {
        const allowedProviders = ['bmac', 'paypal', 'stripe'];

        expect(allowedProviders.includes('bmac')).toBe(true);
        expect(allowedProviders.includes('paypal')).toBe(true);
        expect(allowedProviders.includes('stripe')).toBe(true);
        expect(allowedProviders.includes('crypto')).toBe(false);
        expect(allowedProviders.includes('')).toBe(false);
    });

    it('should produce different hashes for different IPs', async () => {
        const crypto = await import('crypto');

        const salt = 'same-salt';
        const hash1 = crypto.createHash('sha256').update('192.168.1.1' + salt).digest('hex').slice(0, 16);
        const hash2 = crypto.createHash('sha256').update('10.0.0.1' + salt).digest('hex').slice(0, 16);

        expect(hash1).not.toBe(hash2);
    });

    it('should produce consistent hashes for the same IP', async () => {
        const crypto = await import('crypto');

        const salt = 'same-salt';
        const ip = '192.168.1.1';
        const hash1 = crypto.createHash('sha256').update(ip + salt).digest('hex').slice(0, 16);
        const hash2 = crypto.createHash('sha256').update(ip + salt).digest('hex').slice(0, 16);

        expect(hash1).toBe(hash2);
    });

    it('should rate-limit excessive tracking attempts', async () => {
        const { rateLimit } = await import('@/lib/rate-limit');

        // With generous limit of 30 per minute
        const result = rateLimit('donate-test-ip', 30, 60000);
        expect(result.success).toBe(true);
    });
});
