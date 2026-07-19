export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      drivers: {
        Row: {
          cdl_expiry: string | null
          cdl_number: string | null
          cdl_state: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          medical_card_expiry: string | null
          org_id: string
          phone: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cdl_expiry?: string | null
          cdl_number?: string | null
          cdl_state?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          medical_card_expiry?: string | null
          org_id: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cdl_expiry?: string | null
          cdl_number?: string | null
          cdl_state?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          medical_card_expiry?: string | null
          org_id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          created_at: string | null
          document_type: string
          driver_id: string
          expiry_date: string | null
          file_type: string | null
          file_url: string
          id: string
          notes: string | null
          org_id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          driver_id: string
          expiry_date?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          notes?: string | null
          org_id: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          driver_id?: string
          expiry_date?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          org_id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      dvir_items: {
        Row: {
          created_at: string | null
          defect_description: string | null
          defect_image_url: string | null
          dvir_report_id: string
          id: string
          item_key: string
          label: string
          repaired: boolean | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          defect_description?: string | null
          defect_image_url?: string | null
          dvir_report_id: string
          id?: string
          item_key: string
          label: string
          repaired?: boolean | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          defect_description?: string | null
          defect_image_url?: string | null
          dvir_report_id?: string
          id?: string
          item_key?: string
          label?: string
          repaired?: boolean | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dvir_items_dvir_report_id_fkey"
            columns: ["dvir_report_id"]
            isOneToOne: false
            referencedRelation: "dvir_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      dvir_reports: {
        Row: {
          created_at: string | null
          defect_count: number | null
          driver_id: string | null
          engine_hours: number | null
          id: string
          notes: string | null
          odometer: number | null
          org_id: string
          repair_count: number | null
          report_type: Database["public"]["Enums"]["dvir_type"]
          signature_data: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          defect_count?: number | null
          driver_id?: string | null
          engine_hours?: number | null
          id?: string
          notes?: string | null
          odometer?: number | null
          org_id: string
          repair_count?: number | null
          report_type: Database["public"]["Enums"]["dvir_type"]
          signature_data?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          defect_count?: number | null
          driver_id?: string | null
          engine_hours?: number | null
          id?: string
          notes?: string | null
          odometer?: number | null
          org_id?: string
          repair_count?: number | null
          report_type?: Database["public"]["Enums"]["dvir_type"]
          signature_data?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dvir_reports_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dvir_reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dvir_reports_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dvir_reports_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_purchases: {
        Row: {
          created_at: string | null
          date: string
          gallons: number
          id: string
          ifta_report_id: string | null
          org_id: string
          price_per_gallon: number | null
          receipt_url: string | null
          state: string
          total_cost: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          gallons: number
          id?: string
          ifta_report_id?: string | null
          org_id: string
          price_per_gallon?: number | null
          receipt_url?: string | null
          state: string
          total_cost?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          gallons?: number
          id?: string
          ifta_report_id?: string | null
          org_id?: string
          price_per_gallon?: number | null
          receipt_url?: string | null
          state?: string
          total_cost?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_purchases_ifta_report_id_fkey"
            columns: ["ifta_report_id"]
            isOneToOne: false
            referencedRelation: "ifta_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_purchases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_purchases_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      ifta_reports: {
        Row: {
          created_at: string | null
          id: string
          net_due: number | null
          org_id: string
          quarter: string
          state_breakdown: Json | null
          status: string
          tax_due: number | null
          tax_paid: number | null
          total_gallons: number | null
          total_miles: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          net_due?: number | null
          org_id: string
          quarter: string
          state_breakdown?: Json | null
          status?: string
          tax_due?: number | null
          tax_paid?: number | null
          total_gallons?: number | null
          total_miles?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          net_due?: number | null
          org_id?: string
          quarter?: string
          state_breakdown?: Json | null
          status?: string
          tax_due?: number | null
          tax_paid?: number | null
          total_gallons?: number | null
          total_miles?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ifta_reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          dot_number: string | null
          id: string
          mc_number: string | null
          name: string
          phone: string | null
          slug: string
          state: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          dot_number?: string | null
          id?: string
          mc_number?: string | null
          name: string
          phone?: string | null
          slug: string
          state?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          dot_number?: string | null
          id?: string
          mc_number?: string | null
          name?: string
          phone?: string | null
          slug?: string
          state?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          org_id: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          org_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          org_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string | null
          id: string
          make: string | null
          model: string | null
          org_id: string
          plate_number: string | null
          plate_state: string | null
          status: string | null
          unit_number: string
          updated_at: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          make?: string | null
          model?: string | null
          org_id: string
          plate_number?: string | null
          plate_state?: string | null
          status?: string | null
          unit_number: string
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          make?: string | null
          model?: string | null
          org_id?: string
          plate_number?: string | null
          plate_state?: string | null
          status?: string | null
          unit_number?: string
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      dvir_type: "pre_trip" | "post_trip"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dvir_type: ["pre_trip", "post_trip"],
    },
  },
} as const
