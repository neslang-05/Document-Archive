import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  // Clear the session cookie
  const cookieStore = await cookies()
  cookieStore.set("__session", "", { maxAge: 0, path: "/" })

  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
}
