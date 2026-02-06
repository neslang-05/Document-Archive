# API Reference

API base URL
- The application serves pages and server components via Next.js App Router. For hosted instances the app metadata declares `https://document-archive.vercel.app` in `src/app/layout.tsx` but runtime host may differ. See [src/app/layout.tsx](src/app/layout.tsx).

Authentication method
- Supabase Auth (email/password, OAuth such as GitHub). Client uses anonymous/public key for browser interactions (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Server uses `createServerClient` to access cookie-bound sessions.

Endpoints (router-based)

| Method | Endpoint | Description | Auth Required |
|---|---:|---|---:|
| GET | `/auth/callback?code=...` | Exchanges OAuth code for session and redirects to `next` (implemented in `src/app/auth/callback/route.ts`). | No (callback handles exchange)
| GET | `/auth/logout` | Signs out current session and redirects to `/` (`src/app/auth/logout/route.ts`). | Yes (requires existing session)

Notes on API design
- There are no dedicated API route folders with REST endpoints in this codebase beyond the two auth routes. Most data access is performed directly from server components or client code via the Supabase JS client.
- Protected routes and RBAC checks are enforced by middleware and by Postgres RLS policies defined in `supabase/schema.sql`.

Middleware-protected paths
- The middleware checks paths such as `/dashboard`, `/submit`, `/moderation`, `/admin`, and `/profile` and enforces authentication/roles. See [src/middleware.ts](src/middleware.ts) and [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts).

Error handling conventions
- Supabase SDK returns `{ data, error }` objects; the application checks and handles these in-page. There is no global API error format or centralized error aggregator implemented in the repository.
