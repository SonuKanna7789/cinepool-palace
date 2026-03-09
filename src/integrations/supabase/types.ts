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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      movies: {
        Row: {
          backdrop_path: string | null
          created_at: string
          director: string | null
          genre_ids: number[] | null
          genres: string[] | null
          id: string
          overview: string | null
          poster_path: string | null
          release_date: string | null
          runtime: number | null
          title: string
          updated_at: string
          vote_average: number | null
          vote_count: number | null
        }
        Insert: {
          backdrop_path?: string | null
          created_at?: string
          director?: string | null
          genre_ids?: number[] | null
          genres?: string[] | null
          id: string
          overview?: string | null
          poster_path?: string | null
          release_date?: string | null
          runtime?: number | null
          title: string
          updated_at?: string
          vote_average?: number | null
          vote_count?: number | null
        }
        Update: {
          backdrop_path?: string | null
          created_at?: string
          director?: string | null
          genre_ids?: number[] | null
          genres?: string[] | null
          id?: string
          overview?: string | null
          poster_path?: string | null
          release_date?: string | null
          runtime?: number | null
          title?: string
          updated_at?: string
          vote_average?: number | null
          vote_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_onboarded: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_onboarded?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_onboarded?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suggestion_feedback: {
        Row: {
          action: string
          created_at: string
          id: string
          movie_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          movie_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          movie_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorite_movies: {
        Row: {
          added_at: string
          id: string
          movie_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          movie_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          movie_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_movies_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          favorite_genres: string[]
          favorite_platforms: string[]
          id: string
          preferred_languages: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          favorite_genres?: string[]
          favorite_platforms?: string[]
          id?: string
          preferred_languages?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          favorite_genres?: string[]
          favorite_platforms?: string[]
          id?: string
          preferred_languages?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          movie_id: string
          platform_watched: string | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          movie_id: string
          platform_watched?: string | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          movie_id?: string
          platform_watched?: string | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_watch_history: {
        Row: {
          created_at: string
          genre: string | null
          id: string
          movie_id: string
          movie_title: string
          rating: number | null
          user_id: string
          watched_at: string
        }
        Insert: {
          created_at?: string
          genre?: string | null
          id?: string
          movie_id: string
          movie_title: string
          rating?: number | null
          user_id: string
          watched_at?: string
        }
        Update: {
          created_at?: string
          genre?: string | null
          id?: string
          movie_id?: string
          movie_title?: string
          rating?: number | null
          user_id?: string
          watched_at?: string
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
