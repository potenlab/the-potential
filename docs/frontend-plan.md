# Frontend Implementation Plan - The Potential

Generated: 2026-02-04
Updated: 2026-02-04 (Added i18n Architecture)
Source PRD: `/docs/prd.md`
Design Reference: `/docs/ui-ux-plan.md`
Architecture: Bulletproof React + Next.js 16 App Router

---

## 1. Executive Summary

This document outlines the comprehensive frontend implementation plan for "The Potential" - a trust-based platform for early-stage startup founders. The plan follows Bulletproof React architecture patterns, leverages Next.js 16 with App Router, and implements the Toss-style dark theme design system specified in the UI/UX plan.

### Key Technical Decisions
- **Framework:** Next.js 16.1.6 with App Router
- **React Version:** React 19.2.3
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **State Management:** Zustand (global) + React Query/TanStack Query (server state)
- **Database/Auth:** Supabase (PostgreSQL + Auth)
- **Animation:** Framer Motion (motion/react)
- **Form Handling:** React Hook Form + Zod
- **Icons:** Lucide React (with direct imports)
- **Internationalization:** next-intl (Korean default, English secondary)

---

## 2. shadcn/ui Component Architecture

### 2.1 Component Wrapper Strategy

All UI components follow a three-layer architecture:

```
Layer 1: shadcn primitives (installed via CLI)
    |
Layer 2: Customized wrappers (src/components/ui/) - App-specific variants & styling
    |
Layer 3: Feature components (src/features/[name]/components/) - Business logic compositions
```

**Key Principle:** shadcn primitives are NEVER used directly in feature components. They are always wrapped in customized versions that apply The Potential's design system.

### 2.2 Available shadcn Components (Registry: @shadcn)

Based on shadcn registry discovery, the following components are available:

| Category | Components | Install Command |
|----------|------------|-----------------|
| **Forms** | button, input, textarea, checkbox, radio-group, select, switch, slider, form, field, label, input-otp, input-group | `npx shadcn@latest add button input textarea checkbox radio-group select switch slider form field label input-otp input-group` |
| **Layout** | card, separator, aspect-ratio, resizable, scroll-area, sidebar | `npx shadcn@latest add card separator aspect-ratio resizable scroll-area sidebar` |
| **Feedback** | alert, alert-dialog, dialog, drawer, sheet, sonner, progress, skeleton, spinner, empty | `npx shadcn@latest add alert alert-dialog dialog drawer sheet sonner progress skeleton spinner empty` |
| **Navigation** | tabs, navigation-menu, menubar, breadcrumb, pagination, command | `npx shadcn@latest add tabs navigation-menu menubar breadcrumb pagination command` |
| **Data Display** | avatar, badge, table, hover-card, tooltip, kbd | `npx shadcn@latest add avatar badge table hover-card tooltip kbd` |
| **Overlay** | popover, dropdown-menu, context-menu, combobox | `npx shadcn@latest add popover dropdown-menu context-menu combobox` |
| **Misc** | accordion, collapsible, toggle, toggle-group, carousel, calendar, chart | `npx shadcn@latest add accordion collapsible toggle toggle-group carousel calendar chart` |

### 2.3 Installation Command (All Required Components)

```bash
# Initialize shadcn in project
npx shadcn@latest init

# Install all required components for The Potential
npx shadcn@latest add \
  button input textarea checkbox radio-group select switch slider form field label input-otp \
  card separator scroll-area \
  alert alert-dialog dialog drawer sheet sonner progress skeleton spinner empty \
  tabs navigation-menu breadcrumb pagination command \
  avatar badge table hover-card tooltip \
  popover dropdown-menu combobox \
  accordion collapsible toggle toggle-group carousel calendar
```

---

## 3. Technology Stack

### Core Dependencies

```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^5.x",
    "framer-motion": "^11.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "date-fns": "^3.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "class-variance-authority": "^0.7.x",
    "next-intl": "^4.x"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5",
    "@types/react": "^19",
    "@types/node": "^20",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "prettier": "^3.x",
    "vitest": "^2.x",
    "@testing-library/react": "^16.x",
    "@testing-library/user-event": "^14.x",
    "playwright": "^1.x"
  }
}
```

### Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  experimental: {
    // Enable optimized imports to avoid barrel file performance issues
    // Reference: vercel-react-best-practices/bundle-barrel-imports.md
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'date-fns'
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
```

---

## 4. Internationalization (i18n) Architecture

### 4.1 Overview

The Potential implements internationalization using `next-intl` with locale-based routing. The platform supports:

| Locale | Language | Route Prefix | Status |
|--------|----------|--------------|--------|
| `ko` | Korean | `/ko/*` (default) | Primary |
| `en` | English | `/en/*` | Secondary |

**Key Features:**
- Korean (`ko`) as the default locale
- Automatic locale detection from browser preferences
- Locale prefix on all routes (including default)
- SEO-friendly with proper `hreflang` tags
- Server Components support with static rendering

### 4.2 File Structure

```
src/
├── i18n/
│   ├── routing.ts          # Central routing configuration
│   ├── request.ts          # Server-side request configuration
│   └── navigation.ts       # Localized navigation utilities
├── messages/
│   ├── ko.json             # Korean translations (default)
│   └── en.json             # English translations
├── app/
│   └── [locale]/           # Dynamic locale segment
│       ├── layout.tsx      # Root layout with i18n provider
│       ├── page.tsx        # Landing page
│       ├── (auth)/         # Auth route group
│       ├── (dashboard)/    # Dashboard route group
│       └── (admin)/        # Admin route group
├── components/
│   └── common/
│       └── language-switcher.tsx  # Language toggle component
└── middleware.ts           # Locale detection middleware
```

### 4.3 Routing Configuration

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['ko', 'en'],

  // Korean is the default locale
  defaultLocale: 'ko',

  // Always show locale prefix in URL (including default)
  localePrefix: 'always',

  // Locale detection strategy
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
```

### 4.4 Request Configuration

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming locale is supported
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### 4.5 Navigation Utilities

```typescript
// src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Export localized navigation components
export const {
  Link,           // Localized <Link> component
  redirect,       // Localized redirect function
  usePathname,    // Get pathname without locale prefix
  useRouter,      // Localized router
  getPathname,    // Get localized pathname for a given route
} = createNavigation(routing);
```

### 4.6 Middleware Configuration

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  // - API routes (/api/*)
  // - tRPC routes (/trpc/*)
  // - Next.js internals (/_next/*)
  // - Vercel internals (/_vercel/*)
  // - Static files (files with extensions like .js, .css, .png)
  matcher: ['/', '/(ko|en)/:path*', '/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
```

### 4.7 Root Layout with i18n Provider

```typescript
// src/app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { Providers } from './providers';
import '@/app/globals.css';

// Generate static params for all supported locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Generate metadata with locale-specific content
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const titles = {
    ko: 'The Potential - 초기 창업자를 위한 신뢰 기반 플랫폼',
    en: 'The Potential - Trust-based Platform for Early-stage Founders',
  };

  const descriptions = {
    ko: '검증된 전문가 매칭과 창업자 네트워킹을 통해 스타트업 성장을 지원합니다.',
    en: 'Supporting startup growth through verified expert matching and founder networking.',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.ko,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.ko,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ko: '/ko',
        en: '/en',
      },
    },
  };
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 4.8 Language Switcher Component

```typescript
// src/components/common/language-switcher.tsx
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
import Globe from 'lucide-react/dist/esm/icons/globe';
import Check from 'lucide-react/dist/esm/icons/check';
import { cn } from '@/lib/cn';

const localeNames: Record<Locale, { name: string; nativeName: string }> = {
  ko: { name: 'Korean', nativeName: '한국어' },
  en: { name: 'English', nativeName: 'English' },
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted hover:text-white">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              'flex items-center justify-between cursor-pointer',
              locale === loc && 'bg-primary/10'
            )}
          >
            <span>{localeNames[loc].nativeName}</span>
            {locale === loc && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 4.9 Translation File Structure

#### Korean Translations (Default)

```json
// src/messages/ko.json
{
  "common": {
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다",
    "retry": "다시 시도",
    "cancel": "취소",
    "confirm": "확인",
    "save": "저장",
    "delete": "삭제",
    "edit": "수정",
    "search": "검색",
    "filter": "필터",
    "reset": "초기화",
    "viewMore": "더 보기",
    "close": "닫기",
    "back": "뒤로"
  },
  "navigation": {
    "home": "홈",
    "support": "지원 프로그램",
    "thread": "쓰레드",
    "experts": "전문가 찾기",
    "clubs": "클럽",
    "profile": "프로필",
    "notifications": "알림",
    "signOut": "로그아웃"
  },
  "auth": {
    "login": {
      "title": "다시 오신 것을 환영합니다",
      "email": "이메일",
      "emailPlaceholder": "이메일을 입력하세요",
      "password": "비밀번호",
      "passwordPlaceholder": "비밀번호를 입력하세요",
      "submit": "로그인",
      "googleLogin": "Google로 계속하기",
      "orContinueWith": "또는 이메일로 계속",
      "noAccount": "계정이 없으신가요?",
      "signUp": "회원가입",
      "forgotPassword": "비밀번호를 잊으셨나요?",
      "invalidCredentials": "이메일 또는 비밀번호가 올바르지 않습니다"
    },
    "signup": {
      "title": "회원가입",
      "subtitle": "초기 창업자를 위한 신뢰 기반 커뮤니티에 참여하세요",
      "name": "이름",
      "namePlaceholder": "이름을 입력하세요",
      "email": "이메일",
      "emailPlaceholder": "이메일을 입력하세요",
      "password": "비밀번호",
      "passwordPlaceholder": "비밀번호를 입력하세요 (8자 이상)",
      "companyName": "회사명",
      "companyPlaceholder": "회사명을 입력하세요",
      "submit": "가입 신청",
      "hasAccount": "이미 계정이 있으신가요?",
      "login": "로그인",
      "pendingApproval": "가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.",
      "termsAgreement": "가입 시 {terms}과 {privacy}에 동의하게 됩니다.",
      "termsOfService": "이용약관",
      "privacyPolicy": "개인정보처리방침"
    },
    "otp": {
      "title": "인증 코드 입력",
      "subtitle": "{email}로 전송된 6자리 코드를 입력하세요",
      "resend": "코드 재전송",
      "resendIn": "{seconds}초 후 재전송 가능"
    }
  },
  "home": {
    "welcome": "{name}님, 환영합니다!",
    "welcomeGuest": "환영합니다!",
    "latestPrograms": "최신 지원 프로그램",
    "trendingThreads": "인기 쓰레드",
    "featuredExperts": "추천 전문가",
    "viewAll": "전체 보기"
  },
  "experts": {
    "title": "전문가 찾기",
    "subtitle": "검증된 전문가와 함께 비즈니스를 성장시키세요",
    "search": "전문가 검색",
    "searchPlaceholder": "이름, 전문분야, 회사명으로 검색",
    "filters": {
      "title": "필터",
      "category": "카테고리",
      "region": "지역",
      "sortBy": "정렬",
      "sortNewest": "최신순",
      "sortRecommended": "추천순",
      "reset": "필터 초기화"
    },
    "categories": {
      "marketing": "마케팅",
      "development": "개발",
      "design": "디자인",
      "legal": "법률",
      "finance": "재무",
      "hr": "인사",
      "operations": "운영"
    },
    "regions": {
      "seoul": "서울",
      "busan": "부산",
      "incheon": "인천",
      "daegu": "대구",
      "remote": "원격 가능"
    },
    "card": {
      "verified": "검증됨",
      "viewProfile": "프로필 보기",
      "available": "상담 가능"
    },
    "profile": {
      "about": "소개",
      "portfolio": "포트폴리오",
      "reviews": "리뷰",
      "contact": "연락하기",
      "collaboration": "협업 제안",
      "coffeeChat": "커피챗 신청"
    },
    "empty": "검색 조건에 맞는 전문가가 없습니다",
    "registration": {
      "title": "전문가 등록",
      "subtitle": "전문가로 등록하여 창업자들과 연결되세요",
      "companyName": "회사명",
      "specialty": "전문 분야",
      "portfolio": "포트폴리오",
      "businessNumber": "사업자등록번호",
      "documents": "증빙 서류",
      "submit": "등록 신청",
      "pending": "검토 대기 중",
      "approved": "승인됨",
      "rejected": "반려됨"
    }
  },
  "thread": {
    "title": "쓰레드",
    "subtitle": "창업자들과 경험과 인사이트를 공유하세요",
    "compose": {
      "placeholder": "무슨 생각을 하고 계신가요?",
      "submit": "게시",
      "attachImage": "이미지 첨부",
      "attachFile": "파일 첨부"
    },
    "post": {
      "like": "좋아요",
      "comment": "댓글",
      "share": "공유",
      "report": "신고",
      "delete": "삭제",
      "edit": "수정"
    },
    "comments": {
      "title": "댓글",
      "placeholder": "댓글을 작성하세요...",
      "submit": "댓글 달기",
      "reply": "답글",
      "empty": "첫 번째 댓글을 작성해보세요"
    },
    "empty": "아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!"
  },
  "supportPrograms": {
    "title": "지원 프로그램",
    "subtitle": "스타트업을 위한 최신 지원 프로그램 정보",
    "categories": {
      "all": "전체",
      "funding": "투자/자금",
      "mentoring": "멘토링",
      "space": "공간/인프라",
      "education": "교육",
      "networking": "네트워킹"
    },
    "card": {
      "deadline": "마감일",
      "dday": "D-{days}",
      "closed": "마감",
      "organization": "주관",
      "viewDetails": "자세히 보기",
      "apply": "신청하기"
    },
    "detail": {
      "overview": "개요",
      "eligibility": "신청 자격",
      "benefits": "지원 내용",
      "process": "신청 절차",
      "contact": "문의처"
    },
    "empty": "현재 진행 중인 지원 프로그램이 없습니다"
  },
  "clubs": {
    "title": "클럽",
    "subtitle": "관심사가 맞는 창업자들과 교류하세요",
    "join": "가입하기",
    "leave": "탈퇴",
    "create": "클럽 만들기",
    "members": "{count}명의 멤버",
    "posts": "게시글",
    "events": "이벤트",
    "about": "소개",
    "empty": "아직 클럽이 없습니다"
  },
  "profile": {
    "title": "내 프로필",
    "edit": "프로필 수정",
    "completeness": "프로필 완성도",
    "sections": {
      "about": "소개",
      "expertise": "전문 분야",
      "experience": "경력",
      "portfolio": "포트폴리오",
      "collaborationNeeds": "협업 니즈"
    },
    "settings": {
      "title": "설정",
      "notifications": "알림 설정",
      "privacy": "개인정보 설정",
      "language": "언어",
      "deleteAccount": "계정 삭제"
    }
  },
  "admin": {
    "title": "관리자 대시보드",
    "members": {
      "title": "회원 관리",
      "pending": "승인 대기",
      "approved": "승인됨",
      "rejected": "반려됨",
      "approve": "승인",
      "reject": "반려"
    },
    "experts": {
      "title": "전문가 검증",
      "pending": "검토 대기",
      "verified": "검증 완료",
      "rejected": "반려됨",
      "verify": "승인",
      "reject": "반려",
      "viewDocuments": "서류 확인"
    },
    "content": {
      "title": "콘텐츠 관리",
      "programs": "지원 프로그램",
      "posts": "게시글 관리"
    }
  },
  "errors": {
    "notFound": {
      "title": "페이지를 찾을 수 없습니다",
      "description": "요청하신 페이지가 존재하지 않거나 이동되었습니다.",
      "backHome": "홈으로 돌아가기"
    },
    "serverError": {
      "title": "서버 오류",
      "description": "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    },
    "unauthorized": {
      "title": "접근 권한이 없습니다",
      "description": "이 페이지에 접근하려면 로그인이 필요합니다.",
      "login": "로그인하기"
    },
    "networkError": "네트워크 연결을 확인해주세요"
  },
  "validation": {
    "required": "필수 입력 항목입니다",
    "email": "올바른 이메일 형식이 아닙니다",
    "minLength": "최소 {min}자 이상 입력해주세요",
    "maxLength": "최대 {max}자까지 입력 가능합니다",
    "passwordMismatch": "비밀번호가 일치하지 않습니다"
  },
  "footer": {
    "company": "The Potential",
    "description": "초기 창업자를 위한 신뢰 기반 플랫폼",
    "links": {
      "about": "회사 소개",
      "terms": "이용약관",
      "privacy": "개인정보처리방침",
      "contact": "문의하기"
    },
    "copyright": "The Potential. All rights reserved."
  }
}
```

#### English Translations

```json
// src/messages/en.json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "filter": "Filter",
    "reset": "Reset",
    "viewMore": "View More",
    "close": "Close",
    "back": "Back"
  },
  "navigation": {
    "home": "Home",
    "support": "Support Programs",
    "thread": "Thread",
    "experts": "Find Experts",
    "clubs": "Clubs",
    "profile": "Profile",
    "notifications": "Notifications",
    "signOut": "Sign Out"
  },
  "auth": {
    "login": {
      "title": "Welcome Back",
      "email": "Email",
      "emailPlaceholder": "Enter your email",
      "password": "Password",
      "passwordPlaceholder": "Enter your password",
      "submit": "Sign In",
      "googleLogin": "Continue with Google",
      "orContinueWith": "Or continue with email",
      "noAccount": "Don't have an account?",
      "signUp": "Sign Up",
      "forgotPassword": "Forgot password?",
      "invalidCredentials": "Invalid email or password"
    },
    "signup": {
      "title": "Sign Up",
      "subtitle": "Join the trust-based community for early-stage founders",
      "name": "Name",
      "namePlaceholder": "Enter your name",
      "email": "Email",
      "emailPlaceholder": "Enter your email",
      "password": "Password",
      "passwordPlaceholder": "Enter your password (min 8 characters)",
      "companyName": "Company Name",
      "companyPlaceholder": "Enter your company name",
      "submit": "Submit Application",
      "hasAccount": "Already have an account?",
      "login": "Sign In",
      "pendingApproval": "Your application has been submitted. You can access the platform after admin approval.",
      "termsAgreement": "By signing up, you agree to our {terms} and {privacy}.",
      "termsOfService": "Terms of Service",
      "privacyPolicy": "Privacy Policy"
    },
    "otp": {
      "title": "Enter Verification Code",
      "subtitle": "Enter the 6-digit code sent to {email}",
      "resend": "Resend Code",
      "resendIn": "Resend available in {seconds}s"
    }
  },
  "home": {
    "welcome": "Welcome, {name}!",
    "welcomeGuest": "Welcome!",
    "latestPrograms": "Latest Support Programs",
    "trendingThreads": "Trending Threads",
    "featuredExperts": "Featured Experts",
    "viewAll": "View All"
  },
  "experts": {
    "title": "Find Experts",
    "subtitle": "Grow your business with verified experts",
    "search": "Search Experts",
    "searchPlaceholder": "Search by name, specialty, or company",
    "filters": {
      "title": "Filters",
      "category": "Category",
      "region": "Region",
      "sortBy": "Sort By",
      "sortNewest": "Newest",
      "sortRecommended": "Recommended",
      "reset": "Reset Filters"
    },
    "categories": {
      "marketing": "Marketing",
      "development": "Development",
      "design": "Design",
      "legal": "Legal",
      "finance": "Finance",
      "hr": "HR",
      "operations": "Operations"
    },
    "regions": {
      "seoul": "Seoul",
      "busan": "Busan",
      "incheon": "Incheon",
      "daegu": "Daegu",
      "remote": "Remote Only"
    },
    "card": {
      "verified": "Verified",
      "viewProfile": "View Profile",
      "available": "Available"
    },
    "profile": {
      "about": "About",
      "portfolio": "Portfolio",
      "reviews": "Reviews",
      "contact": "Contact",
      "collaboration": "Propose Collaboration",
      "coffeeChat": "Request Coffee Chat"
    },
    "empty": "No experts found matching your criteria",
    "registration": {
      "title": "Expert Registration",
      "subtitle": "Register as an expert and connect with founders",
      "companyName": "Company Name",
      "specialty": "Specialty",
      "portfolio": "Portfolio",
      "businessNumber": "Business Registration Number",
      "documents": "Supporting Documents",
      "submit": "Submit Application",
      "pending": "Under Review",
      "approved": "Approved",
      "rejected": "Rejected"
    }
  },
  "thread": {
    "title": "Thread",
    "subtitle": "Share experiences and insights with fellow founders",
    "compose": {
      "placeholder": "What's on your mind?",
      "submit": "Post",
      "attachImage": "Attach Image",
      "attachFile": "Attach File"
    },
    "post": {
      "like": "Like",
      "comment": "Comment",
      "share": "Share",
      "report": "Report",
      "delete": "Delete",
      "edit": "Edit"
    },
    "comments": {
      "title": "Comments",
      "placeholder": "Write a comment...",
      "submit": "Comment",
      "reply": "Reply",
      "empty": "Be the first to comment"
    },
    "empty": "No posts yet. Be the first to share something!"
  },
  "supportPrograms": {
    "title": "Support Programs",
    "subtitle": "Latest support programs for startups",
    "categories": {
      "all": "All",
      "funding": "Funding",
      "mentoring": "Mentoring",
      "space": "Space/Infrastructure",
      "education": "Education",
      "networking": "Networking"
    },
    "card": {
      "deadline": "Deadline",
      "dday": "D-{days}",
      "closed": "Closed",
      "organization": "Organized by",
      "viewDetails": "View Details",
      "apply": "Apply"
    },
    "detail": {
      "overview": "Overview",
      "eligibility": "Eligibility",
      "benefits": "Benefits",
      "process": "Application Process",
      "contact": "Contact"
    },
    "empty": "No support programs available at the moment"
  },
  "clubs": {
    "title": "Clubs",
    "subtitle": "Connect with founders who share your interests",
    "join": "Join",
    "leave": "Leave",
    "create": "Create Club",
    "members": "{count} members",
    "posts": "Posts",
    "events": "Events",
    "about": "About",
    "empty": "No clubs available yet"
  },
  "profile": {
    "title": "My Profile",
    "edit": "Edit Profile",
    "completeness": "Profile Completeness",
    "sections": {
      "about": "About",
      "expertise": "Expertise",
      "experience": "Experience",
      "portfolio": "Portfolio",
      "collaborationNeeds": "Collaboration Needs"
    },
    "settings": {
      "title": "Settings",
      "notifications": "Notification Settings",
      "privacy": "Privacy Settings",
      "language": "Language",
      "deleteAccount": "Delete Account"
    }
  },
  "admin": {
    "title": "Admin Dashboard",
    "members": {
      "title": "Member Management",
      "pending": "Pending Approval",
      "approved": "Approved",
      "rejected": "Rejected",
      "approve": "Approve",
      "reject": "Reject"
    },
    "experts": {
      "title": "Expert Verification",
      "pending": "Pending Review",
      "verified": "Verified",
      "rejected": "Rejected",
      "verify": "Approve",
      "reject": "Reject",
      "viewDocuments": "View Documents"
    },
    "content": {
      "title": "Content Management",
      "programs": "Support Programs",
      "posts": "Post Management"
    }
  },
  "errors": {
    "notFound": {
      "title": "Page Not Found",
      "description": "The page you're looking for doesn't exist or has been moved.",
      "backHome": "Go to Home"
    },
    "serverError": {
      "title": "Server Error",
      "description": "A temporary error occurred. Please try again later."
    },
    "unauthorized": {
      "title": "Unauthorized Access",
      "description": "You need to sign in to access this page.",
      "login": "Sign In"
    },
    "networkError": "Please check your network connection"
  },
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email address",
    "minLength": "Must be at least {min} characters",
    "maxLength": "Must be no more than {max} characters",
    "passwordMismatch": "Passwords do not match"
  },
  "footer": {
    "company": "The Potential",
    "description": "Trust-based platform for early-stage founders",
    "links": {
      "about": "About Us",
      "terms": "Terms of Service",
      "privacy": "Privacy Policy",
      "contact": "Contact Us"
    },
    "copyright": "The Potential. All rights reserved."
  }
}
```

### 4.10 Using Translations in Components

#### Server Components

```typescript
// src/app/[locale]/(dashboard)/home/page.tsx
import { use } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { WelcomeSection } from '@/features/home/components/welcome-section';
import { ThreadPreview } from '@/features/home/components/thread-preview';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default function HomePage({ params }: HomePageProps) {
  const { locale } = use(params);

  // Enable static rendering - MUST be called before useTranslations
  setRequestLocale(locale);

  const t = useTranslations('home');

  return (
    <div className="space-y-8">
      <WelcomeSection />
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('trendingThreads')}</h2>
        <ThreadPreview />
      </section>
    </div>
  );
}
```

#### Client Components

```typescript
// src/features/auth/components/login-form.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function LoginForm() {
  const t = useTranslations('auth.login');
  const tValidation = useTranslations('validation');

  // Create schema with translated messages
  const loginSchema = z.object({
    email: z.string()
      .min(1, tValidation('required'))
      .email(tValidation('email')),
    password: z.string()
      .min(8, tValidation('minLength', { min: 8 })),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <CardTitle className="text-center">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Input
            label={t('email')}
            type="email"
            placeholder={t('emailPlaceholder')}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label={t('password')}
            type="password"
            placeholder={t('passwordPlaceholder')}
            error={errors.password?.message}
            {...register('password')}
          />
          <Button
            type="submit"
            variant="primary-glow"
            size="lg"
            className="w-full"
            loading={isSubmitting}
          >
            {t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 4.11 Localized Navigation Links

```typescript
// src/components/layouts/header.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/common/language-switcher';

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/95 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
        <Link href="/home" className="text-xl font-extrabold text-white">
          The Potential
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors rounded-2xl',
                pathname.startsWith(item.href)
                  ? 'text-white bg-primary/10 border border-primary/30'
                  : 'text-muted hover:text-white hover:bg-white/5'
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {/* ... other header actions */}
        </div>
      </div>
    </header>
  );
}
```

### 4.12 Date and Number Formatting

```typescript
// Using next-intl's formatting utilities
import { useFormatter } from 'next-intl';

