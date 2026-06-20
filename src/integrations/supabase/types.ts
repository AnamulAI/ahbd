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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          country: string | null
          created_at: string
          device_type: string
          event_type: string
          id: string
          link_text: string | null
          link_url: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string
          source: string
          time_on_page_seconds: number | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          device_type?: string
          event_type: string
          id?: string
          link_text?: string | null
          link_url?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id: string
          source?: string
          time_on_page_seconds?: number | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          device_type?: string
          event_type?: string
          id?: string
          link_text?: string | null
          link_url?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string
          source?: string
          time_on_page_seconds?: number | null
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string
          id: string
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          related_service: Database["public"]["Enums"]["related_service"] | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          related_service?:
            | Database["public"]["Enums"]["related_service"]
            | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          related_service?:
            | Database["public"]["Enums"]["related_service"]
            | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source_page: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source_page?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source_page?: string
        }
        Relationships: []
      }
      client_demo_pages: {
        Row: {
          audio_url: string | null
          book_call_link: string | null
          brand_name: string
          client_name: string
          closing_note: string | null
          cover_image: string | null
          created_at: string | null
          cta_button_text: string | null
          device_info: Json | null
          email: string | null
          episode_summary: string | null
          episode_title: string | null
          features: Json | null
          first_viewed_at: string | null
          id: string
          internal_notes: string | null
          is_published: boolean | null
          last_viewed_at: string | null
          outreach_status: string | null
          page_title: string
          personalized_intro: string | null
          phone: string | null
          podcast_category: string | null
          preview_mode: string | null
          secondary_cta_text: string | null
          sent_date: string | null
          slug: string
          subtitle: string | null
          transcript_highlights: string | null
          updated_at: string | null
          video_url: string | null
          view_count: number | null
          visitor_fingerprint: string | null
          website_url: string | null
          whatsapp_link: string | null
          why_fits_brand: string | null
        }
        Insert: {
          audio_url?: string | null
          book_call_link?: string | null
          brand_name: string
          client_name: string
          closing_note?: string | null
          cover_image?: string | null
          created_at?: string | null
          cta_button_text?: string | null
          device_info?: Json | null
          email?: string | null
          episode_summary?: string | null
          episode_title?: string | null
          features?: Json | null
          first_viewed_at?: string | null
          id?: string
          internal_notes?: string | null
          is_published?: boolean | null
          last_viewed_at?: string | null
          outreach_status?: string | null
          page_title: string
          personalized_intro?: string | null
          phone?: string | null
          podcast_category?: string | null
          preview_mode?: string | null
          secondary_cta_text?: string | null
          sent_date?: string | null
          slug: string
          subtitle?: string | null
          transcript_highlights?: string | null
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
          visitor_fingerprint?: string | null
          website_url?: string | null
          whatsapp_link?: string | null
          why_fits_brand?: string | null
        }
        Update: {
          audio_url?: string | null
          book_call_link?: string | null
          brand_name?: string
          client_name?: string
          closing_note?: string | null
          cover_image?: string | null
          created_at?: string | null
          cta_button_text?: string | null
          device_info?: Json | null
          email?: string | null
          episode_summary?: string | null
          episode_title?: string | null
          features?: Json | null
          first_viewed_at?: string | null
          id?: string
          internal_notes?: string | null
          is_published?: boolean | null
          last_viewed_at?: string | null
          outreach_status?: string | null
          page_title?: string
          personalized_intro?: string | null
          phone?: string | null
          podcast_category?: string | null
          preview_mode?: string | null
          secondary_cta_text?: string | null
          sent_date?: string | null
          slug?: string
          subtitle?: string | null
          transcript_highlights?: string | null
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
          visitor_fingerprint?: string | null
          website_url?: string | null
          whatsapp_link?: string | null
          why_fits_brand?: string | null
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
      demo_view_rate_limits: {
        Row: {
          client_ip_hash: string
          created_at: string
          id: string
          last_request_at: string
          request_count: number
          slug: string
          window_key: string
        }
        Insert: {
          client_ip_hash: string
          created_at?: string
          id?: string
          last_request_at?: string
          request_count?: number
          slug: string
          window_key: string
        }
        Update: {
          client_ip_hash?: string
          created_at?: string
          id?: string
          last_request_at?: string
          request_count?: number
          slug?: string
          window_key?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_published: boolean
          question: string
          related_service: Database["public"]["Enums"]["related_service"] | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          related_service?:
            | Database["public"]["Enums"]["related_service"]
            | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          related_service?:
            | Database["public"]["Enums"]["related_service"]
            | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          folder: string | null
          id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string
          file_url: string
          folder?: string | null
          id?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          folder?: string | null
          id?: string
        }
        Relationships: []
      }
      project_audio: {
        Row: {
          audio_url: string
          cover_image: string | null
          created_at: string
          duration: string | null
          id: string
          is_enabled: boolean
          is_published: boolean
          preview_mode: string
          project_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          audio_url?: string
          cover_image?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          is_enabled?: boolean
          is_published?: boolean
          preview_mode?: string
          project_id: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          cover_image?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          is_enabled?: boolean
          is_published?: boolean
          preview_mode?: string
          project_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_audio_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_demos: {
        Row: {
          button_text: string | null
          created_at: string
          demo_summary: string | null
          desktop_screenshot: string | null
          id: string
          is_published: boolean
          live_demo_url: string | null
          mobile_screenshot: string | null
          preview_image: string | null
          project_id: string
          updated_at: string
          video_demo_url: string | null
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          demo_summary?: string | null
          desktop_screenshot?: string | null
          id?: string
          is_published?: boolean
          live_demo_url?: string | null
          mobile_screenshot?: string | null
          preview_image?: string | null
          project_id: string
          updated_at?: string
          video_demo_url?: string | null
        }
        Update: {
          button_text?: string | null
          created_at?: string
          demo_summary?: string | null
          desktop_screenshot?: string | null
          id?: string
          is_published?: boolean
          live_demo_url?: string | null
          mobile_screenshot?: string | null
          preview_image?: string | null
          project_id?: string
          updated_at?: string
          video_demo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_demos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          categories: string[] | null
          cover_image: string | null
          created_at: string
          enable_preview_modal: boolean
          from_text: string | null
          helper_text: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          label: string
          meta: string | null
          primary_cta_text: string | null
          primary_cta_url: string | null
          quick_detail_best_for: string | null
          quick_detail_focus: string | null
          quick_detail_format: string | null
          quick_detail_type: string | null
          related_service: Database["public"]["Enums"]["related_service"] | null
          sample_type: Database["public"]["Enums"]["sample_type"]
          secondary_cta_text: string | null
          short_description: string
          show_on_homepage: boolean
          show_on_samples_page: boolean
          slug: string
          sort_order: number
          summary: string
          tags: string[] | null
          thumbnail: string | null
          title: string
          to_text: string | null
          updated_at: string
          what_it_shows: string[] | null
          why_it_works: string[] | null
        }
        Insert: {
          categories?: string[] | null
          cover_image?: string | null
          created_at?: string
          enable_preview_modal?: boolean
          from_text?: string | null
          helper_text?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          label?: string
          meta?: string | null
          primary_cta_text?: string | null
          primary_cta_url?: string | null
          quick_detail_best_for?: string | null
          quick_detail_focus?: string | null
          quick_detail_format?: string | null
          quick_detail_type?: string | null
          related_service?:
            | Database["public"]["Enums"]["related_service"]
            | null
          sample_type?: Database["public"]["Enums"]["sample_type"]
          secondary_cta_text?: string | null
          short_description?: string
          show_on_homepage?: boolean
          show_on_samples_page?: boolean
          slug: string
          sort_order?: number
          summary?: string
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          to_text?: string | null
          updated_at?: string
          what_it_shows?: string[] | null
          why_it_works?: string[] | null
        }
        Update: {
          categories?: string[] | null
          cover_image?: string | null
          created_at?: string
          enable_preview_modal?: boolean
          from_text?: string | null
          helper_text?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          label?: string
          meta?: string | null
          primary_cta_text?: string | null
          primary_cta_url?: string | null
          quick_detail_best_for?: string | null
          quick_detail_focus?: string | null
          quick_detail_format?: string | null
          quick_detail_type?: string | null
          related_service?:
            | Database["public"]["Enums"]["related_service"]
            | null
          sample_type?: Database["public"]["Enums"]["sample_type"]
          secondary_cta_text?: string | null
          short_description?: string
          show_on_homepage?: boolean
          show_on_samples_page?: boolean
          slug?: string
          sort_order?: number
          summary?: string
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          to_text?: string | null
          updated_at?: string
          what_it_shows?: string[] | null
          why_it_works?: string[] | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          icon_name: string | null
          id: string
          is_published: boolean
          link: string | null
          projects_count: string | null
          rating: string | null
          slug: string
          sort_order: number
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon_name?: string | null
          id?: string
          is_published?: boolean
          link?: string | null
          projects_count?: string | null
          rating?: string | null
          slug: string
          sort_order?: number
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string | null
          id?: string
          is_published?: boolean
          link?: string | null
          projects_count?: string | null
          rating?: string | null
          slug?: string
          sort_order?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          id: string
          is_published: boolean
          name: string
          project_label: string | null
          rating: number
          result_text: string | null
          role: string | null
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          name: string
          project_label?: string | null
          rating?: number
          result_text?: string | null
          role?: string | null
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          project_label?: string | null
          rating?: number
          result_text?: string | null
          role?: string | null
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_demo_view_rate_limit: {
        Args: {
          _client_ip_hash: string
          _max_requests?: number
          _slug: string
          _window_key: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      related_service: "podcast" | "web_development" | "automation"
      sample_type:
        | "podcast"
        | "website"
        | "web_app"
        | "automation"
        | "dashboard"
        | "portfolio"
        | "service_page"
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
      app_role: ["admin", "moderator", "user"],
      related_service: ["podcast", "web_development", "automation"],
      sample_type: [
        "podcast",
        "website",
        "web_app",
        "automation",
        "dashboard",
        "portfolio",
        "service_page",
      ],
    },
  },
} as const
