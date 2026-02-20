'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import CakePreview from '@/components/CakePreview';

// ---------------------------------------------------------------------------
// Landing Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text font-serif">
            🎂 HappyBirthday
          </Link>
          <div className="flex gap-4 items-center">
            <Link
              href="/create"
              className="bg-pastel-400 hover:bg-pastel-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
            >
              Create a Card
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Left content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="gradient-text font-serif">Birthday Magic</span>
              <br />
              <span className="text-gray-800">at Your Fingertips</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Create stunning animated birthday cards with beautiful cakes,
              sparkling confetti, and heartfelt messages. Send love for just{' '}
              <span className="font-bold text-pastel-400">₹19</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/create">
                <motion.button
                  className="bg-pastel-400 hover:bg-pastel-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg pulse-glow transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  🎉 Create a Card — ₹19
                </motion.button>
              </Link>
              <Link href="#how-it-works">
                <button className="border-2 border-pastel-300 text-pastel-400 px-8 py-4 rounded-full text-lg font-semibold hover:bg-pastel-50 transition-all">
                  How It Works
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right — animated cake */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="float-animation">
              <CakePreview
                shape="round"
                icingColor="#FF9CCF"
                candleCount={5}
                showCandles={true}
                size="lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-16 font-serif"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: '✍️',
                title: 'Write Your Message',
                desc: 'Add a personal message with rich formatting, choose a template, and customize your cake.',
              },
              {
                emoji: '💳',
                title: 'Quick Payment — ₹19',
                desc: 'Pay securely via PayPal. Your card is created instantly with a unique shareable link.',
              },
              {
                emoji: '🎁',
                title: 'Share the Joy',
                desc: 'Send via WhatsApp, Telegram, or any platform. Recipients get an animated, interactive experience!',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="glass rounded-2xl p-8 text-center hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-5xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section className="py-20 px-4 bg-white/40">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-4 font-serif"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Beautiful Templates
          </motion.h2>
          <p className="text-center text-gray-600 mb-12">
            Choose from 4 stunning designs, each with unique animations and vibes.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Pastel Heart', bg: '#FFF7FB', accent: '#FF9CCF', emoji: '💖' },
              { name: 'Bold Neon', bg: '#0A0A1A', accent: '#00FFAA', emoji: '⚡', dark: true },
              { name: 'Classic Elegant', bg: '#FFFCF5', accent: '#C9A84C', emoji: '✨' },
              { name: 'Cute Cartoon', bg: '#FFF9E6', accent: '#4ECDC4', emoji: '🎈' },
            ].map((template, i) => (
              <motion.div
                key={i}
                className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
                style={{ background: template.bg }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="p-6 text-center" style={{ minHeight: '180px' }}>
                  <div className="text-5xl mb-3">{template.emoji}</div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: template.dark ? '#E8E8FF' : '#333' }}
                  >
                    {template.name}
                  </h3>
                  <div
                    className="w-12 h-1 rounded-full mx-auto"
                    style={{ background: template.accent }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-2xl mx-auto text-center glass rounded-3xl p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 font-serif">
            Make Someone&apos;s Day Special
          </h2>
          <p className="text-gray-600 mb-8">
            A personalized, animated birthday card delivered in seconds.
          </p>
          <Link href="/create">
            <motion.button
              className="bg-pastel-400 hover:bg-pastel-500 text-white px-10 py-4 rounded-full text-xl font-semibold shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              🎂 Create Your Card Now
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-500 text-sm">
        <p>
          Made with ❤️ for birthday celebrations everywhere.{' '}
          <span className="mx-2">•</span>
          <Link href="/admin" className="hover:text-pastel-400 underline">
            Admin
          </Link>
        </p>
        <p className="mt-1 text-xs">
          We store only necessary information. Cards can be deleted at any time.{' '}
          <Link href="#" className="underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
