"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  className?: string
}

/**
 * Cloudflare Turnstile widget component.
 * Renders the CAPTCHA challenge and returns the verification token.
 */
export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!loaded || !containerRef.current || !SITE_KEY) return

    const turnstile = (window as unknown as Record<string, TurnstileAPI>).turnstile
    if (!turnstile) return

    // Clean up previous widget
    if (widgetIdRef.current) {
      turnstile.remove(widgetIdRef.current)
    }

    widgetIdRef.current = turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: onVerify,
      "expired-callback": onExpire,
      "error-callback": onError,
      theme: "auto",
    })

    return () => {
      if (widgetIdRef.current) {
        turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [loaded, onVerify, onExpire, onError])

  if (!SITE_KEY) {
    // Don't render in development when not configured
    return null
  }

  return (
    <>
      <Script
        id="turnstile-script"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onLoad={() => {
          setLoaded(true)
        }}
      />
      <div ref={containerRef} className={className} />
    </>
  )
}

interface TurnstileAPI {
  render(
    container: HTMLElement,
    options: {
      sitekey: string
      callback: (token: string) => void
      "expired-callback"?: () => void
      "error-callback"?: () => void
      theme?: "auto" | "light" | "dark"
    }
  ): string
  remove(widgetId: string): void
  reset(widgetId: string): void
}
