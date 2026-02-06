# Deployment

Runtime environment
- Next.js 16 application (requires Node 18+). See `package.json` for scripts and dependencies.

Build steps
1. Install dependencies: `npm install`
2. Provide environment variables (see next section)
3. Build: `npm run build`
4. Start production: `npm run start` (or deploy to Vercel for automatic builds)

Environment variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase public anon key

Database setup
- Run the SQL in `supabase/schema.sql` (present in the repository) against a Supabase project's SQL editor to create tables, triggers, functions, RLS policies and seed data.

Deployment workflow
- No CI/CD workflows are present in the repository (no `.github/workflows` detected). Typical workflow:
  - Push branch to remote
  - Trigger build/deploy on Vercel (connect repository)
  - Configure environment variables in the Vercel dashboard
  - Run the `supabase/schema.sql` at project provisioning time

Hosting assumptions
- Application is designed for deployment on Next.js hosting platforms (Vercel recommended in README). Supabase is the managed backend.

Scaling considerations
- Horizontal scaling for Next.js is supported by the host.
- Heavy DB load should be addressed with appropriate Supabase/Postgres scaling (indexes exist for common queries, see `supabase/schema.sql`).
