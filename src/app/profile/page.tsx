"use client"

import Link from "next/link"
import {
  FileText,
  Bookmark,
  Clock,
  Star,
  Download,
  Upload,
  Settings,
  LogOut,
  Calendar,
  Award,
  TrendingUp
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatNumber } from "@/lib/utils"

// Mock user data
const mockUser = {
  id: "1",
  full_name: "Rahul Sharma",
  email: "rahul@mtu.ac.in",
  avatar_url: null,
  role: "student",
  semester: 5,
  department: "Computer Science",
  created_at: "2024-01-15T10:00:00Z",
  stats: {
    uploads: 12,
    downloads: 156,
    totalViews: 2340,
    averageRating: 4.3,
    bookmarks: 24,
    contributions: 18,
  },
}

// Mock uploads
const mockUploads = [
  {
    id: "1",
    title: "DBMS End-Term 2024",
    course: { code: "CS3522", name: "Database Management Systems" },
    category: "question_paper",
    status: "approved",
    uploadedAt: "2024-12-20T10:30:00Z",
    rating: 4.5,
    ratingCount: 23,
    downloads: 156,
  },
  {
    id: "2",
    title: "OS Complete Notes",
    course: { code: "CS3531", name: "Operating Systems" },
    category: "notes",
    status: "approved",
    uploadedAt: "2024-11-15T14:20:00Z",
    rating: 4.8,
    ratingCount: 45,
    downloads: 312,
  },
  {
    id: "3",
    title: "AI Mid-Term 2024",
    course: { code: "CS3524", name: "Artificial Intelligence" },
    category: "question_paper",
    status: "pending",
    uploadedAt: "2024-12-28T09:15:00Z",
    rating: 0,
    ratingCount: 0,
    downloads: 0,
  },
]

// Mock bookmarks
const mockBookmarks = [
  {
    id: "1",
    resource: {
      id: "10",
      title: "Machine Learning Complete Guide",
      course: { code: "CS4753", name: "Machine Learning" },
      category: "notes",
      rating: 4.9,
      downloads: 567,
    },
    bookmarkedAt: "2024-12-27T16:30:00Z",
  },
  {
    id: "2",
    resource: {
      id: "11",
      title: "CNS End-Term 2024",
      course: { code: "CS4748", name: "Cryptography and Network Security" },
      category: "question_paper",
      rating: 4.2,
      downloads: 189,
    },
    bookmarkedAt: "2024-12-25T11:00:00Z",
  },
  {
    id: "3",
    resource: {
      id: "12",
      title: "Cloud Computing Lab Manual",
      course: { code: "CS4862", name: "Cloud Computing Lab" },
      category: "lab_manual",
      rating: 4.4,
      downloads: 234,
    },
    bookmarkedAt: "2024-12-20T14:45:00Z",
  },
]

// Mock activity
const mockActivity = [
  {
    id: "1",
    type: "upload",
    title: "You uploaded DBMS End-Term 2024",
    timestamp: "2024-12-20T10:30:00Z",
  },
  {
    id: "2",
    type: "approved",
    title: "Your upload OS Complete Notes was approved",
    timestamp: "2024-11-15T16:00:00Z",
  },
  {
    id: "3",
    type: "bookmark",
    title: "You bookmarked Machine Learning Complete Guide",
    timestamp: "2024-12-27T16:30:00Z",
  },
  {
    id: "4",
    type: "rating",
    title: "Someone rated your DBMS End-Term 2024 ★★★★★",
    timestamp: "2024-12-22T09:15:00Z",
  },
]

const categoryLabels: Record<string, string> = {
  question_paper: "Question Paper",
  notes: "Notes",
  lab_manual: "Lab Manual",
  project_report: "Project Report",
}

const categoryColors: Record<string, string> = {
  question_paper: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  notes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  lab_manual: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  project_report: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
}

