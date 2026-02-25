'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ---------------------------------------------------------------------------
// OpenSurprise — Birthday card reveal animation (Enhanced)
// ---------------------------------------------------------------------------
// Multi-phase spectacular reveal:
// 1. Gift box unwrap with 3D lid lift
// 2. Firework starburst rays from center
// 3. Floating emoji rain (birthday-themed)
// 4. Enhanced confetti with ribbon shapes
// 5. Golden shimmer ring expansion
// 6. Content reveal with bounce + stagger
// 7. Sparkle overlays
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
const PARTICLE_SHAPES = ['square', 'circle', 'triangle', 'star', 'ribbon'] as const;
const CONFETTI_COLORS = [
    '#FF9CCF', '#FFD700', '#00FFAA', '#FF6B6B', '#4ECDC4',
    '#FF3CAC', '#845EC2', '#00C9A7', '#F9F871', '#FFC75F',
    '#FF9671', '#D65DB1', '#2C73D2', '#FF8066', '#00B8A9',
];

const BIRTHDAY_EMOJIS = ['🎂', '🎈', '🎁', '🎉', '🌟', '🎊', '🥳', '💖', '✨', '🎵', '🍰', '🧁'];

function getRandomColor() {
    return CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
}

function getRandomShape() {
    return PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)];
}

function getRandomEmoji() {
    return BIRTHDAY_EMOJIS[Math.floor(Math.random() * BIRTHDAY_EMOJIS.length)];
}

// Single confetti particle — now with ribbon shape support
function ConfettiPiece({ delay, id }: { delay: number; id: number }) {
    const color = getRandomColor();
    const shape = getRandomShape();
    const startX = Math.random() * 100;
    const endX = startX + (Math.random() - 0.5) * 50;
    const size = 6 + Math.random() * 10;
    const duration = 2.5 + Math.random() * 2.5;
    const rotation = 360 + Math.random() * 720;

    const shapeStyle: React.CSSProperties = {
        position: 'fixed',
        width: shape === 'ribbon' ? size * 0.4 : size,
        height: shape === 'ribbon' ? size * 2.5 : size,
        left: `${startX}%`,
        zIndex: 60,
        pointerEvents: 'none',
        backgroundColor: shape === 'triangle' ? 'transparent' : color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'ribbon' ? '3px' : '2px',
        ...(shape === 'triangle' && {
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
            backgroundColor: 'transparent',
        }),
        ...(shape === 'star' && {
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        }),
    };

    return (
        <motion.div
            key={id}
            style={shapeStyle}
            initial={{ top: '-5%', rotate: 0, opacity: 1, x: 0 }}
            animate={{
                top: '110vh',
                rotate: rotation,
                opacity: [1, 1, 0.8, 0],
                x: (endX - startX) * 4,
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
                scale: [0, 1.8, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180],
            }}
            transition={{
                duration: 1,
                delay,
                ease: 'easeOut',
            }}
        >
            <span className="text-2xl">✨</span>
        </motion.div>
    );
}

// Floating emoji particle
function FloatingEmoji({ delay, id }: { delay: number; id: number }) {
    const emoji = getRandomEmoji();
    const startX = 10 + Math.random() * 80;
    const drift = (Math.random() - 0.5) * 30;
    const size = 20 + Math.random() * 16;

    return (
        <motion.div
            key={id}
            className="fixed pointer-events-none z-50"
            style={{
                left: `${startX}%`,
                fontSize: size,
                bottom: '-10%',
            }}
            initial={{ y: 0, opacity: 0, scale: 0.3 }}
            animate={{
                y: [0, -window.innerHeight * 0.8 - Math.random() * 200],
                x: [0, drift, drift * 1.5],
                opacity: [0, 1, 1, 0.6, 0],
                scale: [0.3, 1.2, 1, 0.8, 0.4],
                rotate: [0, (Math.random() - 0.5) * 40],
            }}
            transition={{
                duration: 3 + Math.random() * 1.5,
                delay,
                ease: 'easeOut',
            }}
        >
            {emoji}
        </motion.div>
    );
}

