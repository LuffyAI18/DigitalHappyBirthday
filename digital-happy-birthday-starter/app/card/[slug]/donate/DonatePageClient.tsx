'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import CakePreview from '@/components/CakePreview';
import type { TemplateDesign } from '@/designs/templates';
import {
    detectCurrencyAsync,
    DONATION_AMOUNTS,
    type SupportedCurrency,
} from '@/lib/detectCurrency';

// ---------------------------------------------------------------------------
// Donate Page Client — /card/[slug]/donate
// ---------------------------------------------------------------------------
// Shows region-based donation options with Buy Me a Coffee as the primary
// provider. Tracks clicks for analytics. No payment processing happens here.
// ---------------------------------------------------------------------------

interface DonatePageClientProps {
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
    bmacUsername: string | null;
}

export default function DonatePageClient({
    slug,
    cardData,
    template,
    bmacUsername,
}: DonatePageClientProps) {
    const [currency, setCurrency] = useState<SupportedCurrency>('USD');
    const [copied, setCopied] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        detectCurrencyAsync().then(setCurrency);
    }, []);

    const shareUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/card/${slug}`
            : `/card/${slug}`;

    const copyLink = useCallback(() => {
        navigator.clipboard.writeText(shareUrl).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [shareUrl]);

    const handleDonate = async (amount: number) => {
        // Track click
        try {
            await fetch('/api/donations/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    currency,
                    amount,
                    provider: 'bmac',
                }),
            });
        } catch {
            // Don't block donation if tracking fails
        }

        // Open Buy Me a Coffee
        const bmacUrl = bmacUsername
            ? `https://www.buymeacoffee.com/${bmacUsername}?from=${slug}&amount=${amount}`
            : null;

        if (bmacUrl) {
            window.open(bmacUrl, '_blank', 'noopener,noreferrer');
        }

        // Show thank you toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const donationOptions = DONATION_AMOUNTS[currency];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
            {/* Toast notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-sm font-medium"
                        style={{
                            background: template.tailwindColors.accent,
                            color: template.tailwindColors.bg,
                        }}
                    >
                        💖 Thanks — your support means a lot. Your card is ready to share.
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="max-w-2xl w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h1
                        className="text-3xl lg:text-4xl font-bold font-serif mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Support the developer — every bit helps
                    </motion.h1>
                    <p className="text-gray-500 text-sm">
                        A small tip keeps this project alive ❤️
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Left: Card Preview + Share */}
                    <motion.div
                        className="lg:col-span-2 space-y-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Card preview */}
                        <div
                            className="rounded-2xl overflow-hidden shadow-lg"
                            style={{ background: template.tailwindColors.surface }}
                        >
                            <div className="p-4 text-center space-y-3">
                                <div
                                    className="text-lg font-serif font-bold"
                                    style={{ color: template.tailwindColors.primary }}
                                >
                                    {cardData.to}
                                </div>
                                <div className="flex justify-center">
                                    <CakePreview
                                        shape={cardData.cakeOptions.shape}
                                        icingColor={cardData.cakeOptions.icingColor}
                                        candleCount={cardData.cakeOptions.candleCount}
                                        showCandles={cardData.cakeOptions.showCandles}
                                        size="sm"
                                    />
                                </div>
                                <div
                                    className="text-xs px-3 line-clamp-2"
                                    style={{ color: template.tailwindColors.text }}
                                >
                                    {cardData.message.replace(/<[^>]*>/g, '').slice(0, 80)}
                                    {cardData.message.length > 80 ? '...' : ''}
                                </div>
                                <div
                                    className="text-xs font-medium"
                                    style={{ color: template.tailwindColors.accent }}
                                >
                                    — {cardData.from}
                                </div>
                            </div>
                            <div
                                className="px-4 py-2 text-center text-xs font-medium"
                                style={{
                                    background: template.tailwindColors.accent,
                                    color: template.tailwindColors.bg,
                                }}
                            >
                                {template.name}
                            </div>
                        </div>

                        {/* Share link */}
                        <div className="glass rounded-xl p-4">
                            <div className="text-xs font-semibold text-gray-600 mb-2">
                                🔗 Your card link
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono bg-gray-50 truncate"
                                />
                                <button
                                    onClick={copyLink}
                                    className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 transition-all shrink-0"
                                >
                                    {copied ? '✅ Copied' : '📋 Copy'}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Donation Options */}
                    <motion.div
                        className="lg:col-span-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="glass rounded-2xl p-6 space-y-5">
                            {/* Donation buttons */}
                            <div className="space-y-3">
                                {donationOptions.map((option) => (
                                    <motion.button
                                        key={option.amount}
                                        onClick={() => handleDonate(option.amount)}
                                        className="w-full py-3.5 px-6 rounded-xl text-base font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                                        style={{
                                            background: template.tailwindColors.accent,
                                            color: template.tailwindColors.bg,
                                        }}
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        ☕ {option.label}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Provider info */}
                            <div className="text-center space-y-2">
                                <p className="text-xs text-gray-500">
                                    We use{' '}
                                    <span className="font-semibold">Buy Me a Coffee</span>{' '}
                                    for fast, secure donations
                                </p>
                                {!bmacUsername && (
                                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                        ⚠️ Set <code className="font-mono">BMAC_USERNAME</code> in
                                        your .env to enable donation links
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400">or</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Skip link */}
                            <div className="text-center">
                                <Link
                                    href={`/card/${slug}`}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline transition-all"
                                    style={{ color: template.tailwindColors.primary }}
                                >
                                    Skip &amp; view card →
                                </Link>
                            </div>

                            {/* Privacy & fee notes */}
                            <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-400 text-center">
                                    🔒 No payment data is stored here. Donations are processed
                                    by the chosen provider.
                                </p>
                                <p className="text-xs text-gray-400 text-center">
                                    Payments handled by the provider; contact them for refunds.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Footer */}
            <p className="mt-10 text-xs opacity-60">
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
