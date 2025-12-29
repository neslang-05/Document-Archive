"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Shield, 
  FileText, 
  Check, 
  X, 
  Eye, 
  Download,
  Clock,
  User,
  Filter,
  Search,
  ChevronDown,
  AlertTriangle,
  ExternalLink
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/lib/utils"

// Mock data for pending submissions
const mockSubmissions = [
  {
    id: "1",
    title: "DBMS End-Term Question Paper 2024",
    course: { code: "CS3522", name: "Database Management Systems" },
    category: "question_paper",
    examType: "end_term",
    year: 2024,
    uploader: { name: "John Doe", email: "john@mtu.ac.in" },
    fileUrl: "#",
    fileName: "CS3522_EndTerm_2024.pdf",
    fileSize: 2456789,
    submittedAt: "2024-12-28T10:30:00Z",
    status: "pending",
  },
  {
    id: "2",
    title: "AI Complete Notes - Unit 1-5",
    course: { code: "CS3524", name: "Artificial Intelligence" },
    category: "notes",
    examType: null,
    year: 2024,
    uploader: { name: "Jane Smith", email: "jane@mtu.ac.in" },
    fileUrl: "#",
    fileName: "AI_Notes_Complete.pdf",
    fileSize: 5678901,
    submittedAt: "2024-12-27T15:45:00Z",
    status: "pending",
  },
  {
    id: "3",
    title: "Operating Systems Lab Manual",
    course: { code: "CS3637", name: "Operating Systems Laboratory" },
    category: "lab_manual",
    examType: null,
    year: 2024,
    uploader: { name: "Mike Johnson", email: "mike@mtu.ac.in" },
    fileUrl: "#",
    fileName: "OS_Lab_Manual_2024.pdf",
    fileSize: 3456789,
    submittedAt: "2024-12-26T09:15:00Z",
    status: "pending",
  },
  {
    id: "4",
    title: "CNS Mid-Term 2024",
    course: { code: "CS4748", name: "Cryptography and Network Security" },
    category: "question_paper",
    examType: "mid_term",
    year: 2024,
    uploader: { name: "Sarah Williams", email: "sarah@mtu.ac.in" },
    fileUrl: "#",
    fileName: "CNS_MidTerm_2024.pdf",
    fileSize: 1234567,
    submittedAt: "2024-12-25T14:20:00Z",
    status: "pending",
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

export default function ModerationPage() {
  const [submissions, setSubmissions] = useState(mockSubmissions)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<typeof mockSubmissions[0] | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  const pendingCount = submissions.filter((s) => s.status === "pending").length

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.uploader.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || submission.status === activeTab
    return matchesSearch && matchesTab
  })

  const handleApprove = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s))
    )
    setSelectedSubmission(null)
  }

  const handleReject = () => {
    if (selectedSubmission && rejectionReason.trim()) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSubmission.id ? { ...s, status: "rejected" } : s))
      )
      setRejectDialogOpen(false)
      setSelectedSubmission(null)
      setRejectionReason("")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={{ id: "1", email: "moderator@mtu.ac.in", full_name: "Moderator", role: "moderator" }} />
      
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <Breadcrumbs
            items={[{ label: "Moderation Queue" }]}
            className="mb-6"
          />

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Moderation Queue
              </h1>
              <p className="text-muted-foreground mt-1">
                Review and manage pending submissions
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search submissions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {submissions.filter((s) => s.status === "approved").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved Today</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                  <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {submissions.filter((s) => s.status === "rejected").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Rejected Today</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                  <p className="text-sm text-muted-foreground">Total Today</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <Check className="h-4 w-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <X className="h-4 w-4" />
                Rejected
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No submissions found</h3>
                    <p className="text-muted-foreground">
                      {activeTab === "pending"
                        ? "All caught up! No pending submissions to review."
                        : "No submissions match your search criteria."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <Card key={submission.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row">
                          {/* Main Content */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                                    {submission.course.code}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={categoryColors[submission.category]}
                                  >
                                    {categoryLabels[submission.category]}
                                  </Badge>
                                  {submission.examType && (
                                    <Badge variant="outline">
                                      {examTypeLabels[submission.examType]}
                                    </Badge>
                                  )}
                                  <span className="font-mono text-xs text-muted-foreground">
                                    {submission.year}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-lg">{submission.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {submission.course.name}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  submission.status === "pending"
                                    ? "pending"
                                    : submission.status === "approved"
                                    ? "approved"
                                    : "rejected"
                                }
                              >
                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {submission.uploader.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(submission.submittedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {submission.fileName} ({formatFileSize(submission.fileSize)})
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          {submission.status === "pending" && (
                            <div className="flex lg:flex-col items-center gap-2 p-4 lg:border-l bg-muted/30">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <Eye className="h-4 w-4" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                className="gap-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(submission.id)}
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-1"
                                onClick={() => {
                                  setSelectedSubmission(submission)
                                  setRejectDialogOpen(true)
                                }}
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Preview Dialog */}
      <Dialog open={!!selectedSubmission && !rejectDialogOpen} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Submission</DialogTitle>
            <DialogDescription>
              Review the submission details before approving or rejecting
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium">{selectedSubmission.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course</span>
                  <span className="font-mono">{selectedSubmission.course.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{categoryLabels[selectedSubmission.category]}</span>
                </div>
                {selectedSubmission.examType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exam Type</span>
                    <span>{examTypeLabels[selectedSubmission.examType]}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year</span>
                  <span className="font-mono">{selectedSubmission.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded by</span>
                  <span>{selectedSubmission.uploader.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File</span>
                  <span>{selectedSubmission.fileName}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download File
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => setRejectDialogOpen(true)}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedSubmission && handleApprove(selectedSubmission.id)}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Reject Submission
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be sent to the uploader.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Low quality scan, incorrect course assignment, duplicate submission..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
