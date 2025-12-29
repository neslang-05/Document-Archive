"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Plus, 
  Building2, 
  BookOpen, 
  Pencil, 
  Trash2, 
  Save,
  X,
  Shield,
  Loader2
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data - would be fetched from Supabase
const mockDepartments = [
  { id: "1", code: "CSE", name: "Computer Science and Engineering", description: "Department of Computer Science and Engineering" },
  { id: "2", code: "ECE", name: "Electronics and Communication Engineering", description: "Department of Electronics and Communication Engineering" },
  { id: "3", code: "EE", name: "Electrical Engineering", description: "Department of Electrical Engineering" },
  { id: "4", code: "ME", name: "Mechanical Engineering", description: "Department of Mechanical Engineering" },
  { id: "5", code: "CE", name: "Civil Engineering", description: "Department of Civil Engineering" },
  { id: "6", code: "MA", name: "Mathematics", description: "Department of Mathematics" },
  { id: "7", code: "PH", name: "Physics", description: "Department of Physics" },
  { id: "8", code: "CH", name: "Chemistry", description: "Department of Chemistry" },
  { id: "9", code: "HS", name: "Humanities and Social Sciences", description: "Department of Humanities and Social Sciences" },
  { id: "10", code: "MG", name: "Management Studies", description: "Department of Management Studies" },
  { id: "11", code: "BI", name: "Biology", description: "Department of Biology" },
]

const mockCourses = [
  { id: "1", code: "CS1101", name: "Programming for Problem Solving", semester: 1, credits: 4, department_id: "1", description: "L-T-P: 3-0-2 | Course Type: AEC" },
  { id: "2", code: "MA1101", name: "Linear Algebra", semester: 1, credits: 3, department_id: "6", description: "L-T-P: 2-1-0 | Course Type: SMC" },
  { id: "3", code: "CS2304", name: "Data Structures and Algorithms – I", semester: 3, credits: 2, department_id: "1", description: "L-T-P: 2-0-0 | Course Type: PCC" },
  { id: "4", code: "CS3522", name: "Database Management Systems", semester: 5, credits: 3, department_id: "1", description: "L-T-P: 3-0-0 | Course Type: PCC" },
  { id: "5", code: "CS3524", name: "Artificial Intelligence", semester: 5, credits: 3, department_id: "1", description: "L-T-P: 3-0-0 | Course Type: PCC" },
]

interface Department {
  id: string
  code: string
  name: string
  description: string
}

interface Course {
  id: string
  code: string
  name: string
  semester: number
  credits: number
  department_id: string
  description: string
}

