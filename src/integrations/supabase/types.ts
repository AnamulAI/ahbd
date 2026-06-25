export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      builder_ai_types: {
        Row: {
          base_price: number
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
        }
        Update: {
          base_price?: number
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
        }
        Relationships: []
      }
      builder_categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          is_required: boolean
          key: string
          label: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_required?: boolean
          key: string
          label: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_required?: boolean
          key?: string
          label?: string
        }
        Relationships: []
      }
      builder_leads: {
        Row: {
          chosen_payment_plan: string | null
          created_at: string
          email: string | null
          id: string
          idea_description: string | null
          name: string | null
          selected_config: Json
          starting_point: string | null
          status: string
          total_price: number | null
          whatsapp: string | null
        }
        Insert: {
          chosen_payment_plan?: string | null
          created_at?: string
          email?: string | null
          id?: string
          idea_description?: string | null
          name?: string | null
          selected_config?: Json
          starting_point?: string | null
          status?: string
          total_price?: number | null
          whatsapp?: string | null
        }
        Update: {
          chosen_payment_plan?: string | null
          created_at?: string
          email?: string | null
          id?: string
          idea_description?: string | null
          name?: string | null
          selected_config?: Json
          starting_point?: string | null
          status?: string
          total_price?: number | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      builder_options: {
        Row: {
          category_key: string
          created_at: string
          display_order: number
          id: string
          input_type: string
          is_active: boolean
          is_default: boolean
          label: string
          option_group: string
          price_delta: number
        }
        Insert: {
          category_key: string
          created_at?: string
          display_order?: number
          id?: string
          input_type?: string
          is_active?: boolean
          is_default?: boolean
          label: string
          option_group: string
          price_delta?: number
        }
        Update: {
          category_key?: string
          created_at?: string
          display_order?: number
          id?: string
          input_type?: string
          is_active?: boolean
          is_default?: boolean
          label?: string
          option_group?: string
          price_delta?: number
        }
        Relationships: []
      }
      builder_podcast_types: {
        Row: {
          base_price: number
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
        }
        Update: {
          base_price?: number
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
        }
        Relationships: []
      }
      builder_tech_approaches: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          key: string
          label: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          key: string
          label: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          key?: string
          label?: string
        }
        Relationships: []
      }
      builder_tiers: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          price_delta: number
          use_case_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          price_delta?: number
          use_case_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          price_delta?: number
          use_case_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_tiers_use_case_id_fkey"
            columns: ["use_case_id"]
            isOneToOne: false
            referencedRelation: "builder_use_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_use_case_pricing: {
        Row: {
          base_price: number
          created_at: string
          id: string
          is_available: boolean
          tech_approach_id: string
          use_case_id: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          id?: string
          is_available?: boolean
          tech_approach_id: string
          use_case_id: string
        }
        Update: {
          base_price?: number
          created_at?: string
          id?: string
          is_available?: boolean
          tech_approach_id?: string
          use_case_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_use_case_pricing_tech_approach_id_fkey"
            columns: ["tech_approach_id"]
            isOneToOne: false
            referencedRelation: "builder_tech_approaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_use_case_pricing_use_case_id_fkey"
            columns: ["use_case_id"]
            isOneToOne: false
            referencedRelation: "builder_use_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_use_cases: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          key: string
          label: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          key: string
          label: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          key?: string
          label?: string
        }
        Relationships: []
      }
      contact_leads: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          project_brief: string | null
          service_interest: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          project_brief?: string | null
          service_interest: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          project_brief?: string | null
          service_interest?: string
          status?: string
        }
        Relationships: []
      }
      sample_previews: {
        Row: {
          audience_category: string
          audio_url: string | null
          business_name: string
          clip_instagram_url: string | null
          clip_linkedin_url: string | null
          clip_tiktok_url: string | null
          created_at: string
          cta_link: string
          cta_text: string
          episode_title: string
          id: string
          logo_url: string | null
          module_order: Json
          platforms: Json
          show_smm: boolean
          show_video: boolean
          slug: string
          topic: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          audience_category?: string
          audio_url?: string | null
          business_name: string
          clip_instagram_url?: string | null
          clip_linkedin_url?: string | null
          clip_tiktok_url?: string | null
          created_at?: string
          cta_link?: string
          cta_text?: string
          episode_title?: string
          id?: string
          logo_url?: string | null
          module_order?: Json
          platforms?: Json
          show_smm?: boolean
          show_video?: boolean
          slug: string
          topic?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          audience_category?: string
          audio_url?: string | null
          business_name?: string
          clip_instagram_url?: string | null
          clip_linkedin_url?: string | null
          clip_tiktok_url?: string | null
          created_at?: string
          cta_link?: string
          cta_text?: string
          episode_title?: string
          id?: string
          logo_url?: string | null
          module_order?: Json
          platforms?: Json
          show_smm?: boolean
          show_video?: boolean
          slug?: string
          topic?: string
          updated_at?: string
          video_url?: string | null
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
    Enums: {},
  },
} as const
