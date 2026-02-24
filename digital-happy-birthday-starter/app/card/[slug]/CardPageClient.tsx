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

                {/* Cake */}
                <motion.div
                    className="flex justify-center py-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                >
                    <div className={isOpened ? '' : 'float-animation'}>
                        <CakePreview
                            shape={cardData.cakeOptions.shape}
                            icingColor={cardData.cakeOptions.icingColor}
                            candleCount={cardData.cakeOptions.candleCount}
                            showCandles={cardData.cakeOptions.showCandles && !isOpened}
                            size="lg"
                        />
                    </div>
                </motion.div>

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
