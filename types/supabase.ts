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
      expenses: {
        Row: {
          amount: number | null
          date: string | null
          id: number
          memo: string | null
          store_id: number | null
          type: string | null
          updated_at: string | null
          vendor_id: number | null
        }
        Insert: {
          amount?: number | null
          date?: string | null
          id?: number
          memo?: string | null
          store_id?: number | null
          type?: string | null
          updated_at?: string | null
          vendor_id?: number | null
        }
        Update: {
          amount?: number | null
          date?: string | null
          id?: number
          memo?: string | null
          store_id?: number | null
          type?: string | null
          updated_at?: string | null
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          }
        ]
      }
      others: {
        Row: {
          amount: number | null
          date: string | null
          id: number
          memo: string | null
          store_name: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          date?: string | null
          id?: number
          memo?: string | null
          store_name?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          date?: string | null
          id?: number
          memo?: string | null
          store_name?: string | null
          type?: string | null
          updated_at?: string | null
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