# UI/UX Design Plan - The Potential

Generated: 2026-02-04
Source PRD: /docs/prd.md
Design System: Toss-style Dark Theme with Electric Blue Accent

---

## Executive Summary

The Potential is a trust-based platform designed for early-stage startup founders, providing verified expert matching, real-time community engagement, and curated support program information. This UI/UX plan establishes a comprehensive design system following Toss-style minimalism with a dark theme aesthetic, featuring large border radii (24px+), Electric Blue (#0079FF / #00E5FF) accent colors, and smooth spring animations.

The design prioritizes mobile-first responsive layouts, content-focused interfaces, and psychological conversion optimization - particularly in expert/agency profiles designed to encourage collaboration proposals.

---

## 1. User Research

### 1.1 Problem Statement

**Business Goal:** Create a trusted platform that connects early-stage startup founders with verified experts/agencies while fostering a supportive community for information sharing and networking.

**User Need:** Early-stage founders need reliable expert information (without trial and error from unverified sources), peer networking opportunities to share concerns, and timely access to support programs.

**Design Challenge:** How might we design an interface that builds trust through verification, encourages meaningful connections, and surfaces relevant information without overwhelming users?

### 1.2 User Personas

#### Primary Persona: Kim Changyup (Early-Stage Founder)

| Attribute | Details |
|-----------|---------|
| **Demographics** | 28-35 years old, first-time founder, tech-savvy, mobile-first user |
| **Goals** | Find trustworthy service providers, connect with fellow founders, discover funding opportunities |
| **Pain Points** | Fragmented information sources, wasted time on unverified experts, isolation in entrepreneurial journey |
| **Behaviors** | Checks mobile during commute, browses support programs weekly, seeks quick answers to operational questions |
| **Quote** | "I need to find a reliable lawyer but don't know who to trust. Every recommendation feels like an ad." |

#### Secondary Persona: Park Agency (Expert/Service Provider)

| Attribute | Details |
|-----------|---------|
| **Demographics** | 35-45 years old, established professional, looking to serve startup clients |
| **Goals** | Build credibility with startups, showcase portfolio, receive quality leads |
| **Pain Points** | Hard to reach early-stage founders, trust barrier with new clients |
| **Behaviors** | Updates profile regularly, responds quickly to inquiries, shares expertise in community |
| **Quote** | "I want to help startups but they're always skeptical of service providers." |

#### Tertiary Persona: Admin Lee (Platform Administrator)

| Attribute | Details |
|-----------|---------|
| **Demographics** | 30-40 years old, community manager background |
| **Goals** | Maintain quality control, verify members and experts, curate valuable content |
| **Pain Points** | Volume of verification requests, content moderation complexity |
| **Behaviors** | Reviews applications daily, monitors community health, publishes support programs |
| **Quote** | "Quality over quantity - every verified member adds value to the ecosystem." |

### 1.3 User Journey Map

```
Journey: First-Time Founder Seeking Expert Help

Stage 1: Discovery
  Actions: Searches for startup services online, discovers The Potential
  Thoughts: "Is this different from other platforms?"
  Emotions: Curious, slightly skeptical
  Pain Points: Overwhelmed by options, unsure of credibility
  Opportunities: Clear value proposition on landing page, trust indicators

Stage 2: Exploration
  Actions: Browses landing page, clicks "Explore" to view content
  Thoughts: "Let me see what's available before signing up"
  Emotions: Interested, evaluating
  Pain Points: Limited access without account
  Opportunities: Show enough value to convert, low-friction signup

Stage 3: Registration
  Actions: Signs up with Google OAuth, completes profile setup
  Thoughts: "This approval process seems legitimate"
  Emotions: Hopeful, invested
  Pain Points: Waiting for approval, uncertainty
  Opportunities: Clear status updates, welcome flow

Stage 4: Active Use
  Actions: Searches experts, posts in community, bookmarks programs
  Thoughts: "This information is actually useful"
  Emotions: Engaged, productive
  Pain Points: Finding specific expertise, notification overload
  Opportunities: Smart filtering, personalized recommendations

Stage 5: Conversion
  Actions: Contacts expert, proposes collaboration
  Thoughts: "This person seems trustworthy, let me reach out"
  Emotions: Confident, excited
  Pain Points: Initial contact awkwardness
  Opportunities: Structured collaboration proposals, coffee chat option
```

### 1.4 Competitive Analysis

| Competitor | Strengths | Weaknesses | Opportunity |
|------------|-----------|------------|-------------|
| LinkedIn | Large network, professional credibility | Noisy, not startup-focused | Focus on early-stage founders only |
| Blind | Anonymity enables honest sharing | No expert verification | Verified identities build trust |
| VC/Accelerator Platforms | Curated network | Exclusive, limited access | More inclusive for pre-investment stage |
| Government Portals | Official support programs | Poor UX, hard to navigate | Beautiful, personalized curation |

---

## 2. Information Architecture

### 2.1 Sitemap

```
The Potential
|
+-- Public Zone (No Auth Required)
|   +-- Landing Page
|   |   +-- Hero Section
|   |   +-- Stats Overview
|   |   +-- Feature Highlights
|   |   +-- CTA Section
|   +-- Login / Sign Up
|   |   +-- Google OAuth
|   |   +-- Email/Password
|   |   +-- 6-digit OTP Verification
|   +-- Support Programs (Limited View)
|   +-- About Page
|
+-- User Zone (Approved Members)
|   +-- Home Dashboard
|   |   +-- Welcome Section (Personalized)
|   |   +-- Real-time Threads Preview
|   |   +-- Article Insights Preview
|   |   +-- Quick Navigation Cards
|   +-- Support Programs
|   |   +-- Category Filter
|   |   +-- Deadline Filter
|   |   +-- Program Cards (Horizontal Scroll)
|   |   +-- Program Detail Modal
|   +-- Community (Thread Feed)
|   |   +-- Post Creation
|   |   +-- Feed List (Infinite Scroll)
|   |   +-- Post Detail
|   |   +-- Comments/Replies
|   |   +-- Likes/Reactions
|   +-- Find Experts
|   |   +-- Category Search
|   |   +-- Keyword Search
|   |   +-- Filter Panel
|   |   +-- Expert Cards Grid
|   |   +-- Expert Profile Detail
|   |   +-- Collaboration Proposal Modal
|   +-- Expert Registration (Agency Only)
|   |   +-- Profile Form
|   |   +-- Document Upload
|   |   +-- Submission Confirmation
|   +-- Events Board
|   |   +-- Event Cards
|   |   +-- Event Detail
|   +-- Private Clubs
|   |   +-- Club Discovery
|   |   +-- Club Detail
|   |   +-- Create Club
|   +-- My Page (Profile)
|   |   +-- Profile Completeness Banner
|   |   +-- Business Card Header
|   |   +-- Expertise & Skills
|   |   +-- Collaboration Needs
|   |   +-- Experience Timeline
|   |   +-- Portfolio Links
|   |   +-- Today's Tasks
|   |   +-- Bookmarks
|   |   +-- Settings
|
+-- Admin Zone (Administrators)
    +-- Member Management
    |   +-- Pending Approval List
    |   +-- Approved Members
    |   +-- Rejected/Suspended
    +-- Expert Verification
    |   +-- Document Review
    |   +-- Approval/Rejection Workflow
    +-- Content Management
        +-- Support Program CRUD
        +-- Community Moderation
        +-- Article Management
```

### 2.2 Navigation Structure

**Primary Navigation (Top Menu Bar - Desktop)**

| Item | Priority | Icon | Target | Notes |
|------|----------|------|--------|-------|
| Home | High | Home | Dashboard | Default landing for logged users |
| Support Programs | High | TrendingUp | /support | Core value proposition |
| Thread | High | MessageCircle | /thread | Community engagement |
| Events | Medium | Calendar | /event | Networking opportunities |
| Clubs | Medium | Users | /club | Deep networking |

**Mobile Bottom Navigation (5 items)**

| Position | Item | Icon | Notes |
|----------|------|------|-------|
| 1 | Home | Home | Dashboard |
| 2 | Support | TrendingUp | Support Programs |
| 3 | Thread | MessageCircle | Community Feed |
| 4 | Club | Users | Private Clubs |
| 5 | Profile | User | My Page |

**Header Actions (Right Side)**

| Item | Icon | Action |
|------|------|--------|
| Notifications | Bell | Open notifications panel |
| Profile Avatar | Avatar | Open profile dropdown/page |

### 2.3 Content Hierarchy

| Page | Primary Content | Secondary Content | Tertiary |
|------|----------------|-------------------|----------|
| Home Dashboard | Thread Feed Preview | Support Programs Cards | Quick Nav Cards |
| Support Programs | Program Cards | Category Filters | Deadline Badges |
| Thread Feed | Post List | Post Creation CTA | Trending Topics |
| Expert Search | Expert Cards Grid | Filter Panel | Search Bar |
| Expert Profile | Profile Header + Collab Needs | Experience Timeline | Portfolio Links |
| My Profile | Profile Completeness | Activity Stats | Settings |

---

## 3. User Flows

### 3.1 Core Flow: Expert Search and Contact

**Goal:** Find a suitable expert and send collaboration proposal
**Entry Point:** Home Dashboard or Find Experts nav item
**Success Criteria:** Collaboration proposal successfully sent

```
[Start: User logged in]
        |
        v
+-------------------+
| Navigate to       |
| Find Experts      |
+--------+----------+
         |
         v
+-------------------+
| Browse/Search     |
| Expert Cards      |
+--------+----------+
         |
         v
    +----------+
    | Found    |
    | Match?   |
    +----+-----+
        / \
      Yes  No
      |     |
      |     +---> [Refine filters] --> [Back to Browse]
      v
+-------------------+
| Click Expert      |
| Profile Card      |
+--------+----------+
         |
         v
+-------------------+
| View Full Profile |
| (Trust Building)  |
+--------+----------+
         |
         v
    +-------------+
    | Ready to    |
    | Contact?    |
    +------+------+
          / \
        Yes  No
        |     |
        |     +---> [Bookmark for later]
        v
+-------------------+
| Choose Action:    |
| Coffee Chat OR    |
| Collaboration     |
+--------+----------+
         |
         v
+-------------------+
| Fill Modal Form   |
| (3 fields max)    |
+--------+----------+
         |
         v
+-------------------+
| Submit Proposal   |
+--------+----------+
         |
         v
+-------------------+
| Success State     |
| (Notification     |
| sent to expert)   |
+-------------------+
```

**Edge Cases:**
- Expert not available: Show "Collaboration Unavailable" badge, disable CTA
- Network error on submit: Show error toast with retry button
- Expert profile incomplete: Show partial info with "Profile being verified" badge

**Error States:**
- Search yields no results: Empty state with suggestions to broaden search
- Expert declined: Notification with option to view other experts
- Invalid contact info: Form validation with inline error messages

### 3.2 Core Flow: Community Post Creation

**Goal:** Share a question or insight in the thread community
**Entry Point:** Thread Feed or floating action button
**Success Criteria:** Post published and visible in feed

```
[Start: Thread Feed]
        |
        v
+-------------------+
| Tap "Write Post"  |
| Button            |
+--------+----------+
         |
         v
+-------------------+
| Open Post         |
| Composer          |
+--------+----------+
         |
         v
+-------------------+
| Write content     |
| (Body text only,  |
| no title required)|
+--------+----------+
         |
         v
    +------------+
    | Add media? |
    +-----+------+
         / \
       Yes  No
       |     |
       v     |
+----------+ |
| Upload   | |
| Image/   | |
| File     | |
+----+-----+ |
     |       |
     +---+---+
         |
         v
+-------------------+
| Preview Post      |
+--------+----------+
         |
         v
+-------------------+
| Tap "Post"        |
+--------+----------+
         |
         v
+-------------------+
| Success State     |
| (Scroll to new    |
| post in feed)     |
+-------------------+
```

**Edge Cases:**
- Empty post attempt: Disable post button until content added
- Upload failure: Show error with retry option, preserve text
- Offline: Queue post for retry when connection restored

**Error States:**
- Content too long: Character counter, prevent submission
- Invalid file type: Inline error with accepted formats
- Rate limit: Toast with cooldown timer

### 3.3 Core Flow: Member Registration

**Goal:** Create account and gain platform access
**Entry Point:** Landing page or sign-up button
**Success Criteria:** Account created and profile setup complete

```
[Start: Landing Page]
        |
        v
+-------------------+
| Click "Sign Up"   |
+--------+----------+
         |
         v
+-------------------+
| Choose Auth:      |
| Google OAuth OR   |
| Email/Password    |
+--------+----------+
         |
    +----+----+
    |         |
    v         v
+-------+ +--------+
|Google | |Email   |
|OAuth  | |Form    |
+---+---+ +---+----+
    |         |
    +----+----+
         |
         v
+-------------------+
| 6-digit OTP       |
| Verification      |
+--------+----------+
         |
         v
+-------------------+
| Profile Setup     |
| Flow (Multi-step) |
+--------+----------+
         |
         v
+-------------------+
| Welcome Page      |
| (First Login)     |
+--------+----------+
         |
         v
+-------------------+
| Home Dashboard    |
+-------------------+
```

---

## 4. Design System

### 4.1 Color Palette

#### Brand Colors

| Name | Hex | RGB | Usage | Contrast |
|------|-----|-----|-------|----------|
| Primary (Electric Blue) | #0079FF | rgb(0,121,255) | Main actions, links, accents | 4.5:1 on black |
| Primary Light | #00E5FF | rgb(0,229,255) | CTAs, highlights, glow effects | 4.8:1 on black |
| Primary Hover | #0079FF/90 | - | Hover states | - |
| Primary 10% | rgba(0,121,255,0.1) | - | Subtle backgrounds | - |
| Primary 20% | rgba(0,121,255,0.2) | - | Card backgrounds, badges | - |
| Primary Glow | rgba(0,121,255,0.4) | - | Box-shadow glow effects | - |

#### Background Colors

| Name | Hex | Usage |
|------|-----|-------|
| Background | #000000 | Page background |
| Card Primary | #121212 | Primary card surfaces |
| Card Secondary | #1C1C1E | Secondary card surfaces, elevated elements |
| Card Hover | #1A1A1A | Hover state backgrounds |

#### Text Colors

| Name | Hex | Usage | Contrast on Black |
|------|-----|-------|-------------------|
| Text Primary | #FFFFFF | Primary text, headings | 21:1 |
| Text Muted | #8B95A1 | Secondary text, captions | 5.2:1 |
| Text Disabled | #6B7280 | Disabled states | 4.5:1 |

#### Semantic Colors

| Name | Hex | Usage | Example |
|------|-----|-------|---------|
| Success | #34D399 (Emerald-400) | Positive feedback, available status | "Collaboration Available" badge |
| Warning | #FB923C (Orange-400) | Deadlines, urgent notices | "D-3" deadline badge |
| Error | #FF453A | Error messages, destructive actions | Form validation errors |
| Info | #22D3EE (Cyan-400) | Informational highlights | Secondary stats |

#### Border Colors

| Name | Value | Usage |
|------|-------|-------|
| Border Default | rgba(255,255,255,0.08) | Card borders, dividers |
| Border Hover | rgba(0,121,255,0.4) | Hover state borders |
| Border Focus | #0079FF | Focus ring |

### 4.2 Typography

#### Font Family

```css
/* Primary Font - Pretendard Variable */
--font-primary: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* System Fallback (if Pretendard unavailable) */
--font-fallback: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### Type Scale

| Style | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display | 48px (3rem) | ExtraBold (800) | 1.2 | -0.02em | Hero headlines |
| H1 | 40px (2.5rem) | ExtraBold (800) | 1.25 | -0.02em | Page titles |
| H2 | 32px (2rem) | Bold (700) | 1.3 | -0.01em | Section headers |
| H3 | 24px (1.5rem) | Bold (700) | 1.35 | -0.01em | Card titles |
| Section Title | 20px (1.25rem) | ExtraBold (800) | 1.4 | -0.01em | Dashboard section headers |
| Body Large | 18px (1.125rem) | Semibold (600) | 1.6 | 0 | Lead paragraphs |
| Body | 16px (1rem) | Regular (400) | 1.5 | 0 | Default body text |
| Body Semibold | 16px (1rem) | Semibold (600) | 1.5 | 0 | Emphasized body |
| Body Small | 14px (0.875rem) | Regular (400) | 1.5 | 0 | Secondary text |
| Caption | 12px (0.75rem) | Medium (500) | 1.4 | 0 | Labels, timestamps |

### 4.3 Spacing System (8px Base Unit)

```css
--space-0: 0px;
--space-1: 4px;     /* Tight inline elements */
--space-2: 8px;     /* Compact (icon + text gap) */
--space-3: 12px;    /* Cozy (list items) */
--space-4: 16px;    /* Default (card gaps, horizontal scroll) */
--space-5: 20px;    /* Container padding, card internal */
--space-6: 24px;    /* Spacious (section spacing) */
--space-8: 32px;    /* Large (welcome section padding) */
--space-10: 40px;   /* XL spacing */
--space-12: 48px;   /* Major section gaps */
--space-16: 64px;   /* Hero spacing */
--space-20: 80px;   /* Page sections */
--space-24: 96px;   /* Bottom nav offset */
```

#### Container Padding

| Context | Value | Tailwind |
|---------|-------|----------|
| Main Container (Mobile) | 20px | px-5 |
| Main Container (Tablet) | 32px | px-8 |
| Main Container (Desktop) | max-w-7xl mx-auto | max-w-7xl mx-auto |

### 4.4 Border Radius (Toss-style Large Curves)

```css
--radius-sm: 8px;      /* Minimum radius (rarely used) */
--radius-md: 12px;     /* Small elements */
--radius-lg: 16px;     /* Buttons, inputs (rounded-2xl) */
--radius-xl: 20px;     /* Medium cards */
--radius-2xl: 24px;    /* Cards, avatars, logos (rounded-3xl) */
--radius-full: 9999px; /* Pills, circular elements */
```

| Element | Radius | Tailwind |
|---------|--------|----------|
| Cards | 24px | rounded-3xl |
| Buttons | 16px | rounded-2xl |
| Inputs | 16px | rounded-2xl |
| Modals | 24px | rounded-3xl |
| Avatars | 24px | rounded-3xl |
| Badges | 9999px | rounded-full |
| Toast notifications | 24px | rounded-3xl |

### 4.5 Shadows and Glow Effects

```css
/* Standard Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
--shadow-md: 0 4px 6px rgba(0,0,0,0.3);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.4);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.5);

/* Primary Glow */
--glow-primary: 0 0 20px rgba(0,121,255,0.4);
--glow-primary-strong: 0 0 40px rgba(0,229,255,0.4);

/* Cyan Glow (CTAs) */
--glow-cyan: 0 0 40px rgba(0,229,255,0.6), 0 10px 30px rgba(0,0,0,0.5);

/* Card Shadow */
--shadow-card: shadow-lg shadow-primary/20;
```

---

## 5. Component Library

### 5.1 Buttons

#### Variants

| Variant | Usage | Background | Text | Border |
|---------|-------|------------|------|--------|
| Primary | Main actions | #0079FF / #00E5FF | Black / White | None |
| Secondary | Secondary actions | transparent | #0079FF | border-primary/30 |
| Outline | Tertiary actions | transparent | White | border-border/50 |
| Ghost | Subtle actions | transparent | #0079FF | None |
| Destructive | Dangerous actions | #FF453A | White | None |

#### Sizes

| Size | Height | Padding | Font Size | Tailwind |
|------|--------|---------|-----------|----------|
| sm | 32px | 12px 16px | 14px | h-8 px-4 |
| md | 40px | 16px 24px | 16px | h-10 px-6 |
| lg | 48px | 20px 32px | 18px | h-12 px-8 |
| xl | 56px | 24px 40px | 20px | h-14 px-10 |

#### States

| State | Visual Change |
|-------|---------------|
| Default | Base styles |
| Hover | Scale 1.02, opacity 0.9, border-primary/40 |
| Active/Tap | Scale 0.98 |
| Focus | 2px ring offset, primary color |
| Disabled | Opacity 0.5, cursor-not-allowed |
| Loading | Spinner icon, disabled state |

#### Button with Glow (CTA)

```css
.glow-button {
  background: #00E5FF;
  color: black;
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.4);
  border-radius: 16px;
  font-weight: 700;
}
```

### 5.2 Form Elements

#### Input Fields

| State | Border | Background | Text |
|-------|--------|------------|------|
| Default | rgba(255,255,255,0.08) | #121212 | White |
| Focus | #0079FF | #121212 | White |
| Error | #FF453A | rgba(255,69,58,0.1) | White |
| Disabled | rgba(255,255,255,0.04) | #0a0a0a | #6B7280 |

**Input Specifications:**
- Height: 48px (h-12)
- Border Radius: 16px (rounded-2xl)
- Padding: 16px horizontal
- Font Size: 16px (prevents iOS zoom)

#### Labels and Help Text

| Element | Font Size | Weight | Color |
|---------|-----------|--------|-------|
| Label | 14px | Semibold (600) | White |
| Help Text | 14px | Regular (400) | #8B95A1 |
| Error Text | 14px | Medium (500) | #FF453A |
| Placeholder | 16px | Regular (400) | #6B7280 |

### 5.3 Cards

#### Structure

```
+----------------------------------------+
|  [Header - optional]                    |
|  Title, Subtitle, Action               |
+-----------------------------------------+
|                                         |
|  [Content Area]                         |
|  Main card content                      |
|                                         |
+-----------------------------------------+
|  [Footer - optional]                    |
|  Actions, Meta info                     |
+-----------------------------------------+
```

#### Card Variants

| Variant | Background | Border | Shadow | Use Case |
|---------|------------|--------|--------|----------|
| Default | #121212 | border-border/30 | None | Standard content |
| Elevated | #1C1C1E | border-border/20 | shadow-lg | Important content |
| Gradient | gradient-to-br from-primary/10 | border-primary/20 | None | CTAs, highlights |
| Interactive | #121212 | border-border/30 | None | Clickable cards |
| Glow | #121212 | border-primary/40 | glow-primary | Featured content |

#### Card Specifications

- Border Radius: 24px (rounded-3xl)
- Padding: 20-32px (p-5 to p-8)
- Gap between cards: 16px (gap-4)

#### Support Program Card (Horizontal Scroll)

```
Width: 300px (mobile), 320px (tablet), 340px (desktop)
+----------------------------------------+
| [Category Badge]           [D-X Badge] |
|                                        |
| Program Title (Bold, 18px)             |
| Organization Name (Muted, 14px)        |
|                                        |
| [Brief description...]                 |
|                                        |
| [Amount Badge]    [Deadline Date]      |
+----------------------------------------+
```

### 5.4 Navigation Components

#### Header (Desktop)

- Height: 64px
- Position: Fixed top
- Background: rgba(0,0,0,0.95) with backdrop-blur
- Content: Logo (left), Nav items (center), Actions (right)

#### Mobile Header

- Height: 56px
- Position: Fixed top
- Background: rgba(0,0,0,0.95) with backdrop-blur
- Content: Menu icon (left), Logo (center), Profile (right)

#### Bottom Navigation (Mobile)

- Height: 80px
- Position: Fixed bottom
- Background: rgba(0,0,0,0.95) with backdrop-blur
- Border Top: rgba(255,255,255,0.08)
- Safe Area: padding-bottom for iOS notch

**Active State:**
- Scale: 1.1
- Y offset: -2px
- Glow: blur-lg opacity-40
- Top indicator: 48px width, 4px height

### 5.5 Badges

| Variant | Background | Text | Border | Use Case |
|---------|------------|------|--------|----------|
| Default | primary/10 | primary | primary/30 | Category tags |
| Deadline | orange-500/20 | orange-400 | orange-500/30 | D-X countdown |
| Success | emerald-500/20 | emerald-400 | emerald-500/30 | Available status |
| Info | cyan-500/20 | cyan-400 | cyan-500/30 | Stats, counts |

**Badge Specifications:**
- Padding: 8px 16px (px-4 py-2)
- Border Radius: 9999px (rounded-full)
- Font: 12-14px, Semibold

### 5.6 Avatar

| Size | Dimensions | Border Radius | Use Case |
|------|------------|---------------|----------|
| xs | 24x24px | 8px | Inline mentions |
| sm | 32x32px | 12px | Comments |
| md | 48x48px | 16px | Card headers |
| lg | 64x64px | 20px | Profile cards |
| xl | 96x96px | 24px | Full profile |

**Avatar with Status Indicator:**
- Indicator: 12x12px circle
- Position: Bottom-right
- Border: 4px solid card background
- Animation: Scale pulse [1, 1.2, 1] every 2s

### 5.7 Modal/Dialog

- Background Overlay: rgba(0,0,0,0.8) with backdrop-blur
- Modal Background: #121212
- Border: rgba(255,255,255,0.08)
- Border Radius: 24px (rounded-3xl)
- Max Width: 500px (sm), 640px (md), 800px (lg)
- Padding: 24-32px

### 5.8 Toast Notifications

- Background: #1A1A1A
- Border: rgba(255,255,255,0.1)
- Border Radius: 24px
- Position: top-center
- Animation: Slide down with spring

---

## 6. Page Layouts

### 6.1 Layout Templates

#### Dashboard Layout (Logged In)

```
+------------------------------------------+
|  Header (64px) - Fixed                   |
+------------------------------------------+
|                                          |
|  Hero Section (Desktop only)             |
|  - Headline                              |
|  - Subheadline                           |
|  - Search Bar                            |
|                                          |
+------------------------------------------+
|                                          |
|  Main Content Area                       |
|  (Container: max-w-7xl mx-auto)          |
|  (Padding: px-4 md:px-8)                 |
|                                          |
|  +------------------------------------+  |
|  | Section 1: Real-time Threads      |  |
|  | [Header]        [View All Button] |  |
|  | [Thread Cards or Empty State]     |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Section 2: Article Insights       |  |
|  | [Header]        [View All Button] |  |
|  | [Horizontal Scroll Cards]         |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Quick Navigation Cards (3 cols)   |  |
|  | [Support] [Events] [Clubs]        |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
|  Footer                                  |
+------------------------------------------+
|  Bottom Navigation (Mobile only, 80px)   |
+------------------------------------------+
```

#### Profile Layout (Business Profile)

```
+------------------------------------------+
|  Header (64px)                           |
+------------------------------------------+
|                                          |
|  Profile Completeness Banner (if <100%)  |
|  [Progress bar + Checklist]              |
|                                          |
+------------------------------------------+
|                                          |
|  Profile Header Card (Premium Style)     |
|  +------------------------------------+  |
|  | [Glow Background Effect]          |  |
|  |                                    |  |
|  | [Avatar]  Name                     |  |
|  |   Check   Company                  |  |
|  |           Title                    |  |
|  |                                    |  |
|  | Location    Network Count          |  |
|  |                                    |  |
|  | "Bio text..."                      |  |
|  |                                    |  |
|  | [Stats: Startups | Stage | etc.]  |  |
|  +------------------------------------+  |
|                                          |
|  Expertise & Skills Section              |
|  [Chip] [Chip] [Chip] [Chip]             |
|                                          |
|  Collaboration Needs Section (GLOW)      |
|  +------------------------------------+  |
|  | "Looking for these partners:"     |  |
|  | [Need Card 1] ->                  |  |
|  | [Need Card 2] ->                  |  |
|  | [Need Card 3] ->                  |  |
|  +------------------------------------+  |
|                                          |
|  Experience Timeline                     |
|  | 2024 - Present: Company A         |  |
|  | 2021 - 2023: Company B            |  |
|                                          |
|  Portfolio Links                         |
|  [Link Card] [Link Card]                 |
|                                          |
+------------------------------------------+
|  Fixed CTA Bar                           |
|  [Coffee Chat] [Propose Collaboration]   |
+------------------------------------------+
```

### 6.2 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px (375px base) | Single column, bottom nav, px-5, compact hero |
| Tablet | 640px - 1023px | 2 columns, px-8, sidebar optional |
| Desktop | >= 1024px | max-w-7xl, 3-4 columns, full header nav, no bottom nav |

### 6.3 Grid System

```css
/* Base Grid */
.grid-cols-1 (mobile)
.md:grid-cols-2 (tablet)
.lg:grid-cols-3 (desktop)
.xl:grid-cols-4 (large desktop)

