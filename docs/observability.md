# Observability

Logging
- No centralized logging or structured logger is present in the repository. Page-level and component-level console logging may be used during development.

Monitoring hooks
- No monitoring integrations (Prometheus, Sentry, Datadog, etc.) are present in the codebase.

Error tracking
- No error-tracking service integration is implemented. Errors currently must be surfaced in-page or captured by adding an external integration.

Health checks
- No dedicated health-check endpoints are provided.

Debugging workflow
- Reproduce in development with `npm run dev` and check server logs from Next.js host.
- Inspect Supabase logs and Postgres metrics in the Supabase dashboard for database-level issues.

Recommendations
- Add an error-tracking integration (e.g., Sentry) for runtime exception monitoring.
- Add structured logging on server-side components and collect logs via a centralized service.
- Add a simple health endpoint or status page to verify service readiness.
