// ---------------------------------------------------------------------------
// FEATURE_FLAG_PAYPAL — DISABLED
// ---------------------------------------------------------------------------
// These tests were for PayPal webhook signature verification and payment
// processing. The payment flow has been replaced by free card creation
// (POST /api/cards) + voluntary donation tracking (POST /api/donations/track).
//
// Replacement tests:
// - tests/create-card.test.ts (free card creation flow)
// - tests/donation-track.test.ts (donation click analytics)
//
// To re-enable these tests:
// 1. Set FEATURE_FLAG_PAYPAL=true
// 2. Uncomment the test code below
// 3. Run: npm test
// ---------------------------------------------------------------------------

import { describe, it } from 'vitest';

describe('Webhook Verification (DISABLED — PayPal checkout removed)', () => {
    it.skip('PayPal webhook tests disabled — see tests/donation-track.test.ts', () => {
        // Original PayPal webhook verification tests
        // See git history for full test implementation
    });
});

/* --- Original PayPal webhook tests preserved below ---
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/paypal', () => ({
    verifyWebhookSignature: vi.fn(),
    getPayPalAccessToken: vi.fn().mockResolvedValue('mock-access-token'),
}));

// ... see git history for full test implementation
--- */