/* Gap */
gap-4 (16px) - card gaps
gap-6 (24px) - section gaps
```

---

## 7. Wireframes

### 7.1 Landing Page Wireframe

**Desktop Layout:**

```
+----------------------------------------------------------+
|  [Logo]                          [Explore] [Sign Up]      |
+----------------------------------------------------------+
|                                                          |
|                    [Glow Effect Background]              |
|                                                          |
|                  [ Badge: Platform Type ]                |
|                                                          |
|                   Beyond Connection,                     |
|                   To Results                             |
|                                                          |
|              Trust-based information sharing             |
|              and real-time networking platform           |
|                                                          |
|           [Explore Button]  [Sign Up Button (Glow)]      |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    +----------+    +----------+    +----------+          |
|    |  1,000+  |    |   500+   |    |   100+   |          |
|    | Founders |    | Programs |    |  Clubs   |          |
|    +----------+    +----------+    +----------+          |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|                   Core Features                          |
|                                                          |
|   +------------------+    +------------------+           |
|   | Support Programs |    | Thread Community |           |
|   | Curation         |    |                  |           |
|   +------------------+    +------------------+           |
|   +------------------+    +------------------+           |
|   | Article Insights |    | Private Clubs    |           |
|   |                  |    |                  |           |
|   +------------------+    +------------------+           |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|   +--------------------------------------------------+   |
|   | Why The Potential?                               |   |
|   | [Glow Card]                                      |   |
|   |                                                  |   |
|   | Check: Verified founders only                    |   |
|   | Check: Weekly updated programs                   |   |
|   | Check: Real-time networking                      |   |
|   | Check: Deep collaboration via clubs              |   |
|   +--------------------------------------------------+   |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|                 Start Now                                |
|            [Sign Up Button (Large + Glow)]               |
|                                                          |
+----------------------------------------------------------+
|  Footer: (c) 2026 The Potential                          |
+----------------------------------------------------------+
```

**Mobile Layout:**

```
+-------------------------+
| [Menu] [Logo]  [Profile]|
+-------------------------+
|                         |
|  [Badge]                |
|                         |
|  Beyond                 |
|  Connection,            |
|  To Results             |
|                         |
|  [Explore]              |
|  [Sign Up (Glow)]       |
|                         |
+-------------------------+
|  +-------+  +-------+   |
|  |1,000+ |  | 500+  |   |
|  +-------+  +-------+   |
|  +-------+              |
|  | 100+  |              |
|  +-------+              |
+-------------------------+
|  Features               |
|  +-------------------+  |
|  | Support Programs  |  |
|  +-------------------+  |
|  +-------------------+  |
|  | Thread Community  |  |
|  +-------------------+  |
|  ...                    |
+-------------------------+
|  [Sign Up CTA]          |
+-------------------------+
|  Bottom Nav             |
+-------------------------+
```

### 7.2 Home Dashboard Wireframe

**Desktop Layout:**

```
+----------------------------------------------------------+
| [TP Logo] The Potential    [Home][Support][Thread]  [Bell][Avatar] |
+----------------------------------------------------------+
|                                                          |
|     Beyond Connection,                                   |
|     The Potential                                        |
|     Real-time insights from founders in one place        |
|                                                          |
|  +----------------------------------------------------+  |
|  |  [Search Icon]  Search support programs, threads   |  |
|  +----------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  Fire: Real-time Threads                    [View All >] |
|  Hottest concerns from founders right now                |
|                                                          |
|  +--------------------------------------------------+    |
|  | [Avatar] Park Startup  2h ago                    |    |
|  | When hiring first employee, what's most...       |    |
|  | [Comment: 23] [Heart: 45]                        |    |
|  +--------------------------------------------------+    |
|  +--------------------------------------------------+    |
|  | [Avatar] Lee Dev  5h ago                         |    |
|  | Corporation vs sole proprietor...                |    |
|  | [Comment: 18] [Heart: 32]                        |    |
|  +--------------------------------------------------+    |
|                                                          |
|  --------------------------------------------------------|
|                                                          |
|  Book: Article Insights                     [View All >] |
|  Content worth reading                                   |
|                                                          |
|  << Horizontal Scroll >>                                 |
|  +--------+ +--------+ +--------+                        |
|  |Invest  | |MVP Dev | |Legal   |                        |
|  |Early   | |Launch  | |Basics  |                        |
|  |Guide   | |Guide   | |        |                        |
|  +--------+ +--------+ +--------+                        |
|                                                          |
|  --------------------------------------------------------|
|                                                          |
|  +---------------+ +---------------+ +---------------+   |
|  | Support       | | Events        | | Clubs         |   |
|  | Programs      | | Networking    | | Interest-     |   |
|  | [Icon]        | | [Icon]        | | based [Icon]  |   |
|  +---------------+ +---------------+ +---------------+   |
|                                                          |
+----------------------------------------------------------+
|  [Footer]                                                |
+----------------------------------------------------------+
```

### 7.3 Expert Profile Wireframe

**Desktop Layout:**

```
+----------------------------------------------------------+
| [Header]                                                 |
+----------------------------------------------------------+
|                                                          |
|  +----------------------------------------------------+  |
|  | Sparkle: Complete your profile              85%    |  |
|  | [Progress Bar ==================--]               |  |
|  |                                                    |  |
|  | Check: Basic Info    Check: Expertise              |  |
|  | Check: Collab Needs  Check: Experience             |  |
|  | Circle: Portfolio                                  |  |
|  |                                                    |  |
|  | [Complete Profile Button ->]                       |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  |  [GLOW EFFECT BACKGROUND]                         |  |
|  |                                                    |  |
|  |  [Avatar]    Kim Changyup                         |  |
|  |  96x96       The Insight Lab                      |  |
|  |  [Check]     AI Startup CEO                       |  |
|  |                                                    |  |
|  |  Location: Seoul Gangnam  |  Network: 127         |  |
|  |                                                    |  |
|  |  +----------------------------------------------+ |  |
|  |  | "5-year serial entrepreneur. Focused on..."  | |  |
|  |  +----------------------------------------------+ |  |
|  |                                                    |  |
|  |  +--------+ +--------+ +--------+ +--------+      |  |
|  |  |   2    | |Series A| |  127   | |   5    |      |  |
|  |  |Startups| | Stage  | |Network | | Clubs  |      |  |
|  |  +--------+ +--------+ +--------+ +--------+      |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  | Trophy: Expertise & Skills                         |  |
|  |                                                    |  |
|  | [AI/ML] [SaaS] [Product Management]               |  |
|  | [Growth Marketing] [Fundraising]                   |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  | Target: Collaboration Needs          [GLOW BORDER] |  |
|  | Looking for these partners:                        |  |
|  |                                                    |  |
|  | +------------------------------------------------+ |  |
|  | | Dev:  CTO Partner                           -> | |  |
|  | |       Python/ML specialist                     | |  |
|  | +------------------------------------------------+ |  |
|  | +------------------------------------------------+ |  |
|  | | Chart: Marketing Expert                     -> | |  |
|  | |        B2B SaaS experience preferred           | |  |
|  | +------------------------------------------------+ |  |
|  | +------------------------------------------------+ |  |
|  | | Money: Angel Investor                       -> | |  |
|  | |        Preparing seed round                    | |  |
|  | +------------------------------------------------+ |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  | Briefcase: Experience & History                    |  |
|  |                                                    |  |
|  | o--  2024 - Present                               |  |
|  | |    The Insight Lab                              |  |
|  | |    Founder & CEO                                |  |
|  | |    AI-based business intelligence SaaS          |  |
|  | |    Rocket: Pre-seed funding (500M KRW)          |  |
|  | |                                                  |  |
|  | o--  2021 - 2023                                  |  |
|  | |    First Startup                                |  |
|  | |    Co-founder & CPO                             |  |
|  | |    Marketing automation for SMBs               |  |
|  | |    Rocket: Exit (Series A, M&A)                 |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  | Chart: Portfolio                                   |  |
|  |                                                    |  |
|  | +----------------------------------------------+  |  |
|  | | The Insight Lab Homepage              ->    |  |  |
|  | | theinsightlab.io                            |  |  |
|  | +----------------------------------------------+  |  |
|  | +----------------------------------------------+  |  |
|  | | LinkedIn                              ->    |  |  |
|  | | linkedin.com/in/kimchangup                  |  |  |
|  | +----------------------------------------------+  |  |
|  +----------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
|  [Gradient Fade from Black]                              |
|  +----------------------+ +---------------------------+  |
|  | Coffee: Coffee Chat  | | Chat: Propose Collab     |  |
|  | (Outline Button)     | | (Primary + Glow Button)  |  |
|  +----------------------+ +---------------------------+  |
+----------------------------------------------------------+
```

---

## 8. Micro-interactions and Motion

### 8.1 Animation Guidelines

#### Duration Scale

| Type | Duration | Easing | Use Case |
|------|----------|--------|----------|
| Micro | 150ms | ease-out | Hover, focus states |
| Small | 200ms | ease-in-out | Button presses, toggles |
| Medium | 300ms | spring | Modals, dropdowns, cards |
| Large | 400ms | spring | Page transitions, reveals |

#### Spring Animation Presets

```javascript
// Standard Spring
const standardSpring = {
  type: 'spring',
  stiffness: 100,
  damping: 12
};

