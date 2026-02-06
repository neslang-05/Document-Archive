# Architecture

Architecture style
- Modular monolith: single Next.js application (App Router) with server and client components that delegates backend responsibilities to Supabase (managed Postgres, Auth, Storage).

Component breakdown

| Component | Type | Responsibility | Key Files / Folders |
|---|---|---|---|
| Next.js App (UI) | Frontend / Server Components | Render pages, UI, client interactivity, PWA shell | [src/app](src/app), [src/components](src/components) |
| Supabase Client (server) | Server helper | Create server-side Supabase client and handle server-side requests | [src/lib/supabase/server.ts](src/lib/supabase/server.ts) |
| Supabase Client (browser) | Client helper | Initialize browser Supabase for client interactions | [src/lib/supabase/client.ts](src/lib/supabase/client.ts) |
| Middleware | Edge / Route protection | Session synchronization, protected route redirects, role checks | [src/middleware.ts](src/middleware.ts), [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts) |
| Database & Auth | Managed service (Supabase/Postgres) | Persistence, RLS, auth, storage for files | [supabase/schema.sql](supabase/schema.sql), [src/types/database.ts](src/types/database.ts) |
| Utilities & Types | Shared library | Formatters, helpers, and TS types used across app | [src/lib/utils.ts](src/lib/utils.ts), [src/types](src/types) |

Layered architecture explanation
- Presentation: React components and server components under `src/app` and `src/components`.
- Application logic: Page-level server components that call Supabase via `createServerClient` to fetch/persist data.
- Infrastructure: Supabase provides Auth, Postgres DB (with RLS), Storage; Next.js provides routing, middleware and PWA hosting.

Internal and external dependencies
- Internal: `src/lib/supabase/*`, `src/components/*`, `src/app/*`.
- External: Next.js 16, React 19, Supabase JS, shadcn/ui + Radix, TailwindCSS. See [package.json](package.json).
