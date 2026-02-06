/**
 * Cloudflare Turnstile verification helper.
 *
 * Client-side: Render the Turnstile widget to obtain a token.
 * Server-side: Verify the token before processing sensitive actions.
 */

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || ""
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export interface TurnstileVerifyResult {
  success: boolean
  "error-codes": string[]
  challenge_ts?: string
  hostname?: string
}

/**
 * Verify a Turnstile token on the server side.
 * Call this before processing login, signup, password reset, or file submission.
 *
 * @param token - The Turnstile token from the client widget
 * @param remoteIp - Optional client IP for additional validation
 * @returns true if the token is valid
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn("Turnstile secret key not configured, skipping verification")
    return true // Allow in development when not configured
  }

  try {
    const formData = new URLSearchParams()
    formData.append("secret", TURNSTILE_SECRET_KEY)
    formData.append("response", token)
    if (remoteIp) {
      formData.append("remoteip", remoteIp)
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    })

    const result: TurnstileVerifyResult = await response.json()
    return result.success
  } catch (error) {
    console.error("Turnstile verification failed:", error)
    return false
  }
}