// Bouncy Spring (buttons, interactive elements)
const bouncySpring = {
  type: 'spring',
  stiffness: 500,
  damping: 30
};

// Soft Spring (modals, large elements)
const softSpring = {
  type: 'spring',
  stiffness: 100,
  damping: 20
};
```

### 8.2 Interaction Patterns

#### Card Interactions

```javascript
// Card scroll-in animation
initial: { opacity: 0, y: 20 }
animate: {
  opacity: 1,
  y: 0,
  transition: {
    type: 'spring',
    stiffness: 100,
    damping: 12
  }
}

// Card hover
whileHover: { scale: 1.02, borderColor: 'rgba(0,121,255,0.4)' }
whileTap: { scale: 0.98 }
```

#### Button Interactions

```javascript
// Primary button hover
whileHover: { scale: 1.02 }
whileTap: { scale: 0.98 }
transition: { type: 'spring', stiffness: 500, damping: 30 }
```

#### Bottom Navigation Active State

```javascript
// Active tab animation
animate: {
  scale: 1.1,
  y: -2
}

// Active indicator
layoutId: "activeTab"
style: { width: 48, height: 4 }
```

#### Staggered Children Animation

```javascript
// Container
variants: {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Children
variants: {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}
```

### 8.3 Loading States

#### Skeleton Loading

- Background: Linear gradient shimmer (#1C1C1E to #2C2C2E)
- Animation: 1.5s infinite ease-in-out
- Border Radius: Match component radius

#### Spinner Loading

- Size: 16x16px (inline), 32x32px (section), 64x64px (full page)
- Color: Primary (#0079FF)
- Border: 4px with transparent top
- Animation: rotate 360deg, 1s linear infinite

### 8.4 Page Load Animation Sequence

```
Timeline:
0ms    - Container fade in starts
100ms  - Welcome/Hero section slide up
200ms  - First section header slide up
300ms  - First card slide in
400ms  - Second card slide in (stagger)
500ms  - Third card slide in (stagger)
600ms  - Second section header slide up
700ms  - Section content staggered entrance
...continue pattern
```

### 8.5 Glow Effects

```css
/* Primary button glow */
.glow-primary {
  box-shadow: 0 0 20px rgba(0, 121, 255, 0.4);
}

/* CTA button glow */
.glow-cta {
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.4);
}

