'use client';

import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

// ---------------------------------------------------------------------------
// LottieAnimation — Wrapper for lottie-web
// ---------------------------------------------------------------------------
// Renders Lottie JSON animation files.
// Place Lottie JSON files in /public/lottie/ and pass the path.
//
// 🔍 FREE LOTTIE ASSETS:
// Search LottieFiles.com with these keywords per template:
//   - Pastel Heart: "heart burst", "candle flicker", "pastel confetti"
//   - Bold Neon: "neon spark", "animated sprinkles", "glow candles"
//   - Classic Elegant: "gold sparkle", "slow confetti", "flicker candle"
//   - Cute Cartoon: "cartoon cake", "confetti pop", "cute candle"
//
// Download free JSON files and place in /public/lottie/
// ---------------------------------------------------------------------------

interface LottieAnimationProps {
    animationPath?: string;
    animationData?: object;
    loop?: boolean;
    autoplay?: boolean;
    speed?: number;
    className?: string;
    width?: number | string;
    height?: number | string;
    onComplete?: () => void;
}

export default function LottieAnimation({
    animationPath,
    animationData,
    loop = true,
    autoplay = true,
    speed = 1,
    className = '',
    width = '100%',
    height = '100%',
    onComplete,
}: LottieAnimationProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<AnimationItem | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        if (!animationPath && !animationData) return;

        // Clean up previous animation
        if (animationRef.current) {
            animationRef.current.destroy();
        }

        const baseConfig = {
            container: containerRef.current,
            renderer: 'svg' as const,
            loop,
            autoplay,
        };

        if (animationData) {
            animationRef.current = lottie.loadAnimation({
                ...baseConfig,
                animationData,
            });
        } else if (animationPath) {
            animationRef.current = lottie.loadAnimation({
                ...baseConfig,
                path: animationPath,
            });
        } else {
            return;
        }
        animationRef.current.setSpeed(speed);

        if (onComplete) {
            animationRef.current.addEventListener('complete', onComplete);
        }

        return () => {
            if (animationRef.current) {
                animationRef.current.destroy();
                animationRef.current = null;
            }
        };
    }, [animationPath, animationData, loop, autoplay, speed, onComplete]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
}
