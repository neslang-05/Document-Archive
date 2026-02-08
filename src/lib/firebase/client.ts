import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

// Initialize Firebase (singleton)
// Use dummy values if keys are missing to prevent build errors
const app = getApps().length === 0 
  ? initializeApp(firebaseConfig.apiKey ? firebaseConfig : { apiKey: "build-dummy-key", authDomain: "dummy", projectId: "dummy" }) 
  : getApp()
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
}
export type { User }

/**
 * Get the current user's Firebase ID token.
 * Returns null if no user is signed in.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

/**
 * Get the current user's ID token and set it as a session cookie
 * by calling our /auth/session API route.
 */
export async function setSessionCookie(): Promise<boolean> {
  const token = await getIdToken()
  if (!token) return false

  const res = await fetch("/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
  })

  return res.ok
}

/**
 * Clear the session cookie by calling our /auth/session DELETE route.
 */
export async function clearSessionCookie(): Promise<void> {
  await fetch("/auth/session", { method: "DELETE" })
}