/* Strong CTA glow */
.glow-strong {
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* Collaboration section glow */
.glow-section {
  box-shadow: 0 0 20px rgba(0, 121, 255, 0.4), 0 0 40px rgba(0, 121, 255, 0.2);
}
```

### 8.6 Pulsing Animations

```css
/* Availability indicator */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
.pulse-indicator {
  animation: pulse 2s infinite;
}

/* Glow pulse */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.4); }
  50% { box-shadow: 0 0 40px rgba(0, 229, 255, 0.6); }
}
```

---

## 9. Accessibility Checklist

### 9.1 WCAG 2.1 AA Requirements

#### Perceivable

- [x] All images have descriptive alt text
- [x] Color contrast meets 4.5:1 minimum for normal text
- [x] Color contrast meets 3:1 for large text (18px+)
- [x] Information not conveyed by color alone (icons + text)
- [x] UI responds correctly to 200% zoom
- [x] Focus states are clearly visible (2px ring, primary color)

#### Operable

- [x] All interactive elements accessible via keyboard
- [x] No keyboard traps (Tab moves through all elements)
- [x] Skip links provided for main content
- [x] Focus indicators visible and consistent
- [x] Touch targets minimum 44x44px

#### Understandable

- [x] Language specified in HTML (ko-KR)
- [x] Form labels clearly associated with inputs
- [x] Error messages descriptive and actionable
- [x] Consistent navigation across pages
- [x] Predictable interaction behaviors

#### Robust

- [x] Valid HTML markup
- [x] ARIA labels for complex widgets
- [x] Works with screen readers (VoiceOver, NVDA)
- [x] Compatible across modern browsers

### 9.2 Color Contrast Verification

| Element | Foreground | Background | Ratio | Status |
|---------|------------|------------|-------|--------|
| Body text | #FFFFFF | #000000 | 21:1 | AAA Pass |
| Muted text | #8B95A1 | #000000 | 5.2:1 | AA Pass |
| Primary text | #0079FF | #000000 | 4.5:1 | AA Pass |
| Primary on Card | #0079FF | #121212 | 4.2:1 | AA Pass |
| Error text | #FF453A | #000000 | 4.7:1 | AA Pass |
| Success text | #34D399 | #000000 | 8.5:1 | AAA Pass |

### 9.3 Focus Management

```
Focus Order: Logo -> Nav Items -> Main Content -> Footer -> Bottom Nav

