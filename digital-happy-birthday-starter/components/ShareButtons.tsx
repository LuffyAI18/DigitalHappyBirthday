'use client';

import { useState, useCallback, useEffect } from 'react';

// ---------------------------------------------------------------------------
// ShareButtons — Comprehensive sharing for all platforms
// ---------------------------------------------------------------------------
// Includes: WhatsApp, Telegram, Facebook, Twitter/X, Email, SMS,
// Copy Link, Embed HTML, Web Share API, Download Image
// Mobile deep-linking with timeout fallback to web URLs
// ---------------------------------------------------------------------------

interface ShareButtonsProps {
    slug: string;
    recipientName?: string;
    senderName?: string;
}

type ToastType = 'success' | 'error';

export default function ShareButtons({ slug, recipientName = 'someone special', senderName = 'Someone' }: ShareButtonsProps) {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [supportsWebShare, setSupportsWebShare] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setSupportsWebShare(typeof navigator !== 'undefined' && !!navigator.share);
        setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }, []);

    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.vercel.app';

    const cardUrl = `${baseUrl}/card/${slug}`;
    const shareText = `🎂 ${senderName} sent you a birthday card, ${recipientName}! Open it here:`;

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const copyToClipboard = useCallback(async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast(`${label} copied!`);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(`${label} copied!`);
        }
    }, [showToast]);

    // Deep link with fallback
    const openWithDeepLink = useCallback((deepLink: string, webUrl: string) => {
        if (isMobile) {
            const start = Date.now();
            window.location.href = deepLink;
            setTimeout(() => {
                if (Date.now() - start < 1500) {
                    window.open(webUrl, '_blank', 'noopener,noreferrer');
                }
            }, 800);
        } else {
            window.open(webUrl, '_blank', 'noopener,noreferrer');
        }
    }, [isMobile]);

    const handleWhatsApp = useCallback(() => {
        const text = encodeURIComponent(`${shareText}\n${cardUrl}`);
        const deepLink = `whatsapp://send?text=${text}`;
        const webUrl = `https://wa.me/?text=${text}`;
        openWithDeepLink(deepLink, webUrl);
    }, [shareText, cardUrl, openWithDeepLink]);

    const handleTelegram = useCallback(() => {
        const text = encodeURIComponent(shareText);
        const url = encodeURIComponent(cardUrl);
        const deepLink = `tg://msg_url?url=${url}&text=${text}`;
        const webUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        openWithDeepLink(deepLink, webUrl);
    }, [shareText, cardUrl, openWithDeepLink]);

    const handleFacebook = useCallback(() => {
        const url = encodeURIComponent(cardUrl);
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            '_blank',
            'noopener,noreferrer,width=600,height=400'
        );
    }, [cardUrl]);

    const handleTwitter = useCallback(() => {
        const text = encodeURIComponent(`${shareText} ${cardUrl}`);
        window.open(
            `https://twitter.com/intent/tweet?text=${text}`,
            '_blank',
            'noopener,noreferrer,width=600,height=400'
        );
    }, [shareText, cardUrl]);

    const handleEmail = useCallback(() => {
        const subject = encodeURIComponent(`🎂 Birthday Card for ${recipientName}`);
        const body = encodeURIComponent(`${shareText}\n\n${cardUrl}\n\nMade with ❤️`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }, [recipientName, shareText, cardUrl]);

    const handleSMS = useCallback(() => {
        const body = encodeURIComponent(`${shareText} ${cardUrl}`);
        // iOS uses &body=, Android uses ?body=
        const separator = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
        window.location.href = `sms:${separator}body=${body}`;
    }, [shareText, cardUrl]);

    const handleWebShare = useCallback(async () => {
        try {
            await navigator.share({
                title: `🎂 Birthday Card for ${recipientName}`,
                text: shareText,
                url: cardUrl,
            });
            showToast('Shared successfully!');
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                showToast('Share cancelled', 'error');
            }
        }
    }, [recipientName, shareText, cardUrl, showToast]);

    const handleCopyLink = useCallback(() => {
        copyToClipboard(cardUrl, 'Link');
    }, [cardUrl, copyToClipboard]);

    const handleCopyEmbed = useCallback(() => {
        const embed = `<iframe src="${cardUrl}" width="400" height="600" frameborder="0" style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1);"></iframe>`;
        copyToClipboard(embed, 'Embed code');
    }, [cardUrl, copyToClipboard]);

    const handleDownload = useCallback(() => {
        window.open(`/api/snapshot/${slug}`, '_blank');
        showToast('Downloading card image…');
    }, [slug, showToast]);

    return (
        <div className="space-y-4">
            {/* Toast notification */}
            {toast && (
                <div
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-sm font-medium shadow-lg transition-all animate-slideDown ${toast.type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}
                >
                    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                </div>
            )}

            {/* Web Share API (primary on supported devices) */}
            {supportsWebShare && (
                <button
                    onClick={handleWebShare}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                >
                    <span className="text-lg">📤</span>
                    Share Card
                </button>
            )}

            {/* Social platforms */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-medium transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                >
                    <span className="text-lg">💬</span>
                    WhatsApp
                </button>
                <button
                    onClick={handleTelegram}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] font-medium transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                >
                    <span className="text-lg">✈️</span>
                    Telegram
                </button>
                <button
                    onClick={handleFacebook}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-medium transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                >
                    <span className="text-lg">📘</span>
                    Facebook
                </button>
                <button
                    onClick={handleTwitter}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-900/10 hover:bg-gray-900/20 text-gray-900 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                >
                    <span className="text-lg">𝕏</span>
                    Twitter/X
                </button>
                <button
                    onClick={handleEmail}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                >
                    <span className="text-lg">📧</span>
                    Email
                </button>
                <button
                    onClick={handleSMS}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                >
                    <span className="text-lg">💬</span>
                    SMS
                </button>
            </div>

            {/* Utility buttons */}
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <button
                        onClick={handleCopyLink}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all min-h-[44px]"
                    >
                        🔗 Copy Link
                    </button>
                    <button
                        onClick={handleCopyEmbed}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all min-h-[44px]"
                    >
                        📋 Embed
                    </button>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all min-h-[44px]"
                >
                    📥 Download Image
                </button>
            </div>
        </div>
    );
}
