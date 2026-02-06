import { getCurrentUser } from "@/lib/auth/session"
import { getD1 } from "@/lib/db/d1"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Star, MoreVertical, Eye } from "lucide-react"
import { formatNumber, formatDate } from "@/lib/utils"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function BookmarksPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

  const db = getD1()
  const { results: bookmarks } = await db
    .prepare(`
      SELECT b.id, b.created_at as bookmark_created_at,
             r.id as resource_id, r.title, r.category, r.download_count,
             r.average_rating, r.created_at as resource_created_at,
             c.code as course_code, c.name as course_name
      FROM bookmarks b
      INNER JOIN resources r ON b.resource_id = r.id
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `)
    .bind(currentUser.firebaseUser.uid)
    .all()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookmarks</h1>
        <p className="text-muted-foreground">
          Resources you&apos;ve saved for quick access.
        </p>
      </div>

      <div className="grid gap-4">
        {bookmarks && bookmarks.length > 0 ? (
          bookmarks.map((bookmark) => {
            return (
              <Card key={bookmark.id as string}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{bookmark.title as string}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                          {bookmark.course_code as string}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{(bookmark.category as string).replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Saved {formatDate(bookmark.bookmark_created_at as string)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1" title="Downloads">
                        <Download className="h-4 w-4" />
                        {formatNumber(bookmark.download_count as number)}
                      </div>
                      <div className="flex items-center gap-1" title="Rating">
                        <Star className="h-4 w-4" />
                        {(bookmark.average_rating as number)?.toFixed(1) || "0.0"}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/resources/${bookmark.resource_id}`}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Resource
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No bookmarks yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              You haven&apos;t bookmarked any resources yet. Browse courses to find useful materials!
            </p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
