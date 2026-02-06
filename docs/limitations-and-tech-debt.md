# Limitations and Technical Debt

Inferred limitations from the current codebase
- No dedicated API layer or server-only endpoints — most logic runs client-side or in page-level server components. This reduces opportunity for centralized validation and access control.
- Minimal observability: no error-tracking, centralized logging or health-check endpoints.
- No CI/CD workflows in repository; infra provisioning is manual (no infra as code).
- No automated migrations: schema is provided as a single SQL file; incremental migrations are not tracked.
- Lack of test coverage: no unit/integration tests detected.

Performance and scaling concerns
- Large/complex resource queries are made directly via Supabase; pagination and caching strategies should be audited for high load.
- File upload handling relies on Supabase Storage; ensure signed upload flow and size limits are enforced.

Maintainability concerns
- Many page components make direct DB calls which can lead to duplication of query logic.
- Lack of centralized validation or API layer increases risk of inconsistent input handling.

Recommended refactors and next steps
- Introduce a small API layer (server-only routes or API handlers) for sensitive operations and centralized validation.
- Add automated database migrations tooling (e.g., migrate, pg-migrate) or adopt Supabase migrations workflow.
- Add tests (unit and integration) for critical flows: auth, submissions, moderation.
- Add observability (Sentry) and logging for production readiness.