export default function AdminPage() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments)
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [isLoading, setIsLoading] = useState(false)
  
  // Department form state
  const [deptDialogOpen, setDeptDialogOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [deptForm, setDeptForm] = useState({ code: "", name: "", description: "" })
  
  // Course form state
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    semester: "1",
    credits: "3",
    department_id: "",
    description: ""
  })

  // Department handlers
  const openDeptDialog = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept)
      setDeptForm({ code: dept.code, name: dept.name, description: dept.description })
    } else {
      setEditingDept(null)
      setDeptForm({ code: "", name: "", description: "" })
    }
    setDeptDialogOpen(true)
  }

  const saveDepartment = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingDept) {
      // Update existing
      setDepartments(prev => prev.map(d => 
        d.id === editingDept.id 
          ? { ...d, ...deptForm }
          : d
      ))
    } else {
      // Add new
      const newDept: Department = {
        id: Date.now().toString(),
        ...deptForm
      }
      setDepartments(prev => [...prev, newDept])
    }
    
    setIsLoading(false)
    setDeptDialogOpen(false)
  }

  const deleteDepartment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department? This will also delete all associated courses.")) {
      return
    }
    setDepartments(prev => prev.filter(d => d.id !== id))
    setCourses(prev => prev.filter(c => c.department_id !== id))
  }

  // Course handlers
  const openCourseDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course)
      setCourseForm({
        code: course.code,
        name: course.name,
        semester: course.semester.toString(),
        credits: course.credits.toString(),
        department_id: course.department_id,
        description: course.description
      })
    } else {
      setEditingCourse(null)
      setCourseForm({
        code: "",
        name: "",
        semester: "1",
        credits: "3",
        department_id: departments[0]?.id || "",
        description: ""
      })
    }
    setCourseDialogOpen(true)
  }

  const saveCourse = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingCourse) {
      setCourses(prev => prev.map(c => 
        c.id === editingCourse.id 
          ? { 
              ...c, 
              ...courseForm,
              semester: parseInt(courseForm.semester),
              credits: parseInt(courseForm.credits)
            }
          : c
      ))
    } else {
      const newCourse: Course = {
        id: Date.now().toString(),
        code: courseForm.code,
        name: courseForm.name,
        semester: parseInt(courseForm.semester),
        credits: parseInt(courseForm.credits),
        department_id: courseForm.department_id,
        description: courseForm.description
      }
      setCourses(prev => [...prev, newCourse])
    }
    
    setIsLoading(false)
    setCourseDialogOpen(false)
  }

  const deleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return
    }
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  const getDepartmentName = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId)
    return dept ? dept.code : "Unknown"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={{ id: "1", email: "admin@mtu.ac.in", full_name: "Admin User", role: "admin" }} />
      
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <Breadcrumbs
            items={[{ label: "Admin Dashboard" }]}
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
                Manage departments, courses, and system settings
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Semesters</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="departments" className="space-y-6">
            <TabsList>
              <TabsTrigger value="departments" className="gap-2">
                <Building2 className="h-4 w-4" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </TabsTrigger>
            </TabsList>

            {/* Departments Tab */}
            <TabsContent value="departments">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Departments</CardTitle>
                    <CardDescription>Manage academic departments</CardDescription>
                  </div>
                  <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => openDeptDialog()} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Department
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingDept ? "Edit Department" : "Add New Department"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingDept 
                            ? "Update the department information below." 
                            : "Fill in the details for the new department."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="dept-code">Department Code *</Label>
                          <Input
                            id="dept-code"
                            placeholder="e.g., CSE, ECE, ME"
                            value={deptForm.code}
                            onChange={(e) => setDeptForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dept-name">Department Name *</Label>
                          <Input
                            id="dept-name"
                            placeholder="e.g., Computer Science and Engineering"
                            value={deptForm.name}
                            onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dept-desc">Description</Label>
                          <Textarea
                            id="dept-desc"
                            placeholder="Brief description of the department"
                            value={deptForm.description}
                            onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeptDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={saveDepartment} 
                          disabled={!deptForm.code || !deptForm.name || isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {editingDept ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left font-medium">Code</th>
                          <th className="p-3 text-left font-medium">Name</th>
                          <th className="p-3 text-left font-medium">Courses</th>
                          <th className="p-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map((dept) => (
                          <tr key={dept.id} className="border-b last:border-0">
                            <td className="p-3">
                              <Badge variant="secondary" className="font-mono">
                                {dept.code}
                              </Badge>
                            </td>
                            <td className="p-3">{dept.name}</td>
                            <td className="p-3 text-muted-foreground">
                              {courses.filter(c => c.department_id === dept.id).length} courses
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeptDialog(dept)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => deleteDepartment(dept.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Courses</CardTitle>
                    <CardDescription>Manage courses across all departments</CardDescription>
                  </div>
                  <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => openCourseDialog()} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingCourse ? "Edit Course" : "Add New Course"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingCourse 
                            ? "Update the course information below." 
                            : "Fill in the details for the new course."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="course-code">Course Code *</Label>
                            <Input
                              id="course-code"
                              placeholder="e.g., CS1101"
                              value={courseForm.code}
                              onChange={(e) => setCourseForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="course-dept">Department *</Label>
                            <Select
                              value={courseForm.department_id}
                              onValueChange={(value) => setCourseForm(prev => ({ ...prev, department_id: value }))}
                            >
                              <SelectTrigger id="course-dept">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.code} - {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="course-name">Course Name *</Label>
                          <Input
                            id="course-name"
                            placeholder="e.g., Programming for Problem Solving"
                            value={courseForm.name}
                            onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="course-semester">Semester *</Label>
                            <Select
                              value={courseForm.semester}
                              onValueChange={(value) => setCourseForm(prev => ({ ...prev, semester: value }))}
                            >
                              <SelectTrigger id="course-semester">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                  <SelectItem key={sem} value={sem.toString()}>
                                    Semester {sem}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="course-credits">Credits *</Label>
                            <Select
                              value={courseForm.credits}
                              onValueChange={(value) => setCourseForm(prev => ({ ...prev, credits: value }))}
                            >
                              <SelectTrigger id="course-credits">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((credit) => (
                                  <SelectItem key={credit} value={credit.toString()}>
                                    {credit} {credit === 1 ? "credit" : "credits"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="course-desc">Description (L-T-P, Course Type)</Label>
                          <Textarea
                            id="course-desc"
                            placeholder="e.g., L-T-P: 3-0-2 | Course Type: PCC"
                            value={courseForm.description}
                            onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={saveCourse} 
                          disabled={!courseForm.code || !courseForm.name || !courseForm.department_id || isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {editingCourse ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left font-medium">Code</th>
                          <th className="p-3 text-left font-medium">Name</th>
                          <th className="p-3 text-left font-medium">Department</th>
                          <th className="p-3 text-left font-medium">Semester</th>
                          <th className="p-3 text-left font-medium">Credits</th>
                          <th className="p-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course.id} className="border-b last:border-0">
                            <td className="p-3">
                              <span className="font-mono text-sm">{course.code}</span>
                            </td>
                            <td className="p-3">{course.name}</td>
                            <td className="p-3">
                              <Badge variant="outline">{getDepartmentName(course.department_id)}</Badge>
                            </td>
                            <td className="p-3">{course.semester}</td>
                            <td className="p-3">{course.credits}</td>
                            <td className="p-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openCourseDialog(course)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => deleteCourse(course.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
