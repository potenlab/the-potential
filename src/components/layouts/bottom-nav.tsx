'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Home, TrendingUp, MessageCircle, Users, User } from 'lucide-react';

/**
 * Navigation item configuration
 * Maps to the navigation translations in messages/[locale].json
 */
const navItems = [
  { href: '/', labelKey: 'home', icon: Home },
  { href: '/support-programs', labelKey: 'support', icon: TrendingUp },
  { href: '/thread', labelKey: 'thread', icon: MessageCircle },
  { href: '/clubs', labelKey: 'clubs', icon: Users },
  { href: '/profile', labelKey: 'profile', icon: User },
] as const;

/**
 * BottomNav Component - Mobile Navigation
 *
 * Design specifications from ui-ux-plan.md:
 * - Fixed at bottom with 80px height (h-20)
 * - Dark glass effect background (bg-black/95 backdrop-blur-md)
 * - Top border (border-white/8)
 * - 5 navigation items with icons and labels
 * - Active state: scale up (scale-110), glow effect, primary color
 * - Animated top indicator line
 * - Safe area padding for iOS notch (pb-safe)
 * - Only visible on mobile (md:hidden)
 */
export function BottomNav() {
  const t = useTranslations('navigation');
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        // Fixed positioning
        'fixed bottom-0 left-0 right-0 z-50',
        // Only visible on mobile
        'md:hidden',
        // Height and styling
        'h-[88px] bg-black/95 backdrop-blur-md border-t border-white/8',
        // Safe area for iOS notch
        'pb-[env(safe-area-inset-bottom)]'
      )}
      role="navigation"
      aria-label={t('menu')}
    >
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/' || pathname === ''
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'min-w-[68px] py-3 transition-transform duration-200',
                // Scale up when active
                isActive && 'scale-110 -translate-y-0.5'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator line at top */}
              {isActive && (
                <motion.div
                  layoutId="activeBottomNavIndicator"
                  className="absolute -top-2 w-14 h-1.5 rounded-full bg-[#0079FF]"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon with glow effect when active */}
              <div
                className={cn(
                  'relative transition-colors duration-200',
                  isActive ? 'text-[#0079FF]' : 'text-[#8B95A1]'
                )}
              >
                <Icon className="h-7 w-7" strokeWidth={2} />
                {/* Glow effect behind active icon */}
                {isActive && (
                  <div
                    className="absolute inset-0 blur-lg bg-[#0079FF]/40 pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-sm font-medium mt-1 transition-colors duration-200',
                  isActive ? 'text-[#0079FF]' : 'text-[#8B95A1]'
                )}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
