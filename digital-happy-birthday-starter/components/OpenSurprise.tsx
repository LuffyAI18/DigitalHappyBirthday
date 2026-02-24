'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ---------------------------------------------------------------------------
// OpenSurprise — Birthday card reveal animation
// ---------------------------------------------------------------------------
// Triggered when the recipient opens their card. Features:
// - Confetti burst with varied particle shapes and colors
// - Sparkle overlays
// - Scale/rotate animation on CTA
// - Optional sound effect (only after user gesture)
// - prefers-reduced-motion: simple fade
// - aria-live announcement
// - Replay and close buttons
// ---------------------------------------------------------------------------

interface OpenSurpriseProps {
    onComplete: () => void;
    templateAccent?: string;
    children?: React.ReactNode;
}

// Confetti particle shapes
const PARTICLE_SHAPES = ['square', 'circle', 'triangle', 'star'] as const;
const CONFETTI_COLORS = [
    '#FF9CCF', '#FFD700', '#00FFAA', '#FF6B6B', '#4ECDC4',
    '#FF3CAC', '#845EC2', '#00C9A7', '#F9F871', '#FFC75F',
    '#FF9671', '#D65DB1', '#2C73D2', '#FF8066', '#00B8A9',
];

function getRandomColor() {
    return CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
}

function getRandomShape() {
    return PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)];
}

// Single confetti particle
function ConfettiPiece({ delay, id }: { delay: number; id: number }) {
    const color = getRandomColor();
    const shape = getRandomShape();
    const startX = Math.random() * 100;
    const endX = startX + (Math.random() - 0.5) * 40;
    const size = 6 + Math.random() * 8;
    const duration = 2.5 + Math.random() * 2;

    const shapeStyle: React.CSSProperties = {
        position: 'fixed',
        width: size,
        height: size,
        left: `${startX}%`,
        zIndex: 60,
        pointerEvents: 'none',
        backgroundColor: shape === 'triangle' ? 'transparent' : color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'star' ? '2px' : '2px',
        ...(shape === 'triangle' && {
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
            backgroundColor: 'transparent',
        }),
    };

    return (
        <motion.div
            key={id}
            style={shapeStyle}
            initial={{ top: '-5%', rotate: 0, opacity: 1, x: 0 }}
            animate={{
                top: '110vh',
                rotate: 360 + Math.random() * 360,
                opacity: [1, 1, 0.8, 0],
                x: (endX - startX) * 3,
            }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
        />
    );
}

// Sparkle overlay
function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
    return (
        <motion.div
            className="fixed pointer-events-none z-50"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180],
            }}
            transition={{
                duration: 0.8,
                delay,
                ease: 'easeOut',
            }}
        >
            <span className="text-2xl">✨</span>
        </motion.div>
    );
}

export default function OpenSurprise({
    onComplete,
    templateAccent = '#FF9CCF',
    children,
}: OpenSurpriseProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showSparkles, setShowSparkles] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [announced, setAnnounced] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prefersReducedMotion = useReducedMotion();

    // Sparkle positions
    const sparkles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        delay: 0.1 + i * 0.15,
    }));

    const playSound = useCallback(() => {
        if (!isSoundEnabled) return;
        try {
            if (!audioRef.current) {
                // Use a simple party horn / celebration sound
                audioRef.current = new Audio('/sounds/celebration.mp3');
                audioRef.current.volume = 0.3;
            }
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
                // Sound play failed — likely no user gesture yet
            });
        } catch {
            // Audio not available
        }
    }, [isSoundEnabled]);

    const triggerAnimation = useCallback(() => {
        setIsAnimating(true);
        setShowConfetti(true);
        setShowSparkles(true);
        setAnnounced(true);
        playSound();

        // End confetti after 3.5 seconds
        setTimeout(() => setShowConfetti(false), 3500);
        setTimeout(() => setShowSparkles(false), 2500);

        // Complete after full duration
        setTimeout(() => {
            onComplete();
        }, 3000);
    }, [onComplete, playSound]);

    const handleReplay = useCallback(() => {
        setIsAnimating(false);
        setAnnounced(false);
        setTimeout(() => triggerAnimation(), 100);
    }, [triggerAnimation]);

    const handleClose = useCallback(() => {
        setIsAnimating(false);
        setShowConfetti(false);
        setShowSparkles(false);
        onComplete();
    }, [onComplete]);

    // Reduced motion: just fade in
    if (prefersReducedMotion) {
        return (
            <div className="text-center">
                {!isAnimating ? (
                    <motion.button
                        onClick={() => {
                            setIsAnimating(true);
                            setAnnounced(true);
                            onComplete();
                        }}
                        className="px-8 py-3 rounded-full text-lg font-bold shadow-lg transition-all"
                        style={{
                            background: templateAccent,
                            color: '#fff',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        🎂 Open Your Card!
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                )}
                {announced && (
                    <p className="sr-only" role="status" aria-live="polite">
                        Make a wish! Your birthday card has been revealed.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="text-center relative">
            {/* Confetti particles */}
            <AnimatePresence>
                {showConfetti &&
                    Array.from({ length: 60 }).map((_, i) => (
                        <ConfettiPiece key={`conf-${i}`} delay={i * 0.05} id={i} />
                    ))}
            </AnimatePresence>

            {/* Sparkle overlays */}
            <AnimatePresence>
                {showSparkles &&
                    sparkles.map((s) => (
                        <Sparkle key={`spark-${s.id}`} delay={s.delay} x={s.x} y={s.y} />
                    ))}
            </AnimatePresence>

            {/* CTA or revealed content */}
            <AnimatePresence mode="wait">
                {!isAnimating ? (
                    <motion.div
                        key="cta"
                        exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.button
                            onClick={triggerAnimation}
                            className="px-8 py-3 rounded-full text-lg font-bold shadow-lg"
                            style={{
                                background: templateAccent,
                                color: '#fff',
                            }}
                            whileHover={{ scale: 1.08, rotate: 2 }}
                            whileTap={{ scale: 0.92, rotate: -2 }}
                            animate={{
                                boxShadow: [
                                    `0 0 0px ${templateAccent}40`,
                                    `0 0 30px ${templateAccent}60`,
                                    `0 0 0px ${templateAccent}40`,
                                ],
                            }}
                            transition={{
                                boxShadow: { repeat: Infinity, duration: 2 },
                            }}
                        >
                            🎂 Open Your Card!
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            duration: 0.6,
                            type: 'spring',
                            damping: 15,
                        }}
                    >
                        {children}

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-3 mt-4">
                            <button
                                onClick={handleReplay}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-all"
                                title="Replay animation"
                            >
                                🔄 Replay
                            </button>
                            <button
                                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-all"
                                aria-label={isSoundEnabled ? 'Mute sound' : 'Unmute sound'}
                            >
                                {isSoundEnabled ? '🔊' : '🔇'}
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-all"
                                title="Close animation"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Screen reader announcement */}
            {announced && (
                <p className="sr-only" role="status" aria-live="polite">
                    Make a wish! Your birthday card has been revealed.
                </p>
            )}
        </div>
    );
}
