'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import {
  ArrowRight,
  Mail,
} from 'lucide-react';

import { Logo } from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModalStore } from '@/stores/auth-modal-store';

/** Quick links that map to footer.links translations */
const quickLinks = [
  { key: 'about' as const, href: '/about' },
  { key: 'terms' as const, href: '/terms' },
  { key: 'privacy' as const, href: '/privacy' },
  { key: 'contact' as const, href: '/contact' },
] as const;

/** Social media links */
const socialLinks = [
  {
    key: 'twitter' as const,
    href: 'https://twitter.com',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: 'linkedin' as const,
    href: 'https://linkedin.com',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    key: 'instagram' as const,
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
      </svg>
    ),
  },
] as const;

export function Footer() {
  const t = useTranslations('footer');
  const { isAuthenticated, loading } = useAuth();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#0A0A0A]" role="contentinfo">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0079FF]/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* CTA Section - only for non-authenticated users */}
        {!loading && !isAuthenticated && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="py-12 text-center md:py-16"
            >
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#8B95A1]/60">
                {t('getStarted')}
              </p>
              <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                {t('cta.title')}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-[#8B95A1]">
                {t('cta.subtitle')}
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={openLogin}
                  className="gap-2 shadow-[0_0_25px_rgba(0,121,255,0.25)]"
                >
                  {t('cta.button')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06]" />
          </>
        )}

        {/* Bottom Section: Logo, Links, Social */}
        <div className="py-10 md:py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            {/* Brand */}
            <div className="max-w-xs">
              <Logo height={18} fill="#4B5563" />
              <p className="mt-3 text-sm leading-relaxed text-[#8B95A1]/80">
                {t('description')}
              </p>

              {/* Social Links */}
              <div className="mt-5 flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[#8B95A1] transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white"
                    aria-label={t(`social.${social.key}`)}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer navigation">
              {quickLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="text-sm text-[#8B95A1]/80 transition-colors duration-200 hover:text-white"
                >
                  {t(`links.${link.key}`)}
                </Link>
              ))}
            </nav>

            {/* Newsletter */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Mail className="h-4 w-4 text-[#0079FF]" />
                {t('newsletter.title')}
              </div>
              <p className="mt-1.5 text-xs text-[#8B95A1]/70">
                {t('newsletter.description')}
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="email"
                  placeholder={t('newsletter.placeholder')}
                  className="h-9 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-[#8B95A1]/50 outline-none transition-colors duration-200 focus:border-[#0079FF]/40 focus:ring-1 focus:ring-[#0079FF]/20"
                />
                <button
                  type="button"
                  className="h-9 shrink-0 rounded-lg bg-[#0079FF] px-4 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#0079FF]/90"
                >
                  {t('newsletter.subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/[0.06] py-6">
          <p className="text-center text-xs text-[#8B95A1]/50">
            &copy; {new Date().getFullYear()} {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
