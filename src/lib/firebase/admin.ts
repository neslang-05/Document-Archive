import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type DecodedIdToken } from "firebase-admin/auth"

let adminApp: App

function getAdminApp(): App {
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
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
