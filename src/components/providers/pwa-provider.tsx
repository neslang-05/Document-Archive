"use client"

import { useEffect } from "react"

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Defer service worker registration to avoid blocking main thread
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      // Use requestIdleCallback if available, otherwise setTimeout
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration.scope)
          })
          .catch((error) => {
            console.log("SW registration failed: ", error)
          })
      }

      if ('requestIdleCallback' in window) {
        (window as typeof window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(registerSW)
      } else {
        setTimeout(registerSW, 1000)
      }
    }
  }, [])

  return <>{children}</>
}
