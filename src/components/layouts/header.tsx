'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LogIn } from 'lucide-react';
import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModalStore } from '@/stores/auth-modal-store';
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
  { href: '/support-programs', labelKey: 'support' },
  { href: '/events', labelKey: 'events' },
  { href: '/thread', labelKey: 'thread' },
  { href: '/experts', labelKey: 'experts' },
] as const;

export function Header() {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const openLogin = useAuthModalStore((s) => s.openLogin);

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
      // Redirect to homepage after successful sign out
      router.push('/');
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
          <Logo height={20} />
        </Link>

        {/* Navigation - Desktop Only */}
        <nav className="hidden md:flex items-center gap-2 relative">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  'relative flex items-center px-5 py-2.5 text-base font-semibold whitespace-nowrap transition-colors rounded-full z-10',
                  isActive ? 'text-white' : 'text-[#8B95A1] hover:text-white hover:bg-white/5'
                )}
              >
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
        <div className="flex items-center gap-4 md:gap-5">
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
                    className="focus:outline-none rounded-full transition-transform hover:scale-105 cursor-pointer"
                    aria-label={t('profile')}
                  >
                    <Avatar size="md" showStatus statusColor="success">
                      <AvatarImage src={user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture} alt={user?.user_metadata?.full_name ?? 'Profile'} />
                      <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-[#121212] border-white/10 rounded-2xl"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="cursor-pointer hover:bg-white/5 focus:bg-white/5 rounded-xl text-base py-2.5"
                    >
                      {t('profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="text-[#FF453A] cursor-pointer hover:bg-[#FF453A]/10 focus:bg-[#FF453A]/10 rounded-xl focus:text-[#FF453A] text-base py-2.5"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    {isSigningOut ? t('signingOut') : t('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : !loading ? (
            <button
              type="button"
              onClick={openLogin}
              className="flex items-center gap-2.5 rounded-full bg-[#0079FF] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#0079FF]/90 hover:shadow-[0_0_20px_rgba(0,121,255,0.3)]"
            >
              <LogIn className="h-5 w-5" />
              {t('login')}
            </button>
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
