"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Download, ExternalLink } from "lucide-react"
import { FilePreview } from "@/components/preview/file-preview"
import type { ResourceFile } from "@/types/database"

interface ResourceActionsProps {
  files: ResourceFile[]
  primaryFileUrl: string
  primaryFileName: string
}

export function ResourceActions({ files, primaryFileUrl, primaryFileName }: ResourceActionsProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  const handlePreview = (index: number = 0) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {files.length > 0 && (
          <Button onClick={() => handlePreview(0)} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview {files.length > 1 && `(${files.length} files)`}
          </Button>
        )}
        <a href={primaryFileUrl} download target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </a>
        <a href={primaryFileUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </Button>
        </a>
      </div>

      {previewOpen && files.length > 0 && (
        <FilePreview
          files={files}
          currentIndex={previewIndex}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  )
}
