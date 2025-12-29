export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = "guest" | "user" | "moderator"

export type ResourceCategory = "question_paper" | "notes" | "lab_manual" | "project_report"

export type ExamType = "mid_term" | "end_term" | "quiz" | "assignment" | "other"

export type SubmissionStatus = "pending" | "approved" | "rejected"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          code?: string
          description?: string | null
        }
      }
      courses: {
        Row: {
          id: string
          department_id: string
          code: string
          name: string
          semester: number
          credits: number | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          department_id: string
          code: string
          name: string
          semester: number
          credits?: number | null
          description?: string | null
          created_at?: string
        }
        Update: {
          department_id?: string
          code?: string
          name?: string
          semester?: number
          credits?: number | null
          description?: string | null
        }
      }
      resources: {
        Row: {
          id: string
          course_id: string
          uploader_id: string
          title: string
          description: string | null
          category: ResourceCategory
          exam_type: ExamType | null
          year: number
          file_url: string
          file_name: string
          file_size: number
          file_type: string
          status: SubmissionStatus
          download_count: number
          average_rating: number
          rating_count: number
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          uploader_id: string
          title: string
          description?: string | null
          category: ResourceCategory
          exam_type?: ExamType | null
          year: number
          file_url: string
          file_name: string
          file_size: number
          file_type: string
          status?: SubmissionStatus
          download_count?: number
          average_rating?: number
          rating_count?: number
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          title?: string
          description?: string | null
          category?: ResourceCategory
          exam_type?: ExamType | null
          year?: number
          file_url?: string
          file_name?: string
          status?: SubmissionStatus
          download_count?: number
          average_rating?: number
          rating_count?: number
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          resource_id: string
          user_id: string
          rating: number
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          user_id: string
          rating: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          rating?: number
          review?: string | null
          updated_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          created_at?: string
        }
        Update: Partial<{
          id: string
          user_id: string
          resource_id: string
          created_at: string
        }>
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: Partial<{
          id: string
          user_id: string | null
          action: string
          resource_id: string | null
          metadata: Json | null
          created_at: string
        }>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: UserRole
      }
    }
    Enums: {
      user_role: UserRole
      resource_category: ResourceCategory
      exam_type: ExamType
      submission_status: SubmissionStatus
    }
  }
}

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Department = Database["public"]["Tables"]["departments"]["Row"]
export type Course = Database["public"]["Tables"]["courses"]["Row"]
export type Resource = Database["public"]["Tables"]["resources"]["Row"]
export type Rating = Database["public"]["Tables"]["ratings"]["Row"]
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"]
export type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"]

// Extended types with relations
export type ResourceWithCourse = Resource & {
  course: Course & {
    department: Department
  }
  uploader: Pick<Profile, "id" | "full_name" | "avatar_url">
}

export type CourseWithDepartment = Course & {
  department: Department
  resource_count?: number
}
