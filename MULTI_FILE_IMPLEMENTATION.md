# Multi-File Upload & Preview System - Implementation Guide

## Overview
This guide outlines the changes needed to support:
- Multiple file uploads (up to 10 files, 50MB total)
- Support for all file types (PDFs, images, documents, etc.)
- In-app preview for PDFs and images
- User delete functionality for own resources

## 1. Database Changes

### Run the SQL Migration
Execute `/workspaces/Document-Archive/supabase/add-multiple-files-support.sql` in your Supabase SQL Editor.

This creates:
- `resource_files` table for multiple file attachments
- Proper RLS policies
- Migration of existing single-file resources

## 2. Frontend Changes Required

### A. Update Submit Page (`src/app/submit/page.tsx`)

**Key Changes:**
```typescript
// Change from single file to multiple files
const [files, setFiles] = useState<File[]>([])
const MAX_FILES = 10
const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB

// Support all file types
const allowedTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain'
]

// Multiple file upload handler
const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = Array.from(e.target.files || [])
  
  // Validate count
  if (selectedFiles.length + files.length > MAX_FILES) {
    setErrors({ files: `Maximum ${MAX_FILES} files allowed` })
    return
  }
  
  // Validate total size
  const totalSize = [...files, ...selectedFiles].reduce((sum, f) => sum + f.size, 0)
  if (totalSize > MAX_TOTAL_SIZE) {
    setErrors({ files: 'Total file size must be less than 50MB' })
    return
  }
  
  setFiles(prev => [...prev, ...selectedFiles])
}

// Remove file handler
const removeFile = (index: number) => {
  setFiles(prev => prev.filter((_, i) => i !== index))
}

// Upload multiple files
const uploadFiles = async (resourceId: string, userId: string) => {
  const uploadPromises = files.map(async (file, index) => {
    const fileName = `${userId}/${resourceId}/${Date.now()}_${index}_${file.name}`
    
    const { data, error } = await supabase.storage
      .from('resourses')
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data: urlData } = supabase.storage
      .from('resourses')
      .getPublicUrl(fileName)
    
    // Insert into resource_files table
    await supabase.from('resource_files').insert({
      resource_id: resourceId,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_order: index
    })
  })
  
  await Promise.all(uploadPromises)
}
```

### B. Create Preview Component (`src/components/preview/file-preview.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react'

interface FilePreviewProps {
  files: Array<{
    file_url: string
    file_name: string
    file_type: string
  }>
  currentIndex?: number
  onClose: () => void
}

export function FilePreview({ files, currentIndex = 0, onClose }: FilePreviewProps) {
  const [index, setIndex] = useState(currentIndex)
  const file = files[index]
  
  const isPDF = file.file_type === 'application/pdf'
  const isImage = file.file_type.startsWith('image/')
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium truncate">{file.file_name}</h3>
          <div className="flex items-center gap-2">
            {files.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIndex(prev => Math.max(0, prev - 1))}
                  disabled={index === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {index + 1} / {files.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIndex(prev => Math.min(files.length - 1, prev + 1))}
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
        
        <div className="flex-1 overflow-auto">
          {isPDF && (
            <iframe
              src={file.file_url}
              className="w-full h-full"
              title={file.file_name}
            />
          )}
          
          {isImage && (
            <img
              src={file.file_url}
              alt={file.file_name}
              className="max-w-full h-auto mx-auto"
            />
          )}
          
          {!isPDF && !isImage && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground mb-4">
                Preview not available for this file type
              </p>
              <Button asChild>
                <a href={file.file_url} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### C. Update Resource Detail Page (`src/app/resources/[id]/page.tsx`)

Add file fetching and preview:
```typescript
// Fetch all files for the resource
const { data: resourceFiles } = await supabase
  .from('resource_files')
  .select('*')
  .eq('resource_id', id)
  .order('file_order')

// In the component, add preview button
'use client'
const [previewOpen, setPreviewOpen] = useState(false)
const [previewIndex, setPreviewIndex] = useState(0)

<Button onClick={() => { setPreviewIndex(0); setPreviewOpen(true) }}>
  Preview Files
</Button>

{previewOpen && (
  <FilePreview
    files={resourceFiles}
    currentIndex={previewIndex}
    onClose={() => setPreviewOpen(false)}
  />
)}
```

### D. Update Moderation Page (`src/app/moderation/page.tsx`)

Add preview button next to approve/reject:
```typescript
<Button variant="outline" onClick={() => openPreview(submission.id)}>
  Preview
</Button>
```

### E. Add Delete Functionality (`src/app/dashboard/submissions/page.tsx`)

```typescript
const handleDelete = async (resourceId: string) => {
  if (!confirm('Are you sure you want to delete this resource?')) return
  
  const supabase = createClient()
  
  // Get all files for this resource
  const { data: files } = await supabase
    .from('resource_files')
    .select('file_url')
    .eq('resource_id', resourceId)
  
  // Delete files from storage
  if (files) {
    for (const file of files) {
      const filePath = file.file_url.split('/').slice(-2).join('/')
      await supabase.storage.from('resourses').remove([filePath])
    }
  }
  
  // Delete resource (cascade will delete resource_files)
  await supabase.from('resources').delete().eq('id', resourceId)
  
  router.refresh()
}
```

## 3. Install Required Packages

```bash
npm install react-pdf
```

For better PDF viewing, consider `react-pdf` library.

## 4. Update TypeScript Types (`src/types/database.ts`)

Add interface for resource_files:
```typescript
resource_files: {
  Row: {
    id: string
    resource_id: string
    file_url: string
    file_name: string
    file_size: number
    file_type: string
    file_order: number
    created_at: string
  }
  Insert: {
    id?: string
    resource_id: string
    file_url: string
    file_name: string
    file_size: number
    file_type: string
    file_order?: number
    created_at?: string
  }
  Update: {
    file_url?: string
    file_name?: string
    file_size?: number
    file_type?: string
    file_order?: number
  }
}
```

## 5. Testing Checklist

- [ ] Upload single file
- [ ] Upload multiple files (2-10 files)
- [ ] Upload mix of PDFs and images
- [ ] Test 50MB limit
- [ ] Test preview for PDFs
- [ ] Test preview for images
- [ ] Test preview navigation (next/prev)
- [ ] Delete own resource
- [ ] Moderator can preview pending submissions
- [ ] Guest can preview approved resources

## Next Steps

1. Run the SQL migration first
2. Create the FilePreview component
3. Update the submit page for multiple files
4. Update resource detail page with preview
5. Add delete functionality
6. Test thoroughly

This is a significant feature - estimate 4-6 hours of development time.
