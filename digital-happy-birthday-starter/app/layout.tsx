import type { Metadata } from 'next';
import {
  Inter,
  Playfair_Display,
  Poppins,
  Roboto_Slab,
  Merriweather,
  Lato,
  Baloo_2,
  Nunito,
} from 'next/font/google';
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

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-roboto-slab',
  display: 'swap',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

const baloo2 = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo-2',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
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

const fontVars = [
  inter.variable,
  playfair.variable,
  poppins.variable,
  robotoSlab.variable,
  merriweather.variable,
  lato.variable,
  baloo2.variable,
  nunito.variable,
].join(' ');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVars}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
