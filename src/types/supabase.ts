export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          present_days: number
          total_days: number
          student_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          present: boolean
          student_id: string
          subject_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          present?: boolean
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          }
        ]
      }
      internship_reports: {
        Row: {
          created_at: string
          file_path: string
          id: string
          student_id: string
          title: string
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          student_id: string
          title: string
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      leave_applications: {
        Row: {
          approved: boolean | null
          created_at: string
          end_date: string
          id: string
          reason: string
          start_date: string
          student_id: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string
          end_date: string
          id?: string
          reason: string
          start_date: string
          student_id: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string
          end_date?: string
          id?: string
          reason?: string
          start_date?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      marks: {
        Row: {
          created_at: string
          id: string
          marks: number
          semester: number
          student_id: string
          subject_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          marks: number
          semester: number
          student_id: string
          subject_id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          marks?: number
          semester?: number
          student_id?: string
          subject_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          }
        ]
      }
      mentoring_sessions: {
        Row: {
          created_at: string
          date: string
          id: string
          mentor_id: string
          notes: string | null
          student_id: string
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          mentor_id: string
          notes?: string | null
          student_id: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          mentor_id?: string
          notes?: string | null
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notices: {
        Row: {
          content: string
          created_at: string
          created_by: string
          file_path: string | null
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          file_path?: string | null
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          file_path?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          mentor_id: string | null
          phone: string | null
          role: string
          semester: number | null
          year_of_admission: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          mentor_id?: string | null
          phone?: string | null
          role: string
          semester?: number | null
          year_of_admission?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          mentor_id?: string | null
          phone?: string | null
          role?: string
          semester?: number | null
          year_of_admission?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          semester: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          semester: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          semester?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}