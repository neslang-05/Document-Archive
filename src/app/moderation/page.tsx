import { getCurrentUser } from "@/lib/auth/session"
import { getD1 } from "@/lib/db/d1"
import { redirect } from "next/navigation"
import { 
  Shield, 
  FileText, 
  Check, 
  Clock,
  User,
  ExternalLink
} from "lucide-react"
import { HeaderServer } from "@/components/layout/header-server"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { ModerationActions } from "./moderation-actions"

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

export default async function ModerationPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

  if (!["moderator", "admin"].includes(currentUser.profile.role)) {
    redirect("/dashboard")
  }

  const db = getD1()

  // Fetch pending submissions with JOINs
  const { results: pendingSubmissions } = await db
    .prepare(`
      SELECT r.*, c.code as course_code, c.name as course_name,
             p.full_name as uploader_name, p.email as uploader_email
      FROM resources r
      LEFT JOIN courses c ON r.course_id = c.id
      LEFT JOIN profiles p ON r.uploader_id = p.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at ASC
    `)
    .all()

  // Fetch recently reviewed (last 20)
  const { results: recentlyReviewed } = await db
    .prepare(`
      SELECT r.*, c.code as course_code, c.name as course_name,
             p.full_name as uploader_name, p.email as uploader_email
      FROM resources r
      LEFT JOIN courses c ON r.course_id = c.id
      LEFT JOIN profiles p ON r.uploader_id = p.id
      WHERE r.status IN ('approved', 'rejected')
      ORDER BY r.approved_at DESC
      LIMIT 20
    `)
    .all()

  // Fetch files for all pending submissions
  const pendingIds = (pendingSubmissions || []).map((s: Record<string, unknown>) => s.id as string)
  let allFiles: Record<string, unknown>[] = []
  if (pendingIds.length > 0) {
    const placeholders = pendingIds.map(() => '?').join(',')
    const { results } = await db
      .prepare(`SELECT * FROM resource_files WHERE resource_id IN (${placeholders}) ORDER BY file_order`)
      .bind(...pendingIds)
      .all()
    allFiles = results || []
  }

  // Create a map of resource_id to files
  const filesMap = new Map<string, Array<{ id: string; resource_id: string; file_url: string; file_name: string; file_size: number; file_type: string; file_order: number; created_at: string }>>()
  allFiles?.forEach(file => {
    if (!filesMap.has(file.resource_id)) {
      filesMap.set(file.resource_id, [])
    }
    filesMap.get(file.resource_id)!.push(file)
  })

  const pendingCount = pendingSubmissions?.length || 0

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderServer />
      
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-5xl">
          <Breadcrumbs
            items={[{ label: "Moderation" }]}
            className="mb-6"
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Moderation Queue
              </h1>
              <p className="text-muted-foreground mt-1">
                Review and approve community submissions
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {pendingCount} pending
            </Badge>
          </div>

          {/* Pending Submissions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Review
              </CardTitle>
              <CardDescription>
                These submissions are waiting for your review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSubmissions && pendingSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {pendingSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={categoryColors[submission.category]}
                            >
                              {categoryLabels[submission.category]}
                            </Badge>
                            {submission.exam_type && (
                              <Badge variant="outline">
                                {examTypeLabels[submission.exam_type]}
                              </Badge>
                            )}
                            <span className="font-mono text-xs text-muted-foreground">
                              {submission.year}
                            </span>
                          </div>

                          <h3 className="font-semibold text-lg">{submission.title}</h3>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span className="font-mono">{submission.course_code}</span>
                              {" - "}
                              {submission.course_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {submission.uploader_name || submission.uploader_email || "Unknown"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(submission.created_at)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {submission.file_name} ({formatFileSize(submission.file_size)})
                            </span>
                            <a
                              href={submission.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Preview file
                            </a>
                          </div>

                          {submission.description && (
                            <p className="text-sm text-muted-foreground border-l-2 pl-3 mt-2">
                              {submission.description}
                            </p>
                          )}
                        </div>

                        <ModerationActions 
                          resourceId={submission.id}
                          files={filesMap.get(submission.id) || []}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Check className="h-12 w-12 mx-auto text-primary/50 mb-4" />
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-muted-foreground mt-1">
                    No pending submissions to review.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Reviewed */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Reviewed</CardTitle>
              <CardDescription>
                Your recent moderation activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentlyReviewed && recentlyReviewed.length > 0 ? (
                <div className="space-y-3">
                  {recentlyReviewed.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{submission.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.course_code} • {formatDate(submission.approved_at || submission.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={submission.status === "approved" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {submission.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
