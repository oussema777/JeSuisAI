# JeSuis-VPS Platform Audit Report
**Date:** 2026-03-07
**Stack:** Next.js 16 + Supabase + TypeScript + Tailwind CSS

---

## CRITICAL Issues (Fix Immediately)

### 1. Authentication Bypass Risk
- **File:** `app/api/invite-member/route.ts:83`
- **Issue:** Uses `getSession()` instead of `getUser()`. Supabase warns that `getSession()` does NOT validate the JWT server-side. An attacker could forge a session cookie to create admin accounts.
- **Fix:** Replace `getSession()` with `getUser()`

### 2. XSS in Email Templates (Stored XSS)
- **File:** `app/api/cron/check-candidature-reminders/route.ts:120-126`
- **Issue:** User data (`nom_prenom`, `intitule_action`) injected into HTML emails without escaping. The `escapeHtml()` function exists in `send-email/route.ts` but isn't used here.
- **File:** `app/api/invite-member/route.ts:246-265`
- **Issue:** Same: `firstName`, `lastName`, `role` interpolated into HTML without escaping + temporary password sent in plaintext.
- **Fix:** Apply `escapeHtml()` to all user-originated data before injecting into HTML templates

### 3. Build Safety Disabled
- **File:** `next.config.ts:12-17`
- **Issue:** `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` means broken TypeScript and lint errors ship to production silently.
- **Fix:** Remove these overrides and fix all type/lint errors

### 4. Hardcoded Colors Bypass Theme System (100+ occurrences)
- **Issue:** Inline `style={{ backgroundColor: '#187A58' }}` everywhere instead of using CSS variables
- **Bug:** CSS color typo `#y187A58` in `app/components/detail/IndicateursConfiance.tsx:32`
- **Fix:** Replace all hardcoded colors with Tailwind classes / CSS variables

### 5. 28/38 Page Files Have Hardcoded French (No i18n)
- **Issue:** Despite having `next-intl` configured, only 10 pages use `useTranslations()`. English version shows French.
- **Fix:** Add translation keys and use `useTranslations()` in all pages

---

## HIGH Issues (Fix Soon)

| # | Issue | Location |
|---|-------|----------|
| 6 | No rate limiting on login — brute-force possible | `LoginAdmin.tsx:198-246` |
| 7 | Client-side-only file upload validation — bypassed with cURL | `PostulerOpportunite.tsx:103`, `ImageUploadWidget.tsx:44` |
| 8 | Missing CSP & HSTS headers — no XSS defense-in-depth | `next.config.ts:19-46` |
| 9 | Render-blocking Google Fonts — `@import url(...)` instead of `next/font` | `globals.css:2` |
| 10 | Zero code splitting — no `dynamic()` or `React.lazy()` anywhere | Codebase-wide |
| 11 | 155 console.log/error statements in production code | Codebase-wide |
| 12 | Dead `href="#"` links in public footer (15+ city links, Help, Partners) | `layout.tsx:84-151` |
| 13 | Placeholder `+237 XXX XXX XXX` phone visible to users | `Contact.tsx:269` |
| 14 | N+1 query in cron job — separate DB query per admin | `check-candidature-reminders/route.ts:77-83` |
| 15 | Unhandled email failures — fetch result ignored, user told "success" | `PostulerOpportunite.tsx:208` |
| 16 | Hardcoded developer email fallback `oussema.lamine@ilab.tn` | `Contact.tsx:87`, 3 other files |
| 17 | Error messages leak internals to client | Multiple API routes |
| 18 | Logo loaded from external server (`ilab.tn`) | `layout.tsx:49` |

---

## MEDIUM Issues (Plan to Fix)

| # | Issue | Location |
|---|-------|----------|
| 19 | In-memory rate limiter useless on serverless (Vercel) | `lib/rate-limit.ts` |
| 20 | SMTP transporter duplicated in 3 files (no shared module) | 3 API routes |
| 21 | Supabase admin client duplicated in 3 files | 3 API routes |
| 22 | Duplicate `useNotifications` hook vs `NotificationContext` | `hooks/` vs `contexts/` |
| 23 | 20+ queries use `select('*')` — over-fetching sensitive data | Multiple pages |
| 24 | Dashboard export fetches ALL rows with no pagination | `admin/dashboard/page.tsx:47-51` |
| 25 | No structured logging, no request IDs | Codebase-wide |
| 26 | Inconsistent error response formats across API routes | All API routes |
| 27 | Missing SEO meta tags (twitter card, OG image, keywords) | `layout.tsx` |
| 28 | Sitemap missing locale prefixes (`/fr/`, `/en/`) | `sitemap.ts` |
| 29 | 8 images use `unoptimized` prop | Multiple files |
| 30 | Empty `alt=""` on content images (accessibility) | 4 files |
| 31 | Stub/noop click handlers | `ListingActualites.tsx:134-135` |
| 32 | No manifest.json / PWA support | Missing file |
| 33 | `.env.example` missing required variables | `.env.example` |
| 34 | Unused `RESEND_API_KEY` in env (dead credential) | `.env.local` |

---

## LOW Issues

- Inconsistent file naming (French/English mix, casing issues)
- Duplicate `CameroonFlag` component in 2 locations
- Non-standard `app/pages/` directory pattern
- Missing error boundary for `(auth)` route group
- Empty catch block in middleware swallows sign-out errors
- `as any` type casts on critical role/status fields

---

## Progress Tracker

- [ ] Issue 1: getSession → getUser
- [ ] Issue 2: XSS in email templates
- [ ] Issue 3: Build safety (ignoreBuildErrors)
- [ ] Issue 4: Hardcoded colors
- [ ] Issue 5: i18n missing
- [ ] Issue 6: Login rate limiting
- [ ] Issue 7: File upload validation
- [ ] Issue 8: CSP & HSTS headers
- [ ] Issue 9: Google Fonts render-blocking
- [ ] Issue 10: Code splitting
- [ ] Issue 11: Console statements cleanup
- [ ] Issue 12: Dead href="#" links
- [ ] Issue 13: Placeholder phone numbers
- [ ] Issue 14: N+1 query in cron
- [ ] Issue 15: Unhandled email failures
- [ ] Issue 16: Hardcoded developer email
- [ ] Issue 17: Error message leakage
- [ ] Issue 18: External logo dependency
- [ ] Issue 19: In-memory rate limiter
- [ ] Issue 20: SMTP transporter duplication
- [ ] Issue 21: Supabase admin client duplication
- [ ] Issue 22: Duplicate notification logic
- [ ] Issue 23: select('*') over-fetching
- [ ] Issue 24: Missing pagination on exports
- [ ] Issue 25: Structured logging
- [ ] Issue 26: Inconsistent error formats
- [ ] Issue 27: Missing SEO meta tags
- [ ] Issue 28: Sitemap locale prefixes
- [ ] Issue 29: Unoptimized images
- [ ] Issue 30: Empty alt attributes
- [ ] Issue 31: Stub click handlers
- [ ] Issue 32: PWA manifest
- [ ] Issue 33: .env.example incomplete
- [ ] Issue 34: Unused RESEND_API_KEY
