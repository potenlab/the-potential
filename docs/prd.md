# The Potential PRD

| Item | Details |
|------|---------|
| Project | The Potential |
| Scope | MVP |
| Status | Ready for Development |
| Date | 2024-05-22 |

---

## 1. Overview

### 1.1 Background and Purpose

- **Problem:** Early-stage startup founders face fragmented information, trial and error due to unverified expert information, and a lack of peer networking to share similar concerns.

- **Solution:** Provide verified professional information and closed networking among founders, connecting business opportunities through trusted expert/agency matching.

- **Target:** Early-stage startup founders (pre-investment stage) who need information sharing, networking, and business partners.

### 1.2 Core Scope (MVP Scope)

- **Find Experts:** Expert/agency matching system with complex search and verification process.
- **Thread-style Community:** Feed-style bulletin board for light communication and sharing concerns.
- **Support Program Information:** Latest startup support program announcements curated by administrators.
- **Member Management:** Administrator approval-based registration system for verifying early-stage startup founders.

### 1.3 Target Platforms

| Platform | Support Strategy |
|----------|------------------|
| PC Web | Responsive layout based on top menu bar |
| Mobile Web | Mobile environment optimization and top menu/feed UI readability |
| Native App | Out of Scope |

---

## 2. User Roles & Permissions

| Role | Definition & Permissions | Accessible Areas |
|------|--------------------------|------------------|
| Regular Member | Early-stage startup founder. Main purpose is information consumption and networking. | Home, Community (Feed), Find Experts, Support Programs, My Page |
| Expert/Agency | Service provider. Entity that registers profiles for matching. | Expert profile registration and editing page, same access as regular members |
| Administrator | Community operation and verification manager. | Dedicated admin dashboard, full page management permissions |

### Permission Levels:

- **Regular Member:** Create/edit/delete posts and comments (own), view experts, view support programs.
- **Expert/Agency:** Create/edit own profile, same permissions as regular members.
- **Administrator:** Approve/reject member registration, approve/reject expert registration, monitor and delete all content.

---

## 3. Information Architecture (IA)

```
The Potential
├── 🌐 Public Zone
│   ├── Landing Page (Service Introduction)
│   ├── Login / Join (Membership Application)
│   └── Support Programs (Partial View Available)
├── 👤 User Zone (Approved Members Only)
│   ├── Home (Latest Feed and Notice Summary)
│   ├── Community (Thread-style Feed)
│   ├── Find Experts (Complex Search and Detailed Profiles)
│   ├── Expert Registration (Agency-only Application Form)
│   └── My Page (My Activity and Profile Management)
└── 🛡 Admin Zone
    ├── Member Management (Pending Approval List)
    ├── Expert Verification (Document Review and Approval Management)
    └── Content Management (Support Program Upload and Community Moderation)
```

### Navigation Pattern:

- Top Menu Bar (Global Navigation Bar)
- Main Menu: Home, Community, Find Experts, Support Programs, My Page

### Key User Journeys:

1. Visit Home → Check Support Programs → Move to Community (Feed) to share related information and write posts
2. Visit Home → Find Experts → Category/Filter Search → View Expert Detailed Profile and Contact

---

## 4. Detailed Feature Specifications

### 4.1 Find Experts and Matching

| Feature | Detailed Logic and Requirements | Notes |
|---------|--------------------------------|-------|
| Expert Complex Search | • Support search combining categories (marketing, development, etc.), keywords, and filters (price range, region)<br>• Search results sorted by newest or admin recommendation<br>• States: Loading (skeleton UI), Error (alert message), Empty (no search results message)<br>• Priority: P1 | [TBD] Search engine selection needed |
| Expert Profile Registration | • Expert directly inputs name, specialty, portfolio (link/file)<br>• Required info: Company name, specialty, business registration number, supporting documents<br>• Status changes to 'Pending Approval' upon submission and admin notification sent<br>• States: Loading (submission in progress), Error (missing required fields)<br>• Priority: P1 | Utilize Imweb board customization |
| Admin Verification System | • Admin reviews submitted business registration number and documents<br>• Upon approval: listed; Upon rejection: reason entered and user notified<br>• States: 3-stage status management (Pending/Approved/Rejected)<br>• Priority: P1 | |

### 4.2 Community (Thread-style Feed)

| Feature | Detailed Logic and Requirements | Notes |
|---------|--------------------------------|-------|
| Feed-style Post Creation | • Support short writing format focused on body text without title<br>• Include image and file attachment functionality<br>• States: Loading (posting), Error (upload failure message)<br>• Priority: P1 | Twitter/Instagram style UI |
| Real-time Communication (Comments/Likes) | • Comment writing and reply functionality below posts<br>• Immediate feedback through like (empathy) button<br>• States: Empty (prompt message to write first comment)<br>• Priority: P1 | |

---

## 5. State Management

### 5.1 User and Authentication State

1. **STATE_USER_PROFILE:** Logged-in user information (name, company name, grade, approval status)
2. **STATE_AUTH_STATUS:** Login status and access token management

### 5.2 Data State

1. **STATE_EXPERT_LIST:** Expert list data with search and filter conditions applied
2. **STATE_FEED_DATA:** Community thread list (including pagination or infinite scroll state)
3. **STATE_NOTICE_LIST:** Support program announcement data

### 5.3 Persistent Storage (Database)

**Data requiring storage:**

- **Member Information:** Regular user and expert account information (contact, affiliation, etc.)
- **Expert Profile:** Company information, portfolio, attached supporting documents (JPG, PDF)
- **Community Data:** Post body, comment data, timestamps
- **Support Program Data:** Admin-registered notice title, content, images, external links
