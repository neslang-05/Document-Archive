import { getCurrentUser } from "@/lib/auth/session"
import { getD1 } from "@/lib/db/d1"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { 
  Download, 
  Star, 
  Clock,
  User,
  ChevronLeft,
  File as FileIcon,
} from "lucide-react"
import { HeaderServer } from "@/components/layout/header-server"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatNumber } from "@/lib/utils"
import { ResourceActions } from "@/components/resource/resource-actions"

export const dynamic = "force-dynamic"

const categoryLabels: Record<string, string> = {
  question_paper: "Question Paper",
  notes: "Notes",
  lab_manual: "Lab Manual",
  project_report: "Project Report",
}

const examTypeLabels: Record<string, string> = {
  mid_term: "Mid-Term",
  end_term: "End-Term",
  quiz: "Quiz",
  assignment: "Assignment",
  other: "Other",
}

const categoryColors: Record<string, string> = {
  question_paper: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  notes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  lab_manual: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  project_report: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
}

export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const db = getD1()
  const { id } = await params

  // Check if user is logged in
  const currentUser = await getCurrentUser()
  
  // Fetch resource with related data
  const resource = await db
    .prepare(`
      SELECT r.*, c.code as course_code, c.name as course_name, c.semester as course_semester,
             c.credits as course_credits, d.code as dept_code, d.name as dept_name,
             p.full_name as uploader_name, p.email as uploader_email
      FROM resources r
      LEFT JOIN courses c ON r.course_id = c.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN profiles p ON r.uploader_id = p.id
      WHERE r.id = ?
    `)
    .bind(id)
    .first<any>()

  if (!resource) {
    notFound()
  }

  // Now check auth for non-approved resources
  if (resource.status !== "approved") {
    if (!currentUser) {
      redirect("/auth/login")
    }
    if (resource.uploader_id !== currentUser.firebaseUser.uid) {
      redirect("/dashboard")
    }
  }

  // Fetch all files for this resource
  const { results: resourceFiles } = await db
    .prepare("SELECT * FROM resource_files WHERE resource_id = ? ORDER BY file_order")
    .bind(id)
    .all()

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderServer />
      
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "Courses", href: "/courses" },
              { label: resource.course_code as string, href: `/courses/${resource.course_id}` },
              { label: resource.title as string },
            ]}
            className="mb-6"
          />

          {/* Back Link */}
          <Link
            href={`/courses/${resource.course_id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to {resource.course_code as string}
          </Link>

          {/* Status Banner for Pending/Rejected */}
          {resource.status !== "approved" && (
            <Card className={`mb-6 ${resource.status === "rejected" ? "border-destructive" : "border-yellow-500"}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Badge 
                    variant={resource.status === "rejected" ? "destructive" : "secondary"}
                    className="capitalize"
                  >
                    {resource.status}
                  </Badge>
                  <div className="flex-1">
                    {resource.status === "pending" && (
                      <p className="text-sm text-muted-foreground">
                        Your submission is being reviewed by moderators. You&apos;ll be notified once it&apos;s approved.
                      </p>
                    )}
                    {resource.status === "rejected" && resource.rejection_reason && (
                      <div>
                        <p className="text-sm font-medium text-destructive mb-1">Rejection Reason:</p>
                        <p className="text-sm text-muted-foreground">{resource.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resource Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className={categoryColors[resource.category]}>
                  {categoryLabels[resource.category]}
                </Badge>
                {resource.exam_type && (
                  <Badge variant="outline">
                    {examTypeLabels[resource.exam_type]}
                  </Badge>
                )}
                <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                  {resource.year}
                </span>
              </div>

              <h1 className="text-2xl font-bold mb-2">{resource.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <Link 
                  href={`/courses/${resource.course_id}`}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <span className="font-mono font-medium">{resource.course_code as string}</span>
                  <span>•</span>
                  <span>{resource.course_name as string}</span>
                </Link>
              </div>

              {resource.description && (
                <p className="text-muted-foreground mb-6">
                  {resource.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className={`h-5 w-5 ${resource.average_rating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  <span className="font-medium">{resource.average_rating?.toFixed(1) || "0.0"}</span>
                  <span className="text-muted-foreground">
                    ({resource.rating_count} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  {formatNumber(resource.download_count)} downloads
                </div>
              </div>

              <Separator className="my-6" />

              {/* Actions */}
              <ResourceActions
                files={resourceFiles || []}
                primaryFileUrl={resource.file_url}

              />
            </CardContent>
          </Card>

          {/* All Files List (if multiple files) */}
          {resourceFiles && resourceFiles.length > 1 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileIcon className="h-4 w-4" />
                  All Files ({resourceFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {resourceFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileIcon className="h-5 w-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={file.file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* File & Upload Info */}
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">File Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Name</span>
                  <span className="font-mono text-xs truncate max-w-50">{resource.file_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Size</span>
                  <span>{formatFileSize(resource.file_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{resource.file_type.split('/')[1]?.toUpperCase() || 'PDF'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded</span>
                  <span>{formatDate(resource.created_at)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-mono font-medium">{resource.course_code as string}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-right">{resource.course_name as string}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Semester</span>
                  <span>{resource.course_semester as number}</span>
                </div>
                {resource.course_credits && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits</span>
                    <span>{resource.course_credits as number}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Uploader Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Uploaded By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-medium">
                  {(resource.uploader_name as string)?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium">{(resource.uploader_name as string) || "Anonymous"}</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(resource.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
