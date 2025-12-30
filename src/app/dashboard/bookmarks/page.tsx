import { createClient } from "@/lib/supabase/server"
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
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select(`
      id,
      created_at,
      resources (
        id,
        title,
        category,
        download_count,
        average_rating,
        created_at,
        courses (
          code,
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
            const resource = bookmark.resources
            // Handle case where resource might have been deleted
            if (!resource) return null

            return (
              <Card key={bookmark.id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{resource.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                          {resource.courses?.code}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{resource.category.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Saved {formatDate(bookmark.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1" title="Downloads">
                        <Download className="h-4 w-4" />
                        {formatNumber(resource.download_count)}
                      </div>
                      <div className="flex items-center gap-1" title="Rating">
                        <Star className="h-4 w-4" />
                        {resource.average_rating?.toFixed(1) || "0.0"}
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
                        <Link href={`/resources/${resource.id}`}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Resource
                          </DropdownMenuItem>
                        </Link>
                        {/* Add remove bookmark action later */}
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
