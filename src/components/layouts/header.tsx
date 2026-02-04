'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

/**
 * Header Component - Desktop Navigation
 *
 * A fixed desktop header with logo, navigation, user actions, and language switcher.
 * Uses translations from next-intl for internationalization support.
 *
 * Features:
 * - Fixed positioning on scroll
 * - Animated active indicator between navigation items
 * - Navigation labels use translations from useTranslations('navigation')
 * - Language switcher for Korean/English
 * - Notification bell and profile avatar
 *
 * @example
 * ```tsx
 * // In a layout component:
 * <Header />
 * ```
 */

/** Navigation items configuration with translation keys */
const navItems = [
  { href: '/home', labelKey: 'home' },
  { href: '/support-programs', labelKey: 'support' },
  { href: '/thread', labelKey: 'thread' },
  { href: '/experts', labelKey: 'experts' },
  { href: '/clubs', labelKey: 'clubs' },
] as const;

export function Header() {
  const t = useTranslations('navigation');
  const pathname = usePathname();

  // Track which nav item is hovered for potential future hover effects
  const [, setHoveredItem] = React.useState<string | null>(null);

  // Real-time notification count
  const { unreadCount } = useRealtimeNotifications();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/95 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-extrabold text-white">The Potential</span>
        </Link>

        {/* Navigation - Desktop Only */}
        <nav className="hidden md:flex items-center gap-1 relative">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors rounded-2xl z-10',
                  isActive ? 'text-white' : 'text-[#8B95A1] hover:text-white hover:bg-white/5'
                )}
              >
                {/* Navigation label with translation */}
                <span className="relative z-10">{t(item.labelKey)}</span>

                {/* Animated active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-[#0079FF]/10 rounded-2xl border border-[#0079FF]/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="text-[#8B95A1] hover:text-white relative"
            aria-label={t('notifications')}
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge - shows unread count from realtime subscription */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#FF453A] rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Profile Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="focus:outline-none focus:ring-2 focus:ring-[#0079FF] rounded-full transition-transform hover:scale-105"
                aria-label={t('profile')}
              >
                <Avatar size="sm" showStatus statusColor="success">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback>KC</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#121212] border-white/10 rounded-2xl"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="cursor-pointer hover:bg-white/5 focus:bg-white/5 rounded-xl"
                >
                  {t('profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/expert-registration"
                  className="cursor-pointer hover:bg-white/5 focus:bg-white/5 rounded-xl"
                >
                  {t('expertRegistration')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="cursor-pointer hover:bg-white/5 focus:bg-white/5 rounded-xl"
                >
                  {t('settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-[#FF453A] cursor-pointer hover:bg-[#FF453A]/10 focus:bg-[#FF453A]/10 rounded-xl focus:text-[#FF453A]">
                {t('signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
