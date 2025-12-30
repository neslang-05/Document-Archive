"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import type { ResourceFile } from "@/types/database"

interface FilePreviewProps {
  files: ResourceFile[]
  currentIndex?: number
  onClose: () => void
  open?: boolean
}

export function FilePreview({ files, currentIndex = 0, onClose, open = true }: FilePreviewProps) {
  const [index, setIndex] = useState(currentIndex)
  const file = files[index]
  
  if (!file) {
    return null
  }
  
  const isPDF = file.file_type === "application/pdf"
  const isImage = file.file_type.startsWith("image/")
  
  const goToPrevious = () => setIndex(prev => Math.max(0, prev - 1))
  const goToNext = () => setIndex(prev => Math.min(files.length - 1, prev + 1))
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium truncate flex-1 pr-4">{file.file_name}</h3>
          <div className="flex items-center gap-2 shrink-0">
            {files.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevious}
                  disabled={index === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {index + 1} / {files.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  disabled={index === files.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="outline" size="icon" asChild>
              <a href={file.file_url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-muted/10">
          {isPDF && (
            <iframe
              src={`${file.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full min-h-[calc(90vh-80px)] bg-white rounded"
              title={file.file_name}
            />
          )}
          
          {isImage && (
            <div className="flex items-center justify-center h-full">
              <img
                src={file.file_url}
                alt={file.file_name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          
          {!isPDF && !isImage && (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Preview not available</p>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                This file type ({file.file_type}) cannot be previewed in the browser.
                Please download it to view the content.
              </p>
              <Button asChild>
                <a href={file.file_url} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
