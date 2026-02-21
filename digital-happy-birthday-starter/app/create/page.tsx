'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import templates from '@/designs/templates';
import CakePreview from '@/components/CakePreview';

// ---------------------------------------------------------------------------
// Card Editor Page — /create
// ---------------------------------------------------------------------------
// Free card creation — no payment required.
// On completion, saves card via POST /api/cards and redirects to the
// donate page at /card/[slug]/donate.
// ---------------------------------------------------------------------------

type CakeShape = 'round' | 'heart' | 'sheet';

interface CardFormData {
    to: string;
    message: string;
    from: string;
    templateId: string;
    cakeOptions: {
        shape: CakeShape;
        icingColor: string;
        showCandles: boolean;
        candleCount: number;
    };
    addOns: {
        confetti: boolean;
        backgroundMusic: boolean;
    };
    colorPalette: string | null;
    fontChoice: string | null;
}

const ICING_COLORS = [
    { name: 'Pink', value: '#FF9CCF' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Chocolate', value: '#8B4513' },
    { name: 'Red', value: '#FF4444' },
    { name: 'Blue', value: '#6CB4EE' },
    { name: 'Gold', value: '#C9A84C' },
    { name: 'Mint', value: '#4ECDC4' },
    { name: 'Purple', value: '#9B59B6' },
];

const EMOJI_LIST = ['🎂', '🎉', '🎈', '🎊', '🥳', '🌟', '💖', '🔥', '🎁', '✨', '🍰', '🧁', '🕯️', '🎶', '💐', '🦋'];

export default function CreatePage() {
    const router = useRouter();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CardFormData>({
        to: 'Dear ',
        message: '',
        from: '',
        templateId: 'pastel-heart',
        cakeOptions: {
            shape: 'round',
            icingColor: '#FF9CCF',
            showCandles: true,
            candleCount: 5,
        },
        addOns: {
            confetti: true,
            backgroundMusic: false,
        },
        colorPalette: null,
        fontChoice: null,
    });

    const selectedTemplate = templates.find((t) => t.id === formData.templateId) || templates[0];

    const updateField = useCallback(
        <K extends keyof CardFormData>(key: K, value: CardFormData[K]) => {
            setFormData((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const updateCakeOption = useCallback(
        <K extends keyof CardFormData['cakeOptions']>(
            key: K,
            value: CardFormData['cakeOptions'][K]
        ) => {
            setFormData((prev) => ({
                ...prev,
                cakeOptions: { ...prev.cakeOptions, [key]: value },
            }));
        },
        []
    );

    const insertEmoji = (emoji: string) => {
        setFormData((prev) => ({
            ...prev,
            message: prev.message + emoji,
        }));
        setShowEmojiPicker(false);
    };

    const isFormValid =
        formData.to.trim().length > 0 &&
        formData.message.trim().length > 0 &&
        formData.from.trim().length > 0;

    const handleComplete = async () => {
        if (!isFormValid || saving) return;

        setSaving(true);
        setSaveError(null);

        try {
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save card');
            }

            const { slug } = await res.json();
            router.push(`/card/${slug}/donate`);
        } catch (err) {
            setSaveError(
                err instanceof Error ? err.message : 'Something went wrong. Please try again.'
            );
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Top nav */}
            <nav className="fixed top-0 w-full z-50 glass">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold gradient-text font-serif">
                        🎂 HappyBirthday
                    </Link>
                    <span className="text-sm text-gray-500">Create Your Card</span>
                </div>
            </nav>

            <div className="pt-20 pb-12 px-4 max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* ============ LEFT: Editor Form ============ */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-3xl font-bold font-serif mb-2">Create Your Card</h1>
                            <p className="text-gray-500 text-sm">
                                Start with &ldquo;Dear &rdquo; — type a name or keep a gentle surprise.
                            </p>
                        </motion.div>

                        {/* To Field */}
                        <div className="glass rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                To
                            </label>
                            <input
                                type="text"
                                value={formData.to}
                                onChange={(e) => updateField('to', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pastel-300 focus:border-transparent outline-none transition-all"
                                placeholder="Dear Friend"
                                autoFocus
                            />
                        </div>

                        {/* Message */}
                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-semibold text-gray-700">
                                    Message
                                </label>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                message: prev.message + '<b></b>',
                                            }))
                                        }
                                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded font-bold"
                                        title="Bold"
                                    >
                                        B
                                    </button>
                                    <button
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                message: prev.message + '<i></i>',
                                            }))
                                        }
                                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded italic"
                                        title="Italic"
                                    >
                                        I
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                            title="Emoji"
                                        >
                                            😊
                                        </button>
                                        {showEmojiPicker && (
                                            <div className="absolute top-8 right-0 bg-white shadow-xl rounded-xl p-3 grid grid-cols-4 gap-2 z-20 border">
                                                {EMOJI_LIST.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => insertEmoji(emoji)}
                                                        className="text-xl hover:scale-125 transition-transform p-1"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <textarea
                                value={formData.message}
                                onChange={(e) => updateField('message', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pastel-300 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Wishing you the happiest birthday! 🎉"
                            />
                        </div>

                        {/* From Field */}
                        <div className="glass rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                From
                            </label>
                            <input
                                type="text"
                                value={formData.from}
                                onChange={(e) => updateField('from', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pastel-300 focus:border-transparent outline-none transition-all"
                                placeholder="Your name"
                            />
                        </div>

                        {/* Template Selector */}
                        <div className="glass rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Choose Template
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {templates.map((t) => (
                                    <motion.button
                                        key={t.id}
                                        onClick={() => updateField('templateId', t.id)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${formData.templateId === t.id
                                            ? 'border-pastel-400 shadow-lg scale-[1.02]'
                                            : 'border-transparent hover:border-gray-200'
                                            }`}
                                        style={{ background: t.tailwindColors.bg }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div
                                            className="text-sm font-bold mb-1"
                                            style={{ color: t.tailwindColors.text }}
                                        >
                                            {t.name}
                                        </div>
                                        <div className="flex gap-1">
                                            {Object.values(t.tailwindColors).map((color, i) => (
                                                <div
                                                    key={i}
                                                    className="w-4 h-4 rounded-full border border-white/50"
                                                    style={{ background: color }}
                                                />
                                            ))}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Font Selector */}
                        <div className="glass rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Font Style
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() =>
                                        updateField('fontChoice', selectedTemplate.fontPrimary)
                                    }
                                    className={`flex-1 px-4 py-3 rounded-xl border-2 text-center transition-all ${formData.fontChoice === selectedTemplate.fontPrimary ||
                                        (!formData.fontChoice)
                                        ? 'border-pastel-400 bg-pastel-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{selectedTemplate.fontPrimary}</span>
                                </button>
                                <button
                                    onClick={() =>
                                        updateField('fontChoice', selectedTemplate.fontAccent)
                                    }
                                    className={`flex-1 px-4 py-3 rounded-xl border-2 text-center transition-all ${formData.fontChoice === selectedTemplate.fontAccent
                                        ? 'border-pastel-400 bg-pastel-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{selectedTemplate.fontAccent}</span>
                                </button>
                            </div>
                        </div>

                        {/* Cake Options */}
                        <div className="glass rounded-xl p-4 space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">
                                Cake Options
                            </label>

                            {/* Shape */}
                            <div>
                                <span className="text-xs text-gray-500">Shape</span>
                                <div className="flex gap-2 mt-1">
                                    {(['round', 'heart', 'sheet'] as CakeShape[]).map((shape) => (
                                        <button
                                            key={shape}
                                            onClick={() => updateCakeOption('shape', shape)}
                                            className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${formData.cakeOptions.shape === shape
                                                ? 'bg-pastel-400 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            {shape === 'round' && '⭕'}
                                            {shape === 'heart' && '💖'}
                                            {shape === 'sheet' && '▬'} {shape}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Icing Color */}
                            <div>
                                <span className="text-xs text-gray-500">Icing Color</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {ICING_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => updateCakeOption('icingColor', color.value)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${formData.cakeOptions.icingColor === color.value
                                                ? 'border-gray-800 scale-110'
                                                : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                            style={{ background: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Candles */}
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.cakeOptions.showCandles}
                                        onChange={(e) =>
                                            updateCakeOption('showCandles', e.target.checked)
                                        }
                                        className="w-4 h-4 rounded accent-pastel-400"
                                    />
                                    <span className="text-sm">Show Candles</span>
                                </label>
                                {formData.cakeOptions.showCandles && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Count:</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={formData.cakeOptions.candleCount}
                                            onChange={(e) =>
                                                updateCakeOption(
                                                    'candleCount',
                                                    Math.min(10, Math.max(1, parseInt(e.target.value) || 1))
                                                )
                                            }
                                            className="w-16 px-2 py-1 border rounded text-sm text-center"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add-ons */}
                        <div className="glass rounded-xl p-4 space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                Add-ons
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.addOns.confetti}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            addOns: { ...prev.addOns, confetti: e.target.checked },
                                        }))
                                    }
                                    className="w-4 h-4 rounded accent-pastel-400"
                                />
                                <span className="text-sm">🎊 Confetti animation</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.addOns.backgroundMusic}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            addOns: {
                                                ...prev.addOns,
                                                backgroundMusic: e.target.checked,
                                            },
                                        }))
                                    }
                                    className="w-4 h-4 rounded accent-pastel-400"
                                />
                                <span className="text-sm">
                                    🎵 Background music{' '}
                                    <span className="text-xs text-gray-400">(free loop)</span>
                                </span>
                            </label>
                        </div>

                        {/* Privacy note */}
                        <div className="text-xs text-gray-400 px-2">
                            🔒 We store only the info needed to create your card. You can
                            request deletion at any time. Card creation is free.
                        </div>
                    </div>

                    {/* ============ RIGHT: Live Preview + Complete Button ============ */}
                    <div className="lg:sticky lg:top-20 lg:self-start space-y-6">
                        {/* Live Preview */}
                        <motion.div
                            className="rounded-2xl overflow-hidden shadow-xl"
                            style={{ background: selectedTemplate.tailwindColors.bg }}
                            layout
                        >
                            <div className="p-6 text-center space-y-4">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={formData.templateId}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Preview header */}
                                        <div
                                            className="text-xl font-serif font-bold mb-2"
                                            style={{ color: selectedTemplate.tailwindColors.primary }}
                                        >
                                            {formData.to || 'Dear Friend'}
                                        </div>

                                        {/* Cake preview */}
                                        <div className="flex justify-center my-4">
                                            <CakePreview
                                                shape={formData.cakeOptions.shape}
                                                icingColor={formData.cakeOptions.icingColor}
                                                candleCount={formData.cakeOptions.candleCount}
                                                showCandles={formData.cakeOptions.showCandles}
                                                size="md"
                                            />
                                        </div>

                                        {/* Message preview */}
                                        <div
                                            className="text-sm px-4 min-h-[3rem] leading-relaxed"
                                            style={{ color: selectedTemplate.tailwindColors.text }}
                                        >
                                            {formData.message || (
                                                <span className="opacity-40 italic">
                                                    Your message will appear here...
                                                </span>
                                            )}
                                        </div>

                                        {/* From preview */}
                                        <div
                                            className="mt-4 text-sm font-medium"
                                            style={{ color: selectedTemplate.tailwindColors.accent }}
                                        >
                                            {formData.from ? `— ${formData.from}` : ''}
                                        </div>

                                        {/* Template badge */}
                                        <div className="mt-4 flex justify-center gap-2">
                                            {formData.addOns.confetti && (
                                                <span className="text-xs bg-white/60 px-2 py-1 rounded-full">
                                                    🎊 Confetti
                                                </span>
                                            )}
                                            {formData.addOns.backgroundMusic && (
                                                <span className="text-xs bg-white/60 px-2 py-1 rounded-full">
                                                    🎵 Music
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div
                                className="px-6 py-3 text-center text-xs font-medium"
                                style={{
                                    background: selectedTemplate.tailwindColors.accent,
                                    color: selectedTemplate.tailwindColors.bg,
                                }}
                            >
                                {selectedTemplate.name} Template • {selectedTemplate.fontPrimary}
                            </div>
                        </motion.div>

                        {/* Complete & Save Section */}
                        <motion.div
                            className="glass rounded-2xl p-6 space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">Create & Send</h3>
                                    <p className="text-sm text-gray-500">
                                        Your card will get a unique shareable link
                                    </p>
                                </div>
                                <div className="text-lg font-bold text-green-500">Free ✨</div>
                            </div>

                            {saveError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    {saveError}
                                    <button
                                        onClick={() => setSaveError(null)}
                                        className="ml-2 underline"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}

                            {!isFormValid && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                                    Please fill in all fields (To, Message, From) to proceed.
                                </div>
                            )}

                            <motion.button
                                onClick={handleComplete}
                                disabled={!isFormValid || saving}
                                className="w-full py-4 rounded-xl text-lg font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: isFormValid ? '#E85D9C' : '#ccc' }}
                                whileHover={isFormValid ? { scale: 1.02 } : {}}
                                whileTap={isFormValid ? { scale: 0.98 } : {}}
                            >
                                {saving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    '🎂 Complete & Save Card'
                                )}
                            </motion.button>

                            <p className="text-xs text-center text-gray-400">
                                No payment required • Your card is saved instantly
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
