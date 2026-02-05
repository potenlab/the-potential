'use client';

import { Header } from '@/components/layouts/header';
import { BottomNav } from '@/components/layouts/bottom-nav';
import HomePage from './(dashboard)/home/landing-content';

export default function LandingPageClient() {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-24 md:pb-8 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <HomePage />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
