import Link from "next/link"
import { FileText, Download, Star, Filter, Search } from "lucide-react"
import { HeaderServer } from "@/components/layout/header-server"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import { formatDate, formatNumber } from "@/lib/utils"
import type { ResourceCategory } from "@/types/database"

const categoryLabels: Record<string, string> = {
  question_paper: "Question Paper",
  notes: "Notes",
  lab_manual: "Lab Manual",
  project_report: "Project Report",
}

const categoryColors: Record<string, string> = {
  question_paper: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  notes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  lab_manual: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  project_report: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
}

type SearchParams = Promise<{ q?: string; category?: string; semester?: string }>

type ResourceWithCourse = {
  id: string
  title: string
  category: keyof typeof categoryLabels
  year: number
  download_count: number | null
  average_rating: number | null
  rating_count: number | null
  created_at: string
  courses: {
    id: string
    code: string
    name: string
    semester: number | null
  } | null
}

export default async function ResourcesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", category, semester } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("resources")
    .select(
      `id, title, category, year, download_count, average_rating, rating_count, created_at, courses!inner(id, code, name, semester)`
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  if (q) {
    query = query.ilike("title", `%${q}%`)
  }

  if (category) {
    query = query.eq("category", category as ResourceCategory)
  }

  if (semester) {
    query = query.eq("courses.semester", Number(semester))
  }

  const { data, error } = await query.limit(50)
  const resources: ResourceWithCourse[] = data || []
  const filtersApplied = Boolean(q || category || semester)

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderServer />
      <main className="flex-1">
        <section className="border-b bg-card/40">
          <div className="container mx-auto px-4 py-12 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-col lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-mono uppercase text-primary">Library</p>
                <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  Browse all approved question papers, notes, lab manuals, and project reports from the community.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Showing {resources.length} item{resources.length === 1 ? "" : "s"}
              </div>
            </div>

            <form className="grid gap-3 md:grid-cols-4" action="/resources" method="get">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    defaultValue={q}
                    placeholder="Search by title"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <select
                  name="category"
                  defaultValue={category || ""}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Semester</label>
                <select
                  name="semester"
                  defaultValue={semester || ""}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2 md:justify-end">
                <Button type="submit" className="w-full md:w-auto">
                  Apply filters
                </Button>
                {filtersApplied && (
                  <Button variant="ghost" className="w-full md:w-auto" asChild>
                    <Link href="/resources">Clear</Link>
                  </Button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          {error && (
            <Card className="mb-6 border-destructive/50 bg-destructive/5">
              <CardContent className="py-4 text-destructive">
                There was a problem loading resources. Please try again.
              </CardContent>
            </Card>
          )}

          {resources.length === 0 && !error && (
            <Card className="text-center">
              <CardContent className="space-y-4 py-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">No resources found</h2>
                  <p className="text-muted-foreground mt-1">
                    Try a different search or adjust the filters. You can also contribute a new resource.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Link href="/submit">
                    <Button className="gap-2">
                      <FileText className="h-4 w-4" />
                      Submit a resource
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline" className="gap-2">
                      Browse courses
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={categoryColors[resource.category]}
                      >
                        {categoryLabels[resource.category]}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">{resource.year}</span>
                      {resource.courses?.semester && (
                        <span className="text-xs text-muted-foreground">Semester {resource.courses.semester}</span>
                      )}
                    </div>
                    <Link href={`/resources/${resource.id}`} className="block">
                      <h3 className="text-lg font-semibold leading-tight hover:text-primary">
                        {resource.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {resource.courses && (
                        <Link
                          href={`/courses/${resource.courses.id}`}
                          className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 font-mono text-xs hover:text-foreground"
                        >
                          <span>{resource.courses.code}</span>
                          <span>•</span>
                          <span>{resource.courses.name}</span>
                        </Link>
                      )}
                      <span>Added {formatDate(resource.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground md:text-right md:flex-col md:items-end">
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span className="font-medium text-foreground">{formatNumber(resource.download_count || 0)}</span>
                      <span>downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-foreground">
                        {(resource.average_rating ?? 0).toFixed(1)}
                      </span>
                      <span>({resource.rating_count || 0})</span>
                    </div>
                    <Link href={`/resources/${resource.id}`}>
                      <Button variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        View resource
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
