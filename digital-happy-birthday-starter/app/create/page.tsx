'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import templates from '@/designs/templates';
import type { ColorPalettePreset } from '@/designs/templates';
import CakePreview from '@/components/CakePreview';
import type { Topping } from '@/components/CakePreview';
import CandleInput from '@/components/Editor/CandleInput';
import { detectCurrencyAsync } from '@/lib/detectCurrency';
import type { SupportedCurrency } from '@/lib/detectCurrency';

// ---------------------------------------------------------------------------
// Card Editor Page — /create
// ---------------------------------------------------------------------------
// Payment-gated card creation (Buy Me a Coffee required).
// On completion, a payment modal appears (₹19 / $1 / €1 based on region).
// After the user confirms payment, the card is saved via POST /api/cards
// and the user is redirected to /card/[slug]/donate.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// PaymentGateModal — shown before card creation to require BMAC payment
// ---------------------------------------------------------------------------
const CURRENCY_PRICES: Record<SupportedCurrency, { symbol: string; amount: number; label: string }> = {
    INR: { symbol: '₹', amount: 19, label: '₹19' },
    USD: { symbol: '$', amount: 1, label: '$1' },
    EUR: { symbol: '€', amount: 1, label: '€1' },
};

interface PaymentGateModalProps {
    currency: SupportedCurrency;
    bmacUsername: string;
    onConfirm: () => void;
    onCancel: () => void;
    saving: boolean;
}

