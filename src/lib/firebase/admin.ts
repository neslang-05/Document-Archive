import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type DecodedIdToken } from "firebase-admin/auth"

let adminApp: App

function getAdminApp(): App {
  // Check if we already have the app initialized
  const apps = getApps()
  if (apps.length > 0) {
    const existing = apps.find(a => a.name === "[DEFAULT]") || apps[0]
    if (existing.name !== "build-time-app") return existing
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    // During build time, return a dummy initialization
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production') {
      return initializeApp({
        credential: cert({
          projectId: "dummy-project",
          clientEmail: "dummy@example.com",
          privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQ\n-----END PRIVATE KEY-----\n",
        }),
      }, "build-time-app")
    }
    
    // In development/runtime, missing vars is a fatal error
    const missing = []
    if (!projectId) missing.push("FIREBASE_ADMIN_PROJECT_ID")
    if (!clientEmail) missing.push("FIREBASE_ADMIN_CLIENT_EMAIL")
    if (!privateKey) missing.push("FIREBASE_ADMIN_PRIVATE_KEY")
    
    console.error(`Firebase Admin SDK variables missing: ${missing.join(", ")}`)
    throw new Error(`Firebase Admin SDK not configured. Missing: ${missing.join(", ")}`)
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  })
  
  return adminApp
}

/**
 * Verify a Firebase ID token on the server side.
 * Returns the decoded token payload, or null if invalid.
 */
export async function verifyIdToken(
  idToken: string
): Promise<DecodedIdToken | null> {
  try {
    const app = getAdminApp()
    const auth = getAuth(app)
    const decoded = await auth.verifyIdToken(idToken)
    return decoded
  } catch (error) {
    console.error("Firebase token verification failed:", error)
    return null
  }
}

/**
 * Get the Firebase UID from a session cookie value (which is the ID token).
 * Returns null if the token is invalid or expired.
 */
export async function getUidFromSession(
  sessionCookie: string | undefined
): Promise<string | null> {
  if (!sessionCookie) return null
  const decoded = await verifyIdToken(sessionCookie)
  return decoded?.uid ?? null
}

export { getAdminApp, getAuth }
export type { DecodedIdToken }
