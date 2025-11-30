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
      routines: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          image_url: string | null
          rest_between_sets: number
          rest_between_exercises: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          image_url?: string | null
          rest_between_sets?: number
          rest_between_exercises?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          rest_between_sets?: number
          rest_between_exercises?: number
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          routine_id: string
          name: string
          sets: number
          reps: number
          weight: number | null
          notes: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          routine_id: string
          name: string
          sets: number
          reps: number
          weight?: number | null
          notes?: string | null
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          routine_id?: string
          name?: string
          sets?: number
          reps?: number
          weight?: number | null
          notes?: string | null
          order_index?: number
          created_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          routine_id: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          routine_id: string
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          routine_id?: string
          date?: string
          created_at?: string
        }
      }
      session_exercises: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          completed_sets: number
          actual_reps: number[]
          actual_weight: number[]
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          completed_sets: number
          actual_reps: number[]
          actual_weight: number[]
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string
          completed_sets?: number
          actual_reps?: number[]
          actual_weight?: number[]
          created_at?: string
        }
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
  }
}