function PaymentGateModal({ currency, bmacUsername, onConfirm, onCancel, saving }: PaymentGateModalProps) {
    const [hasPaid, setHasPaid] = useState(false);
    const price = CURRENCY_PRICES[currency];
    const bmacUrl = `https://www.buymeacoffee.com/${bmacUsername}`;

    const handlePayNow = () => {
        window.open(bmacUrl, '_blank', 'noopener,noreferrer');
        // After a short delay, reveal the confirm button
        setTimeout(() => setHasPaid(true), 2000);
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onCancel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />

                {/* Modal */}
                <motion.div
                    className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center"
                    initial={{ opacity: 0, scale: 0.85, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 30 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                    {/* Close button */}
                    <button
                        onClick={onCancel}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    {/* Coffee icon */}
                    <div className="text-5xl mb-3">☕</div>

                    <h2 className="text-xl font-bold mb-2 font-serif text-gray-800">
                        One small coffee, please!
                    </h2>
                    <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                        Creating a card costs just{' '}
                        <span className="font-bold text-pink-500 text-base">{price.label}</span>.
                        Your support keeps this service alive 💖
                    </p>

                    {/* Step 1 — Pay */}
                    <motion.button
                        onClick={handlePayNow}
                        className="w-full py-3.5 rounded-2xl text-base font-bold text-white shadow-lg mb-3 flex items-center justify-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, #FFDD00, #FFC200)',
                            color: '#000',
                        }}
                        whileHover={{ scale: 1.03, boxShadow: '0 0 24px #FFD70080' }}
                        whileTap={{ scale: 0.97 }}
                    >
                        ☕ Pay {price.label} on Buy Me a Coffee
                    </motion.button>

                    {/* Step 2 — Confirm (appears after clicking Pay) */}
                    <AnimatePresence>
                        {hasPaid && (
                            <motion.button
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                                exit={{ opacity: 0, height: 0 }}
                                onClick={onConfirm}
                                disabled={saving}
                                className="w-full py-3.5 rounded-2xl text-base font-bold text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #E85D9C, #c2185b)' }}
                                whileHover={!saving ? { scale: 1.03 } : {}}
                                whileTap={!saving ? { scale: 0.97 } : {}}
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        Creating your card...
                                    </>
                                ) : (
                                    '✅ I\'ve paid — Create my card! 🎂'
                                )}
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <p className="text-xs text-gray-400 mt-1">
                        Clicking "Pay" will open Buy Me a Coffee in a new tab.
                        Return here and click confirm once done.
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

type CakeShape = 'round' | 'heart' | 'sheet' | 'tiered';

interface CardFormData {
    to: string;
    message: string;
    from: string;
    templateId: string;
    cakeOptions: {
        shape: CakeShape;
        icingColor: string;
        icingGradient: string | null;
        showCandles: boolean;
        candleCount: number;
        toppings: Topping[];
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

// Map font names from templates to CSS variable font families
const FONT_FAMILY_MAP: Record<string, string> = {
    'Poppins': 'var(--font-poppins), Poppins, sans-serif',
    'Playfair Display': 'var(--font-playfair), Playfair Display, serif',
    'Inter': 'var(--font-inter), Inter, sans-serif',
    'Roboto Slab': 'var(--font-roboto-slab), Roboto Slab, serif',
    'Merriweather': 'var(--font-merriweather), Merriweather, serif',
    'Lato': 'var(--font-lato), Lato, sans-serif',
    'Baloo 2': 'var(--font-baloo-2), Baloo 2, cursive',
    'Nunito': 'var(--font-nunito), Nunito, sans-serif',
};

function getFontFamily(fontName: string): string {
    return FONT_FAMILY_MAP[fontName] || fontName;
}

export default function CreatePage() {
    const router = useRouter();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currency, setCurrency] = useState<SupportedCurrency>('INR');
    const editorRef = useRef<HTMLDivElement>(null);

    // Detect user's currency on mount
    useEffect(() => {
        detectCurrencyAsync().then(setCurrency);
    }, []);

    // BMAC username from env (exposed via next.config or hardcoded fallback)
    const bmacUsername = process.env.NEXT_PUBLIC_BMAC_USERNAME || 'prajwalmd';

    const [formData, setFormData] = useState<CardFormData>({
        to: 'Dear ',
        message: '',
        from: '',
        templateId: 'pastel-heart',
        cakeOptions: {
            shape: 'round',
            icingColor: '#FF9CCF',
            icingGradient: null,
            showCandles: true,
            candleCount: 5,
            toppings: [],
        },
        addOns: {
            confetti: true,
            backgroundMusic: false,
        },
        colorPalette: null,
        fontChoice: null,
    });

    const selectedTemplate = templates.find((t) => t.id === formData.templateId) || templates[0];

    // Determine active font: user's choice or template's primary
    const activeFont = formData.fontChoice || selectedTemplate.fontPrimary;

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

    // Sync contentEditable HTML into formData.message
    const handleEditorInput = useCallback(() => {
        if (editorRef.current) {
            setFormData((prev) => ({
                ...prev,
                message: editorRef.current?.innerHTML || '',
            }));
        }
    }, []);

    // Bold: wrap selection or insert placeholder
    const handleBold = useCallback(() => {
        editorRef.current?.focus();
        document.execCommand('bold', false);
        handleEditorInput();
    }, [handleEditorInput]);

    // Italic: wrap selection or insert placeholder
    const handleItalic = useCallback(() => {
        editorRef.current?.focus();
        document.execCommand('italic', false);
        handleEditorInput();
    }, [handleEditorInput]);

    // Insert emoji at cursor in the contentEditable div
    const insertEmoji = useCallback(
        (emoji: string) => {
            editorRef.current?.focus();
            document.execCommand('insertText', false, ` ${emoji} `);
            handleEditorInput();
            setShowEmojiPicker(false);
        },
        [handleEditorInput]
    );

    const isFormValid =
        formData.to.trim().length > 0 &&
        formData.message.trim().length > 0 &&
        formData.from.trim().length > 0;

    // Called when user clicks "Complete & Save Card" — shows payment modal
    const handleComplete = () => {
        if (!isFormValid || saving) return;
        setSaveError(null);
        setShowPaymentModal(true);
    };

    // Called after user confirms payment in the modal — actually creates the card
    const handleConfirmPayment = async () => {
        setSaving(true);

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
            setShowPaymentModal(false);
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
            {/* Payment Gate Modal */}
            {showPaymentModal && (
                <PaymentGateModal
                    currency={currency}
                    bmacUsername={bmacUsername}
                    onConfirm={handleConfirmPayment}
                    onCancel={() => {
                        if (!saving) setShowPaymentModal(false);
                    }}
                    saving={saving}
                />
            )}
            {/* Top nav */}
            <nav className="fixed top-0 w-full z-50 glass">
                <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="text-lg sm:text-xl font-bold gradient-text font-serif">
                        🎂 HappyBirthday
                    </Link>
                    <span className="text-xs sm:text-sm text-gray-500">Create Your Card</span>
                </div>
            </nav>

            <div className="pt-16 sm:pt-20 pb-28 sm:pb-12 px-3 sm:px-4 max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* ============ LEFT: Editor Form ============ */}
                    <div className="space-y-4 sm:space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-1 sm:mb-2">Create Your Card</h1>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                Fill in the details, pick a template, and customize your cake.
                            </p>
                        </motion.div>

                        {/* To Field */}
                        <div className="glass rounded-xl p-3 sm:p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                To
                            </label>
                            <input
                                type="text"
                                value={formData.to}
                                onChange={(e) => updateField('to', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pastel-300 focus:border-transparent outline-none transition-all text-base"
                                placeholder="Dear Friend"
                                autoFocus
                            />
                        </div>

                        {/* Message — Rich Text Editor */}
                        <div className="glass rounded-xl p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-semibold text-gray-700">
                                    Message
                                </label>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={handleBold}
                                        className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded font-bold transition-colors"
                                        title="Bold — select text first, then click"
                                        type="button"
                                    >
                                        B
                                    </button>
                                    <button
                                        onClick={handleItalic}
                                        className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded italic transition-colors"
                                        title="Italic — select text first, then click"
                                        type="button"
                                    >
                                        I
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-sm bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded transition-colors"
                                            title="Insert emoji"
                                            type="button"
                                        >
                                            😊
                                        </button>
                                        {showEmojiPicker && (
                                            <div className="absolute top-10 right-0 bg-white shadow-xl rounded-xl p-3 grid grid-cols-8 gap-3 z-20 border min-w-[280px]">
                                                {EMOJI_LIST.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => insertEmoji(emoji)}
                                                        className="text-2xl hover:scale-125 transition-transform p-1 text-center"
                                                        type="button"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div
                                ref={editorRef}
                                contentEditable
                                onInput={handleEditorInput}
                                data-placeholder="Wishing you the happiest birthday! 🎉  Select text and click B or I to format."
                                className="rich-editor w-full px-3 sm:px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pastel-300 focus:border-transparent transition-all text-base"
                            />
                            <p className="text-xs text-gray-400 mt-1.5">
                                💡 Type your message, select text, then press <strong>B</strong> or <strong>I</strong> to format.
                            </p>
                        </div>

                        {/* From Field */}
                        <div className="glass rounded-xl p-3 sm:p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                From
                            </label>
                            <input
                                type="text"
                                value={formData.from}
                                onChange={(e) => updateField('from', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pastel-300 focus:border-transparent outline-none transition-all text-base"
                                placeholder="Your name"
                            />
                        </div>

                        {/* Template Selector */}
                        <div className="glass rounded-xl p-3 sm:p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Choose Template
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {templates.map((t) => (
                                    <motion.button
                                        key={t.id}
                                        onClick={() => {
                                            updateField('templateId', t.id);
                                            // Reset font choice when template changes
                                            updateField('fontChoice', null);
                                        }}
                                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${formData.templateId === t.id
                                            ? 'border-pastel-400 shadow-lg scale-[1.02]'
                                            : 'border-transparent hover:border-gray-200'
                                            }`}
                                        style={{ background: t.tailwindColors.bg }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div
                                            className="text-sm font-bold mb-1"
                                            style={{
                                                color: t.tailwindColors.text,
                                                fontFamily: getFontFamily(t.fontPrimary),
                                            }}
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
                        <div className="glass rounded-xl p-3 sm:p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Font Style
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() =>
                                        updateField('fontChoice', selectedTemplate.fontPrimary)
                                    }
                                    className={`flex-1 px-3 sm:px-4 py-3 rounded-xl border-2 text-center transition-all min-h-[48px] ${formData.fontChoice === selectedTemplate.fontPrimary ||
                                        (!formData.fontChoice)
                                        ? 'border-pastel-400 bg-pastel-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span
                                        className="text-sm font-medium"
                                        style={{ fontFamily: getFontFamily(selectedTemplate.fontPrimary) }}
                                    >
                                        {selectedTemplate.fontPrimary}
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        updateField('fontChoice', selectedTemplate.fontAccent)
                                    }
                                    className={`flex-1 px-3 sm:px-4 py-3 rounded-xl border-2 text-center transition-all min-h-[48px] ${formData.fontChoice === selectedTemplate.fontAccent
                                        ? 'border-pastel-400 bg-pastel-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span
                                        className="text-sm font-medium"
                                        style={{ fontFamily: getFontFamily(selectedTemplate.fontAccent) }}
                                    >
                                        {selectedTemplate.fontAccent}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Cake Options */}
                        <div className="glass rounded-xl p-3 sm:p-4 space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">
                                Cake Options
                            </label>

                            {/* Shape */}
                            <div>
                                <span className="text-xs text-gray-500">Shape</span>
                                <div className="flex gap-2 mt-1">
                                    {(['round', 'heart', 'sheet', 'tiered'] as CakeShape[]).map((shape) => (
                                        <button
                                            key={shape}
                                            onClick={() => updateCakeOption('shape', shape)}
                                            className={`px-3 sm:px-4 py-2.5 rounded-lg text-sm capitalize transition-all min-h-[44px] ${formData.cakeOptions.shape === shape
                                                ? 'bg-pastel-400 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            {shape === 'round' && '⭕'}
                                            {shape === 'heart' && '💖'}
                                            {shape === 'sheet' && '▬'}
                                            {shape === 'tiered' && '🎂'} {shape}
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
                                            className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full border-2 transition-all ${formData.cakeOptions.icingColor === color.value
                                                ? 'border-gray-800 scale-110'
                                                : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                            style={{ background: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Color Palette Presets */}
                            <div>
                                <span className="text-xs text-gray-500">Palette Presets</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedTemplate.colorPalettePresets.map((preset: ColorPalettePreset) => (
                                        <button
                                            key={preset.name}
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    cakeOptions: {
                                                        ...prev.cakeOptions,
                                                        icingColor: preset.icing,
                                                        icingGradient: preset.icingGradient || null,
                                                    },
                                                    colorPalette: preset.name,
                                                }));
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] border ${formData.colorPalette === preset.name
                                                ? 'border-gray-800 shadow-sm scale-105'
                                                : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                            style={{
                                                background: preset.icingGradient
                                                    ? `linear-gradient(135deg, ${preset.icing}, ${preset.icingGradient})`
                                                    : preset.icing,
                                                color: ['#FFFFFF', '#FFFFF0', '#F7E7CE', '#FFE5B4', '#FFDAB9', '#FFB6C1'].includes(preset.icing) ? '#333' : '#fff',
                                            }}
                                            title={preset.name}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Toppings */}
                            <div>
                                <span className="text-xs text-gray-500">Toppings</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {([['sprinkles', '🌈'], ['cherries', '🍒'], ['macarons', '🧁'], ['fruit', '🍓']] as [Topping, string][]).map(([topping, emoji]) => (
                                        <button
                                            key={topping}
                                            onClick={() => {
                                                setFormData((prev) => {
                                                    const current = prev.cakeOptions.toppings;
                                                    const updated = current.includes(topping)
                                                        ? current.filter((t) => t !== topping)
                                                        : [...current, topping];
                                                    return {
                                                        ...prev,
                                                        cakeOptions: { ...prev.cakeOptions, toppings: updated },
                                                    };
                                                });
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm capitalize transition-all min-h-[44px] ${formData.cakeOptions.toppings.includes(topping)
                                                ? 'bg-pastel-400 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            {emoji} {topping}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Candles */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.cakeOptions.showCandles}
                                        onChange={(e) =>
                                            updateCakeOption('showCandles', e.target.checked)
                                        }
                                        className="w-5 h-5 sm:w-4 sm:h-4 rounded accent-pastel-400"
                                    />
                                    <span className="text-sm">Show Candles</span>
                                </label>
                                {formData.cakeOptions.showCandles && (
                                    <CandleInput
                                        value={formData.cakeOptions.candleCount}
                                        onChange={(count) => updateCakeOption('candleCount', count)}
                                        min={1}
                                        max={10}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Add-ons */}
                        <div className="glass rounded-xl p-3 sm:p-4 space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                Add-ons
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                                <input
                                    type="checkbox"
                                    checked={formData.addOns.confetti}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            addOns: { ...prev.addOns, confetti: e.target.checked },
                                        }))
                                    }
                                    className="w-5 h-5 sm:w-4 sm:h-4 rounded accent-pastel-400"
                                />
                                <span className="text-sm">🎊 Confetti animation</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
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
                                    className="w-5 h-5 sm:w-4 sm:h-4 rounded accent-pastel-400"
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
                    <div className="lg:sticky lg:top-20 lg:self-start space-y-4 sm:space-y-6">
                        {/* Live Preview */}
                        <motion.div
                            className="rounded-2xl overflow-hidden shadow-xl"
                            style={{
                                background: selectedTemplate.tailwindColors.bg,
                                fontFamily: getFontFamily(activeFont),
                            }}
                            layout
                        >
                            <div className="p-4 sm:p-6 text-center space-y-4">
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
                                            className="text-xl font-bold mb-2"
                                            style={{
                                                color: selectedTemplate.tailwindColors.primary,
                                                fontFamily: getFontFamily(activeFont),
                                            }}
                                        >
                                            {formData.to || 'Dear Friend'}
                                        </div>

                                        {/* Cake preview */}
                                        <div className="flex justify-center my-4">
                                            <CakePreview
                                                shape={formData.cakeOptions.shape}
                                                icingColor={formData.cakeOptions.icingColor}
                                                icingGradient={formData.cakeOptions.icingGradient || undefined}
                                                candleCount={formData.cakeOptions.candleCount}
                                                showCandles={formData.cakeOptions.showCandles}
                                                toppings={formData.cakeOptions.toppings}
                                                size="md"
                                            />
                                        </div>

                                        {/* Message preview — renders HTML from contentEditable */}
                                        <div
                                            className="text-sm px-3 sm:px-4 min-h-[3rem] leading-relaxed"
                                            style={{
                                                color: selectedTemplate.tailwindColors.text,
                                                fontFamily: getFontFamily(activeFont),
                                            }}
                                        >
                                            {formData.message ? (
                                                <span dangerouslySetInnerHTML={{ __html: formData.message }} />
                                            ) : (
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
                                        <div className="mt-4 flex justify-center gap-2 flex-wrap">
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
                                className="px-4 sm:px-6 py-3 text-center text-xs font-medium"
                                style={{
                                    background: selectedTemplate.tailwindColors.accent,
                                    color: selectedTemplate.tailwindColors.bg,
                                }}
                            >
                                {selectedTemplate.name} Template • {activeFont}
                            </div>
                        </motion.div>

                        {/* Complete & Save Section — hidden on mobile (shown as fixed bar below) */}
                        <motion.div
                            className="hidden sm:block glass rounded-2xl p-4 sm:p-6 space-y-4"
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
                                <div className="text-lg font-bold text-pink-500">☕ Paid</div>
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
                                A small support fee (₹19 / $1 / €1) keeps this service alive ❤️
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Fixed bottom CTA for mobile */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-200 px-4 py-3 safe-area-pb">
                {saveError && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                        {saveError}
                        <button onClick={() => setSaveError(null)} className="ml-1 underline">
                            Dismiss
                        </button>
                    </div>
                )}
                <button
                    onClick={handleComplete}
                    disabled={!isFormValid || saving}
                    className="w-full py-3.5 rounded-xl text-base font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: isFormValid ? '#E85D9C' : '#ccc' }}
                >
                    {saving ? 'Saving...' : '🎂 Complete & Save Card ☕'}
                </button>
            </div>
        </div>
    );
}
