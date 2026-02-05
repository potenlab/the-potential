'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Home, TrendingUp, MessageCircle, UserSearch, LogIn } from 'lucide-react';
import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { Logo } from '@/components/common/logo';
import { NotificationPopover } from '@/features/notifications';

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

/** Navigation items configuration with translation keys and icons */
const navItems = [
  { href: '/', labelKey: 'home', icon: Home },
  { href: '/support-programs', labelKey: 'support', icon: TrendingUp },
  { href: '/thread', labelKey: 'thread', icon: MessageCircle },
  { href: '/experts', labelKey: 'experts', icon: UserSearch },
] as const;

export function Header() {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Track which nav item is hovered for potential future hover effects
  const [, setHoveredItem] = React.useState<string | null>(null);

  // Sign out loading state
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  // Handle sign out
  const handleSignOut = React.useCallback(async () => {
    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error.message);
        return;
      }
      // Redirect to login page after successful sign out
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  }, [router]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-black/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Logo height={28} />
        </Link>

        {/* Navigation - Desktop Only */}
        <nav className="hidden md:flex items-center gap-2 relative">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/' || pathname === ''
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  'relative flex items-center gap-2 px-5 py-2.5 text-base font-semibold transition-colors rounded-full z-10',
                  isActive ? 'text-white' : 'text-[#8B95A1] hover:text-white hover:bg-white/5'
                )}
              >
                {/* Navigation icon */}
                <Icon className="relative z-10 h-5 w-5" />
                {/* Navigation label with translation */}
                <span className="relative z-10">{t(item.labelKey)}</span>

                {/* Animated active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-[#0079FF] rounded-full"
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
        <div className="flex items-center gap-3 md:gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {!loading && isAuthenticated ? (
            <>
              {/* Notification Bell with Popover */}
              <NotificationPopover />

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
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="text-[#FF453A] cursor-pointer hover:bg-[#FF453A]/10 focus:bg-[#FF453A]/10 rounded-xl focus:text-[#FF453A]"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    {isSigningOut ? t('signingOut') : t('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : !loading ? (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-[#0079FF] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0079FF]/90 hover:shadow-[0_0_20px_rgba(0,121,255,0.3)]"
            >
              <LogIn className="h-4 w-4" />
              {t('login')}
            </Link>
          ) : null}
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0079FF]/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0079FF]/30 to-transparent blur-sm" />
    </header>
  );
}

export default Header;