export function FormattedDate({ date }: { date: Date }) {
  const format = useFormatter();

  return (
    <time dateTime={date.toISOString()}>
      {format.dateTime(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </time>
  );
}

export function FormattedNumber({ value }: { value: number }) {
  const format = useFormatter();

  return <span>{format.number(value)}</span>;
}

// Relative time (e.g., "3 days ago")
export function RelativeTime({ date }: { date: Date }) {
  const format = useFormatter();

  return (
    <time dateTime={date.toISOString()}>
      {format.relativeTime(date)}
    </time>
  );
}
```

### 4.13 SEO and Metadata

```typescript
// src/app/[locale]/(dashboard)/experts/page.tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'experts' });

  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `/${locale}/experts`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/experts`])
      ),
    },
  };
}

export default function ExpertsPage({ params }: { params: Promise<{ locale: string }> }) {
  // ... page implementation
}
```

---

## 5. Project Structure (Bulletproof React + i18n)

```
src/
├── app/                          # Next.js App Router (routes + layouts)
│   ├── [locale]/                 # Dynamic locale segment (NEW)
│   │   ├── (auth)/               # Auth route group (public)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx        # Auth layout (no nav)
│   │   ├── (dashboard)/          # Dashboard route group (protected)
│   │   │   ├── home/
│   │   │   │   └── page.tsx
│   │   │   ├── support-programs/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── thread/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── experts/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── expert-registration/
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   └── page.tsx
│   │   │   ├── clubs/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx        # Dashboard layout (with nav)
│   │   ├── (admin)/              # Admin route group
│   │   │   ├── admin/
│   │   │   │   ├── members/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── experts/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── content/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx        # Admin layout
│   │   ├── layout.tsx            # Locale layout with i18n provider
│   │   ├── page.tsx              # Landing page
│   │   ├── not-found.tsx         # Localized 404 page
│   │   └── error.tsx             # Localized error page
│   ├── globals.css               # Global styles + design tokens
│   └── providers.tsx             # Client providers wrapper
│
├── i18n/                         # Internationalization config (NEW)
│   ├── routing.ts                # Locale routing configuration
│   ├── request.ts                # Server request configuration
│   └── navigation.ts             # Localized navigation utilities
│
├── messages/                     # Translation files (NEW)
│   ├── ko.json                   # Korean translations (default)
│   └── en.json                   # English translations
│
├── components/                   # SHARED UI components only
│   ├── ui/                       # Customized shadcn wrappers (Layer 2)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ... (other components)
│   ├── layouts/                  # Layout components
│   │   ├── header.tsx            # Updated with i18n navigation
│   │   ├── mobile-header.tsx
│   │   ├── bottom-nav.tsx        # Updated with i18n navigation
│   │   ├── sidebar.tsx
│   │   └── page-container.tsx
│   └── common/                   # Generic reusable components
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       ├── empty-state.tsx
│       ├── animated-card.tsx
│       ├── glow-button.tsx
│       └── language-switcher.tsx # Language toggle component (NEW)
│
├── features/                     # BUSINESS LOGIC - Feature modules
│   └── ... (unchanged)
│
├── lib/                          # Configured libraries
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── query-client.ts
│   └── cn.ts
│
├── hooks/                        # Shared custom hooks
├── stores/                       # Global state stores
├── types/                        # Shared TypeScript types
├── utils/                        # Utility functions
│
└── middleware.ts                 # Root middleware (handles i18n routing)
```

---

## 6. Customized shadcn Component Wrappers

### 6.1 Button Component (src/components/ui/button.tsx)

Wraps `@shadcn/button` with The Potential's design system variants.

```typescript
// src/components/ui/button.tsx
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/ui/spinner';

const buttonVariants = cva(
  // Base styles - Toss-style large radius
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary - Electric Blue with glow
        primary: 'bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]',
        // Primary Light - Cyan CTA with glow
        'primary-glow': 'bg-primary-light text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(0,229,255,0.4)]',
        // Secondary - Outline
        secondary: 'border border-primary/30 text-primary bg-transparent hover:bg-primary/10 hover:border-primary/50',
        // Outline - White border
        outline: 'border border-white/10 text-white bg-transparent hover:bg-white/5 hover:border-white/20',
        // Ghost - No background
        ghost: 'text-muted hover:text-white hover:bg-white/5',
        // Destructive
        destructive: 'bg-error text-white hover:bg-error/90',
        // Link style
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-4 text-sm rounded-xl',       // 32px height
        md: 'h-10 px-6 text-base rounded-2xl',   // 40px height
        lg: 'h-12 px-8 text-lg rounded-2xl',     // 48px height
        xl: 'h-14 px-10 text-xl rounded-2xl',    // 56px height
        icon: 'h-10 w-10 rounded-2xl',
        'icon-sm': 'h-8 w-8 rounded-xl',
        'icon-lg': 'h-12 w-12 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### 6.2 Card Component (src/components/ui/card.tsx)

Wraps `@shadcn/card` with The Potential's design variants.

```typescript
// src/components/ui/card.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const cardVariants = cva(
  // Base - 24px border radius (rounded-3xl)
  'rounded-3xl border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-card border-white/8',
        elevated: 'bg-card-secondary border-white/5 shadow-lg',
        gradient: 'bg-gradient-to-br from-primary/10 to-transparent border-primary/20',
        interactive: 'bg-card border-white/8 hover:border-primary/40 hover:scale-[1.02] cursor-pointer',
        glow: 'bg-card border-primary/40 shadow-[0_0_20px_rgba(0,121,255,0.4)]',
        ghost: 'bg-transparent border-transparent',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6 md:p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-xl font-bold leading-tight text-white', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
```

### 6.3 Input Component (src/components/ui/input.tsx)

Wraps `@shadcn/input` with The Potential's dark theme styling.

```typescript
// src/components/ui/input.tsx
import * as React from 'react';
import { cn } from '@/lib/cn';
import { Label } from '@/components/ui/label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const hasError = !!error;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId} className="text-sm font-semibold text-white">
            {label}
          </Label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              // Base styles - 48px height, 16px radius
              'flex h-12 w-full rounded-2xl bg-card border px-4 text-base text-white placeholder:text-muted',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-card/50',
              // Border color based on state
              hasError
                ? 'border-error bg-error/5'
                : 'border-white/8 hover:border-white/20 focus:border-primary',
              // Icon padding
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm font-medium text-error">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

---

## 7. Design System Implementation

### 7.1 CSS Custom Properties (globals.css)

Based on UI/UX plan Section 4 and Section 10.1:

```css
/* src/app/globals.css */
@import 'tailwindcss';

:root {
  /* Brand Colors - Electric Blue Accent */
  --color-primary: #0079FF;
  --color-primary-light: #00E5FF;
  --color-primary-hover: rgba(0, 121, 255, 0.9);
  --color-primary-10: rgba(0, 121, 255, 0.1);
  --color-primary-20: rgba(0, 121, 255, 0.2);
  --color-primary-glow: rgba(0, 121, 255, 0.4);

  /* Background Colors - Dark Theme */
  --color-background: #000000;
  --color-card: #121212;
  --color-card-secondary: #1C1C1E;
  --color-card-hover: #1A1A1A;

  /* Text Colors */
  --color-text: #FFFFFF;
  --color-text-muted: #8B95A1;
  --color-text-disabled: #6B7280;

  /* Semantic Colors */
  --color-success: #34D399;
  --color-warning: #FB923C;
  --color-error: #FF453A;
  --color-info: #22D3EE;

  /* Border Colors */
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(0, 121, 255, 0.4);
  --color-border-focus: #0079FF;

  /* Typography - Pretendard */
  --font-family: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Type Scale */
  --font-size-display: 3rem;        /* 48px */
  --font-size-h1: 2.5rem;           /* 40px */
  --font-size-h2: 2rem;             /* 32px */
  --font-size-h3: 1.5rem;           /* 24px */
  --font-size-section: 1.25rem;     /* 20px */
  --font-size-body-lg: 1.125rem;    /* 18px */
  --font-size-body: 1rem;           /* 16px */
  --font-size-body-sm: 0.875rem;    /* 14px */
  --font-size-caption: 0.75rem;     /* 12px */

  /* Spacing System (8px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Border Radius - Toss-style Large Curves */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.5);

  /* Glow Effects */
  --glow-primary: 0 0 20px rgba(0, 121, 255, 0.4);
  --glow-primary-strong: 0 0 40px rgba(0, 229, 255, 0.4);
  --glow-cta: 0 0 40px rgba(0, 229, 255, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* Base Styles */
body {
  font-family: var(--font-family);
  background-color: var(--color-background);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Prevent iOS zoom on input focus */
input, textarea, select {
  font-size: 16px;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-card);
}

::-webkit-scrollbar-thumb {
  background: var(--color-text-muted);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text);
}

/* Focus visible for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: var(--space-2) var(--space-4);
  z-index: 100;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;
}
```

### 7.2 Tailwind CSS v4 Configuration

```css
/* Extend in globals.css for Tailwind v4 */
@theme {
  /* Colors */
  --color-background: #000000;
  --color-card: #121212;
  --color-card-secondary: #1C1C1E;
  --color-primary: #0079FF;
  --color-primary-light: #00E5FF;
  --color-muted: #8B95A1;
  --color-success: #34D399;
  --color-warning: #FB923C;
  --color-error: #FF453A;
  --color-info: #22D3EE;

  /* Custom border radius */
  --radius-2xl: 16px;
  --radius-3xl: 24px;

  /* Custom shadows */
  --shadow-glow: 0 0 20px rgba(0, 121, 255, 0.4);
  --shadow-glow-strong: 0 0 40px rgba(0, 229, 255, 0.4);
}
```

---

## 8. Layout Components

### 8.1 Header Component (Desktop) - with i18n

```typescript
// src/components/layouts/header.tsx
'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { motion } from 'framer-motion';
// Direct import to avoid barrel file issues
import Bell from 'lucide-react/dist/esm/icons/bell';
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/95 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-white">The Potential</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors rounded-2xl',
                  isActive ? 'text-white' : 'text-muted hover:text-white hover:bg-white/5'
                )}
              >
                {t(item.labelKey)}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/30"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <Button variant="ghost" size="icon" className="text-muted hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="sr-only">{t('notifications')}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
                <Avatar size="sm" showStatus statusColor="success">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback>KC</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile">{t('profile')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/expert-registration">Register as Expert</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-error">
                {t('signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
```

### 8.2 Bottom Navigation (Mobile) - with i18n

```typescript
// src/components/layouts/bottom-nav.tsx
'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { motion } from 'framer-motion';
// Direct imports for performance
import Home from 'lucide-react/dist/esm/icons/home';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Users from 'lucide-react/dist/esm/icons/users';
import User from 'lucide-react/dist/esm/icons/user';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/home', labelKey: 'home', icon: Home },
  { href: '/support-programs', labelKey: 'support', icon: TrendingUp },
  { href: '/thread', labelKey: 'thread', icon: MessageCircle },
  { href: '/clubs', labelKey: 'clubs', icon: Users },
  { href: '/profile', labelKey: 'profile', icon: User },
] as const;

export function BottomNav() {
  const t = useTranslations('navigation');
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden h-20 bg-black/95 backdrop-blur-md border-t border-white/8 pb-safe">
      <div className="flex items-center justify-around h-full px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 min-w-[60px] py-2 transition-transform',
                isActive && 'scale-110 -translate-y-0.5'
              )}
            >
              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="activeBottomNavIndicator"
                  className="absolute -top-2 w-12 h-1 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <div className={cn(
                'relative',
                isActive && 'text-primary'
              )}>
                <Icon className="h-6 w-6" />
                {isActive && (
                  <div className="absolute inset-0 blur-lg bg-primary/40" />
                )}
              </div>

              <span className={cn(
                'text-xs font-medium',
                isActive ? 'text-primary' : 'text-muted'
              )}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## 9. Supabase Integration

### 9.1 Client Setup

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for client-side
export const supabase = createClient();
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie errors in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie errors in Server Components
          }
        },
      },
    }
  );
}
```

---

## 10. State Management Strategy

### 10.1 State Categories

| State Type | Solution | Use Case |
|------------|----------|----------|
| Server State | TanStack Query | Data from Supabase (posts, experts, programs) |
| Auth State | Zustand + Supabase | User session, authentication status |
| UI State | Zustand | Modals, toasts, sidebar state |
| Form State | React Hook Form | Form inputs, validation |
| Local Component State | useState | Toggle states, input focus |

### 10.2 React Query Configuration

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Browser singleton
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
```

---

## 11. Implementation Checklist

### Phase 1: Foundation (Week 1-2)

- [ ] Initialize shadcn/ui with `npx shadcn@latest init`
- [ ] Install all required shadcn components
- [ ] Create customized wrapper components in `src/components/ui/`
- [ ] Configure Tailwind CSS v4 with design tokens
- [ ] Set up Supabase client and auth middleware
- [ ] **Set up next-intl with Korean (default) and English locales**
- [ ] **Create translation files (ko.json, en.json)**
- [ ] **Configure middleware for locale detection**
- [ ] **Build language switcher component**
- [ ] Create layout components (Header, BottomNav) **with i18n**
- [ ] Build landing page **with translations**
- [ ] Build authentication flow (login, signup, OTP) **with translations**

### Phase 2: Core Features (Week 3-4)

- [ ] Home dashboard with navigation **with translations**
- [ ] Thread/Community feed with infinite scroll
- [ ] Post creation and detail
- [ ] Comments and likes
- [ ] Support programs listing and detail **with translations**

### Phase 3: Expert System (Week 5-6)

- [ ] Expert search with filters **with translations**
- [ ] Expert profile pages
- [ ] Collaboration proposal flow
- [ ] Coffee chat feature
- [ ] Expert registration form **with translations**

### Phase 4: Community Features (Week 7-8)

- [ ] Private clubs discovery
- [ ] Club detail pages
- [ ] Events board
- [ ] Article insights section
- [ ] User profile page **with translations**

### Phase 5: Admin & Polish (Week 9-10)

- [ ] Admin dashboard **with translations**
- [ ] Member approval workflow
- [ ] Expert verification workflow
- [ ] Animation refinement
- [ ] **Complete translation review and quality check**
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] E2E testing

---

## 12. Dependencies Installation

```bash
# Core dependencies
bun add @supabase/supabase-js @supabase/ssr @tanstack/react-query zustand

# Form & Validation
bun add react-hook-form @hookform/resolvers zod

# Animation
bun add framer-motion

# UI Utilities
bun add clsx tailwind-merge class-variance-authority

# Date utilities
bun add date-fns

# Internationalization (NEW)
bun add next-intl

# Initialize and install shadcn components
bunx shadcn@latest init
bunx shadcn@latest add button card input textarea badge avatar dialog sheet dropdown-menu select checkbox switch tabs skeleton progress alert tooltip popover scroll-area separator table form carousel accordion command pagination sonner label radio-group input-otp alert-dialog toggle toggle-group

# Dev Dependencies
bun add -d vitest @testing-library/react @testing-library/user-event @playwright/test msw
```

---

## 13. References

### Best Practices Applied

| Rule | Impact | Application |
|------|--------|-------------|
| bundle-barrel-imports | CRITICAL | Direct imports for lucide-react, optimizePackageImports config |
| rerender-memo | MEDIUM | Memoized sub-components |
| async-suspense-boundaries | HIGH | Suspense for data fetching |
| rerender-derived-state | MEDIUM | useMediaQuery for responsive hooks |
| bundle-dynamic-imports | CRITICAL | Dynamic import for modals |
| client-swr-dedup | MEDIUM-HIGH | TanStack Query for deduplication |

### shadcn Component Reference

All components available at: https://ui.shadcn.com/docs/components

### Design System Reference

- UI/UX Plan: `/docs/ui-ux-plan.md`
- Color Palette: Section 4.1
- Typography: Section 4.2
- Spacing: Section 4.3
- Border Radius: Section 4.4
- Component Specs: Section 5
- Animation Guidelines: Section 8
- Accessibility: Section 9

### i18n Reference

- next-intl Documentation: https://next-intl.dev/docs
- App Router with i18n Routing: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
- Messages Format: https://next-intl.dev/docs/usage/messages

---

*This Frontend Plan serves as the comprehensive technical specification for implementing The Potential platform. All UI components are based on shadcn/ui primitives wrapped with The Potential's design system customizations. Feature components use ONLY the customized wrappers from `src/components/ui/`, never importing directly from shadcn primitives. The platform supports Korean (default) and English through next-intl with locale-based routing.*
