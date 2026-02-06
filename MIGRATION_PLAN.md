# Migration Plan: Supabase → Firebase Auth + Cloudflare (D1, R2, Workers, Pages, Turnstile)

**Generated**: 2026-02-06  
**Source Stack**: Supabase (Auth, Postgres, Storage) + Vercel  
**Target Stack**: Firebase Authentication + Cloudflare D1/R2/Workers/Pages + Turnstile  
**Application**: MTU Archive — Community-Driven Academic Archiving Platform (Next.js 16)

---

## Table of Contents

- [Migration Plan: Supabase → Firebase Auth + Cloudflare (D1, R2, Workers, Pages, Turnstile)](#migration-plan-supabase--firebase-auth--cloudflare-d1-r2-workers-pages-turnstile)
  - [Table of Contents](#table-of-contents)
  - [1. Pre-Migration State](#1-pre-migration-state)
    - [Current Architecture](#current-architecture)
    - [Supabase Integration Points (31 files)](#supabase-integration-points-31-files)
    - [Database Schema](#database-schema)
  - [2. Target Architecture](#2-target-architecture)
  - [3. Phase 1 — Infrastructure Setup](#3-phase-1--infrastructure-setup)
    - [3.1 Environment Variables (New)](#31-environment-variables-new)
    - [3.2 Dependencies to Add](#32-dependencies-to-add)
    - [3.3 Dependencies to Remove](#33-dependencies-to-remove)
  - [4. Phase 2 — Database Migration (Postgres → D1)](#4-phase-2--database-migration-postgres--d1)
    - [4.1 Schema Translation](#41-schema-translation)
    - [4.2 D1 Schema](#42-d1-schema)
    - [4.3 Trigger Replacements](#43-trigger-replacements)
  - [5. Phase 3 — Authentication Migration (Supabase Auth → Firebase Auth)](#5-phase-3--authentication-migration-supabase-auth--firebase-auth)
    - [5.1 Client-Side Auth](#51-client-side-auth)
    - [5.2 Server-Side Auth](#52-server-side-auth)
    - [5.3 OAuth Callback](#53-oauth-callback)
  - [6. Phase 4 — Storage Migration (Supabase Storage → R2)](#6-phase-4--storage-migration-supabase-storage--r2)
    - [6.1 Upload Flow](#61-upload-flow)
    - [6.2 Access Control](#62-access-control)
  - [7. Phase 5 — Middleware \& Authorization Rewrite](#7-phase-5--middleware--authorization-rewrite)
    - [7.1 Current Middleware Responsibilities](#71-current-middleware-responsibilities)
    - [7.2 New Middleware](#72-new-middleware)
    - [7.3 RLS Replacement](#73-rls-replacement)
  - [8. Phase 6 — Application Code Migration](#8-phase-6--application-code-migration)
    - [8.1 Files Requiring Changes](#81-files-requiring-changes)
    - [8.2 Query Pattern Translation](#82-query-pattern-translation)
  - [9. Phase 7 — Cloudflare Turnstile Integration](#9-phase-7--cloudflare-turnstile-integration)
    - [9.1 Protected Actions](#91-protected-actions)
    - [9.2 Implementation](#92-implementation)
  - [10. Phase 8 — Hosting Migration (Vercel → Cloudflare Pages)](#10-phase-8--hosting-migration-vercel--cloudflare-pages)
    - [10.1 Build Configuration](#101-build-configuration)
    - [10.2 Compatibility](#102-compatibility)
  - [11. Trade-offs \& Non-1:1 Replacements](#11-trade-offs--non-11-replacements)
  - [12. Rollback Plan](#12-rollback-plan)
  - [13. Post-Migration State](#13-post-migration-state)
    - [Supabase Dependencies Removed](#supabase-dependencies-removed)
  - [14. Validation Checklist](#14-validation-checklist)

---

## 1. Pre-Migration State

### Current Architecture

| Component | Technology | Responsibility |
|---|---|---|
| Frontend/SSR | Next.js 16 (App Router) on Vercel | Pages, components, middleware |
| Auth | Supabase Auth | Email/password, Google OAuth, session cookies |
| Database | Supabase Postgres | 8 tables, RLS, triggers, functions |
| Storage | Supabase Storage (`resourses` bucket) | File uploads (PDF, DOCX, images, etc.) |
| Authorization | Postgres RLS + middleware role checks | Row-level security per role |

### Supabase Integration Points (31 files)

| Feature | File Count | Key Files |
|---|---|---|
| Auth (getUser, signIn, signUp, signOut, OAuth) | 13 | middleware.ts, auth/login, auth/signup, header.tsx |
| Database (from() queries) | 21 | page.tsx, resources/, dashboard/, admin/, moderation/ |
| Storage (upload, getPublicUrl, remove) | 2 | submit/page.tsx, submission-actions.tsx |
| Environment Variables | 6 | lib/supabase/*, middleware.ts |

### Database Schema

- **Tables**: profiles, departments, courses, resources, ratings, bookmarks, activity_log, resource_files
- **Enums**: user_role, resource_category, exam_type, submission_status
- **Triggers**: on_auth_user_created, on_rating_change, update_*_updated_at
- **Functions**: get_user_role, update_resource_rating, handle_new_user, update_updated_at_column
- **RLS**: 16 policies across all tables

---

## 2. Target Architecture

| Component | Technology | Responsibility |
|---|---|---|
| Frontend/SSR | Next.js 16 on Cloudflare Pages | Pages, components, edge runtime |
| Auth | Firebase Authentication | Email/password, Google OAuth, ID tokens |
| Database | Cloudflare D1 (SQLite) | All data persistence |
| Storage | Cloudflare R2 | File storage with signed URLs |
| Authorization | Application-level checks in Workers/middleware | Replaces RLS |
| Bot Protection | Cloudflare Turnstile | Login, signup, file submission |
| API Layer | Cloudflare Workers (via Next.js API routes on Pages) | Backend logic, auth verification |

---

## 3. Phase 1 — Infrastructure Setup

### 3.1 Environment Variables (New)

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Cloudflare D1
CLOUDFLARE_D1_DATABASE_ID=
CLOUDFLARE_ACCOUNT_ID=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=document-archive-files
R2_PUBLIC_URL=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

### 3.2 Dependencies to Add

```
firebase                (client SDK)
firebase-admin          (server SDK for token verification)
@cloudflare/next-on-pages (Cloudflare Pages adapter)
@aws-sdk/client-s3      (R2 uses S3-compatible API)
```

### 3.3 Dependencies to Remove

```
@supabase/ssr
@supabase/supabase-js
```

---

## 4. Phase 2 — Database Migration (Postgres → D1)

### 4.1 Schema Translation

Key differences from Postgres to SQLite (D1):

| Postgres Feature | D1/SQLite Replacement |
|---|---|
| `UUID` type | `TEXT` with application-generated IDs |
| `CREATE TYPE ... AS ENUM` | `TEXT` with `CHECK()` constraints |
| `TIMESTAMPTZ` | `TEXT` (ISO 8601 strings) |
| `DECIMAL(2,1)` | `REAL` |
| `BIGINT` | `INTEGER` |
| `JSONB` | `TEXT` (JSON string) |
| `REFERENCES auth.users(id)` | `TEXT` (Firebase UID, no FK to external system) |
| `uuid_generate_v4()` | Application-side `crypto.randomUUID()` |
| PL/pgSQL triggers/functions | Worker-level application logic |
| RLS policies | Application-level authorization checks |
| `to_tsvector` / GIN index | `LIKE` queries or application-side search |

### 4.2 D1 Schema

See `d1/schema.sql` (created as part of this migration).

### 4.3 Trigger Replacements

| Postgres Trigger | Replacement |
|---|---|
| `on_auth_user_created` → `handle_new_user` | Worker logic: after Firebase signup, insert into `profiles` |
| `on_rating_change` → `update_resource_rating` | Application logic: recalculate average after rating insert/update/delete |
| `update_*_updated_at` | Application logic: set `updated_at = new Date().toISOString()` on every update |

---

## 5. Phase 3 — Authentication Migration (Supabase Auth → Firebase Auth)

### 5.1 Client-Side Auth

| Supabase | Firebase |
|---|---|
| `supabase.auth.signInWithPassword()` | `signInWithEmailAndPassword(auth, email, password)` |
| `supabase.auth.signUp()` | `createUserWithEmailAndPassword(auth, email, password)` |
| `supabase.auth.signInWithOAuth({ provider: 'google' })` | `signInWithPopup(auth, googleProvider)` |
| `supabase.auth.signOut()` | `signOut(auth)` |
| `supabase.auth.resetPasswordForEmail()` | `sendPasswordResetEmail(auth, email)` |
| `supabase.auth.getUser()` | `auth.currentUser` or `onAuthStateChanged()` |
| `supabase.auth.exchangeCodeForSession()` | Not needed (Firebase handles OAuth redirect internally) |

### 5.2 Server-Side Auth

| Supabase | Firebase Admin |
|---|---|
| Session cookies (managed by Supabase SSR) | Firebase ID token in cookie, verified via `admin.auth().verifyIdToken()` |
| `createServerClient` with cookie handlers | `getAuth().verifyIdToken(token)` from `firebase-admin` |

### 5.3 OAuth Callback

Supabase used a `/auth/callback` route to exchange codes. Firebase handles OAuth internally via popup/redirect. The callback route becomes a session-cookie setter that receives the Firebase ID token from the client and sets an HTTP-only cookie.

---

## 6. Phase 4 — Storage Migration (Supabase Storage → R2)

### 6.1 Upload Flow

| Supabase | Cloudflare R2 |
|---|---|
| `supabase.storage.from('resourses').upload(path, file)` | `PutObjectCommand` via `@aws-sdk/client-s3` to R2 |
| `supabase.storage.from('resourses').getPublicUrl(path)` | Generate signed URL or use R2 public bucket URL |
| `supabase.storage.from('resourses').remove(paths)` | `DeleteObjectCommand` / `DeleteObjectsCommand` via S3 client |

### 6.2 Access Control

Supabase Storage used RLS-like policies. R2 buckets are private by default. Access is controlled by:
- Signed URLs generated by Workers (time-limited)
- Or a public R2 custom domain for approved resources

---

## 7. Phase 5 — Middleware & Authorization Rewrite

### 7.1 Current Middleware Responsibilities

1. Refresh Supabase session cookies
2. Check `getUser()` for protected routes
3. Query `profiles.role` for moderator/admin routes
4. Redirect unauthenticated users to `/auth/login`
5. Redirect authenticated users away from `/auth/login` and `/auth/signup`

### 7.2 New Middleware

1. Read Firebase session cookie
2. Verify Firebase ID token using `firebase-admin`
3. Decode user UID from token
4. Query D1 `profiles` table for role (cached)
5. Same redirect logic

### 7.3 RLS Replacement

All 16 RLS policies are replaced by explicit authorization checks in API route handlers and server components. Each database query is wrapped with role/ownership checks.

---

## 8. Phase 6 — Application Code Migration

### 8.1 Files Requiring Changes

Every file that imports from `@/lib/supabase/client` or `@/lib/supabase/server` must be updated. The new library layer provides:

- `src/lib/firebase/client.ts` — Browser Firebase Auth instance
- `src/lib/firebase/admin.ts` — Server Firebase Admin for token verification
- `src/lib/db/client.ts` — D1 database query helpers
- `src/lib/storage/r2.ts` — R2 upload/download/delete helpers
- `src/lib/turnstile.ts` — Turnstile verification helper

### 8.2 Query Pattern Translation

| Supabase Pattern | D1 Replacement |
|---|---|
| `supabase.from('table').select('*')` | `db.prepare('SELECT * FROM table').all()` |
| `.select('*, courses(*)')` | Explicit JOIN queries |
| `.eq('id', value)` | `WHERE id = ?` with bound params |
| `.order('created_at', { ascending: false })` | `ORDER BY created_at DESC` |
| `.limit(n)` | `LIMIT ?` |
| `.single()` | `.first()` in D1 |
| `.select('*', { count: 'exact', head: true })` | `SELECT COUNT(*) FROM table` |
| `.ilike('title', '%query%')` | `WHERE title LIKE ?` (case-insensitive in SQLite by default for ASCII) |
| `.in('id', ids)` | `WHERE id IN (?, ?, ...)` |

---

## 9. Phase 7 — Cloudflare Turnstile Integration

### 9.1 Protected Actions

| Action | Page |
|---|---|
| Login | `/auth/login` |
| Signup | `/auth/signup` |
| Forgot Password | `/auth/forgot-password` |
| Resource Submission | `/submit` |

### 9.2 Implementation

- Client: Render Turnstile widget, obtain token
- Server: Verify token via `https://challenges.cloudflare.com/turnstile/v0/siteverify` before processing

---

## 10. Phase 8 — Hosting Migration (Vercel → Cloudflare Pages)

### 10.1 Build Configuration

- Use `@cloudflare/next-on-pages` to build Next.js for Cloudflare Pages
- Configure `wrangler.toml` with D1 binding and R2 binding
- Set all environment variables in Cloudflare dashboard

### 10.2 Compatibility

- Next.js 16 App Router is supported on Cloudflare Pages via the adapter
- Edge runtime is used for middleware and API routes
- Node.js-specific APIs are not available; use Web APIs

---

## 11. Trade-offs & Non-1:1 Replacements

| Feature | Supabase | Cloudflare+Firebase | Impact |
|---|---|---|---|
| Row-Level Security | Built-in RLS policies | Manual authorization checks | More code, but explicit and auditable |
| Database Triggers | PL/pgSQL triggers | Application logic | Must ensure all write paths include derived-field updates |
| Full-Text Search | `to_tsvector` + GIN index | `LIKE` queries | Reduced search quality; can add Algolia/Meilisearch later |
| Real-time Subscriptions | Supabase realtime | Not available natively | Must implement polling or use Durable Objects if needed |
| Automatic Profile Creation | `on_auth_user_created` trigger | Post-signup Worker logic | Must be called explicitly after Firebase signup |
| UUID Generation | `uuid_generate_v4()` in DB | `crypto.randomUUID()` in app | Functionally equivalent |
| OAuth Code Exchange | Server-side route handler | Firebase handles internally | Simpler; callback route repurposed for session cookie |
| File Access Control | Storage policies + RLS | Signed URLs from Workers | More secure (time-limited), but more complex |

---

## 12. Rollback Plan

1. Keep Supabase project active during migration (do not delete)
2. Maintain the original `supabase/` directory as reference
3. Use git branching: all migration work on a `migration/cloudflare-firebase` branch
4. If migration fails, revert to `main` branch and redeploy to Vercel
5. Data export: before cutover, export all D1 data and verify row counts match

---

## 13. Post-Migration State

| Component | Technology | Status |
|---|---|---|
| Authentication | Firebase Auth (email/password + Google) | Replaces Supabase Auth |
| Database | Cloudflare D1 (SQLite) | Replaces Supabase Postgres |
| File Storage | Cloudflare R2 | Replaces Supabase Storage |
| Bot Protection | Cloudflare Turnstile | New capability |
| Hosting | Cloudflare Pages | Replaces Vercel |
| Authorization | Application-level checks | Replaces RLS |

### Supabase Dependencies Removed
- `@supabase/ssr` — removed
- `@supabase/supabase-js` — removed
- `NEXT_PUBLIC_SUPABASE_URL` — removed
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — removed
- All `src/lib/supabase/*` files — deleted

---

## 14. Validation Checklist

- [ ] Firebase Auth: email signup works
- [ ] Firebase Auth: email login works
- [ ] Firebase Auth: Google OAuth works
- [ ] Firebase Auth: password reset works
- [ ] Firebase Auth: logout works
- [ ] Session cookie: set on login, cleared on logout
- [ ] Middleware: protects /dashboard, /submit, /moderation, /admin
- [ ] Middleware: role-based access for moderator/admin routes
- [ ] D1: all 8 tables created with correct constraints
- [ ] D1: seed data imported
- [ ] D1: CRUD operations work for all tables
- [ ] D1: rating average recalculated on insert/update/delete
- [ ] R2: file upload works
- [ ] R2: file download/preview works
- [ ] R2: file deletion works
- [ ] Turnstile: widget renders on login, signup, forgot-password, submit
- [ ] Turnstile: server-side verification works
- [ ] Home page: stats load from D1
- [ ] Resources: browse, filter, search work
- [ ] Resource detail: loads with files
- [ ] Dashboard: stats, recent uploads display
- [ ] Bookmarks: add/remove/list work
- [ ] Submissions: list and delete work
- [ ] Moderation: approve/reject work
- [ ] Admin: department/course/user CRUD works
- [ ] Profile: update works
- [ ] Search: returns results
- [ ] Cloudflare Pages: build succeeds
- [ ] Cloudflare Pages: deployment works
- [ ] No Supabase references remain in codebase
