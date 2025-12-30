import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function HomeLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Static header skeleton for immediate display */}
      <header className="sticky top-0 z-50 w-full border-b bg-header-bg text-header-foreground">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="h-8 w-8 rounded bg-white/10 animate-pulse" />
            <div className="hidden sm:block h-5 w-24 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="flex-1 max-w-xl mx-4">
            <div className="h-10 w-full rounded bg-white/10 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
            <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section Skeleton */}
        <section className="relative overflow-hidden bg-linear-to-b from-header-bg to-background py-20 text-white">
          <div className="container relative mx-auto px-4 text-center">
            <div className="h-12 w-96 mx-auto rounded bg-white/10 animate-pulse" />
            <div className="mx-auto mt-6 max-w-2xl">
              <div className="h-6 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-6 w-3/4 mx-auto mt-2 rounded bg-white/10 animate-pulse" />
            </div>
            <div className="mx-auto mt-8 max-w-xl">
              <div className="h-12 w-full rounded bg-white/20 animate-pulse" />
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <div className="h-10 w-36 rounded bg-white/10 animate-pulse" />
              <div className="h-10 w-36 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Stats Section Skeleton */}
        <section className="border-b bg-card py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto h-8 w-8 rounded bg-muted animate-pulse" />
                  <div className="mt-2 h-8 w-16 mx-auto rounded bg-muted animate-pulse" />
                  <div className="mt-1 h-4 w-20 mx-auto rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section Skeleton */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="h-7 w-40 rounded bg-muted animate-pulse" />
                <div className="h-5 w-56 rounded bg-muted animate-pulse mt-1" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-16 rounded bg-muted animate-pulse" />
                      <div className="h-5 w-12 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-6 w-full rounded bg-muted animate-pulse mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer variant="default" />
    </div>
  )
}
