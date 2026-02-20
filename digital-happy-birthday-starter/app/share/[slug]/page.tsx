'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ShareButtons from '@/components/ShareButtons';

// ---------------------------------------------------------------------------
// Share Page — /share/[slug]
// ---------------------------------------------------------------------------
// Shown after successful payment. Provides sharing options.
// ---------------------------------------------------------------------------

export default function SharePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    // Unwrap params in client component
    const slug = (params as unknown as { slug: string }).slug;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                className="max-w-md w-full glass rounded-3xl p-8 text-center space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Success icon */}
                <motion.div
                    className="text-6xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    🎉
                </motion.div>

                <div>
                    <h1 className="text-2xl font-bold font-serif mb-2">
                        Your Card is Ready!
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Share this unique link with the birthday person. They&apos;ll see
                        an animated, interactive card experience! 🎂
                    </p>
                </div>

                <ShareButtons slug={slug} />

                {/* Preview link */}
                <div className="pt-4 border-t border-gray-200">
                    <Link
                        href={`/card/${slug}`}
                        className="inline-flex items-center gap-2 text-pastel-400 hover:text-pastel-500 font-medium transition-colors"
                    >
                        👀 Preview your card
                    </Link>
                </div>

                {/* Back to home */}
                <Link
                    href="/"
                    className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                    ← Create another card
                </Link>
            </motion.div>
        </div>
    );
}