export default function ProfilePage() {
  const user = mockUser
  const uploads = mockUploads
  const bookmarks = mockBookmarks
  const activity = mockActivity

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
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
            items={[{ label: "Profile" }]}
            className="mb-6"
          />

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Sidebar - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="p-6 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {user.full_name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user.full_name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    <Badge variant="outline">Sem {user.semester}</Badge>
                  </div>
                  <Separator className="my-4" />
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(user.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      Uploads
                    </span>
                    <span className="font-medium">{user.stats.uploads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Total Downloads
                    </span>
                    <span className="font-medium">{formatNumber(user.stats.downloads)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Avg. Rating
                    </span>
                    <span className="font-medium">{user.stats.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Bookmark className="h-4 w-4" />
                      Bookmarks
                    </span>
                    <span className="font-medium">{user.stats.bookmarks}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/submit">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Resource
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              <Tabs defaultValue="uploads" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="uploads" className="gap-2">
                    <FileText className="h-4 w-4" />
                    My Uploads
                    <Badge variant="secondary" className="ml-1">
                      {uploads.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="bookmarks" className="gap-2">
                    <Bookmark className="h-4 w-4" />
                    Bookmarks
                    <Badge variant="secondary" className="ml-1">
                      {bookmarks.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                {/* Uploads Tab */}
                <TabsContent value="uploads" className="space-y-4">
                  {uploads.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No uploads yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start contributing to help your peers!
                        </p>
                        <Link href="/submit">
                          <Button className="gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Resource
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {uploads.map((upload) => (
                        <Card key={upload.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge
                                    variant="secondary"
                                    className={categoryColors[upload.category]}
                                  >
                                    {categoryLabels[upload.category]}
                                  </Badge>
                                  <Badge
                                    variant={
                                      upload.status === "approved"
                                        ? "approved"
                                        : upload.status === "pending"
                                        ? "pending"
                                        : "rejected"
                                    }
                                  >
                                    {upload.status}
                                  </Badge>
                                </div>
                                <Link href={`/resources/${upload.id}`}>
                                  <h3 className="font-semibold hover:text-primary">
                                    {upload.title}
                                  </h3>
                                </Link>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <Link href={`/courses/${upload.course.code.toLowerCase()}`}>
                                    <span className="font-mono hover:text-primary">
                                      {upload.course.code}
                                    </span>
                                  </Link>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(upload.uploadedAt)}
                                  </span>
                                </div>
                              </div>
                              {upload.status === "approved" && (
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    {renderStars(Math.round(upload.rating))}
                                    <span className="ml-1 font-medium">
                                      {upload.rating.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Download className="h-4 w-4" />
                                    {formatNumber(upload.downloads)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Bookmarks Tab */}
                <TabsContent value="bookmarks" className="space-y-4">
                  {bookmarks.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No bookmarks yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Save resources for quick access later
                        </p>
                        <Link href="/courses">
                          <Button className="gap-2">
                            Browse Courses
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {bookmarks.map((bookmark) => (
                        <Card key={bookmark.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    variant="secondary"
                                    className={categoryColors[bookmark.resource.category]}
                                  >
                                    {categoryLabels[bookmark.resource.category]}
                                  </Badge>
                                </div>
                                <Link href={`/resources/${bookmark.resource.id}`}>
                                  <h3 className="font-semibold hover:text-primary">
                                    {bookmark.resource.title}
                                  </h3>
                                </Link>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <span className="font-mono">
                                    {bookmark.resource.course.code}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Bookmark className="h-3 w-3" />
                                    Saved {formatDate(bookmark.bookmarkedAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  {renderStars(Math.round(bookmark.resource.rating))}
                                  <span className="ml-1 font-medium">
                                    {bookmark.resource.rating.toFixed(1)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Download className="h-4 w-4" />
                                  {formatNumber(bookmark.resource.downloads)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                      <CardDescription>Your recent actions on the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activity.map((item) => (
                          <div key={item.id} className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              {item.type === "upload" && <Upload className="h-4 w-4" />}
                              {item.type === "approved" && <Award className="h-4 w-4 text-green-600" />}
                              {item.type === "bookmark" && <Bookmark className="h-4 w-4" />}
                              {item.type === "rating" && <Star className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(item.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
