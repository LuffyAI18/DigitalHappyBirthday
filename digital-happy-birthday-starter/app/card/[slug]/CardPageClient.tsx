'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CakePreview from '@/components/CakePreview';
import ShareButtons from '@/components/ShareButtons';
import OpenSurprise from '@/components/OpenSurprise';
import type { TemplateDesign } from '@/designs/templates';

// ---------------------------------------------------------------------------
// Card Page Client — Interactive animated card experience
// ---------------------------------------------------------------------------
// Before opening: shows a decorative gift box
// After opening: reveals the cake with a spring animation
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GiftBoxDisplay — Decorative (non-interactive) gift box for pre-open state
// ---------------------------------------------------------------------------
function GiftBoxDisplay({ accent }: { accent: string }) {
    return (
        <motion.div
            className="relative inline-block select-none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
            {/* Gift box lid */}
            <motion.div
                style={{
                    width: 210,
                    height: 36,
                    backgroundColor: accent,
                    borderRadius: '12px 12px 0 0',
                    position: 'relative',
                    boxShadow: `0 -4px 20px ${accent}30`,
                    zIndex: 2,
                }}
                animate={{
                    rotateX: [0, -5, 0, -3, 0],
                    y: [0, -3, 0, -1, 0],
                }}
                transition={{
                    duration: 2.5,
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
                        width: 22,
                        height: '100%',
                        backgroundColor: '#FFD700',
                        transform: 'translateX(-50%)',
                        borderRadius: '8px 8px 0 0',
                    }}
                />
                {/* Bow */}
                <motion.div
                    style={{
                        position: 'absolute',
                        top: -24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 40,
                        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))',
                    }}
                    animate={{
                        scale: [1, 1.18, 1],
                        rotate: [0, 6, -6, 0],
                    }}
                    transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    🎀
                </motion.div>
            </motion.div>

            {/* Gift box body */}
            <div
                style={{
                    width: 200,
                    height: 160,
                    backgroundColor: accent,
                    borderRadius: '0 0 14px 14px',
                    position: 'relative',
                    marginLeft: 5,
                    boxShadow: `0 12px 48px ${accent}40, inset 0 -6px 16px rgba(0,0,0,0.08)`,
                }}
            >
                {/* Vertical ribbon */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: 0,
                        width: 22,
                        height: '100%',
                        backgroundColor: '#FFD700',
                        transform: 'translateX(-50%)',
                    }}
                />
                {/* Horizontal ribbon */}
                <div
                    style={{
                        position: 'absolute',
                        top: '45%',
                        left: 0,
                        width: '100%',
                        height: 22,
                        backgroundColor: '#FFD700',
                        transform: 'translateY(-50%)',
                    }}
                />

                {/* Shimmer/shine effect */}
                <motion.div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '0 0 14px 14px',
                        background: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.25) 50%, transparent 75%)',
                        pointerEvents: 'none',
                    }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Sparkle particles around the box */}
            {[
                { x: -28, y: 25, delay: 0 },
                { x: 215, y: 40, delay: 0.6 },
                { x: -22, y: 130, delay: 1.2 },
                { x: 220, y: 140, delay: 0.3 },
                { x: 95, y: -30, delay: 0.9 },
                { x: -18, y: 80, delay: 1.5 },
                { x: 225, y: 90, delay: 0.15 },
            ].map((spark, i) => (
                <motion.span
                    key={i}
                    style={{
                        position: 'absolute',
                        left: spark.x,
                        top: spark.y,
                        fontSize: 18,
                        pointerEvents: 'none',
                    }}
                    animate={{
                        scale: [0, 1.3, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180],
                    }}
                    transition={{
                        duration: 1.5,
                        delay: spark.delay,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: 'easeOut',
                    }}
                >
                    ✨
                </motion.span>
            ))}
        </motion.div>
    );
}

// ---------------------------------------------------------------------------

interface CardPageClientProps {
    slug: string;
    cardData: {
        to: string;
        message: string;
        from: string;
        templateId: string;
        cakeOptions: {
            shape: 'round' | 'heart' | 'sheet';
            icingColor: string;
            showCandles: boolean;
            candleCount: number;
            toppings?: string[];
        };
        addOns: {
            confetti: boolean;
            backgroundMusic: boolean;
        };
    };
    template: TemplateDesign;
}

