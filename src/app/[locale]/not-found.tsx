'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { FileQuestion, Home, ArrowLeft, Sparkles } from 'lucide-react';

/**
 * Localized 404 Not Found Page
 *
 * Toss-style dark theme design with:
 * - Electric Blue (#0079FF) accent
 * - Large border radius (24px)
 * - Glow effects on CTAs
 * - Spring animations
 */
export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-5">
      {/* Glow Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#0079FF]/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 12 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Card */}
        <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-8 text-center">
          {/* Icon with Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.1 }}
            className="relative mx-auto mb-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-[#0079FF]/10 flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 rounded-3xl bg-[#0079FF]/20 blur-xl" />
              <FileQuestion className="w-12 h-12 text-[#0079FF] relative z-10" />
            </div>
          </motion.div>

          {/* 404 Number */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-2"
          >
            <span className="text-6xl font-extrabold bg-gradient-to-r from-[#0079FF] to-[#00E5FF] bg-clip-text text-transparent">
              404
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-3"
          >
            {t('notFound.title')}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[#8B95A1] text-base mb-8 leading-relaxed"
          >
            {t('notFound.description')}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            {/* Primary CTA with Glow */}
            <Link href="/home">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 px-8 text-base font-semibold text-black bg-[#00E5FF] rounded-2xl inline-flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(0,229,255,0.4)] hover:shadow-[0_0_50px_rgba(0,229,255,0.5)] transition-shadow duration-300"
              >
                <Home className="w-5 h-5" />
                {t('notFound.backHome')}
              </motion.button>
            </Link>

            {/* Secondary Button */}
            <motion.button
              whileHover={{ scale: 1.02, borderColor: 'rgba(0,121,255,0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.history.back()}
              className="w-full h-10 px-6 text-sm font-medium text-[#0079FF] bg-transparent border border-[#0079FF]/30 rounded-2xl inline-flex items-center justify-center gap-2 hover:bg-[#0079FF]/5 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </motion.button>
          </motion.div>

          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2 text-[#8B95A1]/50 text-xs"
          >
            <Sparkles className="w-3 h-3" />
            <span>The Potential</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
