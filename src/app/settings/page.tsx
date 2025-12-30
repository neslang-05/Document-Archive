import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"
import { HeaderServer } from "@/components/layout/header-server"
import { Footer } from "@/components/layout/footer"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderServer />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          <ProfileForm user={profile} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
