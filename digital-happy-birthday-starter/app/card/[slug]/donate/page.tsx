import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCardBySlug } from '@/lib/db';
import { getTemplateById } from '@/designs/templates';
import DonatePageClient from './DonatePageClient';

// ---------------------------------------------------------------------------
// Donate Page — /card/[slug]/donate (SSR)
// ---------------------------------------------------------------------------
// Shown immediately after a user creates and saves a card.
// Displays region-based donation options via Buy Me a Coffee.
// No payment is required — the user can skip and view their card.
// ---------------------------------------------------------------------------

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const card = getCardBySlug(slug);

    if (!card) {
        return { title: 'Card Not Found' };
    }

    const cardData = JSON.parse(card.card_json);

    return {
        title: `Support the Developer — Card for ${cardData.to}`,
        description:
            'Your birthday card is saved! Consider a small donation to support the developer.',
    };
}

export default async function DonatePage({ params }: Props) {
    const { slug } = await params;
    const card = getCardBySlug(slug);

    if (!card) {
        notFound();
    }

    const cardData = JSON.parse(card.card_json);
    const template = getTemplateById(card.template_id) || getTemplateById('pastel-heart')!;
    const bmacUsername = process.env.BMAC_USERNAME || null;

    return (
        <DonatePageClient
            slug={slug}
            cardData={cardData}
            template={template!}
            bmacUsername={bmacUsername}
        />
    );
}
