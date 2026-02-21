// ---------------------------------------------------------------------------
// FEATURE_FLAG_PAYPAL — DISABLED
// ---------------------------------------------------------------------------
// These tests were for the PayPal ₹19 checkout flow which has been replaced
// by free card creation (POST /api/cards) + voluntary donations.
//
// The original PayPal order creation tests have been replaced by:
// - tests/create-card.test.ts (free card creation flow)
// - tests/donation-track.test.ts (donation click analytics)
//
// To re-enable these tests:
// 1. Set FEATURE_FLAG_PAYPAL=true in your .env
// 2. Uncomment the test code below
// 3. Run: npm test
// ---------------------------------------------------------------------------

import { describe, it } from 'vitest';

describe('POST /api/create-order (DISABLED — PayPal checkout removed)', () => {
    it.skip('PayPal checkout tests disabled — see tests/create-card.test.ts', () => {
        // Original PayPal order creation tests
        // See git history for full test implementation
    });
});

/* --- Original PayPal tests preserved below ---
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/paypal', () => ({
    createPayPalOrder: vi.fn().mockResolvedValue({
        id: 'MOCK-ORDER-12345',
        status: 'CREATED',
    }),
}));

vi.mock('@/lib/db', () => ({
    createCard: vi.fn().mockReturnValue(1),
    createPayment: vi.fn().mockReturnValue(1),
}));

// ... see git history for full test implementation
--- */
