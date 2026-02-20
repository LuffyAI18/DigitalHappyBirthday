// ---------------------------------------------------------------------------
// Simple Profanity Filter
// ---------------------------------------------------------------------------
// Uses a small embedded word list for demo/MVP purposes.
// For production, consider a more comprehensive library like 'bad-words'
// or a managed content-moderation API.
// ---------------------------------------------------------------------------

const PROFANITY_WORDS: string[] = [
    'ass', 'asshole', 'bastard', 'bitch', 'bollocks', 'bullshit',
    'crap', 'cunt', 'damn', 'dick', 'douchebag', 'fag', 'fuck',
    'goddamn', 'hell', 'jerk', 'motherfucker', 'nigger', 'piss',
    'prick', 'shit', 'slut', 'twat', 'whore', 'wanker',
];

const PROFANITY_REGEX = new RegExp(
    `\\b(${PROFANITY_WORDS.join('|')})\\b`,
    'gi'
);

/**
 * Check if text contains any profanity words.
 */
export function containsProfanity(text: string): boolean {
    return PROFANITY_REGEX.test(text);
}

/**
 * Replace profanity words with asterisks.
 */
export function filterProfanity(text: string): string {
    return text.replace(PROFANITY_REGEX, (match) =>
        '*'.repeat(match.length)
    );
}

/**
 * Check text and return a result object with details.
 */
export function checkProfanity(text: string): {
    hasProfanity: boolean;
    filtered: string;
    flaggedWords: string[];
} {
    const flaggedWords: string[] = [];
    const filtered = text.replace(PROFANITY_REGEX, (match) => {
        flaggedWords.push(match.toLowerCase());
        return '*'.repeat(match.length);
    });

    return {
        hasProfanity: flaggedWords.length > 0,
        filtered,
        flaggedWords: [...new Set(flaggedWords)],
    };
}
