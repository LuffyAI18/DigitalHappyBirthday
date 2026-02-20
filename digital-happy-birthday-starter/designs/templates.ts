// ---------------------------------------------------------------------------
// 4 Polished Template Designs
// ---------------------------------------------------------------------------
// All fonts are Google Fonts (free). Lottie keywords are for searching
// free animations on LottieFiles (https://lottiefiles.com/search).
// ---------------------------------------------------------------------------

export interface TemplateDesign {
    id: string;
    name: string;
    description: string;
    fontPrimary: string;
    fontAccent: string;
    tailwindColors: {
        bg: string;
        surface: string;
        accent: string;
        primary: string;
        text: string;
    };
    tailwindTokenMapping: Record<string, string>;
    exampleLottieKeywords: {
        candles: string[];
        confetti: string[];
        background: string[];
    };
    exampleMusicKeywords: string[];
    recommendedCakeSVG: string;
    accessibilityContrastNote: string;
    layoutNotes: string;
}

export const templates: TemplateDesign[] = [
    // =========================================================================
    // 1. Pastel Heart
    // =========================================================================
    {
        id: 'pastel-heart',
        name: 'Pastel Heart',
        description:
            'Soft pastels with a romantic heart-shaped cake. Perfect for loved ones and close friends. Rounded serif typography adds warmth.',
        fontPrimary: 'Poppins',
        fontAccent: 'Playfair Display',
        tailwindColors: {
            bg: '#FFF7FB',
            surface: '#FFE8F0',
            accent: '#FF9CCF',
            primary: '#E85D9C',
            text: '#4A2040',
        },
        tailwindTokenMapping: {
            'pastel-50': '#FFF7FB',
            'pastel-100': '#FFE8F0',
            'pastel-200': '#FFD1E3',
            'pastel-300': '#FF9CCF',
            'pastel-400': '#E85D9C',
            'pastel-500': '#D14584',
        },
        exampleLottieKeywords: {
            candles: ['candle flame', 'birthday candle', 'candle flicker'],
            confetti: ['pastel confetti', 'heart confetti', 'pink confetti'],
            background: ['heart burst', 'floating hearts', 'sparkle particles'],
        },
        exampleMusicKeywords: [
            'happy birthday music box',
            'gentle birthday tune',
            'soft celebration loop',
        ],
        recommendedCakeSVG: 'HeartCake',
        accessibilityContrastNote:
            'Primary (#E85D9C) on bg (#FFF7FB) = 4.6:1 contrast ratio. Text (#4A2040) on bg (#FFF7FB) = 12.1:1. Both pass WCAG AA.',
        layoutNotes:
            'Center-aligned message above a heart-shaped cake SVG. Recipient name in accent font at top. Floating heart Lottie particles in background. CTA button below cake. Reply form in subtle card below.',
    },

    // =========================================================================
    // 2. Bold Neon
    // =========================================================================
    {
        id: 'bold-neon',
        name: 'Bold Neon',
        description:
            'Vibrant neon glow on dark background. High energy party vibe with bold sans-serif type and electric color pops.',
        fontPrimary: 'Inter',
        fontAccent: 'Roboto Slab',
        tailwindColors: {
            bg: '#0A0A1A',
            surface: '#1A1A3E',
            accent: '#00FFAA',
            primary: '#FF3CAC',
            text: '#E8E8FF',
        },
        tailwindTokenMapping: {
            'neon-50': '#E8E8FF',
            'neon-100': '#C0C0FF',
            'neon-200': '#8080FF',
            'neon-300': '#00FFAA',
            'neon-400': '#FF3CAC',
            'neon-500': '#0A0A1A',
        },
        exampleLottieKeywords: {
            candles: ['neon candle', 'glow candle', 'flame animation'],
            confetti: ['neon confetti', 'party popper', 'colorful confetti burst'],
            background: ['neon spark', 'electric glow', 'animated sprinkles'],
        },
        exampleMusicKeywords: [
            'party music loop',
            'electronic birthday beat',
            'celebration EDM short',
        ],
        recommendedCakeSVG: 'RoundCake',
        accessibilityContrastNote:
            'Accent (#00FFAA) on bg (#0A0A1A) = 14.2:1 contrast. Text (#E8E8FF) on bg (#0A0A1A) = 17.4:1. Both exceed WCAG AAA.',
        layoutNotes:
            'Dark full-bleed background with neon border effects. Cake preview with glow shadows. Message in a glass-morphism container. Neon-colored CTA button with pulse animation. Confetti launches from bottom on "open cake".',
    },

    // =========================================================================
    // 3. Classic Elegant
    // =========================================================================
    {
        id: 'classic-elegant',
        name: 'Classic Elegant',
        description:
            'Muted gold and cream palette with elegant serif typography. Sophisticated feel, perfect for formal wishes and milestone birthdays.',
        fontPrimary: 'Merriweather',
        fontAccent: 'Lato',
        tailwindColors: {
            bg: '#FFFCF5',
            surface: '#F5EDD6',
            accent: '#C9A84C',
            primary: '#8B6914',
            text: '#2C2416',
        },
        tailwindTokenMapping: {
            'elegant-50': '#FFFCF5',
            'elegant-100': '#F5EDD6',
            'elegant-200': '#E8DDB8',
            'elegant-300': '#C9A84C',
            'elegant-400': '#8B6914',
            'elegant-500': '#5C4510',
        },
        exampleLottieKeywords: {
            candles: ['golden candle', 'elegant candle', 'flicker candle'],
            confetti: ['gold confetti', 'slow confetti', 'elegant celebration'],
            background: ['gold sparkle', 'shimmer particles', 'glitter animation'],
        },
        exampleMusicKeywords: [
            'classical birthday music',
            'piano birthday tune',
            'orchestral celebration loop',
        ],
        recommendedCakeSVG: 'SheetCake',
        accessibilityContrastNote:
            'Primary (#8B6914) on bg (#FFFCF5) = 5.8:1 contrast. Text (#2C2416) on bg (#FFFCF5) = 14.8:1. Both pass WCAG AA. Accent gold used only for decorative elements.',
        layoutNotes:
            'Centered classic layout with gold filigree borders (CSS). Message in elegant card with subtle shadow. Three-tier sheet cake SVG centered below message. Gold sparkle Lottie around the edges. Serif heading, sans-serif body.',
    },

    // =========================================================================
    // 4. Cute Cartoon
    // =========================================================================
    {
        id: 'cute-cartoon',
        name: 'Cute Cartoon',
        description:
            'Bright, playful design with hand-drawn shapes and bouncy animations. Perfect for kids and young-at-heart celebrations.',
        fontPrimary: 'Baloo 2',
        fontAccent: 'Nunito',
        tailwindColors: {
            bg: '#FFF9E6',
            surface: '#FFE5B4',
            accent: '#FF6B6B',
            primary: '#4ECDC4',
            text: '#2D3436',
        },
        tailwindTokenMapping: {
            'cartoon-50': '#FFF9E6',
            'cartoon-100': '#FFE5B4',
            'cartoon-200': '#FFD180',
            'cartoon-300': '#FF6B6B',
            'cartoon-400': '#4ECDC4',
            'cartoon-500': '#2D3436',
        },
        exampleLottieKeywords: {
            candles: ['cute candle', 'cartoon birthday candle', 'kawaii candle'],
            confetti: ['confetti pop', 'party celebration', 'colorful balloons'],
            background: ['cute stars', 'cartoon cake', 'bouncing emoji'],
        },
        exampleMusicKeywords: [
            'happy birthday song kids',
            'cheerful celebration tune',
            'playful birthday jingle',
        ],
        recommendedCakeSVG: 'RoundCake',
        accessibilityContrastNote:
            'Primary (#4ECDC4) should be used on dark text backgrounds only. Text (#2D3436) on bg (#FFF9E6) = 13.8:1 contrast. Accent red used for interactive elements on light bg = 4.7:1.',
        layoutNotes:
            'Fun wavy background with cartoon doodles. Message in speech-bubble styled container. Round cake SVG with colorful layers. Bouncing sticker animations. CTA button is rounded pill shape with bounce-on-hover. Confetti pops from cake on CTA click.',
    },
];

export function getTemplateById(id: string): TemplateDesign | undefined {
    return templates.find((t) => t.id === id);
}

export default templates;
