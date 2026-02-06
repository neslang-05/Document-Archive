# System Overview

What problem the system solves
- Provides a community-driven academic resource archive for B.Tech CSE students at Manipur Technical University (MTU). It centralizes course information, question papers, notes, lab manuals, project reports and enables submission, moderation, rating and bookmarking of resources.

Target users
- Students (consumers and contributors)
- Moderators (review and approve submissions)
- Admins (manage courses/departments)

Core capabilities
- Browse and search courses and resources
- User authentication (email + OAuth) via Supabase Auth
- Resource submission workflow with moderation queue
- Ratings, bookmarks and download tracking
- PWA support for offline access and installability

High-level architecture summary
- Frontend: Next.js 16 (App Router) React application serving server and client components and UI built with shadcn/ui + Radix. See [src/app/layout.tsx](src/app/layout.tsx).
- Backend / Persistence: Supabase (Postgres) used for Auth, Database, Storage and RLS. Schema and RLS policies are defined in [supabase/schema.sql](supabase/schema.sql) and typed in [src/types/database.ts](src/types/database.ts).
- Glue/Server logic: Server-side Supabase clients created in [src/lib/supabase/server.ts](src/lib/supabase/server.ts) and browser client in [src/lib/supabase/client.ts](src/lib/supabase/client.ts).
- Edge middleware: Route protection and session synchronization implemented in [src/middleware.ts](src/middleware.ts) and [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts).

Key constraints and assumptions
- The app relies on Supabase (hosted Postgres) for all backend needs; no separate custom API server exists.
- The public (anon) Supabase key is used for frontend interactions; sensitive administrative operations rely on RLS and Supabase service roles.
- Deployment is expected on Vercel or another Next.js-compatible host; Node 18+ is required (see package.json).
