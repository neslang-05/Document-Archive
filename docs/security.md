# Security

Authentication
- Uses Supabase Auth for user authentication (email/password and OAuth). Session cookies are used for server-side session binding via `createServerClient` ([src/lib/supabase/server.ts](src/lib/supabase/server.ts)).

Authorization
- Role-based access control is implemented using a `role` column on `profiles` (enum: `guest`, `user`, `moderator`, `admin`).
- Row Level Security (RLS) policies are defined for all main tables in `supabase/schema.sql` and control read/write per role and ownership (see the `Resources policies` and `Profiles policies`).

Secrets management
- Required environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client/browser and server usage. These must be set in the deployment environment.
- The repository does not include a server-only service key or secrets vault integration; service-role operations are expected to run within Supabase (careful with exposing any service keys).

Input validation and data integrity
- Database enforces constraints (CHECKs, types, indexes, UNIQUE) defined in `supabase/schema.sql` (for semesters, year ranges, rating ranges, file sizes).
- Application-level validation appears minimal in the repository; submission and input sanitization is performed in-page or implicitly by relying on DB constraints.

Known risks and gaps (based on codebase)
- Public/Anon key exposure: The app relies on the public Supabase anon key for browser calls (expected pattern), but extra server-side endpoints would be required for sensitive operations that must not run client-side.
- No rate-limiting: The repo does not implement application rate limiting for endpoints or uploads.
- Secrets & service-role usage: No explicit handling of a Supabase service role key inside the repo — correct practice is to avoid embedding service keys in frontend code.
- Limited input sanitization in code: rely on DB constraints, but additional server-side validation and sanitization would make the system more robust.

Recommendations
- Add server-side validation layers (or API routes) for critical operations.
- Introduce request-rate limiting (edge or server) and file upload size validation.
- Use secret management for any non-public keys and avoid exposing service keys to client code.
