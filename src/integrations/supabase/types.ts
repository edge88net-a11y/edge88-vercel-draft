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
      accuracy_stats: {
        Row: {
          accuracy: number | null
          correct_predictions: number | null
          created_at: string | null
          date: string
          id: string
          prediction_type: string | null
          roi: number | null
          sport_id: string | null
          total_predictions: number | null
        }
        Insert: {
          accuracy?: number | null
          correct_predictions?: number | null
          created_at?: string | null
          date: string
          id?: string
          prediction_type?: string | null
          roi?: number | null
          sport_id?: string | null
          total_predictions?: number | null
        }
        Update: {
          accuracy?: number | null
          correct_predictions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          prediction_type?: string | null
          roi?: number | null
          sport_id?: string | null
          total_predictions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "accuracy_stats_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      game_research: {
        Row: {
          content: string
          created_at: string | null
          game_id: string | null
          id: string
          relevance_score: number | null
          research_type: string
          sentiment_score: number | null
          source: string | null
          structured_data: Json | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          game_id?: string | null
          id?: string
          relevance_score?: number | null
          research_type: string
          sentiment_score?: number | null
          source?: string | null
          structured_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          game_id?: string | null
          id?: string
          relevance_score?: number | null
          research_type?: string
          sentiment_score?: number | null
          source?: string | null
          structured_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_research_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_weather: {
        Row: {
          conditions: string | null
          created_at: string | null
          forecast_timestamp: string | null
          game_id: string | null
          id: string
          impact_score: number | null
          is_dome: boolean | null
          location: string | null
          precipitation_chance: number | null
          temperature: number | null
          wind_speed: number | null
        }
        Insert: {
          conditions?: string | null
          created_at?: string | null
          forecast_timestamp?: string | null
          game_id?: string | null
          id?: string
          impact_score?: number | null
          is_dome?: boolean | null
          location?: string | null
          precipitation_chance?: number | null
          temperature?: number | null
          wind_speed?: number | null
        }
        Update: {
          conditions?: string | null
          created_at?: string | null
          forecast_timestamp?: string | null
          game_id?: string | null
          id?: string
          impact_score?: number | null
          is_dome?: boolean | null
          location?: string | null
          precipitation_chance?: number | null
          temperature?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_weather_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          away_score: number | null
          away_team: string
          commence_time: string
          created_at: string | null
          external_id: string | null
          home_score: number | null
          home_team: string
          id: string
          sport_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          away_score?: number | null
          away_team: string
          commence_time: string
          created_at?: string | null
          external_id?: string | null
          home_score?: number | null
          home_team: string
          id?: string
          sport_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          away_score?: number | null
          away_team?: string
          commence_time?: string
          created_at?: string | null
          external_id?: string | null
          home_score?: number | null
          home_team?: string
          id?: string
          sport_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      odds_history: {
        Row: {
          away_odds: number | null
          bookmaker: string
          draw_odds: number | null
          game_id: string | null
          home_odds: number | null
          id: string
          market: string
          over_odds: number | null
          recorded_at: string | null
          spread_away: number | null
          spread_home: number | null
          total: number | null
          under_odds: number | null
        }
        Insert: {
          away_odds?: number | null
          bookmaker: string
          draw_odds?: number | null
          game_id?: string | null
          home_odds?: number | null
          id?: string
          market: string
          over_odds?: number | null
          recorded_at?: string | null
          spread_away?: number | null
          spread_home?: number | null
          total?: number | null
          under_odds?: number | null
        }
        Update: {
          away_odds?: number | null
          bookmaker?: string
          draw_odds?: number | null
          game_id?: string | null
          home_odds?: number | null
          id?: string
          market?: string
          over_odds?: number | null
          recorded_at?: string | null
          spread_away?: number | null
          spread_home?: number | null
          total?: number | null
          under_odds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "odds_history_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          confidence: number
          created_at: string | null
          expected_value: number | null
          features_used: Json | null
          game_id: string | null
          graded_at: string | null
          id: string
          is_correct: boolean | null
          model_version: string | null
          predicted_spread: number | null
          predicted_total: number | null
          predicted_winner: string | null
          prediction_type: string
          reasoning: string | null
        }
        Insert: {
          confidence: number
          created_at?: string | null
          expected_value?: number | null
          features_used?: Json | null
          game_id?: string | null
          graded_at?: string | null
          id?: string
          is_correct?: boolean | null
          model_version?: string | null
          predicted_spread?: number | null
          predicted_total?: number | null
          predicted_winner?: string | null
          prediction_type: string
          reasoning?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string | null
          expected_value?: number | null
          features_used?: Json | null
          game_id?: string | null
          graded_at?: string | null
          id?: string
          is_correct?: boolean | null
          model_version?: string | null
          predicted_spread?: number | null
          predicted_total?: number | null
          predicted_winner?: string | null
          prediction_type?: string
          reasoning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      research: {
        Row: {
          content: string
          created_at: string | null
          game_id: string | null
          id: string
          query: string | null
          sentiment: number | null
          source: string
          summary: string | null
          tags: string[] | null
        }
        Insert: {
          content: string
          created_at?: string | null
          game_id?: string | null
          id?: string
          query?: string | null
          sentiment?: number | null
          source: string
          summary?: string | null
          tags?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string | null
          game_id?: string | null
          id?: string
          query?: string | null
          sentiment?: number | null
          source?: string
          summary?: string | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "research_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      sharp_money_moves: {
        Row: {
          bookmaker: string
          created_at: string | null
          current_line: number | null
          game_id: string | null
          id: string
          line_movement: number | null
          market_type: string | null
          opening_line: number | null
          public_bet_percentage: number | null
          sharp_indicator: boolean | null
          timestamp: string | null
        }
        Insert: {
          bookmaker: string
          created_at?: string | null
          current_line?: number | null
          game_id?: string | null
          id?: string
          line_movement?: number | null
          market_type?: string | null
          opening_line?: number | null
          public_bet_percentage?: number | null
          sharp_indicator?: boolean | null
          timestamp?: string | null
        }
        Update: {
          bookmaker?: string
          created_at?: string | null
          current_line?: number | null
          game_id?: string | null
          id?: string
          line_movement?: number | null
          market_type?: string | null
          opening_line?: number | null
          public_bet_percentage?: number | null
          sharp_indicator?: boolean | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sharp_money_moves_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      sports: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          key: string
          name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          key: string
          name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          hashed_password: string | null
          id: string
          stripe_customer_id: string | null
          subscription_tier: string | null
          telegram_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          hashed_password?: string | null
          id?: string
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          telegram_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          hashed_password?: string | null
          id?: string
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          telegram_id?: string | null
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
