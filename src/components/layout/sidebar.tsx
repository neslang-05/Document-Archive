"use client"

import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface SidebarProps {
  departments?: Array<{
    id: string
    name: string
    code: string
  }>
  semesters?: number[]
  examTypes?: Array<{
    value: string
    label: string
  }>
  categories?: Array<{
    value: string
    label: string
  }>
  selectedFilters?: {
    department?: string
    semester?: number
    examType?: string
    category?: string
    year?: number
  }
  onFilterChange?: (filters: Record<string, string | number | undefined>) => void
  className?: string
}

const defaultSemesters = [1, 2, 3, 4, 5, 6, 7, 8]

const defaultExamTypes = [
  { value: "mid_term", label: "Mid-Term" },
  { value: "end_term", label: "End-Term" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
  { value: "other", label: "Other" },
]

const defaultCategories = [
  { value: "question_paper", label: "Question Papers" },
  { value: "notes", label: "Notes" },
  { value: "lab_manual", label: "Lab Manuals" },
  { value: "project_report", label: "Project Reports" },
]

const defaultDepartments = [
  { id: "1", name: "Computer Science and Engineering", code: "CSE" },
  { id: "2", name: "Electronics and Communication", code: "ECE" },
  { id: "3", name: "Electrical Engineering", code: "EE" },
  { id: "4", name: "Mechanical Engineering", code: "ME" },
  { id: "5", name: "Civil Engineering", code: "CE" },
]

// Extracted SidebarSection component
function SidebarSection({
  title,
  sectionKey,
  isExpanded,
  onToggle,
  children,
}: {
  title: string
  sectionKey: string
  isExpanded: boolean
  onToggle: (key: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="py-2">
      <button
        onClick={() => onToggle(sectionKey)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent rounded-md transition-colors"
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-1 space-y-1 px-1">{children}</div>
      )}
    </div>
  )
}

export function Sidebar({
  departments = defaultDepartments,
  semesters = defaultSemesters,
  examTypes = defaultExamTypes,
  categories = defaultCategories,
  selectedFilters = {},
  onFilterChange,
  className,
}: SidebarProps) {
  usePathname()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    departments: true,
    semesters: true,
    examTypes: false,
    categories: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleFilterClick = (key: string, value: string | number) => {
    if (onFilterChange) {
      const newFilters = { ...selectedFilters }
      if (newFilters[key as keyof typeof newFilters] === value) {
        delete newFilters[key as keyof typeof newFilters]
      } else {
        (newFilters as Record<string, string | number | undefined>)[key] = value
      }
      onFilterChange(newFilters)
    }
  }

  return (
    <aside
      className={cn(
        "w-64 border-r bg-card hidden lg:block",
        className
      )}
    >
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4">
          {/* Filter Header */}
          <div className="flex items-center gap-2 px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span className="text-sm font-semibold">Filters</span>
          </div>

          <Separator className="my-2" />

          {/* Departments */}
          <SidebarSection title="Departments" sectionKey="departments" isExpanded={expandedSections.departments} onToggle={toggleSection}>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleFilterClick("department", dept.code)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  selectedFilters.department === dept.code
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                  {dept.code}
                </span>
                <span className="truncate">{dept.name}</span>
              </button>
            ))}
          </SidebarSection>

          <Separator className="my-2" />

          {/* Categories */}
          <SidebarSection title="Resource Type" sectionKey="categories" isExpanded={expandedSections.categories} onToggle={toggleSection}>
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleFilterClick("category", category.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  selectedFilters.category === category.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {category.label}
              </button>
            ))}
          </SidebarSection>

          <Separator className="my-2" />

          {/* Semesters */}
          <SidebarSection title="Semester" sectionKey="semesters" isExpanded={expandedSections.semesters} onToggle={toggleSection}>
            <div className="grid grid-cols-4 gap-1">
              {semesters.map((semester) => (
                <button
                  key={semester}
                  onClick={() => handleFilterClick("semester", semester)}
                  className={cn(
                    "flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-mono transition-colors",
                    selectedFilters.semester === semester
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {semester}
                </button>
              ))}
            </div>
          </SidebarSection>

          <Separator className="my-2" />

          {/* Exam Types */}
          <SidebarSection title="Exam Type" sectionKey="examTypes" isExpanded={expandedSections.examTypes} onToggle={toggleSection}>
            {examTypes.map((examType) => (
              <button
                key={examType.value}
                onClick={() => handleFilterClick("examType", examType.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  selectedFilters.examType === examType.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {examType.label}
              </button>
            ))}
          </SidebarSection>

          <Separator className="my-2" />

          {/* Clear Filters */}
          {Object.keys(selectedFilters).length > 0 && (
            <div className="px-3 py-2">
              <button
                className="w-full rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
                onClick={() => onFilterChange?.({})}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
