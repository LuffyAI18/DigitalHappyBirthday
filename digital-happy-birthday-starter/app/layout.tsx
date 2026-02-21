import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Digital Happy Birthday Cards — Send a Personalized Animated Card',
  description:
    'Create and send beautiful animated birthday cards with custom messages, cake designs, and confetti — completely free. Share via WhatsApp, Telegram, or link.',
  keywords: [
    'birthday card',
    'digital birthday card',
    'animated birthday card',
    'online birthday card',
    'send birthday card',
  ],
  openGraph: {
    title: 'Digital Happy Birthday Cards',
    description:
      'Create beautiful personalized animated birthday cards — free.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Happy Birthday Cards',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Happy Birthday Cards',
    description:
      'Create beautiful personalized animated birthday cards — free.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
