import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Tests: Candle input validation logic
// ---------------------------------------------------------------------------
// Tests the clamping and validation logic used by the CandleInput component.
// Pure logic tests — no DOM rendering required.
// ---------------------------------------------------------------------------

function clampCandleCount(value: number): number {
    return Math.min(50, Math.max(1, value));
}

function validateCandleInput(value: string): { valid: boolean; count: number; message?: string } {
    const num = parseInt(value, 10);

    if (isNaN(num) || value.trim() === '') {
        return { valid: false, count: 1, message: 'Enter a number between 1 and 50' };
    }

    if (num < 1) {
        return { valid: false, count: 1, message: 'Minimum is 1 candle' };
    }

    if (num > 50) {
        return { valid: false, count: 50, message: 'Maximum is 50 candles' };
    }

    return { valid: true, count: num };
}

describe('CandleInput — clamping logic', () => {
    it('clamps below 1 to 1', () => {
        expect(clampCandleCount(0)).toBe(1);
        expect(clampCandleCount(-5)).toBe(1);
    });

    it('clamps above 50 to 50', () => {
        expect(clampCandleCount(51)).toBe(50);
        expect(clampCandleCount(100)).toBe(50);
    });

    it('passes through valid values', () => {
        expect(clampCandleCount(1)).toBe(1);
        expect(clampCandleCount(25)).toBe(25);
        expect(clampCandleCount(50)).toBe(50);
    });
});

describe('CandleInput — validation logic', () => {
    it('validates a normal number', () => {
        const result = validateCandleInput('7');
        expect(result.valid).toBe(true);
        expect(result.count).toBe(7);
        expect(result.message).toBeUndefined();
    });

    it('rejects empty string', () => {
        const result = validateCandleInput('');
        expect(result.valid).toBe(false);
        expect(result.count).toBe(1);
    });

    it('rejects non-numeric input', () => {
        const result = validateCandleInput('abc');
        expect(result.valid).toBe(false);
    });

    it('rejects values below 1', () => {
        const result = validateCandleInput('0');
        expect(result.valid).toBe(false);
        expect(result.count).toBe(1);
        expect(result.message).toContain('Minimum');
    });

    it('rejects values above 50', () => {
        const result = validateCandleInput('51');
        expect(result.valid).toBe(false);
        expect(result.count).toBe(50);
        expect(result.message).toContain('Maximum');
    });

    it('accepts boundary values', () => {
        expect(validateCandleInput('1').valid).toBe(true);
        expect(validateCandleInput('50').valid).toBe(true);
    });
});

describe('CandleInput — increment/decrement simulation', () => {
    it('increment from 1 gives 2', () => {
        const current = 1;
        const next = clampCandleCount(current + 1);
        expect(next).toBe(2);
    });

    it('decrement from 1 stays at 1', () => {
        const current = 1;
        const next = clampCandleCount(current - 1);
        expect(next).toBe(1);
    });

    it('increment from 50 stays at 50', () => {
        const current = 50;
        const next = clampCandleCount(current + 1);
        expect(next).toBe(50);
    });

    it('decrement from 50 gives 49', () => {
        const current = 50;
        const next = clampCandleCount(current - 1);
        expect(next).toBe(49);
    });
});
