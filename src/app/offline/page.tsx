"use client"

import Link from "next/link"
import { WifiOff, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>
        <p className="text-muted-foreground mb-8">
          It looks like you&apos;ve lost your internet connection. Some features may not be available until you&apos;re back online.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Tip: Previously viewed resources may still be available from cache.
        </p>
      </div>
    </div>
  )
}
