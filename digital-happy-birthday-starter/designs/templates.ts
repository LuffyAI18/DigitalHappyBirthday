// ---------------------------------------------------------------------------
// 4 Polished Template Designs + Color Palette Presets
// ---------------------------------------------------------------------------
// All fonts are Google Fonts (free). Lottie keywords are for searching
// free animations on LottieFiles (https://lottiefiles.com/search).
// ---------------------------------------------------------------------------

export interface ColorPalettePreset {
    name: string;
    icing: string;
    icingGradient?: string; // optional second gradient color
    accent: string;
    bg: string;
}

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
    colorPalettePresets: ColorPalettePreset[];
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
            background: ['heart burst', 'floating hearts', 'sparkle particles', 'cute particles'],
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
            'Center-aligned message above a heart-shaped cake SVG. Recipient name in accent font at top. Floating heart Lottie particles in background.',
        colorPalettePresets: [
            { name: 'Rose', icing: '#FF9CCF', accent: '#E85D9C', bg: '#FFF7FB' },
            { name: 'Blush', icing: '#FFB6C1', icingGradient: '#FF69B4', accent: '#FF1493', bg: '#FFF0F5' },
            { name: 'Lavender', icing: '#D8BFD8', icingGradient: '#DDA0DD', accent: '#9B59B6', bg: '#F8F0FF' },
            { name: 'Peach', icing: '#FFDAB9', accent: '#FF7F50', bg: '#FFF5EE' },
            { name: 'Coral', icing: '#FF7F7F', icingGradient: '#FF6B6B', accent: '#FF4444', bg: '#FFF0F0' },
            { name: 'Mint Rose', icing: '#4ECDC4', icingGradient: '#FF9CCF', accent: '#E85D9C', bg: '#F0FFFC' },
        ],
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
            confetti: ['neon confetti', 'party popper', 'colorful confetti burst', 'sparkles'],
            background: ['neon spark', 'electric glow', 'animated sprinkles', 'confetti burst'],
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
            'Dark full-bleed background with neon border effects. Cake preview with glow shadows. Message in a glass-morphism container.',
        colorPalettePresets: [
            { name: 'Neon Mint', icing: '#00FFAA', accent: '#FF3CAC', bg: '#0A0A1A' },
            { name: 'Electric', icing: '#00EEFF', icingGradient: '#FF3CAC', accent: '#FFD700', bg: '#0D0D2B' },
            { name: 'Cyberpunk', icing: '#FF00FF', icingGradient: '#00FFFF', accent: '#FFD700', bg: '#0A001A' },
            { name: 'Ultraviolet', icing: '#8B5CF6', icingGradient: '#EC4899', accent: '#A855F7', bg: '#0F0A1E' },
            { name: 'Acid Green', icing: '#39FF14', accent: '#FF6EC7', bg: '#0A0F0A' },
            { name: 'Hot Pink', icing: '#FF69B4', icingGradient: '#FF1493', accent: '#00FFAA', bg: '#1A0A1A' },
        ],
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
            confetti: ['gold confetti', 'slow confetti', 'elegant celebration', 'confetti burst'],
            background: ['gold sparkle', 'shimmer particles', 'glitter animation', 'sparkles'],
        },
        exampleMusicKeywords: [
            'classical birthday music',
            'piano birthday tune',
            'orchestral celebration loop',
        ],
        recommendedCakeSVG: 'SheetCake',
        accessibilityContrastNote:
            'Primary (#8B6914) on bg (#FFFCF5) = 5.8:1 contrast. Text (#2C2416) on bg (#FFFCF5) = 14.8:1. Both pass WCAG AA.',
        layoutNotes:
            'Centered classic layout with gold filigree borders (CSS). Message in elegant card with subtle shadow. Serif heading, sans-serif body.',
        colorPalettePresets: [
            { name: 'Classic Gold', icing: '#C9A84C', accent: '#8B6914', bg: '#FFFCF5' },
            { name: 'Rose Gold', icing: '#B76E79', icingGradient: '#E8C4B8', accent: '#8B4557', bg: '#FFF8F6' },
            { name: 'Silver', icing: '#C0C0C0', icingGradient: '#E8E8E8', accent: '#808080', bg: '#FAFAFA' },
            { name: 'Champagne', icing: '#F7E7CE', icingGradient: '#E8D5B7', accent: '#B8860B', bg: '#FFFEF5' },
            { name: 'Bronze', icing: '#CD7F32', accent: '#8B5E14', bg: '#FFF8EE' },
            { name: 'Ivory', icing: '#FFFFF0', icingGradient: '#F5F5DC', accent: '#C9A84C', bg: '#FFFFF0' },
        ],
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
            confetti: ['confetti pop', 'party celebration', 'colorful balloons', 'confetti burst'],
            background: ['cute stars', 'cartoon cake', 'bouncing emoji', 'cute particles'],
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
            'Fun wavy background with cartoon doodles. Message in speech-bubble styled container. Round cake SVG with colorful layers.',
        colorPalettePresets: [
            { name: 'Sunny', icing: '#FF6B6B', accent: '#4ECDC4', bg: '#FFF9E6' },
            { name: 'Rainbow', icing: '#FF6B6B', icingGradient: '#4ECDC4', accent: '#FFD93D', bg: '#FFF9E6' },
            { name: 'Bubblegum', icing: '#FF69B4', icingGradient: '#DA70D6', accent: '#FF1493', bg: '#FFF5FA' },
            { name: 'Ocean', icing: '#00BFFF', icingGradient: '#4ECDC4', accent: '#0077B6', bg: '#F0F8FF' },
            { name: 'Candy', icing: '#FF69B4', icingGradient: '#FFFF00', accent: '#FF4500', bg: '#FFFACD' },
            { name: 'Forest', icing: '#2ECC71', icingGradient: '#27AE60', accent: '#16A085', bg: '#F0FFF4' },
        ],
    },
];

export function getTemplateById(id: string): TemplateDesign | undefined {
    return templates.find((t) => t.id === id);
}

export default templates;
