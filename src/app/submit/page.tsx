"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Loader2,
  AlertCircle,
  File,
  X
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { ResourceCategory, ExamType } from "@/types/database"

const steps = [
  { id: 1, name: "Course Details", description: "Select the course" },
  { id: 2, name: "Resource Info", description: "Describe your resource" },
  { id: 3, name: "Upload File", description: "Upload your document" },
  { id: 4, name: "Review", description: "Confirm and submit" },
]

const semesters = [1, 2, 3, 4, 5, 6, 7, 8]

const categories = [
  { value: "question_paper", label: "Question Paper" },
  { value: "notes", label: "Notes" },
  { value: "lab_manual", label: "Lab Manual" },
  { value: "project_report", label: "Project Report" },
]

const examTypes = [
  { value: "mid_term", label: "Mid-Term" },
  { value: "end_term", label: "End-Term" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
  { value: "other", label: "Other" },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

// Sample courses (in production, this would be fetched based on department/semester)
type CourseOption = {
  id: string
  code: string
  name: string
  semester?: number | null
  department?: string | null
}

type DepartmentOption = {
  id: string
  code: string
  name: string
}

export default function SubmitPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([])
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false)
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([])
  const [isCoursesLoading, setIsCoursesLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    department: "",
    semester: "",
    courseCode: "",
    category: "",
    examType: "",
    year: "",
    title: "",
    description: "",
  })

  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const MAX_FILES = 10
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      }
      return prev
    })
  }, [])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.department) newErrors.department = "Please select a department"
        if (!formData.semester) newErrors.semester = "Please select a semester"
        if (!formData.courseCode) newErrors.courseCode = "Please select a course"
        break
      case 2:
        if (!formData.category) newErrors.category = "Please select a category"
        if (!formData.year) newErrors.year = "Please select a year"
        if (!formData.title.trim()) newErrors.title = "Please enter a title"
        if (formData.category === "question_paper" && !formData.examType) {
          newErrors.examType = "Please select an exam type"
        }
        break
      case 3:
        if (files.length === 0) newErrors.files = "Please upload at least one file"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleFilesChange = (newFiles: FileList | null) => {
    if (!newFiles) return
    
    const selectedFiles = Array.from(newFiles)
    
    // Validate count
    if (selectedFiles.length + files.length > MAX_FILES) {
      setErrors({ files: `Maximum ${MAX_FILES} files allowed` })
      return
    }
    
    // Validate total size
    const totalSize = [...files, ...selectedFiles].reduce((sum, f) => sum + f.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      setErrors({ files: "Total file size must be less than 50MB" })
      return
    }
    
    // Validate file types - now accepting all common types including images
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ]
    
    const invalidFiles = selectedFiles.filter(f => !allowedTypes.includes(f.type))
    if (invalidFiles.length > 0) {
      setErrors({ files: `Invalid file type: ${invalidFiles[0].name}. Allowed: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, Images, ZIP, RAR, TXT` })
      return
    }
    
    setFiles(prev => [...prev, ...selectedFiles])
    if (errors.files) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.files
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesChange(e.target.files)
  }
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesChange(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    setErrors({})

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setErrors({ submit: "You must be logged in to submit a resource" })
        setIsSubmitting(false)
        return
      }

      // Look up course ID from course code
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id")
        .eq("code", formData.courseCode)
        .single()

      if (courseError || !courseData) {
        setErrors({ submit: "Could not find the selected course" })
        setIsSubmitting(false)
        return
      }

      // First create the resource record (using first file for primary data)
      const primaryFile = files[0]
      const primaryFileName = `${user.id}/${Date.now()}_${primaryFile.name}`

      // Upload primary file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("resourses")
        .upload(primaryFileName, primaryFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        setErrors({ submit: `File upload failed: ${uploadError.message}` })
        setIsSubmitting(false)
        return
      }

      // Get public URL for the primary file
      const { data: urlData } = supabase.storage
        .from("resourses")
        .getPublicUrl(primaryFileName)

      // Insert resource record
      const { data: resourceData, error: insertError } = await supabase
        .from("resources")
        .insert({
          course_id: courseData.id,
          uploader_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category as ResourceCategory,
          exam_type: (formData.examType || null) as ExamType | null,
          year: parseInt(formData.year, 10),
          file_url: urlData.publicUrl,
          file_name: primaryFile.name,
          file_size: primaryFile.size,
          file_type: primaryFile.type,
          status: "pending",
        })
        .select()
        .single()

      if (insertError || !resourceData) {
        // Clean up uploaded file if DB insert fails
        await supabase.storage.from("resourses").remove([primaryFileName])
        setErrors({ submit: `Failed to save resource: ${insertError?.message || "Unknown error"}` })
        setIsSubmitting(false)
        return
      }

      // Upload all files and create resource_files entries
      const fileUploadPromises = files.map(async (file, index) => {
        try {
          const fileName = `${user.id}/${resourceData.id}/${Date.now()}_${index}_${file.name}`
          
          const { error: fileUploadError } = await supabase.storage
            .from("resourses")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            })

          if (fileUploadError) throw fileUploadError

          const { data: fileUrlData } = supabase.storage
            .from("resourses")
            .getPublicUrl(fileName)

          // Insert into resource_files table
          const { error: fileInsertError } = await supabase
            .from("resource_files")
            .insert({
              resource_id: resourceData.id,
              file_url: fileUrlData.publicUrl,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              file_order: index,
            })

          if (fileInsertError) throw fileInsertError
          
          return { success: true }
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err)
          return { success: false, error: err }
        }
      })

      await Promise.all(fileUploadPromises)

      setIsSubmitting(false)
      setSubmitted(true)
    } catch {
      setErrors({ submit: "An unexpected error occurred. Please try again." })
      setIsSubmitting(false)
    }
  }

  // Fetch departments list from DB once
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsDepartmentsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("departments")
        .select("id, code, name")
        .order("code")

      if (error) {
        setDepartmentOptions([])
      } else {
        setDepartmentOptions((data as DepartmentOption[]) || [])
        if (!data?.some((d) => d.code === formData.department)) {
          updateFormData("department", "")
          updateFormData("courseCode", "")
        }
      }

      setIsDepartmentsLoading(false)
    }

    fetchDepartments()
  }, [formData.department, updateFormData])

  // Fetch courses whenever department and semester are both selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!formData.department || !formData.semester) {
        setCourseOptions([])
        updateFormData("courseCode", "")
        return
      }

      setIsCoursesLoading(true)
      const supabase = createClient()

      // Filter by department code via join to departments table
      const { data, error } = await supabase
        .from("courses")
        .select("id, code, name, semester, departments!inner(id, code, name)")
        .eq("departments.code", formData.department)
        .eq("semester", Number(formData.semester))
        .order("code")

      if (error) {
        setCourseOptions([])
      } else {
        setCourseOptions((data as CourseOption[]) || [])
        // Clear selection if it no longer exists in filtered options
        if (!data?.some((c) => c.code === formData.courseCode)) {
          updateFormData("courseCode", "")
        }
      }

      setIsCoursesLoading(false)
    }

    fetchCourses()
  }, [formData.department, formData.semester, formData.courseCode, updateFormData])

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Submission Received!</CardTitle>
              <CardDescription>
                Thank you for your contribution. Your submission is now pending review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our moderators will review your submission and you&apos;ll be notified once it&apos;s approved.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard/submissions">
                  <Button variant="outline">View My Submissions</Button>
                </Link>
                <Link href="/">
                  <Button>Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-3xl">
          <Breadcrumbs
            items={[{ label: "Submit Resource" }]}
            className="mb-6"
          />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              Upload Resource
            </h1>
            <p className="text-muted-foreground mt-1">
              Share your academic materials with the community
            </p>
          </div>

          {/* Progress Steps */}
          <nav aria-label="Progress" className="mb-8">
            <ol className="flex items-center">
              {steps.map((step, index) => (
                <li
                  key={step.id}
                  className={cn(
                    "relative flex-1",
                    index < steps.length - 1 && "pr-8 sm:pr-20"
                  )}
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
                        step.id < currentStep
                          ? "border-primary bg-primary text-primary-foreground"
                          : step.id === currentStep
                          ? "border-primary text-primary"
                          : "border-muted text-muted-foreground"
                      )}
                    >
                      {step.id < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="ml-4 hidden sm:block">
                      <p className="text-sm font-medium">{step.name}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "absolute right-0 top-5 hidden h-0.5 w-full sm:block",
                        step.id < currentStep ? "bg-primary" : "bg-muted"
                      )}
                      style={{ left: "3rem", width: "calc(100% - 4rem)" }}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Form Steps */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].name}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Course Details */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => updateFormData("department", value)}
                    >
                      <SelectTrigger id="department" className={errors.department ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {isDepartmentsLoading ? (
                          <SelectItem value="__loading__" disabled>
                            Loading departments...
                          </SelectItem>
                        ) : departmentOptions.length === 0 ? (
                          <SelectItem value="__empty__" disabled>
                            No departments found
                          </SelectItem>
                        ) : (
                          departmentOptions.map((dept) => (
                            <SelectItem key={dept.code} value={dept.code}>
                              {dept.code} - {dept.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester *</Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => updateFormData("semester", value)}
                    >
                      <SelectTrigger id="semester" className={errors.semester ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.semester && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.semester}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Course *</Label>
                    <Select
                      value={formData.courseCode}
                      onValueChange={(value) => updateFormData("courseCode", value)}
                    >
                      <SelectTrigger id="course" className={errors.courseCode ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {!formData.department || !formData.semester ? (
                          <SelectItem value="__select-dept-sem__" disabled>
                            Select department and semester first
                          </SelectItem>
                        ) : isCoursesLoading ? (
                          <SelectItem value="__loading__" disabled>
                            Loading courses...
                          </SelectItem>
                        ) : courseOptions.length === 0 ? (
                          <SelectItem value="__empty__" disabled>
                            No courses found for this selection
                          </SelectItem>
                        ) : (
                          courseOptions.map((course) => (
                            <SelectItem key={course.code} value={course.code}>
                              <span className="font-mono">{course.code}</span> - {course.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.courseCode && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.courseCode}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Resource Info */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="category">Resource Type *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => updateFormData("category", value)}
                    >
                      <SelectTrigger id="category" className={errors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {formData.category === "question_paper" && (
                    <div className="space-y-2">
                      <Label htmlFor="examType">Exam Type *</Label>
                      <Select
                        value={formData.examType}
                        onValueChange={(value) => updateFormData("examType", value)}
                      >
                        <SelectTrigger id="examType" className={errors.examType ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.examType && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.examType}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) => updateFormData("year", value)}
                    >
                      <SelectTrigger id="year" className={errors.year ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.year && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.year}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., DBMS End-Term 2024"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                      className={errors.title ? "border-destructive" : ""}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add any additional notes about this resource..."
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Step 3: Upload Files */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      dragActive && "border-primary bg-primary/5",
                      files.length > 0
                        ? "border-primary bg-primary/5"
                        : errors.files
                        ? "border-destructive"
                        : "border-muted hover:border-primary/50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="files"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.7z,.txt,image/*"
                      multiple
                      onChange={handleFileChange}
                    />
                    <label htmlFor="files" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {dragActive ? "Drop files here" : "Click to upload or drag and drop"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            PDF, DOC, Images, ZIP, etc. • Up to {MAX_FILES} files • Max {MAX_TOTAL_SIZE / (1024 * 1024)}MB total
                          </p>
                        </div>
                        <Button variant="outline" size="sm" type="button">
                          Browse Files
                        </Button>
                      </div>
                    </label>
                  </div>
                  
                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {files.length} file{files.length !== 1 ? 's' : ''} selected
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                        </p>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <File className="h-5 w-5 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {errors.files && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.files}
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Course</span>
                      <span className="font-mono">{formData.courseCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span>{formData.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Semester</span>
                      <span>{formData.semester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span>{categories.find((c) => c.value === formData.category)?.label}</span>
                    </div>
                    {formData.examType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exam Type</span>
                        <span>{examTypes.find((e) => e.value === formData.examType)?.label}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year</span>
                      <span className="font-mono">{formData.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title</span>
                      <span>{formData.title}</span>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <p className="font-medium mb-3">Files ({files.length})</p>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1">{file.name}</span>
                          <span className="text-muted-foreground ml-2">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      By submitting, you confirm that this content is your own work or you have 
                      permission to share it. Your submission will be reviewed by moderators 
                      before being published.
                    </p>
                  </div>

                  {errors.submit && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {errors.submit}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button onClick={nextStep}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Resource
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
