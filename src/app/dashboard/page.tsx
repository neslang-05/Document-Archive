import { getCurrentUser } from "@/lib/auth/session"
import { getD1 } from "@/lib/db/d1"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Bookmark, Upload } from "lucide-react"
import { formatNumber, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect("/auth/login")
  }

  const db = getD1()
  const userId = currentUser.profile.id

  // Fetch user stats in parallel
  const [uploadCountResult, uploadsResult, bookmarkCountResult] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM resources WHERE uploader_id = ?').bind(userId).first<{ count: number }>(),
    db.prepare('SELECT download_count FROM resources WHERE uploader_id = ?').bind(userId).all<{ download_count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?').bind(userId).first<{ count: number }>(),
  ])

  const uploadCount = uploadCountResult?.count || 0
  const totalDownloads = uploadsResult?.results?.reduce((sum, item) => sum + (item.download_count || 0), 0) || 0
  const bookmarkCount = bookmarkCountResult?.count || 0

  // Fetch recent uploads
  const { results: recentUploads } = await db
    .prepare('SELECT id, title, created_at, status FROM resources WHERE uploader_id = ? ORDER BY created_at DESC LIMIT 5')
    .bind(userId)
    .all<{ id: string; title: string; created_at: string; status: string }>()

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your contributions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(uploadCount || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Resources contributed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalDownloads)}</div>
            <p className="text-xs text-muted-foreground">
              Across all your uploads
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(bookmarkCount || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Saved resources
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Uploads</h2>
        <div className="rounded-md border">
          {recentUploads && recentUploads.length > 0 ? (
            <div className="divide-y">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {upload.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded on {formatDate(upload.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={upload.status === 'approved' ? 'default' : 'secondary'}>
                    {upload.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No uploads yet. <Link href="/submit" className="text-primary hover:underline">Upload your first resource</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
