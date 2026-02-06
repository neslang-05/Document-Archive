import { getCurrentUser } from "@/lib/auth/session"
import { getD1, type ResourceRow } from "@/lib/db/d1"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { FileText, Download, Star, MoreVertical, Eye } from "lucide-react"
import { formatNumber, formatDate } from "@/lib/utils"
import Link from "next/link"

export default async function SubmissionsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

  const db = getD1()
  const { results: submissions } = await db
    .prepare(`
      SELECT r.*, c.code as course_code, c.name as course_name
      FROM resources r
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE r.uploader_id = ?
      ORDER BY r.created_at DESC
    `)
    .bind(currentUser.firebaseUser.uid)
    .all<ResourceRow & { course_code: string | null; course_name: string | null }>()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">My Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Manage your uploaded resources and check their status.
          </p>
        </div>
        <Link href="/submit" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Upload New Resource</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {submissions && submissions.length > 0 ? (
          submissions.map((submission) => (
            <Card key={submission.id}>
              <CardContent className="p-4 md:p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg wrap-break-word">{submission.title}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                        {submission.course_code}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="capitalize">{submission.category.replace('_', ' ')}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-xs">{formatDate(submission.created_at)}</span>
                    </div>
                    {submission.status === 'rejected' && submission.rejection_reason && (
                      <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs sm:text-sm">
                        <p className="text-destructive font-medium mb-1">Rejection Reason:</p>
                        <p className="text-muted-foreground wrap-break-word">{submission.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t">
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1" title="Downloads">
                      <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{formatNumber(submission.download_count)}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Rating">
                      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{submission.average_rating?.toFixed(1) || "0.0"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        submission.status === 'approved' ? 'default' : 
                        submission.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                      className="capitalize text-xs"
                    >
                      {submission.status}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/resources/${submission.id}`}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Resource
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No submissions yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              You haven&apos;t uploaded any resources yet. Share your knowledge with the community!
            </p>
            <Link href="/submit">
              <Button>Upload Resource</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
