"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Eye, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface SubmissionActionsProps {
  resourceId: string
}

export default function SubmissionActions({ resourceId }: SubmissionActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    try {
      // First, fetch all files associated with this resource
      const { data: resourceFiles, error: fetchError } = await supabase
        .from("resource_files")
        .select("storage_path")
        .eq("resource_id", resourceId)

      if (fetchError) {
        console.error("Error fetching resource files:", fetchError)
        alert("Failed to fetch resource files. Please try again.")
        setIsDeleting(false)
        return
      }

      // Delete all files from storage
      if (resourceFiles && resourceFiles.length > 0) {
        const filePaths = resourceFiles.map(f => f.storage_path)
        const { error: storageError } = await supabase.storage
          .from("resourses")
          .remove(filePaths)

        if (storageError) {
          console.error("Error deleting files from storage:", storageError)
          // Continue anyway - the database cascade will clean up references
        }
      }

      // Delete the resource (cascade will delete resource_files entries)
      const { error: deleteError } = await supabase
        .from("resources")
        .delete()
        .eq("id", resourceId)

      if (deleteError) {
        console.error("Error deleting resource:", deleteError)
        alert("Failed to delete resource. Please try again.")
        setIsDeleting(false)
        return
      }

      // Success - refresh the page
      router.refresh()
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Unexpected error during deletion:", error)
      alert("An unexpected error occurred. Please try again.")
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link href={`/resources/${resourceId}`}>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Resource
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              resource and all associated files from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