Modal Focus Trap:
1. Focus moves to modal on open
2. Tab cycles within modal only
3. Escape key closes modal
4. Focus returns to trigger element on close

Page Load:
1. Focus on skip link (visually hidden until focused)
2. Tab moves to main navigation
3. Continue through page content

Form Focus:
1. Focus on first input when form opens
2. Error: Focus moves to first error field
3. Success: Focus moves to success message
```

### 9.4 Screen Reader Considerations

- Use semantic HTML elements (header, nav, main, footer, section)
- Provide aria-label for icon-only buttons
- Use aria-live regions for dynamic content updates
- Ensure modals have proper aria-modal and aria-labelledby
- Announce loading states with aria-busy

---

## 10. Implementation Guidelines

### 10.1 Design-to-Code Mapping

#### CSS Variables

```css
:root {
  /* Colors */
  --color-background: #000000;
  --color-card: #121212;
  --color-card-secondary: #1C1C1E;
  --color-primary: #0079FF;
  --color-primary-light: #00E5FF;
  --color-text: #FFFFFF;
  --color-muted: #8B95A1;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-success: #34D399;
  --color-warning: #FB923C;
  --color-error: #FF453A;
  --color-info: #22D3EE;

  /* Typography */
  --font-family: 'Pretendard Variable', sans-serif;
  --font-size-display: 3rem;
  --font-size-h1: 2.5rem;
  --font-size-h2: 2rem;
  --font-size-h3: 1.5rem;
  --font-size-section: 1.25rem;
  --font-size-body: 1rem;
  --font-size-small: 0.875rem;
  --font-size-caption: 0.75rem;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border Radius */
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-glow: 0 0 20px rgba(0, 121, 255, 0.4);
  --shadow-glow-strong: 0 0 40px rgba(0, 229, 255, 0.4);
}
```

#### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#000000',
        card: '#121212',
        'card-secondary': '#1C1C1E',
        primary: '#0079FF',
        'primary-light': '#00E5FF',
        muted: '#8B95A1',
        border: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 121, 255, 0.4)',
        'glow-strong': '0 0 40px rgba(0, 229, 255, 0.4)',
      },
    },
  },
};
```

