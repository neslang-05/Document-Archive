import { getCurrentUser } from "@/lib/auth/session"
import { getD1 } from "@/lib/db/d1"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, Building2, BookOpen, Users, FileText, BarChart } from "lucide-react"
import { HeaderServer } from "@/components/layout/header-server"
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
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

  if (currentUser.profile.role !== "admin") {
    redirect("/dashboard")
  }

  const db = getD1()

  // Fetch stats
  const [deptCount, courseCount, userCount, resourceCount, pendingCount] = await Promise.all([
    db.prepare("SELECT COUNT(*) as count FROM departments").first<{ count: number }>(),
    db.prepare("SELECT COUNT(*) as count FROM courses").first<{ count: number }>(),
    db.prepare("SELECT COUNT(*) as count FROM profiles").first<{ count: number }>(),
    db.prepare("SELECT COUNT(*) as count FROM resources").first<{ count: number }>(),
    db.prepare("SELECT COUNT(*) as count FROM resources WHERE status = 'pending'").first<{ count: number }>(),
  ])

  const departmentCount = deptCount?.count ?? 0
  const totalCourseCount = courseCount?.count ?? 0
  const totalUserCount = userCount?.count ?? 0
  const totalResourceCount = resourceCount?.count ?? 0
  const totalPendingCount = pendingCount?.count ?? 0

  // Fetch departments
  const { results: departments } = await db
    .prepare("SELECT id, code, name, description FROM departments ORDER BY code")
    .all()

  // Fetch courses with department join
  const { results: courses } = await db
    .prepare(`
      SELECT c.*, d.code as dept_code, d.name as dept_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      ORDER BY c.code
    `)
    .all()

  // Transform courses to include departments nested object for CourseManager
  const coursesWithDepts = (courses || []).map((c: Record<string, unknown>) => ({
    ...c,
    departments: c.dept_code ? { code: c.dept_code as string, name: c.dept_name as string } : null,
  }))

  // Fetch users (last 50)
  const { results: users } = await db
    .prepare("SELECT * FROM profiles ORDER BY created_at DESC LIMIT 50")
    .all()

  const stats = [
    { label: "Departments", value: departmentCount, icon: Building2 },
    { label: "Courses", value: totalCourseCount, icon: BookOpen },
    { label: "Users", value: totalUserCount, icon: Users },
    { label: "Resources", value: totalResourceCount, icon: FileText },
    { label: "Pending", value: totalPendingCount, icon: BarChart },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderServer />
      
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
                {(totalPendingCount) > 0 && (
                  <Badge variant="secondary">{totalPendingCount}</Badge>
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
              <DepartmentManager departments={(departments || []) as any[]} />
            </TabsContent>

            <TabsContent value="courses">
              <CourseManager courses={coursesWithDepts as any[]} departments={(departments || []) as any[]} />
            </TabsContent>

            <TabsContent value="users">
              <UserManager users={(users || []) as any[]} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
