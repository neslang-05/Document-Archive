"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { 
  FileText, 
  Download, 
  Star, 
  Bookmark, 
  BookmarkCheck,
  Share2,
  Flag,
  Clock,
  User,
  Calendar,
  Eye,
  ChevronLeft,
  ExternalLink,
  MessageSquare
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { formatDate, formatNumber } from "@/lib/utils"

// Mock data - would be fetched from Supabase
const mockResource = {
  id: "1",
  title: "Database Management Systems - End Term Question Paper 2024",
  description: "Complete end-term examination paper for DBMS. Covers SQL queries, normalization, ER diagrams, transaction management, and concurrency control. This paper is from the December 2024 examination.",
  course: { 
    id: "cs3522",
    code: "CS3522", 
    name: "Database Management Systems",
    semester: 5,
    credits: 4,
    department: "Computer Science"
  },
  category: "question_paper",
  examType: "end_term",
  year: 2024,
  uploader: { 
    id: "user1",
    name: "Rahul Sharma", 
    email: "rahul@mtu.ac.in",
    avatar: null
  },
  fileUrl: "#",
  fileName: "CS3522_EndTerm_2024.pdf",
  fileSize: 2456789,
  fileType: "application/pdf",
  uploadedAt: "2024-12-20T10:30:00Z",
  approvedAt: "2024-12-20T14:45:00Z",
  views: 234,
  downloads: 89,
  rating: 4.5,
  ratingCount: 23,
  status: "approved",
}

const mockRatings = [
  {
    id: "1",
    user: { name: "Priya Singh", avatar: null },
    rating: 5,
    comment: "Very helpful! The questions are exactly what was asked in the exam. Great quality scan.",
    createdAt: "2024-12-22T09:15:00Z",
  },
  {
    id: "2",
    user: { name: "Amit Kumar", avatar: null },
    rating: 4,
    comment: "Good paper. Some answers would have been helpful too.",
    createdAt: "2024-12-21T16:30:00Z",
  },
  {
    id: "3",
    user: { name: "Neha Devi", avatar: null },
    rating: 5,
    comment: "Perfect preparation material. Thanks for uploading!",
    createdAt: "2024-12-20T20:00:00Z",
  },
]

const mockRelated = [
  {
    id: "2",
    title: "DBMS Mid-Term 2024",
    category: "question_paper",
    rating: 4.2,
    downloads: 156,
  },
  {
    id: "3",
    title: "DBMS Complete Notes",
    category: "notes",
    rating: 4.8,
    downloads: 312,
  },
  {
    id: "4",
    title: "DBMS Lab Manual",
    category: "lab_manual",
    rating: 4.3,
    downloads: 98,
  },
]

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

export default function ResourcePage() {
  const params = useParams()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [comment, setComment] = useState("")

  const resource = mockResource
  const ratings = mockRatings
  const related = mockRelated

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onSelect?.(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : star - 0.5 <= rating
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <Breadcrumbs
            items={[
              { label: "Courses", href: "/courses" },
              { label: resource.course.code, href: `/courses/${resource.course.id}` },
              { label: resource.title },
            ]}
            className="mb-6"
          />

          {/* Back Link */}
          <Link
            href={`/courses/${resource.course.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to {resource.course.code}
          </Link>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resource Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="secondary" className={categoryColors[resource.category]}>
                      {categoryLabels[resource.category]}
                    </Badge>
                    {resource.examType && (
                      <Badge variant="outline">
                        {examTypeLabels[resource.examType]}
                      </Badge>
                    )}
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                      {resource.year}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold mb-2">{resource.title}</h1>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <Link 
                      href={`/courses/${resource.course.id}`}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <span className="font-mono font-medium">{resource.course.code}</span>
                      <span>•</span>
                      <span>{resource.course.name}</span>
                    </Link>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    {resource.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      {renderStars(resource.rating)}
                      <span className="font-medium">{resource.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({resource.ratingCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {formatNumber(resource.views)} views
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Download className="h-4 w-4" />
                      {formatNumber(resource.downloads)} downloads
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Button className="gap-2">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      {isBookmarked ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                          Bookmarked
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4" />
                          Bookmark
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-muted-foreground">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* PDF Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] rounded-lg border-2 border-dashed bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">{resource.fileName}</p>
                      <p className="text-muted-foreground">
                        {formatFileSize(resource.fileSize)}
                      </p>
                      <Button className="mt-4 gap-2">
                        <Download className="h-4 w-4" />
                        Download to View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Reviews
                  </CardTitle>
                  <CardDescription>
                    {resource.ratingCount} reviews • Average {resource.rating.toFixed(1)} out of 5
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Submit Review */}
                  <div className="rounded-lg border p-4 mb-6">
                    <h4 className="font-medium mb-3">Write a Review</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-muted-foreground">Your rating:</span>
                      {renderStars(userRating, true, setUserRating)}
                    </div>
                    <Textarea
                      placeholder="Share your thoughts about this resource..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="mb-3"
                    />
                    <Button disabled={userRating === 0}>
                      Submit Review
                    </Button>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {ratings.map((review) => (
                      <div key={review.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {review.user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{review.user.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* File Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">File Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Name</span>
                    <span className="font-mono text-xs">{resource.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Size</span>
                    <span>{formatFileSize(resource.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>PDF Document</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded</span>
                    <span>{formatDate(resource.uploadedAt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Uploader */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Uploaded By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {resource.uploader.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{resource.uploader.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(resource.uploadedAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code</span>
                    <span className="font-mono font-medium">{resource.course.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="text-right">{resource.course.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semester</span>
                    <span>{resource.course.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits</span>
                    <span>{resource.course.credits}</span>
                  </div>
                  <Separator />
                  <Link href={`/courses/${resource.course.id}`}>
                    <Button variant="outline" className="w-full gap-2">
                      View All {resource.course.code} Resources
                      <ChevronLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Related Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Related Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/resources/${item.id}`}
                      className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${categoryColors[item.category]}`}
                        >
                          {categoryLabels[item.category]}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {item.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {item.downloads}
                        </span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
