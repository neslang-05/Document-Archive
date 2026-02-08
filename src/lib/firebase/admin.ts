import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type DecodedIdToken } from "firebase-admin/auth"

let adminApp: App

function getAdminApp(): App {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      // During build time or if config is missing, return a dummy initialization
      // to prevent the process from crashing
      adminApp = initializeApp({
        credential: cert({
          projectId: "dummy-project",
          clientEmail: "dummy@example.com",
          privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQ\n-----END PRIVATE KEY-----\n",
        }),
      }, "build-time-app")
    } else {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      })
    }
  }
  return adminApp || getApps()[0]
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
