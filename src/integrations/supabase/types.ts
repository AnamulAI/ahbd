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
      ai_provider_keys: {
        Row: {
          api_key: string
          created_at: string
          custom_provider_name: string | null
          id: string
          label: string | null
          provider: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          custom_provider_name?: string | null
          id?: string
          label?: string | null
          provider: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          custom_provider_name?: string | null
          id?: string
          label?: string | null
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          body_html: string | null
          category: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean
          published_at: string | null
          read_time_minutes: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body_html?: string | null
          category: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          read_time_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          body_html?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          read_time_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_sidebar_cards: {
        Row: {
          body_text: string
          created_at: string
          cta_label: string
          cta_style: string
          cta_url: string
          display_order: number
          eyebrow_text: string
          heading: string
          id: string
          input_placeholder: string
          input_type: string
          is_active: boolean
          show_on_categories: Json
          updated_at: string
        }
        Insert: {
          body_text?: string
          created_at?: string
          cta_label?: string
          cta_style?: string
          cta_url?: string
          display_order?: number
          eyebrow_text?: string
          heading?: string
          id?: string
          input_placeholder?: string
          input_type?: string
          is_active?: boolean
          show_on_categories?: Json
          updated_at?: string
        }
        Update: {
          body_text?: string
          created_at?: string
          cta_label?: string
          cta_style?: string
          cta_url?: string
          display_order?: number
          eyebrow_text?: string
          heading?: string
          id?: string
          input_placeholder?: string
          input_type?: string
          is_active?: boolean
          show_on_categories?: Json
          updated_at?: string
        }
        Relationships: []
      }
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
      builder_copy: {
        Row: {
          created_at: string
          display_order: number
          group_key: string
          id: string
          key: string
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          group_key?: string
          id?: string
          key: string
          label?: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          group_key?: string
          id?: string
          key?: string
          label?: string
          updated_at?: string
          value?: string
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
      builder_promo_cards: {
        Row: {
          brand_color: string
          brand_name: string
          created_at: string
          cta_label: string
          cta_url: string
          description: string
          display_order: number
          eyebrow_text: string
          feature_pills: Json
          heading_prefix: string
          id: string
          is_active: boolean
          updated_at: string
          visibility_condition: string
        }
        Insert: {
          brand_color: string
          brand_name: string
          created_at?: string
          cta_label: string
          cta_url?: string
          description: string
          display_order?: number
          eyebrow_text?: string
          feature_pills?: Json
          heading_prefix?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          visibility_condition?: string
        }
        Update: {
          brand_color?: string
          brand_name?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          description?: string
          display_order?: number
          eyebrow_text?: string
          feature_pills?: Json
          heading_prefix?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          visibility_condition?: string
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
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      newsletter_webhooks: {
        Row: {
          created_at: string
          id: string
          label: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      payment_plan_settings: {
        Row: {
          advance_percent: number
          created_at: string
          id: string
          installment_count: number
          installments_label: string
          milestone_label: string
          pay_in_full_discount_percent: number
          pay_in_full_label: string
          updated_at: string
        }
        Insert: {
          advance_percent?: number
          created_at?: string
          id?: string
          installment_count?: number
          installments_label?: string
          milestone_label?: string
          pay_in_full_discount_percent?: number
          pay_in_full_label?: string
          updated_at?: string
        }
        Update: {
          advance_percent?: number
          created_at?: string
          id?: string
          installment_count?: number
          installments_label?: string
          milestone_label?: string
          pay_in_full_discount_percent?: number
          pay_in_full_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          action_text: string | null
          apple_podcasts_url: string | null
          challenge: string | null
          client_logo_url: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          episode_audio_url: string | null
          episode_title: string | null
          episode_video_url: string | null
          gallery_image_urls: string[]
          github_url: string | null
          id: string
          ig_reel_caption: string | null
          ig_reel_url: string | null
          integration_map: Json
          is_featured: boolean
          linkedin_clip_caption: string | null
          linkedin_clip_url: string | null
          live_url: string | null
          main_category: string
          output_text: string | null
          problem: string | null
          process_steps: Json
          result_stats: Json
          seo_description: string | null
          seo_title: string | null
          slug: string
          solution: string | null
          sort_order: number
          spotify_url: string | null
          sub_category_label: string | null
          tech_stack: string[]
          testimonial_name: string | null
          testimonial_quote: string | null
          testimonial_title: string | null
          tiktok_clip_caption: string | null
          tiktok_clip_url: string | null
          title: string
          trigger_text: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          action_text?: string | null
          apple_podcasts_url?: string | null
          challenge?: string | null
          client_logo_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          episode_audio_url?: string | null
          episode_title?: string | null
          episode_video_url?: string | null
          gallery_image_urls?: string[]
          github_url?: string | null
          id?: string
          ig_reel_caption?: string | null
          ig_reel_url?: string | null
          integration_map?: Json
          is_featured?: boolean
          linkedin_clip_caption?: string | null
          linkedin_clip_url?: string | null
          live_url?: string | null
          main_category: string
          output_text?: string | null
          problem?: string | null
          process_steps?: Json
          result_stats?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          solution?: string | null
          sort_order?: number
          spotify_url?: string | null
          sub_category_label?: string | null
          tech_stack?: string[]
          testimonial_name?: string | null
          testimonial_quote?: string | null
          testimonial_title?: string | null
          tiktok_clip_caption?: string | null
          tiktok_clip_url?: string | null
          title: string
          trigger_text?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          action_text?: string | null
          apple_podcasts_url?: string | null
          challenge?: string | null
          client_logo_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          episode_audio_url?: string | null
          episode_title?: string | null
          episode_video_url?: string | null
          gallery_image_urls?: string[]
          github_url?: string | null
          id?: string
          ig_reel_caption?: string | null
          ig_reel_url?: string | null
          integration_map?: Json
          is_featured?: boolean
          linkedin_clip_caption?: string | null
          linkedin_clip_url?: string | null
          live_url?: string | null
          main_category?: string
          output_text?: string | null
          problem?: string | null
          process_steps?: Json
          result_stats?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          solution?: string | null
          sort_order?: number
          spotify_url?: string | null
          sub_category_label?: string | null
          tech_stack?: string[]
          testimonial_name?: string | null
          testimonial_quote?: string | null
          testimonial_title?: string | null
          tiktok_clip_caption?: string | null
          tiktok_clip_url?: string | null
          title?: string
          trigger_text?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      sample_previews: {
        Row: {
          after_state: string | null
          audience_category: string
          audio_url: string | null
          before_state: string | null
          booking_link: string | null
          business_name: string
          client_industry: string | null
          clip_instagram_url: string | null
          clip_linkedin_url: string | null
          clip_tiktok_url: string | null
          created_at: string
          cta_link: string
          cta_text: string
          episode_title: string
          estimated_listeners: string | null
          estimated_reach_growth: string | null
          estimated_time_saved: string | null
          id: string
          ig_reel_caption: string | null
          linkedin_clip_caption: string | null
          logo_url: string | null
          module_order: Json
          platforms: Json
          scarcity_duration_days: number | null
          scarcity_enabled: boolean
          scarcity_label: string | null
          scarcity_message: string | null
          show_smm: boolean
          show_video: boolean
          slug: string
          tiktok_clip_caption: string | null
          topic: string
          updated_at: string
          video_url: string | null
          whatsapp_number: string | null
        }
        Insert: {
          after_state?: string | null
          audience_category?: string
          audio_url?: string | null
          before_state?: string | null
          booking_link?: string | null
          business_name: string
          client_industry?: string | null
          clip_instagram_url?: string | null
          clip_linkedin_url?: string | null
          clip_tiktok_url?: string | null
          created_at?: string
          cta_link?: string
          cta_text?: string
          episode_title?: string
          estimated_listeners?: string | null
          estimated_reach_growth?: string | null
          estimated_time_saved?: string | null
          id?: string
          ig_reel_caption?: string | null
          linkedin_clip_caption?: string | null
          logo_url?: string | null
          module_order?: Json
          platforms?: Json
          scarcity_duration_days?: number | null
          scarcity_enabled?: boolean
          scarcity_label?: string | null
          scarcity_message?: string | null
          show_smm?: boolean
          show_video?: boolean
          slug: string
          tiktok_clip_caption?: string | null
          topic?: string
          updated_at?: string
          video_url?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          after_state?: string | null
          audience_category?: string
          audio_url?: string | null
          before_state?: string | null
          booking_link?: string | null
          business_name?: string
          client_industry?: string | null
          clip_instagram_url?: string | null
          clip_linkedin_url?: string | null
          clip_tiktok_url?: string | null
          created_at?: string
          cta_link?: string
          cta_text?: string
          episode_title?: string
          estimated_listeners?: string | null
          estimated_reach_growth?: string | null
          estimated_time_saved?: string | null
          id?: string
          ig_reel_caption?: string | null
          linkedin_clip_caption?: string | null
          logo_url?: string | null
          module_order?: Json
          platforms?: Json
          scarcity_duration_days?: number | null
          scarcity_enabled?: boolean
          scarcity_label?: string | null
          scarcity_message?: string | null
          show_smm?: boolean
          show_video?: boolean
          slug?: string
          tiktok_clip_caption?: string | null
          topic?: string
          updated_at?: string
          video_url?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      signature_package_settings: {
        Row: {
          ai_integrator_label: string
          ai_integrator_price: number
          bundle_price: number
          created_at: string
          cta_label: string
          disclosure_text: string
          id: string
          podcast_label: string
          podcast_price: number
          updated_at: string
          web_dev_label: string
          web_dev_price: number
          whats_included: Json
        }
        Insert: {
          ai_integrator_label?: string
          ai_integrator_price?: number
          bundle_price?: number
          created_at?: string
          cta_label?: string
          disclosure_text?: string
          id?: string
          podcast_label?: string
          podcast_price?: number
          updated_at?: string
          web_dev_label?: string
          web_dev_price?: number
          whats_included?: Json
        }
        Update: {
          ai_integrator_label?: string
          ai_integrator_price?: number
          bundle_price?: number
          created_at?: string
          cta_label?: string
          disclosure_text?: string
          id?: string
          podcast_label?: string
          podcast_price?: number
          updated_at?: string
          web_dev_label?: string
          web_dev_price?: number
          whats_included?: Json
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_proof_logos: {
        Row: {
          created_at: string
          id: string
          logo_url: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      static_page_seo: {
        Row: {
          id: string
          page_key: string
          page_label: string
          seo_description: string | null
          seo_title: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          page_key: string
          page_label: string
          seo_description?: string | null
          seo_title?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          page_key?: string
          page_label?: string
          seo_description?: string | null
          seo_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      telegram_bots: {
        Row: {
          bot_token: string
          created_at: string
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          bot_token: string
          created_at?: string
          id?: string
          label?: string
          updated_at?: string
        }
        Update: {
          bot_token?: string
          created_at?: string
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          has_access: boolean
          id: string
          section_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          has_access?: boolean
          id?: string
          section_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          has_access?: boolean
          id?: string
          section_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_primary_owner: boolean
          phone: string | null
          role_label: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_primary_owner?: boolean
          phone?: string | null
          role_label?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_primary_owner?: boolean
          phone?: string | null
          role_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_accounts: {
        Row: {
          access_token: string
          created_at: string
          id: string
          label: string
          phone_number_id: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          label?: string
          phone_number_id?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          label?: string
          phone_number_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_section_access: {
        Args: { _section: string; _user_id: string }
        Returns: boolean
      }
      is_primary_owner: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
