'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Header } from '@/components/layouts/header';
import { BottomNav } from '@/components/layouts/bottom-nav';
import { AuthModal } from '@/features/auth/components/auth-modal';
import HomePage from './(dashboard)/home/landing-content';

export default function LandingPageClient() {
  const searchParams = useSearchParams();
  const isPending = searchParams.get('pending') === 'true';
  const isAuthError = searchParams.get('auth_error') === 'true';
  const t = useTranslations('auth.login');

  useEffect(() => {
    if (isPending) {
      toast.warning(t('pendingApproval'));
    }
    if (isAuthError) {
      toast.error(t('googleLoginFailed'));
    }
  }, [isPending, isAuthError, t]);

  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-24 md:pb-8 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <HomePage />
        </div>
      </main>
      <BottomNav />
      <AuthModal />
    </div>
  );
}
