"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Book,
  FileText,
  Download,
  Star,
  Search,
  ChevronLeft,
  Clock,
  Plus,
  GraduationCap,
  Users
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate, formatNumber } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
type Course = {
  id: string
  code: string
  name: string
  semester?: number
  credits?: number | null
  department_id?: string
  description?: string | null
  departments?: { code: string; name: string } | null
}

type Resource = {
  id: string
  title: string
  category?: string | null
  exam_type?: string | null
  year?: number | null
  created_at?: string | null
  download_count?: number | null
  average_rating?: number | null
  courses?: { code?: string | null; name?: string | null } | null
  uploader_id?: string | null
}

const categoryLabels: Record<string, string> = {
  question_paper: "Question Paper",
  notes: "Notes",
  lab_manual: "Lab Manual",
  project_report: "Project Report",
}

const examTypeLabels: Record<string, string> = {
  mid_term: "Mid-Term",
  end_term: "End-Term",
  quiz: "Quiz",
  assignment: "Assignment",
  other: "Other",
}

const categoryColors: Record<string, string> = {
  question_paper: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  notes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  lab_manual: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  project_report: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
}

export default function CoursePage() {
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [course, setCourse] = useState<Course | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const supabase = createClient()
        const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id
        if (!rawId) {
          setError("Course not found")
          setIsLoading(false)
          return
        }

        const courseId = decodeURIComponent(rawId)
        const selectColumns = "id, code, name, semester, credits, department_id, description, departments(code, name)"

        const { data: courseExact } = await supabase
          .from("courses")
          .select(selectColumns)
          .or(`id.eq.${courseId},code.eq.${courseId}`)
          .maybeSingle()

        let courseData = courseExact

        if (!courseData) {
          const { data: courseByCode } = await supabase
            .from("courses")
            .select(selectColumns)
            .ilike("code", courseId)
            .maybeSingle()

          courseData = courseByCode || null
        }

        if (!courseData) {
          // Fallback: show a lightweight page using the URL code
          const fallbackCourse: Course = {
            id: courseId,
            code: courseId.toUpperCase(),
            name: courseId.toUpperCase(),
            description: "Resources for this course will appear here.",
          }
          setCourse(fallbackCourse)
          setResources([])
          setIsLoading(false)
          return
        }

        const courseIdValue = courseData.id ?? courseData.code ?? courseId

        const { data: resourceData, error: resourceErr } = await supabase
          .from("resources")
          .select("id, title, category, exam_type, year, created_at, download_count, average_rating, uploader_id, courses(code,name)")
          .eq("course_id", courseIdValue)
          .eq("status", "approved")
          .order("created_at", { ascending: false })

        if (resourceErr) {
          setError("Unable to load resources")
        }

        setCourse(courseData as Course)
        setResources((resourceData || []) as Resource[])
      } catch {
        setError("Something went wrong")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params?.id])

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => {
        const title = resource.title || ""
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter
        const yearValue = resource.year ?? null
        const matchesYear =
          yearFilter === "all" || (yearValue !== null && yearValue !== undefined && yearValue.toString() === yearFilter)
        return matchesSearch && matchesCategory && matchesYear
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "rating":
            return (b.average_rating ?? 0) - (a.average_rating ?? 0)
          case "downloads":
            return (b.download_count ?? 0) - (a.download_count ?? 0)
          case "recent":
          default:
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        }
      })
  }, [resources, searchQuery, categoryFilter, yearFilter, sortBy])

  const uniqueYears = useMemo(
    () => [...new Set(resources.map((r) => r.year).filter((y): y is number => y != null))].sort((a, b) => b - a),
    [resources]
  )

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10 text-muted-foreground">
          Loading course...
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl font-bold mb-2">Course not found</h1>
          <p className="text-muted-foreground mb-4">Please check the course link or go back to courses.</p>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const resourceCount = resources.length
  const contributorCount = new Set(resources.map((r) => r.uploader_id).filter(Boolean)).size
  const departmentName = course.departments?.name || "Unknown Department"

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs
            items={[
              { label: "Courses", href: "/courses" },
              { label: course.code },
            ]}
          />

          {/* Back Link */}
          <Link
            href="/courses"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>

          {/* Course Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-lg font-bold bg-muted px-3 py-1 rounded">
                      {course.code}
                    </span>
                    {course.semester && (
                      <Badge variant="secondary">Semester {course.semester}</Badge>
                    )}
                    {course.credits && (
                      <Badge variant="secondary">{course.credits} Credits</Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
                  <p className="text-muted-foreground max-w-3xl">
                    {course.description || "No description available."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                  <Link href="/submit">
                    <Button className="gap-2 w-full">
                      <Plus className="h-4 w-4" />
                      Add Resource
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium text-foreground">{resourceCount}</span>
                  Resources
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span className="font-medium text-foreground">{contributorCount}</span>
                  Contributors
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-medium text-foreground">{departmentName}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Sidebar - Syllabus */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Book className="h-4 w-4" />
                    Course Syllabus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {course.description ? (
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Course description coming soon.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Resources */}
            <div className="lg:col-span-3 space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search resources..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="question_paper">Question Papers</SelectItem>
                          <SelectItem value="notes">Notes</SelectItem>
                          <SelectItem value="lab_manual">Lab Manuals</SelectItem>
                          <SelectItem value="project_report">Projects</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          {uniqueYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="downloads">Most Downloaded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource List */}
              {filteredResources.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No resources found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || categoryFilter !== "all" || yearFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Be the first to contribute!"}
                    </p>
                    <Link href="/submit">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Resource
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""}
                  </p>
                  {filteredResources.map((resource) => {
                    const category = resource.category || "question_paper"
                    const examType = resource.exam_type || null
                    const rating = resource.average_rating ?? 0
                    const downloads = resource.download_count ?? 0
                    const year = resource.year ?? ""
                    const uploaderLabel = resource.uploader_id ? "Contributor" : "Unknown"
                    const createdAt = resource.created_at || new Date().toISOString()

                    return (
                      <Link key={resource.id} href={`/resources/${resource.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge
                                  variant="secondary"
                                  className={categoryColors[category] || categoryColors.question_paper}
                                >
                                  {categoryLabels[category] || category}
                                </Badge>
                                {examType && (
                                  <Badge variant="outline">
                                    {examTypeLabels[examType] || examType.replace("_", " ")}
                                  </Badge>
                                )}
                                {year && (
                                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                    {year}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold">{resource.title}</h3>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>by {uploaderLabel}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                {renderStars(Math.round(rating))}
                                <span className="ml-1 font-medium">
                                  {rating.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Download className="h-4 w-4" />
                                {formatNumber(downloads)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
