import Link from "next/link"
import { ArrowLeft, Home, Search } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
              <p className="mt-3 text-muted-foreground">
                We could not find what you were looking for. It may have been moved or removed.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/">
                <Button className="gap-2">
                  <Home className="h-4 w-4" />
                  Go home
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  Search resources
                </Button>
              </Link>
              <Link href="/submit">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Submit a resource
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
