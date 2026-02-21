'use client';

import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// ShareButtons — Social sharing component
// ---------------------------------------------------------------------------

interface ShareButtonsProps {
    slug: string;
    recipientName?: string;
}

export default function ShareButtons({
    slug,
    recipientName = 'someone special',
}: ShareButtonsProps) {
    const baseUrl =
        typeof window !== 'undefined'
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_BASE_URL || 'https://digitalhappybirthday.vercel.app');
    const cardUrl = `${baseUrl}/card/${slug}`;
    const shareText = `🎂 I made a birthday card for ${recipientName}! Check it out:`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(cardUrl);
            alert('Link copied to clipboard!');
        } catch {
            // Fallback
            const el = document.createElement('textarea');
            el.value = cardUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            alert('Link copied!');
        }
    };

    const embedHtml = `<iframe src="${cardUrl}" width="400" height="600" frameborder="0" style="border-radius:16px;overflow:hidden;" title="Birthday Card"></iframe>`;

    const copyEmbed = async () => {
        try {
            await navigator.clipboard.writeText(embedHtml);
            alert('Embed code copied!');
        } catch {
            alert('Could not copy embed code.');
        }
    };

    const buttons = [
        {
            name: 'WhatsApp',
            emoji: '💬',
            color: 'bg-green-500 hover:bg-green-600',
            href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${cardUrl}`)}`,
        },
        {
            name: 'Telegram',
            emoji: '📨',
            color: 'bg-blue-500 hover:bg-blue-600',
            href: `https://t.me/share/url?url=${encodeURIComponent(cardUrl)}&text=${encodeURIComponent(shareText)}`,
        },
        {
            name: 'X (Twitter)',
            emoji: '🐦',
            color: 'bg-gray-800 hover:bg-gray-900',
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(cardUrl)}`,
        },
    ];

    return (
        <div className="space-y-4">
            {/* Direct link */}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    readOnly
                    value={cardUrl}
                    className="flex-1 px-4 py-2 border rounded-lg bg-white text-sm text-gray-700 truncate"
                />
                <motion.button
                    onClick={copyLink}
                    className="px-4 py-2 bg-pastel-400 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                    whileTap={{ scale: 0.95 }}
                >
                    📋 Copy
                </motion.button>
            </div>

            {/* Social share buttons */}
            <div className="flex flex-wrap gap-3">
                {buttons.map((btn) => (
                    <motion.a
                        key={btn.name}
                        href={btn.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${btn.color} text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>{btn.emoji}</span>
                        {btn.name}
                    </motion.a>
                ))}
            </div>

            {/* Embed code */}
            <details className="text-sm">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    📌 Embed on your website
                </summary>
                <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-xs overflow-x-auto block">
                        {embedHtml}
                    </code>
                    <button
                        onClick={copyEmbed}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs whitespace-nowrap"
                    >
                        Copy
                    </button>
                </div>
            </details>
        </div>
    );
}
