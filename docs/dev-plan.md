# Development Plan - The Potential

Generated: 2026-02-04
Updated: 2026-02-04 (Added i18n Tasks)
Source Plans: frontend-plan.md, backend-plan.md, ui-ux-plan.md
PRD: prd.md

---

## Executive Summary

The Potential is a trust-based platform for early-stage startup founders, providing verified expert/agency matching, real-time community engagement (thread-style feed), curated support program information, and approval-based member management. The platform follows a Toss-style dark theme design with Electric Blue accents (#0079FF / #00E5FF), large border radii (24px+), and smooth spring animations.

### Technical Stack
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui
- **Backend:** Supabase (PostgreSQL), Edge Functions
- **State Management:** Zustand (global) + TanStack Query (server state)
- **Animation:** Framer Motion
- **Authentication:** Supabase Auth (Email/Password + Google OAuth)
- **Internationalization:** next-intl (Korean default, English secondary)

### User Roles
1. **Regular Member:** Early-stage startup founder (approval required)
2. **Expert/Agency:** Service provider with verified profile
3. **Administrator:** Community and verification manager

### Component Architecture (shadcn/ui)
All UI components follow a three-layer architecture:
```
Layer 1: shadcn primitives (installed via CLI)
    |
Layer 2: Customized wrappers (src/components/ui/) - App-specific variants & styling
    |
Layer 3: Feature components (src/features/[name]/components/) - Business logic compositions
```

**Key Principle:** shadcn primitives are NEVER used directly in feature components. They are always wrapped in customized versions that apply The Potential's design system.

---

## Phase 1: Foundation

### Task 1.1: Project Setup and Configuration
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** None
**Complexity:** Medium

**Expected Output:**
- Next.js 16 project initialized with App Router
- TypeScript configured with strict mode
- ESLint and Prettier configured
- Git repository initialized with proper .gitignore

**Acceptance Criteria:**
- `npm run dev` starts development server without errors
- TypeScript compilation passes with no errors
- ESLint runs without critical errors
- Project structure matches Bulletproof React architecture

**Steps to Reproduce:**
1. Run `npm create next-app@latest` with TypeScript option
2. Verify `package.json` contains Next.js 16.x and React 19.x
3. Run `npm run dev` and confirm server starts on localhost:3000
4. Run `npm run lint` and confirm no critical errors

---

### Task 1.2: Install Core Dependencies
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.1
**Complexity:** Low

**Expected Output:**
- All core dependencies installed in package.json
- Dependencies: @supabase/supabase-js, @supabase/ssr, @tanstack/react-query, zustand, framer-motion, react-hook-form, zod, date-fns, clsx, tailwind-merge, class-variance-authority, next-intl
- Dev dependencies: Tailwind CSS v4, vitest, playwright, testing-library

**Acceptance Criteria:**
- `npm install` completes without errors
- All packages resolve to correct versions
- No peer dependency conflicts
- next-intl installed for internationalization

**Steps to Reproduce:**
1. Run `npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query zustand framer-motion react-hook-form @hookform/resolvers zod date-fns clsx tailwind-merge class-variance-authority next-intl`
2. Run `npm install -D tailwindcss @tailwindcss/postcss vitest @testing-library/react playwright`
3. Run `npm ls` to verify all dependencies installed
4. Run `npm run build` to ensure no dependency issues

---

### Task 1.3: Configure Tailwind CSS v4 with Design Tokens
**Source:** ui-ux-plan.md, frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.2
**Complexity:** Medium

**Expected Output:**
- `src/app/globals.css` with all CSS custom properties
- Design tokens: colors (primary, background, card, semantic), typography, spacing, border-radius, shadows, glow effects
- Tailwind CSS @theme configuration

**Acceptance Criteria:**
- Primary color (#0079FF) renders correctly
- Background (#000000) applied to body
- Card backgrounds (#121212) display correctly
- Border radius (24px / rounded-3xl) applies to components
- Glow effects visible on hover states

**Steps to Reproduce:**
1. Open `src/app/globals.css`
2. Verify `:root` contains all CSS custom properties from design system
3. Create a test div with `bg-primary text-white rounded-3xl` classes
4. Verify correct visual appearance (Electric Blue, 24px radius)

---

### Task 1.4: Initialize shadcn/ui
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.3
**Complexity:** Low

**Expected Output:**
- shadcn/ui initialized in project
- `components.json` configuration file created
- Tailwind CSS configured for shadcn
- `src/lib/cn.ts` utility created (clsx + tailwind-merge)

**Acceptance Criteria:**
- `components.json` exists with correct configuration
- `src/lib/cn.ts` exports cn function
- shadcn CLI can add components

**Steps to Reproduce:**
1. Run `npx shadcn@latest init`
2. Select style: Default, base color: Slate, CSS variables: Yes
3. Verify `components.json` created in project root
4. Verify `src/lib/cn.ts` or `src/lib/utils.ts` contains cn function
5. Test: `npx shadcn@latest add button` should work

---

### Task 1.5: Install Required shadcn Components
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.4
**Complexity:** Low

**Expected Output:**
- All required shadcn primitive components installed in `src/components/ui/`
- Radix UI dependencies installed

**Acceptance Criteria:**
- All components listed below exist in `src/components/ui/`
- No TypeScript errors in component files
- Components are importable

**Steps to Reproduce:**
1. Run the following command:
```bash
npx shadcn@latest add \
  button input textarea checkbox radio-group select switch slider form label input-otp \
  card separator scroll-area \
  alert alert-dialog dialog drawer sheet sonner progress skeleton spinner \
  tabs navigation-menu breadcrumb pagination command \
  avatar badge table hover-card tooltip \
  popover dropdown-menu combobox \
  accordion collapsible toggle toggle-group carousel calendar
```
2. Verify all component files exist in `src/components/ui/`
3. Run `npm run build` to verify no TypeScript errors

---

### Task 1.6: Create Customized Button Wrapper
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.5
**Complexity:** Medium

**Expected Output:**
- `src/components/ui/button.tsx` with The Potential's design system variants
- Variants: primary, primary-glow, secondary, outline, ghost, destructive, link
- Sizes: sm, md, lg, xl, icon, icon-sm, icon-lg
- Props: loading, leftIcon, rightIcon, asChild

**Acceptance Criteria:**
- Button uses class-variance-authority (cva)
- Primary variant uses Electric Blue (#0079FF)
- Primary-glow variant has cyan (#00E5FF) with glow shadow
- Loading state shows Spinner component
- All sizes use correct heights (32px, 40px, 48px, 56px)
- Border radius uses rounded-xl/rounded-2xl

**Steps to Reproduce:**
1. Import Button from `@/components/ui/button`
2. Render `<Button variant="primary">Click me</Button>`
3. Verify Electric Blue background
4. Render `<Button variant="primary-glow">CTA</Button>`
5. Verify cyan background with glow shadow
6. Render `<Button loading>Loading</Button>`
7. Verify spinner shows and button is disabled

---

### Task 1.7: Create Customized Card Wrapper
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.5
**Complexity:** Medium

**Expected Output:**
- `src/components/ui/card.tsx` with The Potential's design system variants
- Variants: default, elevated, gradient, interactive, glow, ghost
- Padding: none, sm, md, lg
- Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

**Acceptance Criteria:**
- Card uses 24px border radius (rounded-3xl)
- Default variant uses bg-card border-white/8
- Interactive variant has hover scale and border color change
- Glow variant has primary color glow shadow

**Steps to Reproduce:**
1. Import Card from `@/components/ui/card`
2. Render `<Card variant="default">Content</Card>`
3. Verify rounded-3xl border radius
4. Render `<Card variant="interactive">Click me</Card>`
5. Hover and verify scale animation and border change

---

### Task 1.8: Create Customized Input Wrapper
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.5
**Complexity:** Medium

**Expected Output:**
- `src/components/ui/input.tsx` with label, helper text, error states
- Props: label, helperText, error, leftIcon, rightIcon
- 48px height, 16px border radius (rounded-2xl)

**Acceptance Criteria:**
- Input height is 48px (h-12)
- Border radius is rounded-2xl
- Error state shows red border and error message
- Focus state shows primary color ring
- Left/right icons properly positioned

**Steps to Reproduce:**
1. Import Input from `@/components/ui/input`
2. Render `<Input label="Email" placeholder="Enter email" />`
3. Verify 48px height and proper styling
4. Render `<Input error="Invalid email" />`
5. Verify red border and error message below input

---

### Task 1.9: Create Customized Textarea Wrapper
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.5
**Complexity:** Low

**Expected Output:**
- `src/components/ui/textarea.tsx` with label, helper text, error states
- Same styling consistency as Input component

**Acceptance Criteria:**
- Minimum height 120px
- Border radius rounded-2xl
- Error and focus states match Input component

**Steps to Reproduce:**
1. Import Textarea from `@/components/ui/textarea`
2. Render `<Textarea label="Bio" />`
3. Verify consistent styling with Input

---

### Task 1.10: Create Customized Badge Wrapper
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.5
**Complexity:** Low

**Expected Output:**
- `src/components/ui/badge.tsx` with semantic variants
- Variants: default, success, warning, error, info, muted, outline
- Sizes: sm, md, lg

**Acceptance Criteria:**
- Badge has pill shape (rounded-full)
- Success variant is emerald green
- Warning variant is orange
- Error variant is red

**Steps to Reproduce:**
1. Import Badge from `@/components/ui/badge`
2. Render `<Badge variant="success">Active</Badge>`
3. Verify emerald green color with border

---

### Task 1.11: Create Customized Avatar Wrapper
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.5
**Complexity:** Medium

**Expected Output:**
- `src/components/ui/avatar.tsx` with size variants and status indicator
- Sizes: xs (24px), sm (32px), md (48px), lg (64px), xl (96px), 2xl (128px)
- Status indicator with color variants

**Acceptance Criteria:**
- All sizes render correctly
- Status indicator positioned at bottom-right
- Status colors: success (green), warning (orange), error (red), muted (gray)

**Steps to Reproduce:**
1. Import Avatar from `@/components/ui/avatar`
2. Render `<Avatar size="lg" showStatus statusColor="success" />`
3. Verify 64px size with green status dot

---

### Task 1.12: Create Customized Dialog Wrapper
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.5
**Complexity:** Medium

**Expected Output:**
- `src/components/ui/dialog.tsx` with dark theme styling
- Sub-components: DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
- Animations for open/close

**Acceptance Criteria:**
- Overlay is 80% black with backdrop blur
- Content has rounded-3xl border radius
- Close button styled with hover state
- Animations work on open/close

**Steps to Reproduce:**
1. Import Dialog components
2. Create a dialog with trigger and content
3. Open dialog and verify styling
4. Close dialog and verify animation

---

### Task 1.13: Create Customized Select, Tabs, Skeleton, Sonner, Progress, Spinner Wrappers
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.5
**Complexity:** Medium

**Expected Output:**
- `src/components/ui/select.tsx` with dark theme styling and label support
- `src/components/ui/tabs.tsx` with animated indicator
- `src/components/ui/skeleton.tsx` with shimmer animation
- `src/components/ui/sonner.tsx` configured for dark theme toasts
- `src/components/ui/progress.tsx` with primary color
- `src/components/ui/spinner.tsx` with size variants

**Acceptance Criteria:**
- Select trigger has 48px height and rounded-2xl
- Tabs have animated active indicator
- Skeleton has shimmer animation
- Sonner shows dark theme toasts
- Progress bar uses primary color
- Spinner has sm, md, lg sizes

**Steps to Reproduce:**
1. Test each component individually
2. Verify styling matches design system
3. Verify animations work correctly

---

### Task 1.14: Setup Supabase Project
**Source:** backend-plan.md
**Priority:** Critical
**Dependencies:** None
**Complexity:** Low

**Expected Output:**
- Supabase project created
- Environment variables configured (.env.local)
- NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set

**Acceptance Criteria:**
- Supabase dashboard accessible
- API keys generated and stored securely
- Connection test passes from application

**Steps to Reproduce:**
1. Create project at supabase.com/dashboard
2. Copy API URL and anon key from Settings > API
3. Create `.env.local` with credentials
4. Test connection with Supabase client initialization

---

### Task 1.15: Enable PostgreSQL Extensions
**Source:** backend-plan.md
**Priority:** High
**Dependencies:** 1.14
**Complexity:** Low

**Expected Output:**
- pg_trgm extension enabled (text search)
- unaccent extension enabled (accent-insensitive search)

**Acceptance Criteria:**
- `SELECT * FROM pg_extension WHERE extname = 'pg_trgm'` returns a row
- `SELECT * FROM pg_extension WHERE extname = 'unaccent'` returns a row

**Steps to Reproduce:**
1. Open Supabase SQL Editor
2. Run: `create extension if not exists "pg_trgm"; create extension if not exists "unaccent";`
3. Verify extensions exist in Database > Extensions

---

### Task 1.16: Configure Supabase Client (Browser + Server)
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.14
**Complexity:** Medium

**Expected Output:**
- `src/lib/supabase/client.ts` - Browser client with SSR support
- `src/lib/supabase/server.ts` - Server client for RSC
- `src/lib/supabase/middleware.ts` - Auth middleware for route protection

**Acceptance Criteria:**
- Browser client creates authenticated sessions
- Server client reads cookies correctly
- Middleware redirects unauthenticated users from protected routes

**Steps to Reproduce:**
1. Import client in a component
2. Call `supabase.auth.getSession()`
3. Verify session data returns (or null if not logged in)

---

### Task 1.17: Setup React Query Provider
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.2
**Complexity:** Low

**Expected Output:**
- `src/lib/query-client.ts` with QueryClient configuration
- `src/app/providers.tsx` with QueryClientProvider wrapper
- Root layout wraps children with Providers

**Acceptance Criteria:**
- useQuery hooks work throughout application
- Stale time configured to 60 seconds
- refetchOnWindowFocus disabled

**Steps to Reproduce:**
1. Create a test query hook
2. Verify data fetching works
3. Check DevTools shows query cache

---

### Task 1.18: Setup next-intl Configuration
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.2
**Complexity:** Medium

**Expected Output:**
- `src/i18n/routing.ts` with locale routing configuration (ko default, en secondary)
- `src/i18n/request.ts` with server-side request configuration
- `src/i18n/navigation.ts` with localized navigation utilities (Link, redirect, usePathname, useRouter)
- `next.config.ts` updated with createNextIntlPlugin

**Acceptance Criteria:**
- routing.ts exports locales array ['ko', 'en'] with defaultLocale 'ko'
- request.ts loads correct messages based on locale
- navigation.ts exports localized Link, redirect, usePathname, useRouter
- next.config.ts wraps config with withNextIntl

**Steps to Reproduce:**
1. Create `src/i18n/routing.ts` with defineRouting configuration
2. Create `src/i18n/request.ts` with getRequestConfig
3. Create `src/i18n/navigation.ts` with createNavigation
4. Update `next.config.ts` to use createNextIntlPlugin
5. Import Link from `@/i18n/navigation` and verify it works

---

### Task 1.19: Create Middleware for Locale Routing
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.18
**Complexity:** Medium

**Expected Output:**
- `src/middleware.ts` with next-intl middleware for locale detection and routing
- Middleware matcher configured to handle locale prefixes and exclude API/static routes

**Acceptance Criteria:**
- Visiting `/` redirects to `/ko` (default locale)
- Visiting `/en` shows English version
- Visiting `/ko` shows Korean version
- API routes (`/api/*`), static files, and Next.js internals excluded from middleware
- Browser language detection works for first visit

**Steps to Reproduce:**
1. Create `src/middleware.ts` using createMiddleware from next-intl
2. Configure matcher: `['/', '/(ko|en)/:path*', '/((?!api|trpc|_next|_vercel|.*\\..*).*)']`
3. Visit `/` in browser - should redirect to `/ko`
4. Visit `/en/home` - should show English content
5. Clear cookies, set browser language to English, visit `/` - should redirect to `/en`

---

### Task 1.20: Create Translation Files (Korean + English)
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.18
**Complexity:** High

**Expected Output:**
- `src/messages/ko.json` with complete Korean translations (default)
- `src/messages/en.json` with complete English translations
- Translation keys for: common, navigation, auth, home, experts, thread, supportPrograms, clubs, profile, admin, errors, validation, footer

**Acceptance Criteria:**
- Both JSON files are valid and parseable
- All translation keys match between ko.json and en.json
- Korean translations use natural, native Korean expressions
- English translations are grammatically correct
- Supports interpolation (e.g., `{name}`, `{count}`)

**Steps to Reproduce:**
1. Create `src/messages/ko.json` with all translation keys
2. Create `src/messages/en.json` with matching keys
3. Run `JSON.parse()` on both files to verify validity
4. Compare keys between files to ensure parity
5. Test interpolation: `t('home.welcome', { name: 'Test' })`

---

### Task 1.21: Create Language Switcher Component
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.18, 1.12
**Complexity:** Medium

**Expected Output:**
- `src/components/common/language-switcher.tsx` with dropdown for language selection
- Uses customized DropdownMenu, Button from `@/components/ui/`
- Shows current language with Globe icon
- Lists available languages with native names and checkmark for current

**Acceptance Criteria:**
- Component uses useLocale() from next-intl
- Component uses usePathname() and useRouter() from `@/i18n/navigation`
- Clicking language option changes URL to new locale
- Current language shows checkmark indicator
- Dropdown styled according to design system (dark theme)

**Steps to Reproduce:**
1. Import LanguageSwitcher component
2. Render in header
3. Click to open dropdown
4. See Korean and English options with native names
5. Click English - URL changes to `/en/...`
6. Verify page content updates to English

---

### Task 1.22: Update Root Layout with NextIntlClientProvider
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.18, 1.19, 1.20
**Complexity:** Medium

**Expected Output:**
- `src/app/[locale]/layout.tsx` as the root layout with dynamic locale segment
- Layout wrapped with NextIntlClientProvider
- generateStaticParams returns all supported locales
- generateMetadata produces locale-specific metadata with alternates

**Acceptance Criteria:**
- Layout accepts `params: Promise<{ locale: string }>` and awaits it
- Validates locale against routing.locales, calls notFound() if invalid
- Calls setRequestLocale(locale) for static rendering
- Wraps children with NextIntlClientProvider passing locale and messages
- HTML lang attribute set to current locale

**Steps to Reproduce:**
1. Move existing layout to `src/app/[locale]/layout.tsx`
2. Add locale validation and setRequestLocale call
3. Wrap children with NextIntlClientProvider
4. Add generateStaticParams returning [{locale: 'ko'}, {locale: 'en'}]
5. Visit `/ko` - verify Korean content and lang="ko"
6. Visit `/en` - verify English content and lang="en"

---

### Task 1.23: Update Header and Bottom Nav with i18n
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.21, 2.12, 2.13
**Complexity:** Medium

**Expected Output:**
- Header component updated to use useTranslations('navigation')
- Header includes LanguageSwitcher component
- Bottom nav updated to use useTranslations('navigation')
- Both components use Link from `@/i18n/navigation` instead of next/link

**Acceptance Criteria:**
- Navigation labels display in current locale language
- Language switcher visible in header
- Locale persists when navigating between pages
- Active state indicators still work with localized paths

**Steps to Reproduce:**
1. Update Header to import useTranslations and Link from i18n
2. Replace navigation labels with t('home'), t('support'), etc.
3. Add LanguageSwitcher to header actions
4. Update BottomNav similarly
5. Navigate between pages - verify locale persists
6. Switch language - verify all navigation labels update

---

## Phase 2: Authentication and Core Layout

### Task 2.1: Create Database Enums and Types
**Source:** backend-plan.md
**Priority:** Critical
**Dependencies:** 1.15
**Complexity:** Medium

**Expected Output:**
- user_role enum: 'member', 'expert', 'admin'
- approval_status enum: 'pending', 'approved', 'rejected', 'suspended'
- expert_status enum: 'draft', 'pending_review', 'approved', 'rejected'
- expert_category enum: marketing, development, design, legal, finance, hr, operations, strategy, other

**Acceptance Criteria:**
- All enums created without errors
- Enums visible in Database > Types

**Steps to Reproduce:**
1. Run SQL migration with CREATE TYPE statements
2. Query: `SELECT typname FROM pg_type WHERE typtype = 'e'`
3. Verify all 4+ enums exist

---

### Task 2.2: Create Profiles Table with Indexes
**Source:** backend-plan.md
**Priority:** Critical
**Dependencies:** 2.1
**Complexity:** High

**Expected Output:**
- `profiles` table with columns: id (UUID PK), email, full_name, avatar_url, phone, company_name, job_title, bio, location, role, approval_status, profile_completeness, network_count, expertise (text[]), skills (text[]), collaboration_needs (jsonb), experience (jsonb), portfolio_links (jsonb), timestamps
- GIN indexes for full-text search and array columns
- Partial index for pending approvals

**Acceptance Criteria:**
- Table created with all columns
- Primary key references auth.users(id)
- All indexes created
- Check constraints valid

**Steps to Reproduce:**
1. Run profiles table migration
2. Query: `SELECT * FROM information_schema.columns WHERE table_name = 'profiles'`
3. Verify all columns exist with correct types
4. Query: `SELECT indexname FROM pg_indexes WHERE tablename = 'profiles'`
5. Verify indexes created

---

### Task 2.3: Create Expert Profiles Table
**Source:** backend-plan.md
**Priority:** High
**Dependencies:** 2.2
**Complexity:** High

**Expected Output:**
- `expert_profiles` table with business info, verification workflow, visibility settings
- Foreign key to profiles(id) with index
- Composite index for expert search
- Full-text search index

**Acceptance Criteria:**
- Table created with all columns
- Foreign key constraint works
- Unique constraint on user_id prevents duplicates

**Steps to Reproduce:**
1. Run expert_profiles table migration
2. Attempt to insert duplicate user_id - should fail
3. Insert valid expert profile - should succeed

---

### Task 2.4: Create Posts and Comments Tables
**Source:** backend-plan.md
**Priority:** High
**Dependencies:** 2.2
**Complexity:** Medium

**Expected Output:**
- `posts` table with BIGINT IDENTITY PK, content, media_urls, like_count, comment_count, moderation fields
- `comments` table with parent_id for replies
- Cursor-based pagination index on (created_at desc, id desc)

**Acceptance Criteria:**
- Posts table accepts new inserts
- Comments link to posts via foreign key
- Nested comments work via parent_id
- Feed index enables efficient pagination

**Steps to Reproduce:**
1. Insert test post
2. Insert comment on post
3. Insert reply to comment (parent_id set)
4. Query feed with ORDER BY created_at DESC, id DESC LIMIT 20

---

### Task 2.5: Create Likes, Bookmarks, Notifications Tables
**Source:** backend-plan.md
**Priority:** Medium
**Dependencies:** 2.4
**Complexity:** Medium

**Expected Output:**
- `likes` table with polymorphic design (likeable_type, likeable_id)
- `bookmarks` table with polymorphic design
- `notifications` table with type enum and metadata jsonb

**Acceptance Criteria:**
- Unique constraint prevents duplicate likes
- Bookmarks display correctly per user
- Notifications store all required metadata

**Steps to Reproduce:**
1. Like a post - should succeed
2. Like same post again - should fail (unique constraint)
3. Unlike post - should succeed
4. Like post again - should succeed

---

### Task 2.6: Create Support Programs Table
**Source:** backend-plan.md
**Priority:** Medium
**Dependencies:** 2.2
**Complexity:** Medium

**Expected Output:**
- `support_programs` table with title, description, organization, category, dates, status
- Deadline index for filtering
- Full-text search index

**Acceptance Criteria:**
- Programs store all required fields
- Deadline filtering works
- Search returns relevant results

**Steps to Reproduce:**
1. Insert support program with deadline
2. Query programs where deadline > NOW()
3. Search programs by keyword

---

### Task 2.7: Create Collaboration Requests Table
**Source:** backend-plan.md
**Priority:** Medium
**Dependencies:** 2.3
**Complexity:** Medium

**Expected Output:**
- `collaboration_requests` table with sender_id, recipient_id, type, status
- Inbox index for recipient queries

**Acceptance Criteria:**
- Requests store sender and recipient
- Different parties constraint enforced
- Status transitions work correctly

**Steps to Reproduce:**
1. Create collaboration request
2. Query recipient's inbox
3. Update status to 'accepted'
4. Verify status change persists

---

### Task 2.8: Create Database Triggers
**Source:** backend-plan.md
**Priority:** High
**Dependencies:** 2.5
**Complexity:** Medium

**Expected Output:**
- `update_updated_at()` trigger function
- `update_like_count()` trigger for posts/comments
- `update_comment_count()` trigger for posts
- `handle_new_user()` trigger for profile creation on signup

**Acceptance Criteria:**
- updated_at auto-updates on row changes
- like_count increments/decrements on likes table changes
- comment_count updates on comments table changes
- Profile created automatically on auth.users insert

**Steps to Reproduce:**
1. Update a profile row
2. Verify updated_at changed
3. Insert like on post
4. Verify post like_count incremented
5. Sign up new user
6. Verify profile created in profiles table

---

### Task 2.9: Enable RLS and Create Helper Functions
**Source:** backend-plan.md
**Priority:** Critical
**Dependencies:** 2.8
**Complexity:** High

**Expected Output:**
- RLS enabled on all tables
- `is_admin()` helper function
- `is_approved_member()` helper function
- `get_user_role()` helper function

**Acceptance Criteria:**
- Direct table queries fail without auth
- Helper functions return correct values
- Functions use SECURITY DEFINER with explicit search_path

**Steps to Reproduce:**
1. Attempt query without authentication - should fail
2. Query with authenticated user - should succeed based on policy
3. Test is_admin() returns true for admin user

---

### Task 2.10: Create RLS Policies for All Tables
**Source:** backend-plan.md
**Priority:** Critical
**Dependencies:** 2.9
**Complexity:** High

**Expected Output:**
- Profiles: SELECT approved or own, UPDATE own, DELETE admin only
- Expert profiles: SELECT approved to members, INSERT/UPDATE own
- Posts: SELECT non-hidden to approved members, INSERT approved members
- Comments: Similar to posts
- Likes/Bookmarks: Own data only
- Support programs: Published to all, CRUD admin only
- Notifications: Own notifications only
- Collaboration requests: Own sent/received

**Acceptance Criteria:**
- Non-approved users cannot view community content
- Users can only edit their own content
- Admins have elevated permissions
- Hidden content invisible to regular users

**Steps to Reproduce:**
1. Login as pending member - cannot view posts
2. Login as approved member - can view and create posts
3. Login as admin - can view hidden posts
4. User A cannot edit User B's post

---

### Task 2.11: Create Storage Buckets
**Source:** backend-plan.md
**Priority:** High
**Dependencies:** 2.9
**Complexity:** Medium

**Expected Output:**
- `avatars` bucket (public)
- `post-media` bucket (public)
- `expert-documents` bucket (private)
- `expert-portfolio` bucket (public)
- `program-images` bucket (public)

**Acceptance Criteria:**
- Public buckets accessible without auth
- Private buckets require owner or admin auth
- Upload policies restrict by user folder

**Steps to Reproduce:**
1. Upload avatar to avatars bucket
2. Verify public URL accessible
3. Upload document to expert-documents
4. Verify only owner can download

---

### Task 2.12: Implement Header Component (Desktop)
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** High
**Dependencies:** 1.6, 1.7, 1.10, 1.11, 1.21
**Complexity:** Medium

**Expected Output:**
- `src/components/layouts/header.tsx`
- Fixed position, 64px height
- Logo, navigation items, notification bell, profile avatar
- Active nav indicator with layoutId animation
- Language switcher integrated
- Uses useTranslations('navigation') for labels

**Acceptance Criteria:**
- Header stays fixed on scroll
- Navigation shows current route as active
- Active indicator animates between items
- Profile dropdown accessible
- Language switcher visible and functional
- Navigation labels use translations

**Steps to Reproduce:**
1. Navigate to different routes
2. Verify active indicator moves
3. Scroll page - header stays fixed
4. Click notification bell - verify action
5. Click language switcher - verify language changes
6. Verify navigation labels match current locale

---

### Task 2.13: Implement Bottom Navigation (Mobile)
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** High
**Dependencies:** 1.6, 1.18
**Complexity:** Medium

**Expected Output:**
- `src/components/layouts/bottom-nav.tsx`
- Fixed bottom, 80px height with safe area padding
- 5 items: Home, Support, Thread, Clubs, Profile
- Active state with scale and glow
- Uses useTranslations('navigation') for labels

**Acceptance Criteria:**
- Bottom nav visible only on mobile (hidden md:)
- Active tab scales up and shows glow
- Top indicator line animates
- Safe area respects iOS notch
- Navigation labels use translations

**Steps to Reproduce:**
1. View on mobile viewport
2. Tap different nav items
3. Verify active state changes
4. Verify bottom padding for iOS
5. Switch language - verify labels update

---

### Task 2.14: Implement Dashboard Layout
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 2.12, 2.13
**Complexity:** Low

**Expected Output:**
- `src/app/[locale]/(dashboard)/layout.tsx`
- Header at top
- Main content with proper padding (pt-16 pb-24 md:pb-8)
- Bottom nav for mobile

**Acceptance Criteria:**
- Content not obscured by fixed header
- Content not obscured by bottom nav on mobile
- Responsive padding adjustment
- Layout works within [locale] segment

**Steps to Reproduce:**
1. Add content that fills viewport
2. Verify header doesn't overlap
3. Verify bottom content visible above nav

---

### Task 2.15: Implement Auth Layout
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.3
**Complexity:** Low

**Expected Output:**
- `src/app/[locale]/(auth)/layout.tsx`
- Centered content without navigation
- Dark background

**Acceptance Criteria:**
- Auth pages centered vertically and horizontally
- No header or bottom nav visible
- Clean minimal appearance
- Works within [locale] segment

**Steps to Reproduce:**
1. Navigate to /ko/login or /en/login
2. Verify centered layout
3. Verify no navigation components

---

### Task 2.16: Implement Login Form
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.6, 1.8, 1.16, 1.20
**Complexity:** Medium

**Expected Output:**
- `src/features/auth/components/login-form.tsx`
- Google OAuth button
- Email/password form with validation
- React Hook Form + Zod validation
- Uses useTranslations('auth.login') for all labels and messages

**Acceptance Criteria:**
- Form validates email format
- Form validates password minimum length (8 chars)
- Google OAuth initiates redirect
- Successful login redirects to /[locale]/home
- Error messages display on failure in current locale
- All labels and messages use translations

**Steps to Reproduce:**
1. Submit empty form - see validation errors in current locale
2. Enter invalid email - see email error
3. Enter valid credentials - redirect to home
4. Enter wrong credentials - see error message in current locale
5. Switch to English - verify all text changes

---

### Task 2.17: Implement Signup Form with Profile Setup
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 2.16
**Complexity:** High

**Expected Output:**
- `src/features/auth/components/signup-form.tsx`
- Multi-step form: credentials, profile info
- Email verification (OTP)
- Profile creation on completion
- Uses useTranslations('auth.signup') for all labels

**Acceptance Criteria:**
- User can sign up with email/password
- User must enter name and company
- OTP verification works
- Profile created with pending status
- All labels use translations

**Steps to Reproduce:**
1. Fill signup form
2. Receive OTP
3. Enter OTP - verify account
4. Check profiles table for new record with status='pending'

---

### Task 2.18: Implement Auth Middleware
**Source:** frontend-plan.md
**Priority:** Critical
**Dependencies:** 1.16, 1.19
**Complexity:** Medium

**Expected Output:**
- `src/middleware.ts` combining next-intl and Supabase auth middleware
- Protected routes: /[locale]/home, /[locale]/thread, /[locale]/experts, etc.
- Admin routes: /[locale]/admin/*

**Acceptance Criteria:**
- Unauthenticated users redirected to /[locale]/login from protected routes
- Non-admin users redirected from /[locale]/admin routes
- Auth pages redirect authenticated users to /[locale]/home
- Locale routing continues to work alongside auth

**Steps to Reproduce:**
1. Visit /ko/home without login - redirected to /ko/login
2. Login - can access /ko/home
3. Visit /ko/admin as non-admin - redirected to /ko/home

---

## Phase 3: Community Features (Thread Feed)

### Task 3.1: Implement Feed API Queries
**Source:** frontend-plan.md, backend-plan.md
**Priority:** High
**Dependencies:** 2.4, 2.10
**Complexity:** Medium

**Expected Output:**
- `src/features/community/api/queries.ts`
- usePosts() with infinite query (cursor pagination)
- usePost(id) for single post
- useComments(postId)
- useCreatePost, useLikePost mutations

**Acceptance Criteria:**
- Posts load with author info (JOIN)
- Infinite scroll loads more posts
- Optimistic update for likes
- Cache invalidation on new post

**Steps to Reproduce:**
1. Load thread feed
2. Scroll to bottom - more posts load
3. Like a post - count updates immediately
4. Create post - appears at top of feed

---

### Task 3.2: Implement Post Card Component
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.6, 1.7, 1.10, 1.11, 3.1
**Complexity:** Medium

**Expected Output:**
- `src/features/community/components/post-card.tsx`
- Uses customized Card, Avatar, Badge from `@/components/ui/`
- Author info with avatar
- Content text
- Media grid (if images)
- Like and comment counts
- Uses useTranslations('thread.post') for action labels

**Acceptance Criteria:**
- Author name, company, avatar display
- Relative timestamp (e.g., "2h ago") - formatted for locale
- Images render in grid
- Like button toggles state
- Card has hover animation
- Action labels (like, comment, share) use translations

**Steps to Reproduce:**
1. Render post card with post data
2. Verify author info displays
3. Click like button - heart fills
4. Hover card - slight scale up
5. Switch language - verify action labels change

---

### Task 3.3: Implement Post Composer
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 1.6, 1.9, 3.1
**Complexity:** Medium

**Expected Output:**
- `src/features/community/components/post-composer.tsx`
- Uses customized Textarea, Button from `@/components/ui/`
- Textarea for content (no title required)
- Image upload capability
- Submit button with loading state
- Uses useTranslations('thread.compose') for placeholder and button text

**Acceptance Criteria:**
- Empty submit disabled
- Character limit indicator (5000 chars max)
- Image preview before submit
- Success shows post in feed
- Placeholder and submit button use translations

**Steps to Reproduce:**
1. Type content
2. Attach image
3. Preview image
4. Submit - post appears in feed

---

### Task 3.4: Implement Comment List and Form
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** 3.2
**Complexity:** Medium

**Expected Output:**
- `src/features/community/components/comment-list.tsx`
- `src/features/community/components/comment-form.tsx`
- Nested replies support
- Uses useTranslations('thread.comments') for labels

**Acceptance Criteria:**
- Comments display chronologically
- Reply button shows reply form
- Nested comments indented
- Like count on comments
- Labels use translations

**Steps to Reproduce:**
1. Open post detail
2. View comments
3. Submit new comment
4. Reply to existing comment

---

### Task 3.5: Implement Thread Feed Page
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 3.2, 3.3
**Complexity:** Medium

**Expected Output:**
- `src/app/[locale]/(dashboard)/thread/page.tsx`
- Post composer at top
- Infinite scroll feed
- Loading skeletons
- Page title uses useTranslations('thread')

**Acceptance Criteria:**
- Page loads with posts
- Composer visible at top
- Scroll triggers next page
- Skeleton UI during loading
- Page title and subtitle use translations

**Steps to Reproduce:**
1. Navigate to /ko/thread or /en/thread
2. See post composer
3. See posts loading
4. Scroll to bottom - more load

---

### Task 3.6: Implement Post Detail Page
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** 3.2, 3.4
**Complexity:** Medium

**Expected Output:**
- `src/app/[locale]/(dashboard)/thread/[id]/page.tsx`
- Full post content
- Comment section
- Back navigation

**Acceptance Criteria:**
- Post content fully visible
- Comments load below
- Can add comment
- Can navigate back to feed

**Steps to Reproduce:**
1. Click post in feed
2. See full post detail
3. See comments
4. Add comment
5. Go back to feed

---

## Phase 4: Expert System

### Task 4.1: Implement Expert Search API
**Source:** frontend-plan.md, backend-plan.md
**Priority:** High
**Dependencies:** 2.3, 2.10
**Complexity:** High

**Expected Output:**
- `src/features/experts/api/queries.ts`
- useExperts(filters) with search, category, price, region filters
- useExpert(id) for single profile
- Full-text search support

**Acceptance Criteria:**
- Category filter works
- Keyword search returns relevant results
- Price range filter works
- Multiple filters combine correctly

**Steps to Reproduce:**
1. Search experts with keyword
2. Filter by category
3. Filter by price range
4. Combine multiple filters

---

### Task 4.2: Implement Expert Card Component
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** High
**Dependencies:** 1.6, 1.7, 1.10, 1.11, 4.1
**Complexity:** Medium

**Expected Output:**
- `src/features/experts/components/expert-card.tsx`
- Uses customized Card, Avatar, Badge from `@/components/ui/`
- Business name, category, avatar
- Specialty badges
- Availability indicator
- Featured badge
- Uses useTranslations('experts.card') for labels

**Acceptance Criteria:**
- Card displays all expert info
- Available experts show green indicator
- Featured experts highlighted
- Click navigates to profile
- Labels (verified, available) use translations

**Steps to Reproduce:**
1. Render expert card
2. Verify info displays
3. Click card - navigate to profile

---

### Task 4.3: Implement Expert Grid with Filters
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 4.2
**Complexity:** Medium

**Expected Output:**
- `src/features/experts/components/expert-grid.tsx`
- `src/features/experts/components/filter-panel.tsx`
- Uses customized Select, Checkbox, Accordion from `@/components/ui/`
- Responsive grid layout
- Category, price, region filters
- Uses useTranslations('experts.filters') for filter labels

**Acceptance Criteria:**
- Grid responsive (1-4 columns)
- Filters update results
- Clear filters button
- Results count displayed
- Filter labels and category names use translations

**Steps to Reproduce:**
1. View expert grid
2. Apply category filter
3. See filtered results
4. Clear filters

---

### Task 4.4: Implement Expert Profile Header
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** High
**Dependencies:** 1.6, 1.7, 1.10, 1.11, 4.1
**Complexity:** High

**Expected Output:**
- `src/features/experts/components/expert-profile-header.tsx`
- Uses customized Avatar, Badge from `@/components/ui/`
- Avatar with verification badge
- Name, company, specialty
- Location, network count
- Bio section
- Stats grid
- Availability badge with pulse

**Acceptance Criteria:**
- Glow background effect visible
- Verified badge shows for approved
- Stats grid animated on hover
- Availability badge pulses

**Steps to Reproduce:**
1. Open expert profile
2. Verify header info
3. Hover stats - animation
4. See pulsing availability indicator

---

### Task 4.5: Implement Expert Profile Sections
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** Medium
**Dependencies:** 4.4
**Complexity:** Medium

**Expected Output:**
- Uses customized Badge, Tabs, Accordion from `@/components/ui/`
- Expertise & Skills section (chips)
- Collaboration Needs section (glow border)
- Experience Timeline
- Portfolio Links
- Uses useTranslations('experts.profile') for section labels

**Acceptance Criteria:**
- Skills displayed as badges/chips
- Collaboration needs in highlighted card
- Timeline shows chronological experience
- Portfolio links open in new tab
- Section labels use translations

**Steps to Reproduce:**
1. View expert profile
2. See skills section
3. See collaboration needs (highlighted)
4. Click portfolio link - opens new tab

---

### Task 4.6: Implement Collaboration Modal
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** High
**Dependencies:** 1.6, 1.8, 1.12, 4.4
**Complexity:** Medium

**Expected Output:**
- `src/features/experts/components/collaboration-modal.tsx`
- Uses customized Dialog, Input, Textarea, Button from `@/components/ui/`
- Subject, message, contact email fields
- Form validation
- Success/error states
- Uses useTranslations for labels and validation messages

**Acceptance Criteria:**
- Modal opens from CTA button
- Form validates required fields
- Submit creates collaboration request
- Success message shown
- Modal closes on success
- All text uses translations

**Steps to Reproduce:**
1. Click "Propose Collaboration" button
2. Modal opens
3. Fill form
4. Submit - see success
5. Modal closes

---

### Task 4.7: Implement Coffee Chat Modal
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** 4.6
**Complexity:** Low

**Expected Output:**
- `src/features/experts/components/coffee-chat-modal.tsx`
- Simpler form than collaboration
- Lower commitment option

**Acceptance Criteria:**
- Modal opens from secondary CTA
- Simpler form (message only)
- Creates collaboration request with type='coffee_chat'

**Steps to Reproduce:**
1. Click "Coffee Chat" button
2. Enter message
3. Submit

---

### Task 4.8: Implement Expert Profile Page
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 4.4, 4.5, 4.6, 4.7
**Complexity:** Medium

**Expected Output:**
- `src/app/[locale]/(dashboard)/experts/[id]/page.tsx`
- Profile header
- All sections
- Fixed CTA bar at bottom

**Acceptance Criteria:**
- All profile sections load
- Sticky CTA bar visible
- Both CTA buttons work
- Back navigation works

**Steps to Reproduce:**
1. Navigate to expert profile
2. See all sections
3. Scroll - CTA bar stays
4. Click collaboration button

---

### Task 4.9: Implement Expert Search Page
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 4.3
**Complexity:** Medium

**Expected Output:**
- `src/app/[locale]/(dashboard)/experts/page.tsx`
- Search bar
- Filter panel
- Expert grid
- Empty state
- Uses useTranslations('experts') for page title and labels

**Acceptance Criteria:**
- Search input works
- Filters visible and functional
- Grid displays results
- Empty state shows for no results with translated message

**Steps to Reproduce:**
1. Navigate to /ko/experts or /en/experts
2. Search by keyword
3. Filter by category
4. Click expert card

---

### Task 4.10: Implement Expert Registration Form
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** 2.3, 2.11
**Complexity:** High

**Expected Output:**
- `src/app/[locale]/(dashboard)/expert-registration/page.tsx`
- `src/features/expert-registration/components/registration-form.tsx`
- `src/features/expert-registration/components/document-upload.tsx`
- Uses customized Form, Input, Select, Progress, Alert from `@/components/ui/`
- Business info, service details, document upload
- Uses useTranslations('experts.registration') for labels

**Acceptance Criteria:**
- Form validates all required fields
- Business registration number format validated
- Documents upload to storage
- Submission sets status to 'pending_review'
- Admin notified
- All labels use translations

**Steps to Reproduce:**
1. Navigate to expert registration
2. Fill all required fields
3. Upload documents
4. Submit - see confirmation
5. Check expert_profiles table

---

## Phase 5: Support Programs and Dashboard

### Task 5.1: Implement Support Programs API
**Source:** frontend-plan.md, backend-plan.md
**Priority:** High
**Dependencies:** 2.6, 2.10
**Complexity:** Medium

**Expected Output:**
- `src/features/support-programs/api/queries.ts`
- usePrograms(filters)
- useProgram(id)
- Category and deadline filters

**Acceptance Criteria:**
- Programs load with published status
- Category filter works
- Deadline filter shows upcoming
- Full-text search works

**Steps to Reproduce:**
1. Load support programs
2. Filter by category
3. Filter by deadline
4. Search by keyword

---

### Task 5.2: Implement Program Card Component
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** High
**Dependencies:** 1.6, 1.7, 1.10
**Complexity:** Medium

**Expected Output:**
- `src/features/support-programs/components/program-card.tsx`
- Uses customized Card, Badge from `@/components/ui/`
- Category badge
- Deadline badge (D-X countdown)
- Title, organization
- Brief description
- Amount badge
- Uses useTranslations('supportPrograms.card') for labels

**Acceptance Criteria:**
- Card width fixed for horizontal scroll (300-340px)
- Deadline shows days remaining
- Deadline badge orange when urgent
- Card clickable for detail
- Labels use translations

**Steps to Reproduce:**
1. Render program card
2. Verify deadline countdown
3. Click card - see detail

---

### Task 5.3: Implement Program Carousel
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** Medium
**Dependencies:** 5.2
**Complexity:** Medium

**Expected Output:**
- `src/features/support-programs/components/program-carousel.tsx`
- Uses customized Carousel, Tabs from `@/components/ui/`
- Horizontal scroll container
- Category filter above
- Touch-friendly scrolling

**Acceptance Criteria:**
- Cards scroll horizontally
- Category filter updates cards
- Touch swipe works on mobile
- Scroll snap optional

**Steps to Reproduce:**
1. View carousel
2. Swipe/scroll horizontally
3. Filter by category
4. See cards update

---

### Task 5.4: Implement Program Detail Modal
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** 5.2, 1.12
**Complexity:** Medium

**Expected Output:**
- `src/features/support-programs/components/program-detail-modal.tsx`
- Uses customized Dialog from `@/components/ui/`
- Full program info
- Apply/external link button
- Bookmark button
- Uses useTranslations('supportPrograms.detail') for section labels

**Acceptance Criteria:**
- Modal shows all program details
- External URL opens in new tab
- Bookmark saves program
- Close button works
- Section labels use translations

**Steps to Reproduce:**
1. Click program card
2. Modal opens
3. View all details
4. Click apply - external link opens

---

### Task 5.5: Implement Support Programs Page
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** 5.3, 5.4
**Complexity:** Medium

**Expected Output:**
- `src/app/[locale]/(dashboard)/support-programs/page.tsx`
- Category filter
- Deadline filter
- Program cards
- Detail modal
- Uses useTranslations('supportPrograms') for page title

**Acceptance Criteria:**
- Page loads programs
- Filters work correctly
- Cards open detail modal
- Responsive layout
- Page title uses translations

**Steps to Reproduce:**
1. Navigate to /ko/support-programs or /en/support-programs
2. See program cards
3. Filter by category
4. Click card - see detail

---

### Task 5.6: Implement Home Dashboard Page
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** High
**Dependencies:** 3.2, 5.2, 1.20
**Complexity:** High

**Expected Output:**
- `src/app/[locale]/(dashboard)/home/page.tsx`
- Uses customized Card, Carousel, Scroll-area from `@/components/ui/`
- Welcome section (personalized)
- Real-time threads preview
- Article insights carousel
- Quick navigation cards
- Uses useTranslations('home') for all section titles and welcome message

**Acceptance Criteria:**
- Welcome shows user name with translation interpolation
- Thread preview shows recent posts
- Horizontal scroll for articles
- Quick nav cards lead to sections
- Staggered animation on load
- All section titles use translations

**Steps to Reproduce:**
1. Navigate to /ko/home or /en/home
2. See personalized welcome (translated)
3. See thread preview
4. See article carousel
5. Click quick nav card

---

### Task 5.7: Implement Profile Page
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** High
**Dependencies:** 4.4, 1.20
**Complexity:** High

**Expected Output:**
- `src/app/[locale]/(dashboard)/profile/page.tsx`
- Uses customized Avatar, Badge, Progress, Accordion from `@/components/ui/`
- Profile completeness banner
- Business card header
- Expertise & skills
- Collaboration needs
- Experience timeline
- Portfolio links
- Uses useTranslations('profile') for all labels

**Acceptance Criteria:**
- Completeness percentage calculated
- All sections editable
- Changes persist to database
- Profile photo uploadable
- All labels use translations

**Steps to Reproduce:**
1. Navigate to /ko/profile or /en/profile
2. See completeness banner
3. Edit section
4. Save changes
5. Verify persistence

---

### Task 5.8: Implement Profile Edit Forms
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** 5.7
**Complexity:** Medium

**Expected Output:**
- Edit forms for each profile section
- Uses customized Form, Input, Select, Dialog from `@/components/ui/`
- Inline editing or modal editing
- Form validation

**Acceptance Criteria:**
- Each section has edit button
- Edit mode shows form
- Validation prevents invalid data
- Save updates database

**Steps to Reproduce:**
1. Click edit on expertise section
2. Modify skills
3. Save
4. Verify changes persisted

---

## Phase 6: Admin Zone

### Task 6.1: Implement Admin Layout
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** 2.18
**Complexity:** Low

**Expected Output:**
- `src/app/[locale]/(admin)/admin/layout.tsx`
- Admin sidebar navigation
- Protected by admin role check
- Uses useTranslations('admin') for navigation labels

**Acceptance Criteria:**
- Only admins can access
- Sidebar shows admin sections
- Different visual treatment
- Navigation labels use translations

**Steps to Reproduce:**
1. Login as admin
2. Navigate to /ko/admin or /en/admin
3. See admin dashboard
4. Non-admin redirected

---

### Task 6.2: Implement Member Approval List
**Source:** frontend-plan.md, backend-plan.md
**Priority:** Medium
**Dependencies:** 6.1
**Complexity:** Medium

**Expected Output:**
- `src/app/[locale]/(admin)/admin/members/page.tsx`
- `src/features/admin/components/member-approval-list.tsx`
- Uses customized Table from `@/components/ui/`
- List of pending members
- Approve/reject buttons
- Uses useTranslations('admin.members') for labels

**Acceptance Criteria:**
- Pending members displayed
- Approve button changes status to 'approved'
- Reject button requires reason
- User notified on status change
- Labels use translations

**Steps to Reproduce:**
1. View pending members
2. Click approve on member
3. Verify status changed
4. Check notifications table

---

### Task 6.3: Implement Expert Verification
**Source:** frontend-plan.md, backend-plan.md
**Priority:** Medium
**Dependencies:** 6.1
**Complexity:** Medium

**Expected Output:**
- `src/app/[locale]/(admin)/admin/experts/page.tsx`
- `src/features/admin/components/expert-verification.tsx`
- Uses customized Table, Dialog from `@/components/ui/`
- Document preview
- Approve/reject workflow
- Uses useTranslations('admin.experts') for labels

**Acceptance Criteria:**
- Pending experts listed
- Documents viewable
- Approval changes expert status
- Expert notified
- Labels use translations

**Steps to Reproduce:**
1. View pending experts
2. Review documents
3. Approve or reject
4. Check status changed

---

### Task 6.4: Implement Content Management
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** 6.1
**Complexity:** Medium

**Expected Output:**
- `src/app/[locale]/(admin)/admin/content/page.tsx`
- Uses customized Table, Dropdown-menu from `@/components/ui/`
- Support program CRUD
- Community moderation tools
- Uses useTranslations('admin.content') for labels

**Acceptance Criteria:**
- Can create support program
- Can edit existing programs
- Can hide/delete community posts
- Can pin posts
- Labels use translations

**Steps to Reproduce:**
1. Create support program
2. Verify appears in program list
3. Hide community post
4. Verify hidden from feed

---

### Task 6.5: Implement Edge Functions for Admin Actions
**Source:** backend-plan.md
**Priority:** Medium
**Dependencies:** 6.2, 6.3
**Complexity:** Medium

**Expected Output:**
- `supabase/functions/approve-member/index.ts`
- `supabase/functions/send-notification/index.ts`
- Admin-only function invocation

**Acceptance Criteria:**
- Functions verify admin role
- Member approval updates profile
- Notification sent to user
- Audit trail maintained

**Steps to Reproduce:**
1. Invoke approve-member function
2. Verify profile status changed
3. Verify notification created

---

## Phase 7: Polish and Testing

### Task 7.1: Implement Loading Skeletons
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** Medium
**Dependencies:** 1.13
**Complexity:** Low

**Expected Output:**
- Skeleton components for cards, lists, profiles
- Uses customized Skeleton from `@/components/ui/`
- Shimmer animation effect

**Acceptance Criteria:**
- Skeletons match component dimensions
- Shimmer animation visible
- Replace with content on load

**Steps to Reproduce:**
1. Slow network throttle
2. Navigate to page
3. See skeleton loading
4. See content replace skeleton

---

### Task 7.2: Implement Error Boundaries
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** All Phase 3-6
**Complexity:** Medium

**Expected Output:**
- `src/components/common/error-boundary.tsx`
- Per-feature error boundaries
- Retry functionality
- Uses useTranslations('errors') for error messages

**Acceptance Criteria:**
- Errors caught and displayed
- Retry button attempts reload
- User-friendly error messages in current locale

**Steps to Reproduce:**
1. Force an error (e.g., network failure)
2. See error boundary with translated message
3. Click retry
4. Content loads

---

### Task 7.3: Implement Empty States
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** Medium
**Dependencies:** All Phase 3-6
**Complexity:** Low

**Expected Output:**
- `src/components/common/empty-state.tsx`
- Empty states for: no posts, no experts found, no programs
- Uses useTranslations for messages

**Acceptance Criteria:**
- Friendly message displayed in current locale
- Illustration or icon
- Action suggestion

**Steps to Reproduce:**
1. Search with no results
2. See empty state with translated message
3. See suggestion to broaden search

---

### Task 7.4: Implement Toast Notifications
**Source:** frontend-plan.md, ui-ux-plan.md
**Priority:** Medium
**Dependencies:** 1.13
**Complexity:** Medium

**Expected Output:**
- Toast notifications via Sonner
- Uses customized Sonner from `@/components/ui/`
- Success, error, info variants

**Acceptance Criteria:**
- Toast appears on action
- Auto-dismiss after delay
- Dismiss button works
- Accessible announcements

**Steps to Reproduce:**
1. Submit form successfully
2. See success toast
3. Toast auto-dismisses
4. Can manually dismiss

---

### Task 7.5: Implement Real-time Subscriptions
**Source:** backend-plan.md
**Priority:** Medium
**Dependencies:** All backend tasks
**Complexity:** Medium

**Expected Output:**
- Real-time new post notifications
- Real-time notification badge count
- Connection status indicator

**Acceptance Criteria:**
- New posts appear without refresh
- Notification count updates live
- Reconnection on disconnect

**Steps to Reproduce:**
1. Open feed in two tabs
2. Create post in one tab
3. See post appear in other tab

---

### Task 7.6: Accessibility Audit
**Source:** ui-ux-plan.md
**Priority:** High
**Dependencies:** All Phase 3-6
**Complexity:** Medium

**Expected Output:**
- Skip link implemented
- Focus management for modals
- ARIA labels on all interactive elements
- Color contrast verified

**Acceptance Criteria:**
- WCAG 2.1 AA compliance
- Keyboard navigation complete
- Screen reader tested
- Focus indicators visible

**Steps to Reproduce:**
1. Run axe-core audit
2. Tab through entire application
3. Test with VoiceOver
4. Verify no violations

---

### Task 7.7: Performance Optimization
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** All Phase 3-6
**Complexity:** Medium

**Expected Output:**
- Bundle analysis
- Dynamic imports for heavy components
- Image optimization
- Query deduplication

**Acceptance Criteria:**
- Initial bundle < 200KB
- LCP < 2.5s
- CLS < 0.1
- No duplicate network requests

**Steps to Reproduce:**
1. Run Lighthouse audit
2. Verify performance scores
3. Check network tab for duplicates
4. Check bundle size

---

### Task 7.8: Write Unit Tests for Core Features
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** All Phase 3-6
**Complexity:** High

**Expected Output:**
- Tests for auth hooks
- Tests for form validation
- Tests for key components
- Test coverage > 70%

**Acceptance Criteria:**
- All tests pass
- Critical paths covered
- Mocks properly configured
- CI pipeline runs tests

**Steps to Reproduce:**
1. Run `npm test`
2. Verify all tests pass
3. Check coverage report

---

### Task 7.9: Write E2E Tests for Critical Flows
**Source:** frontend-plan.md
**Priority:** Medium
**Dependencies:** 7.8
**Complexity:** High

**Expected Output:**
- E2E test: User signup flow
- E2E test: Post creation flow
- E2E test: Expert search and contact
- E2E test: Admin approval flow

**Acceptance Criteria:**
- Tests run in CI
- All critical paths tested
- Tests reliable (no flakes)

**Steps to Reproduce:**
1. Run `npx playwright test`
2. Verify all tests pass
3. Check test report

---

### Task 7.10: Complete Translation Review and Quality Check
**Source:** frontend-plan.md
**Priority:** High
**Dependencies:** All i18n tasks
**Complexity:** Medium

**Expected Output:**
- All translation keys verified across application
- Korean translations reviewed by native speaker
- English translations verified for grammar
- Missing translations identified and added

**Acceptance Criteria:**
- No missing translation keys (no fallback text visible)
- Korean uses natural, native expressions
- English is grammatically correct
- All interpolations work correctly ({name}, {count}, etc.)
- Date/number formatting correct for each locale

**Steps to Reproduce:**
1. Switch to Korean, navigate all pages - verify no English fallback text
2. Switch to English, navigate all pages - verify no Korean fallback text
3. Test pages with dynamic content (usernames, counts)
4. Verify date formatting matches locale conventions

---

### Task 7.11: Final Integration Testing
**Source:** All plans
**Priority:** Critical
**Dependencies:** All tasks
**Complexity:** High

**Expected Output:**
- Full app walkthrough
- All features functional
- No critical bugs
- i18n working across all features

**Acceptance Criteria:**
- User can sign up and get approved
- User can browse and create posts
- User can search and contact experts
- Admin can manage members and content
- Language switching works everywhere
- All content displays in selected language

**Steps to Reproduce:**
1. Complete user journey as new member (both languages)
2. Complete user journey as expert (both languages)
3. Complete admin journey (both languages)
4. Document any issues

---

## Summary

| Phase | Tasks | Critical | High | Medium | Low |
|-------|-------|----------|------|--------|-----|
| 1 | 23 | 10 | 8 | 5 | 0 |
| 2 | 18 | 5 | 9 | 4 | 0 |
| 3 | 6 | 0 | 4 | 2 | 0 |
| 4 | 10 | 0 | 6 | 4 | 0 |
| 5 | 8 | 0 | 5 | 3 | 0 |
| 6 | 5 | 0 | 0 | 5 | 0 |
| 7 | 11 | 1 | 2 | 8 | 0 |
| **Total** | **81** | **16** | **34** | **31** | **0** |

---

## Critical Path

The minimum viable path to a working application:

1. Task 1.1-1.5 (Foundation setup + shadcn init)
2. Task 1.6-1.8 (Core component wrappers: Button, Card, Input)
3. Task 1.14-1.17 (Supabase + React Query setup)
4. **Task 1.18-1.22 (i18n setup - next-intl, translations, locale routing)**
5. Task 2.1-2.2 (Profiles table)
6. Task 2.9-2.10 (RLS policies)
7. Task 2.16-2.18 (Authentication)
8. Task 3.1-3.2, 3.5 (Thread feed)
9. Task 5.6 (Home dashboard)
10. Task 7.10-7.11 (Translation review + Integration testing)

---

## Parallel Tracks

Tasks that can be developed in parallel:

**Track A (Backend):** Tasks 2.1-2.11 (Database setup)
**Track B (UI Foundation):** Tasks 1.4-1.13 (shadcn setup + component wrappers)
**Track C (Auth):** Tasks 2.16-2.18 (Authentication flow)
**Track D (i18n):** Tasks 1.18-1.23 (Internationalization setup)

After foundation complete:
**Track A:** Community features (Phase 3)
**Track B:** Expert system (Phase 4)
**Track C:** Support programs (Phase 5.1-5.5)

---

## Component Dependencies

All feature components depend on these customized wrappers being complete:

| Feature | Required Wrappers | i18n Integration |
|---------|------------------|------------------|
| Auth | Button, Input, Form | useTranslations('auth') |
| Community/Thread | Button, Card, Avatar, Badge, Textarea, Skeleton | useTranslations('thread') |
| Experts | Button, Card, Avatar, Badge, Dialog, Select, Tabs, Accordion | useTranslations('experts') |
| Support Programs | Button, Card, Badge, Carousel, Dialog, Tabs | useTranslations('supportPrograms') |
| Profile | Button, Card, Avatar, Badge, Progress, Accordion, Form | useTranslations('profile') |
| Admin | Button, Table, Dialog, Dropdown-menu | useTranslations('admin') |

---

## i18n Implementation Notes

### Translation Key Namespaces
- `common` - Shared UI text (loading, error, retry, etc.)
- `navigation` - Nav labels (home, support, thread, etc.)
- `auth` - Login/signup forms
- `home` - Dashboard page
- `experts` - Expert search and profiles
- `thread` - Community feed
- `supportPrograms` - Support program listings
- `clubs` - Clubs feature
- `profile` - User profile
- `admin` - Admin dashboard
- `errors` - Error messages
- `validation` - Form validation messages
- `footer` - Footer content

### Locale File Locations
- `src/messages/ko.json` - Korean (default)
- `src/messages/en.json` - English

### Key Components for i18n
- `src/i18n/routing.ts` - Locale configuration
- `src/i18n/request.ts` - Server request config
- `src/i18n/navigation.ts` - Localized navigation
- `src/middleware.ts` - Locale routing middleware
- `src/components/common/language-switcher.tsx` - Language toggle

---

## Deployment Considerations

1. **Environment Variables:** Ensure SUPABASE_URL and SUPABASE_ANON_KEY configured
2. **Database Migrations:** Run in order (types, tables, RLS, triggers)
3. **Storage:** Configure bucket CORS for file uploads
4. **Edge Functions:** Deploy to Supabase
5. **Vercel:** Configure for Next.js 16 with correct build settings
6. **Domain:** Configure custom domain and SSL
7. **Monitoring:** Setup error tracking (Sentry recommended)
8. **i18n:** Ensure all locales are included in build (generateStaticParams)

---

*This Development Plan consolidates frontend-plan.md, backend-plan.md, and ui-ux-plan.md into a unified, actionable roadmap for building The Potential platform. All UI components use shadcn/ui with customized wrappers in src/components/ui/. The platform supports Korean (default) and English via next-intl with locale-based routing.*
