'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, Sparkles } from 'lucide-react';

/**
 * Localized Error Page
 *
 * Toss-style dark theme design with:
 * - Error red (#FF453A) accent
 * - Large border radius (24px)
 * - Glow effects on CTAs
 * - Spring animations
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-5">
      {/* Glow Background Effect - Error Red */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FF453A]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 12 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Card */}
        <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-8 text-center">
          {/* Icon with Error Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.1 }}
            className="relative mx-auto mb-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-[#FF453A]/10 flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 rounded-3xl bg-[#FF453A]/20 blur-xl" />
              <AlertCircle className="w-12 h-12 text-[#FF453A] relative z-10" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white mb-3"
          >
            {t('serverError.title')}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[#8B95A1] text-base mb-6 leading-relaxed"
          >
            {t('serverError.description')}
          </motion.p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-6 p-4 rounded-2xl bg-[#FF453A]/5 border border-[#FF453A]/20 text-left"
            >
              <p className="text-sm font-semibold text-[#FF453A] mb-2">Error Details:</p>
              <p className="text-xs font-mono text-[#FF453A]/80 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-[#8B95A1] mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3"
          >
            {/* Primary CTA - Retry with Glow */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={reset}
              className="w-full h-12 px-8 text-base font-semibold text-black bg-[#00E5FF] rounded-2xl inline-flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(0,229,255,0.4)] hover:shadow-[0_0_50px_rgba(0,229,255,0.5)] transition-shadow duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              {t('serverError.retry')}
            </motion.button>

            {/* Secondary Button - Go Home */}
            <Link href="/home">
              <motion.button
                whileHover={{ scale: 1.02, borderColor: 'rgba(0,121,255,0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-10 px-6 text-sm font-medium text-[#0079FF] bg-transparent border border-[#0079FF]/30 rounded-2xl inline-flex items-center justify-center gap-2 hover:bg-[#0079FF]/5 transition-colors duration-200"
              >
                <Home className="w-4 h-4" />
                {t('notFound.backHome')}
              </motion.button>
            </Link>
          </motion.div>

          {/* Contact Support */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-xs text-[#8B95A1]"
          >
            {t('contactSupport')}
          </motion.p>

          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex items-center justify-center gap-2 text-[#8B95A1]/50 text-xs"
          >
            <Sparkles className="w-3 h-3" />
            <span>The Potential</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
