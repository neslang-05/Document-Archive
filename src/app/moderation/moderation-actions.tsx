"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { FilePreview } from "@/components/preview/file-preview"
import type { ResourceFile } from "@/types/database"

interface ModerationActionsProps {
  resourceId: string
  files?: ResourceFile[]
}

export function ModerationActions({ resourceId, files = [] }: ModerationActionsProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("resources")
      .update({
        status: "approved",
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", resourceId)

    setIsApproving(false)

    if (!error) {
      router.refresh()
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return

    setIsRejecting(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("resources")
      .update({
        status: "rejected",
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason.trim(),
      })
      .eq("id", resourceId)

    setIsRejecting(false)
    setRejectDialogOpen(false)

    if (!error) {
      router.refresh()
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {files.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        )}
        <Button
          size="sm"
          className="gap-1"
          onClick={handleApprove}
          disabled={isApproving}
        >
          {isApproving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="gap-1"
          onClick={() => setRejectDialogOpen(true)}
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>

      {previewOpen && files.length > 0 && (
        <FilePreview
          files={files}
          currentIndex={0}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this submission. This will be shared with the uploader.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Low quality scan, duplicate content, incorrect course..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isRejecting}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Submission"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
