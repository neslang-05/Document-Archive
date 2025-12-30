import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Star, Clock, MoreVertical, Eye } from "lucide-react"
import { formatNumber, formatDate } from "@/lib/utils"
import Link from "next/link"
import SubmissionActions from "./submission-actions"

export default async function SubmissionsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: submissions } = await supabase
    .from('resources')
    .select(`
      *,
      courses (
        code,
        name
      )
    `)
    .eq('uploader_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Submissions</h1>
          <p className="text-muted-foreground">
            Manage your uploaded resources and check their status.
          </p>
        </div>
        <Link href="/submit">
          <Button>Upload New Resource</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {submissions && submissions.length > 0 ? (
          submissions.map((submission) => (
            <Card key={submission.id}>
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
<div className="flex items-center gap-4 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{submission.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                        {submission.courses?.code}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{submission.category.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{formatDate(submission.created_at)}</span>
                    </div>
                    {submission.status === 'rejected' && submission.rejection_reason && (
                      <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm">
                        <p className="text-destructive font-medium mb-1">Rejection Reason:</p>
                        <p className="text-muted-foreground">{submission.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1" title="Downloads">
                      <Download className="h-4 w-4" />
                      {formatNumber(submission.download_count)}
                    </div>
                    <div className="flex items-center gap-1" title="Rating">
                      <Star className="h-4 w-4" />
                      {submission.average_rating?.toFixed(1) || "0.0"}
                    </div>
                  </div>

                  <Badge 
                    variant={
                      submission.status === 'approved' ? 'default' : 
                      submission.status === 'rejected' ? 'destructive' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {submission.status}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No submissions yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              You haven't uploaded any resources yet. Share your knowledge with the community!
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
