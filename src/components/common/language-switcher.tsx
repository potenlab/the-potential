'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Language Switcher Component
 *
 * Dropdown component for switching between Korean and English locales.
 * Uses next-intl for locale management and displays native language names.
 *
 * Features:
 * - Shows current locale with Globe icon trigger
 * - Displays checkmark indicator for current language
 * - Preserves current path when switching locales
 * - Styled according to dark theme design system
 *
 * @example
 * ```tsx
 * // In a header component:
 * <LanguageSwitcher />
 * ```
 */

/** Native language names for each supported locale */
const localeNames: Record<Locale, { name: string; nativeName: string }> = {
  ko: { name: 'Korean', nativeName: '한국어' },
  en: { name: 'English', nativeName: 'English' },
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Handle locale change
   * Replaces the current URL with the same path but different locale prefix
   */
  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#8B95A1] hover:text-white"
          aria-label="Change language"
        >
          <Globe className="h-6 w-6" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 bg-[#121212] border-white/10 rounded-2xl"
      >
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              'flex items-center justify-between cursor-pointer rounded-xl px-4 py-2.5 text-base',
              'hover:bg-white/5 focus:bg-white/5',
              locale === loc && 'bg-[#0079FF]/10 text-white'
            )}
          >
            <span className={cn(locale === loc ? 'text-white' : 'text-[#8B95A1]')}>
              {localeNames[loc].nativeName}
            </span>
            {locale === loc && <Check className="h-5 w-5 text-[#0079FF]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