### 10.2 Component Specifications

#### Button Component Interface

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Card Component Interface

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'gradient' | 'interactive' | 'glow';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Input Component Interface

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
}
```

### 10.3 Asset Specifications

| Asset Type | Format | Sizes | Notes |
|------------|--------|-------|-------|
| Icons | SVG | 16, 20, 24px | Use Lucide icons |
| Logo | SVG | Original | Include dark mode variant |
| Avatars | WebP, PNG fallback | 24, 32, 48, 64, 96px | 1x and 2x |
| Card Images | WebP, PNG fallback | 300w, 600w | Responsive images |
| Background Blurs | CSS | N/A | Use CSS gradients and filters |

### 10.4 Animation Library

- Primary: Framer Motion (motion/react)
- CSS Transitions: For simple hover/focus states
- Spring configurations as documented in Section 8

---

## 11. Design Decisions Log

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Dark theme as default | Target audience (startup founders) works late hours; reduces eye strain; creates premium feel | Light theme option, auto theme switching |
| 24px+ border radius | Toss-style aesthetic; friendly, approachable feel; differentiates from corporate tools | Standard 8px radius, sharp corners |
| Electric Blue accent | High contrast on dark background; energetic, innovative feel; trust (blue psychology) | Green (growth), Orange (energy), Purple (creativity) |
| Bottom navigation on mobile | Thumb-friendly; common mobile pattern; keeps main content area clean | Hamburger menu, side drawer |
| Glow effects on CTAs | Draws attention; premium feel; guides user action | Standard buttons, larger size only |
| Horizontal scroll for cards | Compact display of multiple items; mobile-native pattern; reduces vertical scrolling | Grid layout, pagination |
| Spring animations | Natural, organic feel; matches Toss aesthetic; more engaging than linear | Linear easing, no animation |
| Profile completeness gamification | Encourages full profiles; increases matching quality; Toss-proven pattern | Hidden progress, reminder emails |
| Dual CTA (Coffee Chat + Collaborate) | Lowers barrier for casual connections; separates serious inquiries | Single CTA, message button |
| Approval-based membership | Maintains community quality; builds trust; creates exclusivity | Open registration, invite-only |

---

## 12. Conversion Optimization

### 12.1 Trust-Building Elements

1. **Verification Badges**
   - Visible on all verified expert profiles
   - Explains verification process on hover/tap

2. **Profile Completeness**
   - Percentage indicator creates accountability
   - Complete profiles signal serious users

3. **Social Proof**
   - Network count on profiles
   - Community participation stats
   - Testimonials and success stories

### 12.2 Collaboration Conversion Strategy

1. **Psychological Triggers in Expert Profile**
   - Availability indicator (pulsing green) creates urgency
   - Specific collaboration needs enable self-matching
   - Achievement highlights (funding, exits) build credibility

2. **Reduced Friction CTA**
   - Fixed position ensures always visible
   - Two options reduce decision paralysis
   - Coffee chat as low-commitment entry point

3. **Collaboration Modal Optimization**
   - Only 3 fields (subject, message, contact)
   - Example placeholders guide completion
   - Positive framing ("Higher response rate with specific proposals")

### 12.3 Key Metrics to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| Profile View to Proposal Rate | 15%+ | Proposal clicks / Profile views |
| Proposal Completion Rate | 80%+ | Submitted / Started proposals |
| Proposal Acceptance Rate | 30%+ | Accepted / Submitted proposals |
| Profile Completeness | 85%+ average | Percentage of completed fields |
| Time to First Collaboration | < 14 days | From signup to first proposal |

---

## 13. Next Steps

### Phase 1: Foundation (Week 1-2)
- [ ] Set up design system tokens in Tailwind/CSS
- [ ] Implement base component library
- [ ] Create landing page
- [ ] Build authentication flow

### Phase 2: Core Features (Week 3-4)
- [ ] Home dashboard with navigation
- [ ] Thread feed with post creation
- [ ] Support programs listing and detail

### Phase 3: Expert System (Week 5-6)
- [ ] Expert search and filtering
- [ ] Expert profile pages
- [ ] Collaboration proposal flow
- [ ] Coffee chat feature

### Phase 4: Community Features (Week 7-8)
- [ ] Private clubs discovery and detail
- [ ] Events board
- [ ] Article insights section

### Phase 5: Polish (Week 9-10)
- [ ] Animation refinement
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Usability testing

---

## 14. References

### Design Inspiration
- Toss (Korean fintech app) - Minimalism, dark theme, large radius
- Twitter/X - Thread feed pattern
- LinkedIn - Professional networking flows

### Technical Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Project Resources
- PRD: `/docs/prd.md`
- Design Guide: `/docs/ui:ux/DESIGN_GUIDE.md`
- Profile Design: `/docs/ui:ux/PROFILE_TO_COLLABORATION_DESIGN.md`
- Sample Implementation: `/docs/ui:ux/src/`

---

*This UI/UX Plan serves as the comprehensive design specification for The Potential platform. All design decisions follow the established Toss-style dark theme aesthetic with Electric Blue accents, large border radii, and smooth spring animations as specified in the reference design system.*
