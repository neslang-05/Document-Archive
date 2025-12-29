import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function StaticLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {children}
      </main>
      <Footer />
    </div>
  )
}
