import Link from "next/link"
import { 
  BookOpen, 
  FileText, 
  Download, 
  Star, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Search,
  Upload
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// Mock data for demonstration
const stats = [
  { label: "Resources", value: "2,500+", icon: FileText },
  { label: "Downloads", value: "50,000+", icon: Download },
  { label: "Contributors", value: "150+", icon: Users },
  { label: "Courses", value: "80+", icon: BookOpen },
]

const featuredCourses = [
  {
    code: "CS3522",
    name: "Database Management Systems",
    semester: 5,
    resourceCount: 45,
    department: "CSE",
  },
  {
    code: "CS3524",
    name: "Artificial Intelligence",
    semester: 5,
    resourceCount: 38,
    department: "CSE",
  },
  {
    code: "CS3638",
    name: "Design and Analysis of Algorithms",
    semester: 6,
    resourceCount: 52,
    department: "CSE",
  },
  {
    code: "CS4748",
    name: "Cryptography and Network Security",
    semester: 7,
    resourceCount: 28,
    department: "CSE",
  },
]

const recentResources = [
  {
    id: "1",
    title: "DBMS End-Term 2024",
    course: "CS3522",
    category: "question_paper",
    examType: "end_term",
    year: 2024,
    downloads: 234,
    rating: 4.5,
  },
  {
    id: "2",
    title: "AI Complete Notes",
    course: "CS3524",
    category: "notes",
    examType: null,
    year: 2024,
    downloads: 189,
    rating: 4.8,
  },
  {
    id: "3",
    title: "OS Lab Manual",
    course: "CS3636",
    category: "lab_manual",
    examType: null,
    year: 2024,
    downloads: 156,
    rating: 4.3,
  },
]

const categoryColors: Record<string, string> = {
  question_paper: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  notes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  lab_manual: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  project_report: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
}

const categoryLabels: Record<string, string> = {
  question_paper: "Question Paper",
  notes: "Notes",
  lab_manual: "Lab Manual",
  project_report: "Project Report",
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-header-bg to-background py-20 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="container relative mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              MTU Academic Archive
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
              A community-driven platform for B.Tech CSE students at Manipur Technical University. 
              Access question papers, notes, lab manuals, and more.
            </p>
            
            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-xl">
              <form className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for courses, resources, question papers..."
                  className="h-12 pl-12 pr-4 text-foreground bg-white shadow-lg"
                />
              </form>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/courses">
                <Button size="lg" className="gap-2">
                  <BookOpen className="h-5 w-5" />
                  Browse Courses
                </Button>
              </Link>
              <Link href="/submit">
                <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Upload className="h-5 w-5" />
                  Upload Resource
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-card py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto h-8 w-8 text-primary" />
                  <div className="mt-2 text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Popular Courses</h2>
                <p className="text-muted-foreground mt-1">
                  Most accessed courses by students
                </p>
              </div>
              <Link href="/courses">
                <Button variant="ghost" className="gap-2">
                  View all courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {featuredCourses.map((course) => (
                <Link key={course.code} href={`/courses/${course.code}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                          {course.code}
                        </span>
                        <Badge variant="secondary">Sem {course.semester}</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {course.resourceCount} resources
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Resources */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Recent Uploads
                </h2>
                <p className="text-muted-foreground mt-1">
                  Latest resources added by the community
                </p>
              </div>
              <Link href="/resources">
                <Button variant="ghost" className="gap-2">
                  View all resources
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-4">
              {recentResources.map((resource) => (
                <Link key={resource.id} href={`/resources/${resource.id}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{resource.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs text-muted-foreground">
                              {resource.course}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={categoryColors[resource.category]}
                            >
                              {categoryLabels[resource.category]}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                              {resource.year}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {resource.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {resource.rating}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Semester Quick Links */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Browse by Semester
            </h2>
            <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                <Link key={semester} href={`/courses?semester=${semester}`}>
                  <Card className="text-center hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary">{semester}</div>
                      <div className="text-xs text-muted-foreground mt-1">Semester</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Contribute to the Archive</h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Help your fellow students by sharing your notes, question papers, and resources. 
              Every contribution makes a difference!
            </p>
            <Link href="/submit">
              <Button size="lg" variant="secondary" className="mt-8 gap-2">
                <Upload className="h-5 w-5" />
                Upload a Resource
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
