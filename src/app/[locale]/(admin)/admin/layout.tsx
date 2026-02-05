'use client';

import { ReactNode, useState, useCallback } from 'react';
import { usePathname, Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase/client';

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Admin Layout - Administrative dashboard layout with sidebar navigation
 *
 * This layout provides:
 * - Sidebar navigation for admin sections (Members, Experts, Content, etc.)
 * - Different visual treatment from main dashboard (darker theme, accent colors)
 * - Collapsible sidebar for more workspace
 * - Mobile-responsive with drawer navigation
 * - All navigation labels use translations from useTranslations('admin')
 *
 * Access Control:
 * - Only accessible to users with admin role (enforced by middleware in task 2.18)
 *
 * Visual Treatment:
 * - Darker sidebar background to distinguish from main app
 * - Purple/violet accent color for admin branding
 * - Shield icon to indicate admin zone
 */

interface NavItem {
  key: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { key: 'dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'members', href: '/admin/members', icon: Users },
  { key: 'experts', href: '/admin/experts', icon: UserCheck },
  { key: 'content', href: '/admin/content', icon: FileText },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error.message);
        return;
      }
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  }, [router]);

  const isActiveRoute = (href: string) => {
    // Exact match for dashboard, prefix match for other routes
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 hidden h-screen border-r border-white/5 bg-[#0a0a0a] transition-all duration-300 lg:flex lg:flex-col',
          isCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">
                {t('title')}
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 mx-auto">
              <Shield className="h-4 w-4 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn('text-[#8B95A1] hover:text-white', isCollapsed && 'hidden')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-violet-600/20 text-violet-400 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]'
                      : 'text-[#8B95A1] hover:bg-white/5 hover:text-white',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-violet-400' : 'text-[#8B95A1]'
                    )}
                  />
                  {!isCollapsed && <span>{t(`sidebar.${item.key}`)}</span>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle (when collapsed) */}
        {isCollapsed && (
          <div className="border-t border-white/5 p-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsCollapsed(false)}
              className="w-full text-[#8B95A1] hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="border-t border-white/5 p-2">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#FF453A] transition-all duration-200 hover:bg-[#FF453A]/10 disabled:opacity-50',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span>{isSigningOut ? t('sidebar.signingOut') : t('sidebar.logout')}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/5 bg-[#0a0a0a] transition-transform duration-300 lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">{t('title')}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-[#8B95A1] hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-violet-600/20 text-violet-400 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]'
                      : 'text-[#8B95A1] hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-violet-400' : 'text-[#8B95A1]'
                    )}
                  />
                  <span>{t(`sidebar.${item.key}`)}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Mobile Sidebar Footer */}
        <div className="border-t border-white/5 p-2">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#FF453A] transition-all duration-200 hover:bg-[#FF453A]/10 disabled:opacity-50"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>{isSigningOut ? t('sidebar.signingOut') : t('sidebar.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        )}
      >
        {/* Top Bar - Mobile */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-[#8B95A1] hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">{t('title')}</span>
          </div>
          <div className="w-8" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