// Firework starburst ray
function StarburstRay({ angle, delay, color }: { angle: number; delay: number; color: string }) {
    const length = 60 + Math.random() * 80;
    const radians = (angle * Math.PI) / 180;

    return (
        <motion.div
            className="fixed pointer-events-none z-40"
            style={{
                left: '50%',
                top: '50%',
                width: 3,
                height: length,
                backgroundColor: color,
                transformOrigin: 'top center',
                transform: `rotate(${angle}deg)`,
                borderRadius: 2,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{
                scaleY: [0, 1, 0.3, 0],
                opacity: [0, 0.9, 0.4, 0],
            }}
            transition={{
                duration: 0.8,
                delay,
                ease: 'easeOut',
            }}
        />
    );
}

// Golden shimmer ring
function ShimmerRing({ accent }: { accent: string }) {
    return (
        <motion.div
            className="absolute pointer-events-none z-30"
            style={{
                left: '50%',
                top: '50%',
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `3px solid ${accent}`,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 20px ${accent}60, inset 0 0 20px ${accent}30`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: [0, 15, 20],
                opacity: [0, 0.7, 0],
            }}
            transition={{
                duration: 1.5,
                delay: 0.1,
                ease: 'easeOut',
            }}
        />
    );
}

// Second shimmer ring (offset timing)
function ShimmerRing2({ accent }: { accent: string }) {
    return (
        <motion.div
            className="absolute pointer-events-none z-30"
            style={{
                left: '50%',
                top: '50%',
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `2px solid #FFD700`,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 30px #FFD70060`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: [0, 12, 18],
                opacity: [0, 0.5, 0],
            }}
            transition={{
                duration: 1.5,
                delay: 0.4,
                ease: 'easeOut',
            }}
        />
    );
}

// Gift box component for unwrap animation
function GiftBox({ accent, onOpen }: { accent: string; onOpen: () => void }) {
    return (
        <motion.div
            className="relative inline-block cursor-pointer"
            onClick={onOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Gift box body */}
            <motion.div
                style={{
                    width: 120,
                    height: 90,
                    backgroundColor: accent,
                    borderRadius: 8,
                    position: 'relative',
                    boxShadow: `0 8px 32px ${accent}40`,
                }}
            >
                {/* Vertical ribbon */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: 0,
                        width: 16,
                        height: '100%',
                        backgroundColor: '#FFD700',
                        transform: 'translateX(-50%)',
                    }}
                />
                {/* Horizontal ribbon */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        width: '100%',
                        height: 16,
                        backgroundColor: '#FFD700',
                        transform: 'translateY(-50%)',
                    }}
                />
            </motion.div>

            {/* Gift box lid */}
            <motion.div
                style={{
                    width: 130,
                    height: 24,
                    backgroundColor: accent,
                    borderRadius: '8px 8px 0 0',
                    position: 'absolute',
                    top: -24,
                    left: -5,
                    boxShadow: `0 -4px 16px ${accent}30`,
                    transformOrigin: 'left bottom',
                }}
                animate={{
                    rotateX: [0, -5, 0, -3, 0],
                    y: [0, -2, 0, -1, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {/* Lid ribbon */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: 0,
                        width: 16,
                        height: '100%',
                        backgroundColor: '#FFD700',
                        transform: 'translateX(-50%)',
                        borderRadius: '4px 4px 0 0',
                    }}
                />
                {/* Bow */}
                <motion.div
                    style={{
                        position: 'absolute',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 24,
                    }}
                    animate={{
                        scale: [1, 1.15, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    🎀
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// Lid flying off animation
function FlyingLid({ accent }: { accent: string }) {
    return (
        <motion.div
            className="fixed pointer-events-none z-50"
            style={{
                width: 130,
                height: 24,
                backgroundColor: accent,
                borderRadius: '8px 8px 0 0',
                left: '50%',
                top: '50%',
                transformOrigin: 'center center',
            }}
            initial={{
                x: '-50%',
                y: '-50%',
                rotate: 0,
                opacity: 1,
                scale: 1,
            }}
            animate={{
                y: ['-50%', '-300%'],
                x: ['-50%', '100%'],
                rotate: [0, -45, -90],
                opacity: [1, 0.8, 0],
                scale: [1, 0.6],
            }}
            transition={{
                duration: 1,
                ease: 'easeOut',
            }}
        />
    );
}

export default function OpenSurprise({
    onComplete,
    templateAccent = '#FF9CCF',
    children,
}: OpenSurpriseProps) {
    const [phase, setPhase] = useState<'idle' | 'unwrapping' | 'bursting' | 'revealing'>('idle');
    const [showConfetti, setShowConfetti] = useState(false);
    const [showSparkles, setShowSparkles] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);
    const [showStarburst, setShowStarburst] = useState(false);
    const [showShimmer, setShowShimmer] = useState(false);
    const [showLid, setShowLid] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [announced, setAnnounced] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prefersReducedMotion = useReducedMotion();

    // Sparkle positions — more sparkles for enhanced effect
    const sparkles = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        y: 5 + Math.random() * 90,
        delay: 0.2 + i * 0.12,
    }));

    // Starburst rays
    const rays = Array.from({ length: 16 }, (_, i) => ({
        angle: (360 / 16) * i,
        delay: 0.05 * i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }));

    const playSound = useCallback(() => {
        if (!isSoundEnabled) return;
        try {
            if (!audioRef.current) {
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
        // Phase 1: Gift box unwrap
        setPhase('unwrapping');
        setShowLid(true);
        setAnnounced(true);
        playSound();

        // Phase 2: Starburst + shimmer (after 0.3s)
        setTimeout(() => {
            setPhase('bursting');
            setShowStarburst(true);
            setShowShimmer(true);
        }, 300);

        // Phase 3: Emojis rain (after 0.5s)
        setTimeout(() => {
            setShowEmojis(true);
        }, 500);

        // Phase 4: Confetti storm (after 0.3s)
        setTimeout(() => {
            setShowConfetti(true);
        }, 300);

        // Phase 5: Sparkles (after 0.6s)
        setTimeout(() => {
            setShowSparkles(true);
        }, 600);

        // Clean up effects
        setTimeout(() => setShowStarburst(false), 1500);
        setTimeout(() => setShowLid(false), 1200);
        setTimeout(() => setShowShimmer(false), 2000);
        setTimeout(() => setShowSparkles(false), 3000);
        setTimeout(() => setShowConfetti(false), 4500);
        setTimeout(() => setShowEmojis(false), 4000);

        // Phase 6: Reveal content (after 1.5s)
        setTimeout(() => {
            setPhase('revealing');
        }, 1500);

        // Complete
        setTimeout(() => {
            onComplete();
        }, 3500);
    }, [onComplete, playSound]);

    const handleReplay = useCallback(() => {
        setPhase('idle');
        setAnnounced(false);
        setShowConfetti(false);
        setShowSparkles(false);
        setShowEmojis(false);
        setShowStarburst(false);
        setShowShimmer(false);
        setShowLid(false);
        setTimeout(() => triggerAnimation(), 150);
    }, [triggerAnimation]);

    const handleClose = useCallback(() => {
        setPhase('idle');
        setShowConfetti(false);
        setShowSparkles(false);
        setShowEmojis(false);
        setShowStarburst(false);
        setShowShimmer(false);
        setShowLid(false);
        onComplete();
    }, [onComplete]);

    // Reduced motion: simple fade
    if (prefersReducedMotion) {
        return (
            <div className="text-center">
                {phase === 'idle' ? (
                    <motion.button
                        onClick={() => {
                            setPhase('revealing');
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
            {/* Confetti particles — 80 pieces */}
            <AnimatePresence>
                {showConfetti &&
                    Array.from({ length: 80 }).map((_, i) => (
                        <ConfettiPiece key={`conf-${i}`} delay={i * 0.04} id={i} />
                    ))}
            </AnimatePresence>

            {/* Sparkle overlays */}
            <AnimatePresence>
                {showSparkles &&
                    sparkles.map((s) => (
                        <Sparkle key={`spark-${s.id}`} delay={s.delay} x={s.x} y={s.y} />
                    ))}
            </AnimatePresence>

            {/* Floating birthday emojis */}
            <AnimatePresence>
                {showEmojis &&
                    Array.from({ length: 20 }).map((_, i) => (
                        <FloatingEmoji key={`emoji-${i}`} delay={i * 0.15} id={i} />
                    ))}
            </AnimatePresence>

            {/* Firework starburst rays */}
            <AnimatePresence>
                {showStarburst &&
                    rays.map((ray, i) => (
                        <StarburstRay
                            key={`ray-${i}`}
                            angle={ray.angle}
                            delay={ray.delay}
                            color={ray.color}
                        />
                    ))}
            </AnimatePresence>

            {/* Golden shimmer rings */}
            <AnimatePresence>
                {showShimmer && (
                    <>
                        <ShimmerRing accent={templateAccent} />
                        <ShimmerRing2 accent={templateAccent} />
                    </>
                )}
            </AnimatePresence>

            {/* Flying lid */}
            <AnimatePresence>
                {showLid && <FlyingLid accent={templateAccent} />}
            </AnimatePresence>

            {/* CTA or revealed content */}
            <AnimatePresence mode="wait">
                {phase === 'idle' ? (
                    <motion.div
                        key="cta"
                        exit={{ opacity: 0, scale: 0.5, rotate: 10, y: -40 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {/* CTA button with pulsing glow + bounce */}
                        <motion.button
                            onClick={triggerAnimation}
                            className="px-10 py-4 rounded-full text-lg font-bold shadow-xl relative overflow-hidden"
                            style={{
                                background: `linear-gradient(135deg, ${templateAccent}, ${templateAccent}dd)`,
                                color: '#fff',
                            }}
                            whileHover={{
                                scale: 1.1,
                                rotate: 2,
                                boxShadow: `0 0 40px ${templateAccent}80`,
                            }}
                            whileTap={{ scale: 0.88, rotate: -3 }}
                            animate={{
                                y: [0, -6, 0],
                                boxShadow: [
                                    `0 4px 15px ${templateAccent}30`,
                                    `0 8px 40px ${templateAccent}70`,
                                    `0 4px 15px ${templateAccent}30`,
                                ],
                            }}
                            transition={{
                                y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                                boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                            }}
                        >
                            {/* Shimmer sweep effect */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                    width: '50%',
                                }}
                                animate={{ x: ['-100%', '300%'] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    ease: 'easeInOut',
                                }}
                            />
                            🎁 Open Your Card!
                        </motion.button>

                        <motion.p
                            className="text-sm opacity-60"
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Tap to unwrap your surprise! ✨
                        </motion.p>
                    </motion.div>
                ) : phase === 'revealing' || phase === 'bursting' || phase === 'unwrapping' ? (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 60, scale: 0.7 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            duration: 0.8,
                            type: 'spring',
                            damping: 12,
                            stiffness: 100,
                        }}
                    >
                        {/* Content wrapper with golden border pulse */}
                        <motion.div
                            initial={{ borderColor: 'transparent' }}
                            animate={{
                                borderColor: [
                                    'transparent',
                                    `${templateAccent}40`,
                                    '#FFD70040',
                                    'transparent',
                                ],
                            }}
                            transition={{
                                duration: 3,
                                delay: 0.5,
                            }}
                            style={{
                                border: '2px solid transparent',
                                borderRadius: 16,
                                padding: 4,
                            }}
                        >
                            {children}
                        </motion.div>

                        {/* Controls */}
                        <motion.div
                            className="flex items-center justify-center gap-3 mt-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.4 }}
                        >
                            <button
                                onClick={handleReplay}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-all active:scale-95"
                                title="Replay animation"
                            >
                                🔄 Replay
                            </button>
                            <button
                                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-all active:scale-95"
                                aria-label={isSoundEnabled ? 'Mute sound' : 'Unmute sound'}
                            >
                                {isSoundEnabled ? '🔊' : '🔇'}
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-all active:scale-95"
                                title="Close animation"
                            >
                                ✕
                            </button>
                        </motion.div>
                    </motion.div>
                ) : null}
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
