// ---------------------------------------------------------------------------
// In-Memory Rate Limiter (Sliding Window)
// ---------------------------------------------------------------------------
// Simple rate limiter for demo / MVP usage.
//
// ⚠️  PRODUCTION NOTE:
// This uses in-memory storage and resets on server restart.
// For production, use Redis-based rate limiting (e.g., @upstash/ratelimit)
// or a WAF like Cloudflare / AWS WAF.
// ---------------------------------------------------------------------------

interface RateLimitEntry {
    timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        entry.timestamps = entry.timestamps.filter(
            (ts) => now - ts < 60 * 60 * 1000
        );
        if (entry.timestamps.length === 0) {
            store.delete(key);
        }
    }
}, CLEANUP_INTERVAL);

/**
 * Check if a request from the given IP is within rate limits.
 *
 * @param identifier - IP address or unique identifier
 * @param limit - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns Object with success status and remaining requests
 */
export function rateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60 * 1000
): { success: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    let entry = store.get(identifier);

    if (!entry) {
        entry = { timestamps: [] };
        store.set(identifier, entry);
    }

    // Remove timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

    if (entry.timestamps.length >= limit) {
        const oldestInWindow = entry.timestamps[0];
        const resetMs = windowMs - (now - oldestInWindow);
        return {
            success: false,
            remaining: 0,
            resetMs,
        };
    }

    entry.timestamps.push(now);

    return {
        success: true,
        remaining: limit - entry.timestamps.length,
        resetMs: windowMs,
    };
}
