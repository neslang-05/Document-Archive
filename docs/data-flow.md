# Data Flow

Request lifecycle (typical page/API interaction)

1. Browser requests a page or navigates to a route (Next.js App Router).
2. Next.js edge middleware (`src/middleware.ts`) runs first: it uses a server Supabase client to check session and roles and may redirect to `/auth/login` for protected routes.
3. Page server components call `createServerClient` ([src/lib/supabase/server.ts](src/lib/supabase/server.ts)) to query Supabase.
4. Supabase executes queries against Postgres (schema in [supabase/schema.sql](supabase/schema.sql)). RLS policies determine which rows are visible or writable.
5. Responses are returned to the server component which renders HTML; client components hydrate and may use the browser Supabase client (`src/lib/supabase/client.ts`) for subsequent actions.
6. Writes (e.g., submitting a resource) go through Supabase insert/update calls; triggers defined in `supabase/schema.sql` (e.g., `handle_new_user`, `update_resource_rating`) maintain derived state.

Data flow between components (short)
- Client UI → Browser Supabase client → Supabase Auth/DB/Storage.
- Server components → Server Supabase client → Supabase DB (used for SSR and protected operations).

Error propagation
- Supabase errors are surfaced to the calling code; pages typically handle or show user-friendly messages. There is no central error middleware implemented in the codebase—errors should be handled where queries are executed.

State management
- Transient UI state is local to React components.
- Persistent state is stored in Supabase (profiles, resources, ratings, bookmarks).
- Session state is managed by Supabase Auth cookies and synchronized via middleware.
