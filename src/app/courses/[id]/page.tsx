"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Book,
  FileText,
  Download,
  Star,
  Search,
  Filter,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate, formatNumber } from "@/lib/utils"

// Mock course data
const mockCourse = {
  id: "cs3522",
  code: "CS3522",
  name: "Database Management Systems",
  semester: 5,
  credits: 4,
  courseType: "PCC",
  department: "Computer Science",
  description: "This course covers the fundamentals of database systems including data models, relational database design, SQL, transaction processing, concurrency control, and database recovery.",
  syllabus: [
    "Unit 1: Introduction to DBMS, Data Models, ER Model",
    "Unit 2: Relational Model, Relational Algebra",
    "Unit 3: SQL - DDL, DML, DCL, Constraints, Joins",
    "Unit 4: Normalization - 1NF, 2NF, 3NF, BCNF",
    "Unit 5: Transaction Processing, ACID Properties",
    "Unit 6: Concurrency Control, Locking Protocols",
    "Unit 7: Database Recovery, Backup Strategies",
    "Unit 8: NoSQL Databases, MongoDB Basics",
  ],
  resourceCount: 24,
  contributorCount: 12,
}

// Mock resources
const mockResources = [
  {
    id: "1",
    title: "DBMS End-Term 2024",
    category: "question_paper",
    examType: "end_term",
    year: 2024,
    uploader: "Rahul S.",
    uploadedAt: "2024-12-20T10:30:00Z",
    rating: 4.5,
    ratingCount: 23,
    downloads: 156,
    views: 342,
  },
  {
    id: "2",
    title: "DBMS Mid-Term 2024",
    category: "question_paper",
    examType: "mid_term",
    year: 2024,
    uploader: "Priya K.",
    uploadedAt: "2024-10-15T14:20:00Z",
    rating: 4.2,
    ratingCount: 18,
    downloads: 134,
    views: 289,
  },
  {
    id: "3",
    title: "Complete DBMS Notes Unit 1-8",
    category: "notes",
    examType: null,
    year: 2024,
    uploader: "Amit G.",
    uploadedAt: "2024-09-01T09:00:00Z",
    rating: 4.8,
    ratingCount: 45,
    downloads: 312,
    views: 567,
  },
  {
    id: "4",
    title: "SQL Lab Manual",
    category: "lab_manual",
    examType: null,
    year: 2024,
    uploader: "Neha D.",
    uploadedAt: "2024-08-20T11:30:00Z",
    rating: 4.3,
    ratingCount: 28,
    downloads: 189,
    views: 423,
  },
  {
    id: "5",
    title: "DBMS End-Term 2023",
    category: "question_paper",
    examType: "end_term",
    year: 2023,
    uploader: "Rahul S.",
    uploadedAt: "2024-01-05T16:45:00Z",
    rating: 4.1,
    ratingCount: 34,
    downloads: 267,
    views: 512,
  },
  {
    id: "6",
    title: "ER Diagram Project Report",
    category: "project_report",
    examType: null,
    year: 2024,
    uploader: "Team Alpha",
    uploadedAt: "2024-11-28T13:15:00Z",
    rating: 4.0,
    ratingCount: 12,
    downloads: 78,
    views: 145,
  },
]

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

const courseTypeLabels: Record<string, string> = {
  PCC: "Professional Core Course",
  LC: "Lab Course",
  SEC: "Skill Enhancement Course",
  OEC: "Open Elective Course",
  PEC: "Professional Elective Course",
  BSC: "Basic Science Course",
  ESC: "Engineering Science Course",
  HSMC: "Humanities & Social Science",
}

export default function CoursePage() {
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const course = mockCourse
  const resources = mockResources

  // Filter and sort resources
  const filteredResources = resources
    .filter((resource) => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter
      const matchesYear = yearFilter === "all" || resource.year.toString() === yearFilter
      return matchesSearch && matchesCategory && matchesYear
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "downloads":
          return b.downloads - a.downloads
        case "recent":
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      }
    })

  const uniqueYears = [...new Set(resources.map((r) => r.year))].sort((a, b) => b - a)

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <Breadcrumbs
            items={[
              { label: "Courses", href: "/courses" },
              { label: course.code },
            ]}
            className="mb-6"
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
                    <Badge variant="outline">{course.courseType}</Badge>
                    <Badge variant="secondary">Semester {course.semester}</Badge>
                    <Badge variant="secondary">{course.credits} Credits</Badge>
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
                  <p className="text-muted-foreground max-w-3xl">
                    {course.description}
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
                  <span className="font-medium text-foreground">{course.resourceCount}</span>
                  Resources
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span className="font-medium text-foreground">{course.contributorCount}</span>
                  Contributors
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-medium text-foreground">{course.department}</span>
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
                  <ul className="space-y-2 text-sm">
                    {course.syllabus.map((unit, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        {unit}
                      </li>
                    ))}
                  </ul>
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
                        <SelectTrigger className="w-[140px]">
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
                        <SelectTrigger className="w-[100px]">
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
                        <SelectTrigger className="w-[130px]">
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
                  {filteredResources.map((resource) => (
                    <Link key={resource.id} href={`/resources/${resource.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge
                                  variant="secondary"
                                  className={categoryColors[resource.category]}
                                >
                                  {categoryLabels[resource.category]}
                                </Badge>
                                {resource.examType && (
                                  <Badge variant="outline">
                                    {examTypeLabels[resource.examType]}
                                  </Badge>
                                )}
                                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {resource.year}
                                </span>
                              </div>
                              <h3 className="font-semibold">{resource.title}</h3>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>by {resource.uploader}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(resource.uploadedAt)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                {renderStars(Math.round(resource.rating))}
                                <span className="ml-1 font-medium">
                                  {resource.rating.toFixed(1)}
                                </span>
                                <span className="text-muted-foreground">
                                  ({resource.ratingCount})
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Download className="h-4 w-4" />
                                {formatNumber(resource.downloads)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
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
