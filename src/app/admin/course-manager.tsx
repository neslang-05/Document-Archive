"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface Department {
  id: string
  code: string
  name: string
}

interface Course {
  id: string
  code: string
  name: string
  semester: number
  credits: number | null
  department_id: string
  description?: string | null
  departments?: { code: string; name: string } | null
}

interface CourseManagerProps {
  courses: Course[]
  departments: Department[]
}

export function CourseManager({ courses: initialCourses, departments }: CourseManagerProps) {
  const router = useRouter()
  const [courses, setCourses] = useState(initialCourses)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [form, setForm] = useState({
    code: "",
    name: "",
    semester: "1",
    credits: "3",
    department_id: "",
    description: "",
  })

  const openDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course)
      setForm({
        code: course.code,
        name: course.name,
        semester: course.semester.toString(),
        credits: (course.credits ?? 3).toString(),
        department_id: course.department_id,
        description: course.description || "",
      })
    } else {
      setEditingCourse(null)
      setForm({
        code: "",
        name: "",
        semester: "1",
        credits: "3",
        department_id: "",
        description: "",
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.department_id) return

    setIsLoading(true)
    const supabase = createClient()

    const courseData = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      semester: parseInt(form.semester, 10),
      credits: parseInt(form.credits, 10),
      department_id: form.department_id,
      description: form.description.trim() || null,
    }

    if (editingCourse) {
      const { error } = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", editingCourse.id)

      if (!error) {
        const dept = departments.find((d) => d.id === form.department_id)
        setCourses((prev) =>
          prev.map((c) =>
            c.id === editingCourse.id
              ? { ...c, ...courseData, departments: dept ? { code: dept.code, name: dept.name } : null }
              : c
          )
        )
      }
    } else {
      const { data, error } = await supabase
        .from("courses")
        .insert(courseData)
        .select("*, departments(code, name)")
        .single()

      if (!error && data) {
        setCourses((prev) => [...prev, data])
      }
    }

    setIsLoading(false)
    setDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all associated resources.")) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (!error) {
      setCourses((prev) => prev.filter((c) => c.id !== id))
      router.refresh()
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Manage academic courses</CardDescription>
          </div>
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    <span className="font-mono bg-muted px-2 py-0.5 rounded mr-2">
                      {course.code}
                    </span>
                    {course.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{course.departments?.code}</Badge>
                    <span>Semester {course.semester}</span>
                    <span>•</span>
                    <span>{course.credits} credits</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(course)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No courses yet. Add your first course.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Add Course"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update course details" : "Create a new course"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., CS3522"
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={form.department_id}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, department_id: value }))}
                >
                  <SelectTrigger>
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Database Management Systems"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={form.semester}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger>
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
                <Label htmlFor="credits">Credits</Label>
                <Select
                  value={form.credits}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, credits: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((credit) => (
                      <SelectItem key={credit} value={credit.toString()}>
                        {credit} credits
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Course description, L-T-P, etc."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !form.code.trim() || !form.name.trim() || !form.department_id}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
