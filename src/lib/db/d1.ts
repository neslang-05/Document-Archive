/**
 * Cloudflare D1 Database Helper
 *
 * In Cloudflare Pages/Workers, the D1 binding is available via
 * the platform context. For local development, we use the REST API.
 *
 * In production (Cloudflare Pages), D1 is accessed via the binding:
 *   const db = context.env.DB
 *
 * For server components and API routes in Next.js on Cloudflare Pages,
 * we use getRequestContext() from @cloudflare/next-on-pages.
 */

export interface D1Result<T = any> {
  results: T[]
  success: boolean
  meta: {
    changes: number
    last_row_id: number
    duration: number
  }
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  exec(query: string): Promise<D1Result>
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = any>(column?: string): Promise<T | null>
  all<T = any>(): Promise<D1Result<T>>
  run(): Promise<D1Result>
  raw<T = any[]>(): Promise<T[]>
}

/**
 * Get the D1 database instance.
 *
 * In Cloudflare Pages runtime, this uses the platform binding.
 * The binding name "DB" must match wrangler.toml configuration.
 */
export function getD1(): D1Database {
  // When running on Cloudflare Pages, use the binding from next-on-pages
  try {
    // Only attempt to use @cloudflare/next-on-pages in production and when not on Vercel
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      // Use eval('require') to prevent Turbopack from trying to resolve this at build time
      // as it's only available in the Cloudflare Pages environment
      const req = eval('require');
      const { getRequestContext } = req("@cloudflare/next-on-pages")
      const { env } = getRequestContext()
      if (env && env.DB) {
        return env.DB as D1Database
      }
    }
    
    throw new Error("No DB binding found")
  } catch (err) {
    // Fallback for build time or local environment without wrangler
    // We only log this in dev to avoid noise in production build logs
    if (process.env.NODE_ENV === 'development') {
      console.warn("D1 binding not found, using mock.")
    }
    
    const mockResult = { results: [], success: true, meta: { changes: 0, last_row_id: 0, duration: 0 } }
    const mockStatement = {
      bind: () => mockStatement,
      all: async () => mockResult,
      first: async () => null,
      run: async () => mockResult,
      raw: async () => []
    }
    
    return {
      prepare: () => mockStatement,
      batch: async () => [],
      exec: async () => mockResult
    } as unknown as D1Database
  }
}

/**
 * Generate a new UUID for use as a primary key.
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Get current ISO timestamp for created_at/updated_at fields.
 */
export function now(): string {
  return new Date().toISOString()
}

// ============================================
// Query helpers — replace Supabase .from() calls
// ============================================

/**
 * Get a user profile by Firebase UID.
 */
export async function getProfile(db: D1Database, userId: string) {
  return db
    .prepare("SELECT * FROM profiles WHERE id = ?")
    .bind(userId)
    .first<ProfileRow>()
}

/**
 * Create or update a profile after Firebase signup.
 * Replaces the Supabase `handle_new_user` trigger.
 */
export async function upsertProfile(
  db: D1Database,
  profile: { id: string; email: string; full_name?: string; avatar_url?: string }
) {
  const ts = now()
  return db
    .prepare(
      `INSERT INTO profiles (id, email, full_name, avatar_url, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', ?, ?)
       ON CONFLICT (id) DO UPDATE SET
         email = excluded.email,
         full_name = COALESCE(excluded.full_name, profiles.full_name),
         avatar_url = COALESCE(excluded.avatar_url, profiles.avatar_url),
         updated_at = ?`
    )
    .bind(
      profile.id,
      profile.email,
      profile.full_name ?? null,
      profile.avatar_url ?? null,
      ts,
      ts,
      ts
    )
    .run()
}

/**
 * Recalculate average_rating and rating_count for a resource.
 * Replaces the Supabase `update_resource_rating` trigger.
 */
export async function recalculateResourceRating(
  db: D1Database,
  resourceId: string
) {
  return db
    .prepare(
      `UPDATE resources SET
         average_rating = COALESCE((SELECT AVG(CAST(rating AS REAL)) FROM ratings WHERE resource_id = ?), 0),
         rating_count = (SELECT COUNT(*) FROM ratings WHERE resource_id = ?),
         updated_at = ?
       WHERE id = ?`
    )
    .bind(resourceId, resourceId, now(), resourceId)
    .run()
}

// ============================================
// Row types (match D1 schema)
// ============================================

export interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "guest" | "user" | "moderator" | "admin"
  created_at: string
  updated_at: string
}

export interface DepartmentRow {
  id: string
  name: string
  code: string
  description: string | null
  created_at: string
}

export interface CourseRow {
  id: string
  department_id: string
  code: string
  name: string
  semester: number
  credits: number | null
  description: string | null
  created_at: string
}

export interface ResourceRow {
  id: string
  course_id: string
  uploader_id: string
  title: string
  description: string | null
  category: string
  exam_type: string | null
  year: number
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  status: string
  download_count: number
  average_rating: number
  rating_count: number
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface RatingRow {
  id: string
  resource_id: string
  user_id: string
  rating: number
  review: string | null
  created_at: string
  updated_at: string
}

export interface BookmarkRow {
  id: string
  user_id: string
  resource_id: string
  created_at: string
}

export interface ActivityLogRow {
  id: string
  user_id: string | null
  action: string
  resource_id: string | null
  metadata: string | null
  created_at: string
}

export interface ResourceFileRow {
  id: string
  resource_id: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  file_order: number
  created_at: string
}
