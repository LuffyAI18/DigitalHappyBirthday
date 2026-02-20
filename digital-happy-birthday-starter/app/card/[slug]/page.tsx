import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCardBySlug, getRepliesByCardId } from '@/lib/db';
import { getTemplateById } from '@/designs/templates';
import CardPageClient from './CardPageClient';

// ---------------------------------------------------------------------------
// Card Display Page — /card/[slug] (SSR)
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return {
        title: `🎂 Birthday Card for ${cardData.to}`,
        description: `A special birthday card from ${cardData.from}`,
        openGraph: {
            title: `🎂 Birthday Card for ${cardData.to}`,
            description: `A special birthday message from ${cardData.from}. Open to see the surprise!`,
            url: `${baseUrl}/card/${slug}`,
            type: 'website',
            images: [
                {
                    url: `${baseUrl}/api/snapshot/${slug}`,
                    width: 1200,
                    height: 630,
                    alt: `Birthday card for ${cardData.to}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `🎂 Birthday Card for ${cardData.to}`,
            description: `A special birthday message from ${cardData.from}`,
        },
    };
}

export default async function CardPage({ params }: Props) {
    const { slug } = await params;
    const card = getCardBySlug(slug);

    if (!card) {
        notFound();
    }

    const cardData = JSON.parse(card.card_json);
    const template = getTemplateById(card.template_id);
    const replies = getRepliesByCardId(card.id);

    return (
        <CardPageClient
            slug={slug}
            cardData={cardData}
            template={template!}
            replies={replies}
        />
    );
}
