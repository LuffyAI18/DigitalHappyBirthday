import { slugExists } from './db';

// ---------------------------------------------------------------------------
// Base62 Slug Generator
// ---------------------------------------------------------------------------
// Produces 8-character random slugs using base62 (a-z, A-Z, 0-9).
// Checks for collisions against the database and retries up to 10 times.
// ---------------------------------------------------------------------------

const BASE62_CHARS =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const SLUG_LENGTH = 8;
const MAX_RETRIES = 10;

function generateRandomSlug(length: number = SLUG_LENGTH): string {
    let slug = '';
    const charsLen = BASE62_CHARS.length;
    for (let i = 0; i < length; i++) {
        slug += BASE62_CHARS[Math.floor(Math.random() * charsLen)];
    }
    return slug;
}

/**
 * Generate a unique base62 slug with collision checking.
 * Retries up to MAX_RETRIES times if a collision is found.
 */
export async function generateUniqueSlug(): Promise<string> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const slug = generateRandomSlug();
        if (!(await slugExists(slug))) {
            return slug;
        }
    }
    throw new Error(
        `Failed to generate a unique slug after ${MAX_RETRIES} attempts`
    );
}
