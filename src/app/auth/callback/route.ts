import { NextResponse } from "next/server"

/**
 * OAuth callback handler.
 * With Firebase Auth, OAuth is handled client-side via popup/redirect.
 * This route now simply redirects to the dashboard.
 * The actual session cookie is set by the client calling /auth/session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get("next") ?? "/dashboard"

  return NextResponse.redirect(`${origin}${next}`)
}
