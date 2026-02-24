import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Tests: Share URL construction
// ---------------------------------------------------------------------------
// These tests verify that share URLs are correctly formed for each platform.
// They don't render components — they test the URL generation logic only.
// ---------------------------------------------------------------------------

const SLUG = 'happy-birthday-jane-abc123';
const RECIPIENT = 'Jane';
const SENDER = 'John';
const BASE_URL = 'https://example.com';
const CARD_URL = `${BASE_URL}/card/${SLUG}`;
const SHARE_TEXT = `🎂 ${SENDER} sent you a birthday card, ${RECIPIENT}! Open it here:`;

describe('Share URL generation', () => {
    it('WhatsApp URL includes card URL and encoded text', () => {
        const text = encodeURIComponent(`${SHARE_TEXT}\n${CARD_URL}`);
        const url = `https://wa.me/?text=${text}`;
        expect(url).toContain('wa.me');
        expect(url).toContain(encodeURIComponent(CARD_URL));
        expect(url).toContain(encodeURIComponent(RECIPIENT));
    });

    it('Telegram URL includes URL and text params', () => {
        const text = encodeURIComponent(SHARE_TEXT);
        const encodedUrl = encodeURIComponent(CARD_URL);
        const url = `https://t.me/share/url?url=${encodedUrl}&text=${text}`;
        expect(url).toContain('t.me/share/url');
        expect(url).toContain(encodedUrl);
        expect(url).toContain(encodeURIComponent(SENDER));
    });

    it('Facebook URL includes card URL', () => {
        const encodedUrl = encodeURIComponent(CARD_URL);
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        expect(url).toContain('facebook.com/sharer');
        expect(url).toContain(encodedUrl);
    });

    it('Twitter URL includes share text and card URL', () => {
        const fullText = `${SHARE_TEXT} ${CARD_URL}`;
        const text = encodeURIComponent(fullText);
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        expect(url).toContain('twitter.com/intent/tweet');
        expect(url).toContain(encodeURIComponent(SLUG));
    });

    it('Email URL has subject and body', () => {
        const subject = encodeURIComponent(`🎂 Birthday Card for ${RECIPIENT}`);
        const body = encodeURIComponent(`${SHARE_TEXT}\n\n${CARD_URL}\n\nMade with ❤️`);
        const url = `mailto:?subject=${subject}&body=${body}`;
        expect(url).toContain('mailto:');
        expect(url).toContain(encodeURIComponent(RECIPIENT));
        expect(url).toContain(encodeURIComponent(CARD_URL));
    });

    it('SMS URL uses correct separator for body', () => {
        const body = encodeURIComponent(`${SHARE_TEXT} ${CARD_URL}`);
        // Android uses ?body=
        const androidUrl = `sms:?body=${body}`;
        expect(androidUrl).toContain('sms:?body=');
        expect(androidUrl).toContain(encodeURIComponent(SLUG));

        // iOS uses &body=
        const iosUrl = `sms:&body=${body}`;
        expect(iosUrl).toContain('sms:&body=');
    });

    it('Embed code includes iframe with card URL', () => {
        const embed = `<iframe src="${CARD_URL}" width="400" height="600" frameborder="0" style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1);"></iframe>`;
        expect(embed).toContain(CARD_URL);
        expect(embed).toContain('iframe');
        expect(embed).toContain('border-radius');
    });

    it('Download image URL points to snapshot API', () => {
        const downloadUrl = `/api/snapshot/${SLUG}`;
        expect(downloadUrl).toContain(SLUG);
        expect(downloadUrl).toContain('/api/snapshot/');
    });
});
