"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Department {
  id: string
  code: string
  name: string
  description?: string | null
}

interface DepartmentManagerProps {
  departments: Department[]
}

export function DepartmentManager({ departments: initialDepartments }: DepartmentManagerProps) {
  const router = useRouter()
  const [departments, setDepartments] = useState(initialDepartments)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [form, setForm] = useState({ code: "", name: "", description: "" })

  const openDialog = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept)
      setForm({ code: dept.code, name: dept.name, description: dept.description || "" })
    } else {
      setEditingDept(null)
      setForm({ code: "", name: "", description: "" })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) return

    setIsLoading(true)

    if (editingDept) {
      const res = await fetch("/api/departments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingDept.id,
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          description: form.description.trim() || null,
        }),
      })

      if (res.ok) {
        setDepartments((prev) =>
          prev.map((d) =>
            d.id === editingDept.id
              ? { ...d, code: form.code.trim().toUpperCase(), name: form.name.trim(), description: form.description.trim() || null }
              : d
          )
        )
      }
    } else {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          description: form.description.trim() || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setDepartments((prev) => [...prev, data])
      }
    }

    setIsLoading(false)
    setDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all associated courses and resources.")) {
      return
    }

    const res = await fetch(`/api/departments?id=${id}`, { method: "DELETE" })

    if (res.ok) {
      setDepartments((prev) => prev.filter((d) => d.id !== id))
      router.refresh()
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Manage academic departments</CardDescription>
          </div>
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    <span className="font-mono bg-muted px-2 py-0.5 rounded mr-2">
                      {dept.code}
                    </span>
                    {dept.name}
                  </p>
                  {dept.description && (
                    <p className="text-sm text-muted-foreground mt-1">{dept.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(dept)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(dept.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {departments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No departments yet. Add your first department.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDept ? "Edit Department" : "Add Department"}</DialogTitle>
            <DialogDescription>
              {editingDept ? "Update department details" : "Create a new academic department"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="e.g., CSE"
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Computer Science and Engineering"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the department..."
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
            <Button onClick={handleSave} disabled={isLoading || !form.code.trim() || !form.name.trim()}>
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
