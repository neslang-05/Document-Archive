# Database Design

Database type
- PostgreSQL (managed via Supabase). Schema and policies are provided in `supabase/schema.sql`.

Schema overview
- Core tables: `profiles`, `departments`, `courses`, `resources`, `ratings`, `bookmarks`, `activity_log`, `resource_files`.
- Enums: `user_role`, `resource_category`, `exam_type`, `submission_status`.
- Triggers/functions: `handle_new_user`, `update_resource_rating`, `update_updated_at_column`, and `get_user_role`.

Key entities and relationships

| Entity / Table | Fields (high level) | Purpose |
|---|---|---|
| profiles | `id`, `email`, `full_name`, `avatar_url`, `role`, `created_at`, `updated_at` | User profiles mapped to Supabase `auth.users` (see `on_auth_user_created` trigger). |
| departments | `id`, `name`, `code`, `description`, `created_at` | Academic departments; referenced by `courses`.
| courses | `id`, `department_id`, `code`, `name`, `semester`, `credits`, `description`, `created_at` | Courses for the university; referenced by `resources`.
| resources | `id`, `course_id`, `uploader_id`, `title`, `category`, `exam_type`, `year`, `file_url`, `file_name`, `file_size`, `file_type`, `status`, `download_count`, `average_rating`, `rating_count`, `approved_by`, `approved_at`, `rejection_reason`, `created_at`, `updated_at` | Main content table for uploaded resources. RLS and triggers manage visibility and derived fields.
| ratings | `id`, `resource_id`, `user_id`, `rating`, `review`, `created_at`, `updated_at` | User ratings and optional reviews; unique per (resource_id, user_id). Triggers update `resources.average_rating` and `rating_count`.
| bookmarks | `id`, `user_id`, `resource_id`, `created_at` | User bookmarks; enforces uniqueness (one bookmark per user/resource).
| activity_log | `id`, `user_id`, `action`, `resource_id`, `metadata`, `created_at` | Auditing and activity tracking.
| resource_files | `id`, `resource_id`, `file_url`, `file_name`, `file_size`, `file_type`, `file_order`, `created_at` | Support multiple files per resource (multi-file support present in `supabase/` SQL).

Indexing and constraints
- Indexes created for common filters and sorts: resources by `course_id`, `status`, `category`, `year`, and `created_at` (see `supabase/schema.sql`).
- Strong constraints: foreign keys, unique constraints (e.g., `email` in `profiles`), and CHECK constraints for semesters, years, file sizes and rating ranges.

Schema management and migrations
- The repository contains `supabase/schema.sql` which is intended to be run in Supabase SQL editor or applied via migration tooling. No dedicated migration framework (e.g., pg-migrate) is included in the repo.
