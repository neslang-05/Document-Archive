import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 container mx-auto px-4 py-6 gap-6">
        <aside className="hidden md:block">
          <DashboardSidebar />
        </aside>
        <main className="flex-1 overflow-hidden rounded-lg border bg-card shadow-sm">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}
