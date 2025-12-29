"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { BookOpen, FileText, Search, Filter, ChevronDown } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Complete MTU B.Tech CSE Course Structure
const allCourses = [
  // Semester 1
  { code: "MA1101", name: "Linear Algebra", semester: 1, credits: 3, department: "MA", type: "SMC", resources: 12 },
  { code: "PH1101", name: "Optics and Modern Physics", semester: 1, credits: 3, department: "PH", type: "SMC", resources: 8 },
  { code: "CH1101", name: "Applied Chemistry", semester: 1, credits: 3, department: "CH", type: "SMC", resources: 10 },
  { code: "ME1103", name: "Foundations of Mechanical Engineering", semester: 1, credits: 3, department: "ME", type: "AEC", resources: 6 },
  { code: "CS1101", name: "Programming for Problem Solving", semester: 1, credits: 4, department: "CSE", type: "AEC", resources: 45 },
  { code: "HS1101", name: "Professional Communication", semester: 1, credits: 3, department: "HS", type: "HMC", resources: 15 },
  { code: "HS1102", name: "Design Thinking", semester: 1, credits: 1, department: "HS", type: "HMC", resources: 5 },
  { code: "EC1102", name: "Electronics and Computer Workshop", semester: 1, credits: 1, department: "ECE", type: "AEC", resources: 8 },
  
  // Semester 2
  { code: "MA1202", name: "Univariate Calculus", semester: 2, credits: 3, department: "MA", type: "SMC", resources: 14 },
  { code: "PH1203", name: "Semiconductor Physics and Electromagnetism", semester: 2, credits: 3, department: "PH", type: "SMC/AEC", resources: 11 },
  { code: "EE1201", name: "Basic Electrical Engineering", semester: 2, credits: 3, department: "EE", type: "AEC/SMC", resources: 18 },
  { code: "ME1204", name: "Engineering Graphics and Design", semester: 2, credits: 3, department: "ME", type: "AEC", resources: 22 },
  { code: "CE1203", name: "Engineering Mechanics", semester: 2, credits: 5, department: "CE", type: "AEC", resources: 16 },
  { code: "CS1202", name: "Introduction to Scientific Computational Tools", semester: 2, credits: 1, department: "CSE", type: "AEC", resources: 9 },
  
  // Semester 3
  { code: "MA2301", name: "Ordinary Differential Equations and Multivariate Calculus", semester: 3, credits: 3, department: "MA", type: "BSC", resources: 20 },
  { code: "MG2301", name: "Professional Laws, Ethics, Values and Harmony", semester: 3, credits: 0, department: "MG", type: "MLC", resources: 4 },
  { code: "HS2303", name: "Innovation and Creativity", semester: 3, credits: 1, department: "HS", type: "HSMC", resources: 6 },
  { code: "CS2303", name: "Development Tools Laboratory", semester: 3, credits: 2, department: "CSE", type: "SBC", resources: 12 },
  { code: "EE2312", name: "Feedback Control Systems", semester: 3, credits: 2, department: "EE", type: "IFC", resources: 8 },
  { code: "CS2304", name: "Data Structures and Algorithms – I", semester: 3, credits: 2, department: "CSE", type: "PCC", resources: 48 },
  { code: "CS2305", name: "Data Structures and Algorithms – I Laboratory", semester: 3, credits: 1, department: "CSE", type: "LC", resources: 15 },
  { code: "CS2306", name: "Digital Logic Design", semester: 3, credits: 3, department: "CSE", type: "PCC", resources: 32 },
  { code: "CS2307", name: "Digital Logic Design Laboratory", semester: 3, credits: 1, department: "CSE", type: "LC", resources: 10 },
  { code: "CS2308", name: "Discrete Structures and Graph Theory", semester: 3, credits: 3, department: "CSE", type: "PCC", resources: 28 },
  { code: "CS2309", name: "Principles of Programming Languages", semester: 3, credits: 3, department: "CSE", type: "PCC", resources: 25 },
  { code: "CS2310", name: "Principles of Programming Languages Laboratory", semester: 3, credits: 1, department: "CSE", type: "LC", resources: 8 },
  
  // Semester 4
  { code: "MA2403", name: "Vector Calculus and Partial Differential Equations", semester: 4, credits: 3, department: "MA", type: "BSC", resources: 18 },
  { code: "BI2401", name: "Biology for Engineers", semester: 4, credits: 3, department: "BI", type: "BSC", resources: 12 },
  { code: "CS2411", name: "Rapid Prototyping Practice Using Object Oriented Programming", semester: 4, credits: 2, department: "CSE", type: "SBC", resources: 20 },
  { code: "EC2408", name: "Sensors and Automation", semester: 4, credits: 2, department: "ECE", type: "IFC", resources: 9 },
  { code: "CS2412", name: "Theory of Computation", semester: 4, credits: 4, department: "CSE", type: "PCC", resources: 35 },
  { code: "CS2413", name: "Microprocessor Techniques", semester: 4, credits: 3, department: "CSE", type: "PCC", resources: 28 },
  { code: "CS2414", name: "Microprocessor Techniques Laboratory", semester: 4, credits: 1, department: "CSE", type: "LC", resources: 12 },
  { code: "CS2415", name: "Data Structures and Algorithms – II", semester: 4, credits: 2, department: "CSE", type: "PCC", resources: 42 },
  { code: "CS2416", name: "Data Structures and Algorithms – II Laboratory", semester: 4, credits: 1, department: "CSE", type: "LC", resources: 14 },
  { code: "CS2417", name: "Data Communication", semester: 4, credits: 3, department: "CSE", type: "PCC", resources: 22 },
  
  // Semester 5
  { code: "MA3501", name: "Probability and Statistics for Engineers", semester: 5, credits: 3, department: "MA", type: "BSC", resources: 25 },
  { code: "HS3505", name: "Constitution of India", semester: 5, credits: 0, department: "HS", type: "MLC", resources: 5 },
  { code: "MG3502", name: "Entrepreneurship Principles and Process", semester: 5, credits: 1, department: "MG", type: "HSMC", resources: 8 },
  { code: "HS3504", name: "English Language Proficiency", semester: 5, credits: 2, department: "HS", type: "HSMC", resources: 10 },
  { code: "CS3520", name: "Software Engineering: Mini Project – Stage 1", semester: 5, credits: 2, department: "CSE", type: "SBC", resources: 15 },
  { code: "ME3509", name: "Robotics", semester: 5, credits: 2, department: "ME", type: "IFC", resources: 12 },
  { code: "CS3521", name: "Computer Organization", semester: 5, credits: 3, department: "CSE", type: "PCC", resources: 38 },
  { code: "CS3522", name: "Database Management Systems", semester: 5, credits: 3, department: "CSE", type: "PCC", resources: 52 },
  { code: "CS3523", name: "Database Management Systems Laboratory", semester: 5, credits: 1, department: "CSE", type: "LC", resources: 18 },
  { code: "CS3524", name: "Artificial Intelligence", semester: 5, credits: 3, department: "CSE", type: "PCC", resources: 45 },
  { code: "CS3525", name: "Artificial Intelligence Laboratory", semester: 5, credits: 1, department: "CSE", type: "LC", resources: 14 },
  { code: "CS3526", name: "Computer Networks", semester: 5, credits: 3, department: "CSE", type: "PCC", resources: 40 },
  { code: "CS3527", name: "Computer Networks Laboratory", semester: 5, credits: 1, department: "CSE", type: "LC", resources: 12 },
  
  // Semester 6
  { code: "CE3632", name: "Environmental Studies", semester: 6, credits: 0, department: "CE", type: "MLC", resources: 6 },
  { code: "HS3606", name: "Engineering Economics", semester: 6, credits: 2, department: "HS", type: "HSMC", resources: 14 },
  { code: "CS3634", name: "Software Engineering: Mini Project – Stage II", semester: 6, credits: 3, department: "CSE", type: "SBC", resources: 18 },
  { code: "CS3635", name: "Introduction to Artificial Intelligence (IOC)", semester: 6, credits: 2, department: "CSE", type: "IOC", resources: 10 },
  { code: "CS3644", name: "Computer Graphics", semester: 6, credits: 3, department: "CSE", type: "DEC", resources: 28 },
  { code: "CS3645", name: "Computer Graphics Laboratory", semester: 6, credits: 1, department: "CSE", type: "LC", resources: 10 },
  { code: "CS3636", name: "Operating Systems", semester: 6, credits: 3, department: "CSE", type: "PCC", resources: 48 },
  { code: "CS3637", name: "Operating Systems Laboratory", semester: 6, credits: 1, department: "CSE", type: "LC", resources: 16 },
  { code: "CS3638", name: "Design and Analysis of Algorithms", semester: 6, credits: 4, department: "CSE", type: "PCC", resources: 55 },
  { code: "CS3639", name: "Data Science", semester: 6, credits: 3, department: "CSE", type: "PCC", resources: 32 },
  { code: "CS3640", name: "Data Science Laboratory", semester: 6, credits: 1, department: "CSE", type: "LC", resources: 12 },
  
  // Semester 7
  { code: "HS4712", name: "Intellectual Property Rights", semester: 7, credits: 0, department: "HS", type: "MLC", resources: 5 },
  { code: "HS47XX", name: "Liberal Learning Course", semester: 7, credits: 1, department: "HS", type: "LLC", resources: 4 },
  { code: "MG4703", name: "Business Management (IOC-II)", semester: 7, credits: 2, department: "MG", type: "IOC", resources: 8 },
  { code: "CS4746", name: "Compiler Construction", semester: 7, credits: 3, department: "CSE", type: "PCC", resources: 35 },
  { code: "CS4747", name: "Compiler Construction Laboratory", semester: 7, credits: 1, department: "CSE", type: "LC", resources: 12 },
  { code: "CS4748", name: "Cryptography and Network Security", semester: 7, credits: 3, department: "CSE", type: "PCC", resources: 30 },
  { code: "CS4749", name: "Cryptography and Network Security Laboratory", semester: 7, credits: 1, department: "CSE", type: "LC", resources: 10 },
  { code: "CS4751", name: "Cloud and Big Data", semester: 7, credits: 3, department: "CSE", type: "DEC", resources: 25 },
  { code: "CS4771", name: "Natural Language Processing", semester: 7, credits: 3, department: "CSE", type: "DEC", resources: 22 },
  { code: "CS4772", name: "Natural Language Processing Laboratory", semester: 7, credits: 1, department: "CSE", type: "LC", resources: 8 },
  
  // Semester 8
  { code: "DEC-IV", name: "Departmental Elective IV", semester: 8, credits: 3, department: "CSE", type: "DEC", resources: 0 },
  { code: "DEC-IV-LAB", name: "Departmental Elective IV Laboratory", semester: 8, credits: 1, department: "CSE", type: "DEC", resources: 0 },
  { code: "CS4873", name: "Project", semester: 8, credits: 8, department: "CSE", type: "SBC", resources: 20 },
]

