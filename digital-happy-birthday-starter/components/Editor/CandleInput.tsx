'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// CandleInput — Accessible candle count control
// ---------------------------------------------------------------------------
// Allows typing on all devices (desktop + mobile numeric keyboard).
// Provides +/- stepper buttons and clamps to 1..50 on blur.
// Debounces preview updates by 150ms.
// ---------------------------------------------------------------------------

interface CandleInputProps {
    value: number;
    onChange: (count: number) => void;
    min?: number;
    max?: number;
}

export default function CandleInput({
    value,
    onChange,
    min = 1,
    max = 50,
}: CandleInputProps) {
    const [displayValue, setDisplayValue] = useState(String(value));
    const [error, setError] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync external value changes
    useEffect(() => {
        setDisplayValue(String(value));
    }, [value]);

    const clamp = useCallback(
        (n: number) => Math.min(max, Math.max(min, n)),
        [min, max]
    );

    const emitChange = useCallback(
        (n: number) => {
            const clamped = clamp(n);
            setError(null);
            onChange(clamped);
        },
        [clamp, onChange]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            setDisplayValue(raw);

            // Allow empty field while typing
            if (raw === '') {
                setError(null);
                return;
            }

            const parsed = parseInt(raw, 10);
            if (isNaN(parsed)) {
                setError('Please enter a number');
                return;
            }

            if (parsed < min) {
                setError(`Minimum is ${min}`);
            } else if (parsed > max) {
                setError(`Maximum is ${max}`);
            } else {
                setError(null);
            }

            // Debounce the preview update
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                emitChange(parsed);
            }, 150);
        },
        [min, max, emitChange]
    );

    const handleBlur = useCallback(() => {
        // Clamp on blur
        const parsed = parseInt(displayValue, 10);
        const final = isNaN(parsed) ? min : clamp(parsed);
        setDisplayValue(String(final));
        setError(null);
        onChange(final);
    }, [displayValue, min, clamp, onChange]);

    const handleIncrement = useCallback(() => {
        const current = parseInt(displayValue, 10) || min;
        const next = clamp(current + 1);
        setDisplayValue(String(next));
        setError(null);
        onChange(next);
    }, [displayValue, min, clamp, onChange]);

    const handleDecrement = useCallback(() => {
        const current = parseInt(displayValue, 10) || min;
        const next = clamp(current - 1);
        setDisplayValue(String(next));
        setError(null);
        onChange(next);
    }, [displayValue, min, clamp, onChange]);

    const currentNum = parseInt(displayValue, 10) || 0;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Candles:</span>
                <div className="flex items-center gap-1">
                    {/* Decrement button */}
                    <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={currentNum <= min}
                        aria-label="Decrease candle count"
                        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none"
                    >
                        −
                    </button>

                    {/* Number input */}
                    <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={min}
                        max={max}
                        step={1}
                        value={displayValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        aria-label="Number of candles (1 to 50)"
                        className="w-16 px-2 py-2 border rounded-lg text-sm text-center min-h-[44px] appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />

                    {/* Increment button */}
                    <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={currentNum >= max}
                        aria-label="Increase candle count"
                        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none"
                    >
                        +
                    </button>
                </div>
                <span className="text-xs text-gray-400">{min}–{max}</span>
            </div>

            {/* Validation message */}
            {error && (
                <p className="text-xs text-red-500 pl-1" role="alert">
                    ⚠️ {error}
                </p>
            )}
        </div>
    );
}
