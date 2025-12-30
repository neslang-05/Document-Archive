import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, Building2, BookOpen, Users, FileText, BarChart } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatNumber } from "@/lib/utils"
import { DepartmentManager } from "./department-manager"
import { CourseManager } from "./course-manager"
import { UserManager } from "./user-manager"

export default async function AdminPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch stats
  const [
    { count: departmentCount },
    { count: courseCount },
    { count: userCount },
    { count: resourceCount },
    { count: pendingCount },
  ] = await Promise.all([
    supabase.from("departments").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("resources").select("*", { count: "exact", head: true }),
    supabase.from("resources").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ])

  // Fetch departments for course manager
  const { data: departments } = await supabase
    .from("departments")
    .select("id, code, name")
    .order("code")

  // Fetch courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*, departments(code, name)")
    .order("code")

  // Fetch users
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  const stats = [
    { label: "Departments", value: departmentCount || 0, icon: Building2 },
    { label: "Courses", value: courseCount || 0, icon: BookOpen },
    { label: "Users", value: userCount || 0, icon: Users },
    { label: "Resources", value: resourceCount || 0, icon: FileText },
    { label: "Pending", value: pendingCount || 0, icon: BarChart },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumbs
            items={[{ label: "Admin" }]}
            className="mb-6"
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage departments, courses, and users
              </p>
            </div>
            <Link href="/moderation">
              <Button variant="outline" className="gap-2">
                <Shield className="h-4 w-4" />
                Moderation Queue
                {(pendingCount ?? 0) > 0 && (
                  <Badge variant="secondary">{pendingCount}</Badge>
                )}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className="h-8 w-8 text-primary/70" />
                  <div>
                    <p className="text-2xl font-bold">{formatNumber(stat.value)}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="departments">
            <TabsList className="mb-4">
              <TabsTrigger value="departments" className="gap-2">
                <Building2 className="h-4 w-4" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="departments">
              <DepartmentManager departments={departments || []} />
            </TabsContent>

            <TabsContent value="courses">
              <CourseManager courses={courses || []} departments={departments || []} />
            </TabsContent>

            <TabsContent value="users">
              <UserManager users={users || []} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