const courseTypeColors: Record<string, string> = {
  PCC: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  LC: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  SBC: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  DEC: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  SMC: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  BSC: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  AEC: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  HMC: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  HSMC: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  IFC: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  IOC: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  MLC: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  LLC: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
}

export default function CoursesPage() {
  const searchParams = useSearchParams()
  const initialSemester = searchParams.get("semester")
  
  const [selectedSemester, setSelectedSemester] = useState<string>(initialSemester || "all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filteredCourses = allCourses.filter((course) => {
    const matchesSemester = selectedSemester === "all" || course.semester === parseInt(selectedSemester)
    const matchesDepartment = selectedDepartment === "all" || course.department === selectedDepartment
    const matchesSearch = 
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSemester && matchesDepartment && matchesSearch
  })

  const groupedBySemester = filteredCourses.reduce((acc, course) => {
    const sem = course.semester
    if (!acc[sem]) acc[sem] = []
    acc[sem].push(course)
    return acc
  }, {} as Record<number, typeof allCourses>)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:block w-64 border-r bg-card">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 px-3 py-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Filters</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                  <SelectItem value="MA">Mathematics (MA)</SelectItem>
                  <SelectItem value="PH">Physics (PH)</SelectItem>
                  <SelectItem value="CH">Chemistry (CH)</SelectItem>
                  <SelectItem value="EE">Electrical (EE)</SelectItem>
                  <SelectItem value="ECE">Electronics (ECE)</SelectItem>
                  <SelectItem value="ME">Mechanical (ME)</SelectItem>
                  <SelectItem value="CE">Civil (CE)</SelectItem>
                  <SelectItem value="HS">Humanities (HS)</SelectItem>
                  <SelectItem value="MG">Management (MG)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[{ label: "Courses" }]}
            className="mb-6"
          />

          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Course Catalog
              </h1>
              <p className="text-muted-foreground mt-1">
                MTU B.Tech CSE Course Structure • {filteredCourses.length} courses
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showMobileFilters ? "rotate-180" : ""}`} />
            </Button>
            
            {showMobileFilters && (
              <div className="mt-2 p-4 border rounded-lg bg-card space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                      <SelectItem value="MA">Mathematics (MA)</SelectItem>
                      <SelectItem value="PH">Physics (PH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Course List */}
          <div className="space-y-8">
            {Object.entries(groupedBySemester)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([semester, courses]) => (
                <div key={semester}>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-sm font-mono">
                      Sem {semester}
                    </span>
                    <span className="text-muted-foreground text-sm font-normal">
                      {courses.length} courses
                    </span>
                  </h2>
                  
                  <div className="grid gap-3">
                    {courses.map((course) => (
                      <Link key={course.code} href={`/courses/${course.code}`}>
                        <Card className="hover:border-primary/50 transition-colors">
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <BookOpen className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                                    {course.code}
                                  </span>
                                  <Badge 
                                    variant="secondary" 
                                    className={courseTypeColors[course.type] || courseTypeColors.PCC}
                                  >
                                    {course.type}
                                  </Badge>
                                </div>
                                <h3 className="font-medium mt-1">{course.name}</h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <span className="hidden sm:inline-flex items-center gap-1">
                                Credits: <span className="font-mono">{course.credits}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {course.resources}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
