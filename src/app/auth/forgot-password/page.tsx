"use client"

import { useState, useCallback } from "react"
import { auth, sendPasswordResetEmail } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TurnstileWidget } from "@/components/ui/turnstile"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    if (!turnstileToken) {
      setError("Please complete the verification challenge")
      setLoading(false)
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage("Check your email for the password reset link")
    } catch (err) {
      const firebaseError = err as { message?: string }
      setError(firebaseError.message || "Failed to send reset email")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <TurnstileWidget onVerify={handleTurnstileVerify} className="flex justify-center" />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending link..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="text-center">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