export default function CardPageClient({
    slug,
    cardData,
    template,
}: CardPageClientProps) {
    const [isOpened, setIsOpened] = useState(false);
    const [showSharePanel, setShowSharePanel] = useState(false);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{ background: template.tailwindColors.bg }}
        >
            <motion.div
                className="max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden"
                style={{ background: template.tailwindColors.surface }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
            >
                {/* Card Header */}
                <div
                    className="p-6 text-center"
                    style={{ background: template.tailwindColors.accent + '20' }}
                >
                    <motion.h1
                        className="text-3xl font-serif font-bold"
                        style={{ color: template.tailwindColors.primary }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {cardData.to}
                    </motion.h1>
                </div>

                {/* Gift Box (before open) → Cake (after open) */}
                <div className="flex justify-center py-8 min-h-[240px] sm:min-h-[280px]">
                    <AnimatePresence mode="wait">
                        {!isOpened ? (
                            <motion.div
                                key="gift-box"
                                className="flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.3, y: -60, rotate: 15 }}
                                transition={{ duration: 0.5, type: 'spring' }}
                            >
                                <GiftBoxDisplay accent={template.tailwindColors.accent} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="cake-reveal"
                                className="flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.5, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    type: 'spring',
                                    damping: 14,
                                    stiffness: 120,
                                }}
                            >
                                <CakePreview
                                    shape={cardData.cakeOptions.shape}
                                    icingColor={cardData.cakeOptions.icingColor}
                                    candleCount={cardData.cakeOptions.candleCount}
                                    showCandles={cardData.cakeOptions.showCandles}
                                    toppings={(cardData.cakeOptions.toppings || []) as any}
                                    size="lg"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Open CTA or Message */}
                <div className="px-6 pb-6">
                    <AnimatePresence mode="wait">
                        {!isOpened ? (
                            <motion.div
                                key="cta"
                                className="text-center"
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <OpenSurprise
                                    onComplete={() => setIsOpened(true)}
                                    templateAccent={template.tailwindColors.accent}
                                >
                                    {/* This renders INSIDE OpenSurprise after reveal */}
                                    <div>
                                        <div
                                            className="text-center text-lg leading-relaxed mb-4 whitespace-pre-wrap"
                                            style={{ color: template.tailwindColors.text }}
                                            dangerouslySetInnerHTML={{ __html: cardData.message }}
                                        />
                                        <div
                                            className="text-right text-sm font-medium mb-4"
                                            style={{ color: template.tailwindColors.accent }}
                                        >
                                            With love, {cardData.from} 💝
                                        </div>
                                    </div>
                                </OpenSurprise>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="message"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Message */}
                                <div
                                    className="text-center text-lg leading-relaxed mb-4 whitespace-pre-wrap"
                                    style={{ color: template.tailwindColors.text }}
                                    dangerouslySetInnerHTML={{ __html: cardData.message }}
                                />

                                {/* From */}
                                <div
                                    className="text-right text-sm font-medium mb-6"
                                    style={{ color: template.tailwindColors.accent }}
                                >
                                    With love, {cardData.from} 💝
                                </div>

                                {/* Share toggle */}
                                <div className="mb-4">
                                    <button
                                        onClick={() => setShowSharePanel(!showSharePanel)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        style={{
                                            borderColor: template.tailwindColors.accent,
                                            color: template.tailwindColors.primary,
                                        }}
                                    >
                                        {showSharePanel ? '✕ Close' : '🔗 Share this card'}
                                    </button>
                                </div>

                                {/* Share Panel */}
                                <AnimatePresence>
                                    {showSharePanel && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ShareButtons
                                                slug={slug}
                                                recipientName={cardData.to}
                                                senderName={cardData.from}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Footer */}
            <p className="mt-8 text-xs opacity-60">
                Made By{' '}
                <a
                    href="https://www.linkedin.com/in/prajwal-m-d/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium hover:opacity-80"
                >
                    Prajwal M D
                </a>
            </p>
        </div>
    );
}
