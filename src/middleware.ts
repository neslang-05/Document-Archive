import { NextResponse, type NextRequest } from "next/server"
import { verifyIdToken } from "@/lib/firebase/admin"

const SESSION_COOKIE_NAME = "__session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // Verify session if cookie exists
  let userId: string | null = null

  if (sessionCookie) {
    try {
      const decoded = await verifyIdToken(sessionCookie)
      if (decoded) {
        userId = decoded.uid
      }
    } catch {
      // Invalid session — treat as unauthenticated
      userId = null
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/submit", "/profile", "/moderation", "/admin", "/dashboard"]
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Auth routes (login/signup) - redirect to home if already logged in
  const authRoutes = ["/auth/login", "/auth/signup"]
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !userId) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && userId) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Note: Moderator/admin role checks are performed in the page-level
  // server components via getCurrentUser() + D1 profile query,
  // since D1 bindings are not available in edge middleware.

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
