"use client"

import { useEffect, useState, useCallback, useSyncExternalStore } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Helper to check if running in browser
const isBrowser = typeof window !== 'undefined'

// External store for online status
function subscribeToOnlineStatus(callback: () => void) {
  if (!isBrowser) return () => {}
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

function getOnlineStatusSnapshot() {
  return isBrowser ? navigator.onLine : true
}

function getOnlineStatusServerSnapshot() {
  return true
}

export function useServiceWorker() {
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineStatusSnapshot,
    getOnlineStatusServerSnapshot
  )
  
  const [isInstalled, setIsInstalled] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if already installed - deferred to avoid sync setState
    if (!isBrowser) return
    
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true)
      }
    }
    
    // Use requestIdleCallback or setTimeout to defer
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(checkInstalled)
    } else {
      setTimeout(checkInstalled, 0)
    }
  }, [])

  useEffect(() => {
    // Register service worker
    if (isBrowser && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setRegistration(reg)
          console.log("Service Worker registered:", reg.scope)

          // Check for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content available
                  console.log("New content available, refresh to update")
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }
  }, [])

  useEffect(() => {
    if (!isBrowser) return

    // Handle install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstalled(true)
    }

    setInstallPrompt(null)
    return outcome === "accepted"
  }, [installPrompt])

  const update = useCallback(async () => {
    if (registration) {
      await registration.update()
    }
  }, [registration])

  return {
    isInstalled,
    isOnline,
    canInstall: !!installPrompt,
    promptInstall,
    update,
  }
}
