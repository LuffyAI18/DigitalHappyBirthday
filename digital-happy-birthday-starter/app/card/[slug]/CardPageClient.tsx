'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import CakePreview from '@/components/CakePreview';
import type { TemplateDesign } from '@/designs/templates';
import type { ReplyRow } from '@/lib/db';

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
    replies: ReplyRow[];
}

// Simple confetti particle component
function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
    const colors = ['#FF9CCF', '#FFD700', '#00FFAA', '#FF6B6B', '#4ECDC4', '#FF3CAC'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return (
        <motion.div
            className="fixed w-3 h-3 rounded-sm z-50 pointer-events-none"
            style={{ background: color, left: `${x}%` }}
            initial={{ top: -20, rotate: 0, opacity: 1 }}
            animate={{
                top: '110vh',
                rotate: 720,
                opacity: 0,
            }}
            transition={{
                duration: 3 + Math.random() * 2,
                delay,
                ease: 'easeIn',
            }}
        />
    );
}

export default function CardPageClient({
    slug,
    cardData,
    template,
    replies: initialReplies,
}: CardPageClientProps) {
    const [isOpened, setIsOpened] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replySender, setReplySender] = useState('');
    const [replies, setReplies] = useState(initialReplies);
    const [replySending, setReplySending] = useState(false);
    const [replySuccess, setReplySuccess] = useState(false);

    const handleOpenCake = () => {
        setIsOpened(true);
        if (cardData.addOns.confetti) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        setReplySending(true);

        try {
            const res = await fetch(`/api/card/${slug}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: replyText,
                    sender: replySender || 'Anonymous',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setReplies((prev) => [
                    ...prev,
                    {
                        id: data.id,
                        card_id: 0,
                        message: replyText,
                        sender: replySender || 'Anonymous',
                        created_at: new Date().toISOString(),
                    },
                ]);
                setReplyText('');
                setReplySuccess(true);
                setTimeout(() => setReplySuccess(false), 3000);
            }
        } catch (err) {
            console.error('Reply error:', err);
        } finally {
            setReplySending(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{ background: template.tailwindColors.bg }}
        >
            {/* Confetti */}
            <AnimatePresence>
                {showConfetti &&
                    Array.from({ length: 40 }).map((_, i) => (
                        <ConfettiParticle
                            key={i}
                            delay={i * 0.08}
                            x={Math.random() * 100}
                        />
                    ))}
            </AnimatePresence>

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
                <AnimatePresence mode="wait">
                    {!isOpened ? (
                        <motion.div
                            key="cta"
                            className="px-6 pb-6 text-center"
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <motion.button
                                onClick={handleOpenCake}
                                className="px-8 py-3 rounded-full text-lg font-bold shadow-lg transition-all"
                                style={{
                                    background: template.tailwindColors.accent,
                                    color: template.tailwindColors.bg,
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{
                                    boxShadow: [
                                        `0 0 0px ${template.tailwindColors.accent}40`,
                                        `0 0 25px ${template.tailwindColors.accent}60`,
                                        `0 0 0px ${template.tailwindColors.accent}40`,
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
                            key="message"
                            className="px-6 pb-6"
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

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 justify-center">
                                <Link
                                    href={`/card/${slug}`}
                                    className="px-4 py-2 rounded-full text-sm font-medium border transition-all hover:scale-105"
                                    style={{
                                        borderColor: template.tailwindColors.accent,
                                        color: template.tailwindColors.primary,
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const url = `${window.location.origin}/card/${slug}`;
                                        navigator.clipboard.writeText(url).then(() => {
                                            alert('Card link copied to clipboard!');
                                        }).catch(() => {
                                            alert(`Share this link: ${url}`);
                                        });
                                    }}
                                >
                                    🔗 Share
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Reply Section (visible after opening) */}
            {isOpened && (
                <motion.div
                    className="max-w-lg w-full mt-6 rounded-2xl p-6 shadow-lg"
                    style={{ background: template.tailwindColors.surface }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3
                        className="text-lg font-bold mb-3"
                        style={{ color: template.tailwindColors.text }}
                    >
                        💬 Send a Reply
                    </h3>

                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Your name (optional)"
                            value={replySender}
                            onChange={(e) => setReplySender(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border text-sm"
                            style={{ borderColor: template.tailwindColors.accent + '40' }}
                        />
                        <textarea
                            placeholder="Write a short reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 rounded-lg border resize-none text-sm"
                            style={{ borderColor: template.tailwindColors.accent + '40' }}
                        />
                        <button
                            onClick={handleSendReply}
                            disabled={replySending || !replyText.trim()}
                            className="px-6 py-2 rounded-full text-sm font-medium text-white disabled:opacity-50 transition-all"
                            style={{ background: template.tailwindColors.accent }}
                        >
                            {replySending ? 'Sending...' : '📨 Send Reply'}
                        </button>

                        {replySuccess && (
                            <p className="text-sm text-green-600">✅ Reply sent!</p>
                        )}
                    </div>

                    {/* Existing replies */}
                    {replies.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-semibold text-gray-500">Replies</h4>
                            {replies.map((reply) => (
                                <div
                                    key={reply.id}
                                    className="p-3 rounded-lg text-sm"
                                    style={{
                                        background: template.tailwindColors.bg,
                                        color: template.tailwindColors.text,
                                    }}
                                >
                                    <span className="font-medium">{reply.sender}:</span>{' '}
                                    {reply.message}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Footer */}
            <p className="mt-8 text-xs opacity-40">
                Made with 🎂 HappyBirthday Cards
            </p>
        </div>
    );
}
