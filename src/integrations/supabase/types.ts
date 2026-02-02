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
      accuracy_tracking: {
        Row: {
          actual_winner: string | null
          confidence_at_prediction: number | null
          created_at: string | null
          factors_used: Json | null
          id: string
          league: string | null
          model_version: string | null
          predicted_winner: string | null
          prediction_id: string | null
          sport: string | null
          was_correct: boolean | null
        }
        Insert: {
          actual_winner?: string | null
          confidence_at_prediction?: number | null
          created_at?: string | null
          factors_used?: Json | null
          id?: string
          league?: string | null
          model_version?: string | null
          predicted_winner?: string | null
          prediction_id?: string | null
          sport?: string | null
          was_correct?: boolean | null
        }
        Update: {
          actual_winner?: string | null
          confidence_at_prediction?: number | null
          created_at?: string | null
          factors_used?: Json | null
          id?: string
          league?: string | null
          model_version?: string | null
          predicted_winner?: string | null
          prediction_id?: string | null
          sport?: string | null
          was_correct?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "accuracy_tracking_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: true
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_clicks: {
        Row: {
          casino_name: string
          clicked_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          casino_name: string
          clicked_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          casino_name?: string
          clicked_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      betting_slips: {
        Row: {
          added_at: string | null
          id: string
          prediction_id: string
          removed_at: string | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          prediction_id: string
          removed_at?: string | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          prediction_id?: string
          removed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          accuracy_pct: number | null
          article_date: string
          author: string | null
          content: string | null
          created_at: string | null
          featured: boolean | null
          id: string
          losses: number | null
          prediction_ids: string[] | null
          published: boolean | null
          slug: string
          sport: string | null
          summary: string | null
          title: string
          total_picks: number | null
          updated_at: string | null
          views: number | null
          wins: number | null
        }
        Insert: {
          accuracy_pct?: number | null
          article_date: string
          author?: string | null
          content?: string | null
          created_at?: string | null
          featured?: boolean | null
          id?: string
          losses?: number | null
          prediction_ids?: string[] | null
          published?: boolean | null
          slug: string
          sport?: string | null
          summary?: string | null
          title: string
          total_picks?: number | null
          updated_at?: string | null
          views?: number | null
          wins?: number | null
        }
        Update: {
          accuracy_pct?: number | null
          article_date?: string
          author?: string | null
          content?: string | null
          created_at?: string | null
          featured?: boolean | null
          id?: string
          losses?: number | null
          prediction_ids?: string[] | null
          published?: boolean | null
          slug?: string
          sport?: string | null
          summary?: string | null
          title?: string
          total_picks?: number | null
          updated_at?: string | null
          views?: number | null
          wins?: number | null
        }
        Relationships: []
      }
      comment_votes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "event_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_votes: {
        Row: {
          id: string
          prediction_id: string
          user_id: string
          voted_at: string | null
          voted_team: string
        }
        Insert: {
          id?: string
          prediction_id: string
          user_id: string
          voted_at?: string | null
          voted_team: string
        }
        Update: {
          id?: string
          prediction_id?: string
          user_id?: string
          voted_at?: string | null
          voted_team?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      data_freshness: {
        Row: {
          data_type: string | null
          error_message: string | null
          id: string
          last_updated: string | null
          records_updated: number | null
          status: string | null
        }
        Insert: {
          data_type?: string | null
          error_message?: string | null
          id?: string
          last_updated?: string | null
          records_updated?: number | null
          status?: string | null
        }
        Update: {
          data_type?: string | null
          error_message?: string | null
          id?: string
          last_updated?: string | null
          records_updated?: number | null
          status?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          clicked_at: string | null
          email_type: string
          error_message: string | null
          id: string
          opened_at: string | null
          resend_id: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          subscriber_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          subscriber_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          subject: string
          template_name: string
          text_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          subject: string
          template_name: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          subject?: string
          template_name?: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      event_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          downvotes: number | null
          id: string
          parent_id: string | null
          prediction_id: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
          user_pick: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_id?: string | null
          prediction_id: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
          user_pick?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_id?: string | null
          prediction_id?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
          user_pick?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "event_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_comments_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
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
      game_stats: {
        Row: {
          assists_away: number | null
          assists_home: number | null
          away_points_prediction: number | null
          cards_away: number | null
          cards_home: number | null
          corners_prediction: number | null
          created_at: string | null
          efficiency_away: number | null
          efficiency_home: number | null
          first_half_score: string | null
          goalie_save_pct_away: number | null
          goalie_save_pct_home: number | null
          goals_over_under: number | null
          goals_prediction: string | null
          height_advantage_cm: number | null
          home_points_prediction: number | null
          id: string
          method_of_victory: string | null
          pace: number | null
          period_1_score: string | null
          period_2_score: string | null
          period_3_score: string | null
          possession_away: number | null
          possession_home: number | null
          powerplay_pct_away: number | null
          powerplay_pct_home: number | null
          prediction_id: string | null
          q1_score: string | null
          q2_score: string | null
          q3_score: string | null
          q4_score: string | null
          reach_advantage_cm: number | null
          rebounds_away: number | null
          rebounds_home: number | null
          round_prediction: number | null
          second_half_score: string | null
          shots_on_goal_away: number | null
          shots_on_goal_home: number | null
          significant_strikes_away: number | null
          significant_strikes_home: number | null
          sport: string
          takedowns_away: number | null
          takedowns_home: number | null
          total_points_prediction: number | null
          updated_at: string | null
          xg_away: number | null
          xg_home: number | null
        }
        Insert: {
          assists_away?: number | null
          assists_home?: number | null
          away_points_prediction?: number | null
          cards_away?: number | null
          cards_home?: number | null
          corners_prediction?: number | null
          created_at?: string | null
          efficiency_away?: number | null
          efficiency_home?: number | null
          first_half_score?: string | null
          goalie_save_pct_away?: number | null
          goalie_save_pct_home?: number | null
          goals_over_under?: number | null
          goals_prediction?: string | null
          height_advantage_cm?: number | null
          home_points_prediction?: number | null
          id?: string
          method_of_victory?: string | null
          pace?: number | null
          period_1_score?: string | null
          period_2_score?: string | null
          period_3_score?: string | null
          possession_away?: number | null
          possession_home?: number | null
          powerplay_pct_away?: number | null
          powerplay_pct_home?: number | null
          prediction_id?: string | null
          q1_score?: string | null
          q2_score?: string | null
          q3_score?: string | null
          q4_score?: string | null
          reach_advantage_cm?: number | null
          rebounds_away?: number | null
          rebounds_home?: number | null
          round_prediction?: number | null
          second_half_score?: string | null
          shots_on_goal_away?: number | null
          shots_on_goal_home?: number | null
          significant_strikes_away?: number | null
          significant_strikes_home?: number | null
          sport: string
          takedowns_away?: number | null
          takedowns_home?: number | null
          total_points_prediction?: number | null
          updated_at?: string | null
          xg_away?: number | null
          xg_home?: number | null
        }
        Update: {
          assists_away?: number | null
          assists_home?: number | null
          away_points_prediction?: number | null
          cards_away?: number | null
          cards_home?: number | null
          corners_prediction?: number | null
          created_at?: string | null
          efficiency_away?: number | null
          efficiency_home?: number | null
          first_half_score?: string | null
          goalie_save_pct_away?: number | null
          goalie_save_pct_home?: number | null
          goals_over_under?: number | null
          goals_prediction?: string | null
          height_advantage_cm?: number | null
          home_points_prediction?: number | null
          id?: string
          method_of_victory?: string | null
          pace?: number | null
          period_1_score?: string | null
          period_2_score?: string | null
          period_3_score?: string | null
          possession_away?: number | null
          possession_home?: number | null
          powerplay_pct_away?: number | null
          powerplay_pct_home?: number | null
          prediction_id?: string | null
          q1_score?: string | null
          q2_score?: string | null
          q3_score?: string | null
          q4_score?: string | null
          reach_advantage_cm?: number | null
          rebounds_away?: number | null
          rebounds_home?: number | null
          round_prediction?: number | null
          second_half_score?: string | null
          shots_on_goal_away?: number | null
          shots_on_goal_home?: number | null
          significant_strikes_away?: number | null
          significant_strikes_home?: number | null
          sport?: string
          takedowns_away?: number | null
          takedowns_home?: number | null
          total_points_prediction?: number | null
          updated_at?: string | null
          xg_away?: number | null
          xg_home?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_stats_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: true
            referencedRelation: "predictions"
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
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          email_preferences: Json | null
          emails_clicked: number | null
          emails_opened: number | null
          emails_sent: number | null
          id: string
          last_email_sent: string | null
          signup_date: string | null
          subscription_tier: string | null
          unsubscribed: boolean | null
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_preferences?: Json | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          last_email_sent?: string | null
          signup_date?: string | null
          subscription_tier?: string | null
          unsubscribed?: boolean | null
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_preferences?: Json | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          last_email_sent?: string | null
          signup_date?: string | null
          subscription_tier?: string | null
          unsubscribed?: boolean | null
          unsubscribed_at?: string | null
        }
        Relationships: []
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
      player_stats: {
        Row: {
          assists_avg: number | null
          assists_season: number | null
          created_at: string | null
          double_double_rate: number | null
          games_played: number | null
          goals_season: number | null
          height_cm: number | null
          id: string
          knockouts: number | null
          losses: number | null
          player_name: string
          plus_minus: number | null
          points_avg: number | null
          prediction_id: string | null
          reach_cm: number | null
          rebounds_avg: number | null
          season_stats: Json | null
          shots_per_game: number | null
          sport: string | null
          submissions: number | null
          team: string | null
          updated_at: string | null
          weight_kg: number | null
          wins: number | null
        }
        Insert: {
          assists_avg?: number | null
          assists_season?: number | null
          created_at?: string | null
          double_double_rate?: number | null
          games_played?: number | null
          goals_season?: number | null
          height_cm?: number | null
          id?: string
          knockouts?: number | null
          losses?: number | null
          player_name: string
          plus_minus?: number | null
          points_avg?: number | null
          prediction_id?: string | null
          reach_cm?: number | null
          rebounds_avg?: number | null
          season_stats?: Json | null
          shots_per_game?: number | null
          sport?: string | null
          submissions?: number | null
          team?: string | null
          updated_at?: string | null
          weight_kg?: number | null
          wins?: number | null
        }
        Update: {
          assists_avg?: number | null
          assists_season?: number | null
          created_at?: string | null
          double_double_rate?: number | null
          games_played?: number | null
          goals_season?: number | null
          height_cm?: number | null
          id?: string
          knockouts?: number | null
          losses?: number | null
          player_name?: string
          plus_minus?: number | null
          points_avg?: number | null
          prediction_id?: string | null
          reach_cm?: number | null
          rebounds_avg?: number | null
          season_stats?: Json | null
          shots_per_game?: number | null
          sport?: string | null
          submissions?: number | null
          team?: string | null
          updated_at?: string | null
          weight_kg?: number | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
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
          h2h_history: Json | null
          id: string
          is_correct: boolean | null
          model_version: string | null
          mystical_analysis: Json | null
          perplexity_queries_used: number | null
          predicted_spread: number | null
          predicted_total: number | null
          predicted_winner: string | null
          prediction_type: string
          reasoning: string | null
          research_summary: Json | null
        }
        Insert: {
          confidence: number
          created_at?: string | null
          expected_value?: number | null
          features_used?: Json | null
          game_id?: string | null
          graded_at?: string | null
          h2h_history?: Json | null
          id?: string
          is_correct?: boolean | null
          model_version?: string | null
          mystical_analysis?: Json | null
          perplexity_queries_used?: number | null
          predicted_spread?: number | null
          predicted_total?: number | null
          predicted_winner?: string | null
          prediction_type: string
          reasoning?: string | null
          research_summary?: Json | null
        }
        Update: {
          confidence?: number
          created_at?: string | null
          expected_value?: number | null
          features_used?: Json | null
          game_id?: string | null
          graded_at?: string | null
          h2h_history?: Json | null
          id?: string
          is_correct?: boolean | null
          model_version?: string | null
          mystical_analysis?: Json | null
          perplexity_queries_used?: number | null
          predicted_spread?: number | null
          predicted_total?: number | null
          predicted_winner?: string | null
          prediction_type?: string
          reasoning?: string | null
          research_summary?: Json | null
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
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_user_id: string | null
          referrer_user_id: string
          status: string | null
          tips_earned: number | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_user_id?: string | null
          referrer_user_id: string
          status?: string | null
          tips_earned?: number | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          referrer_user_id?: string
          status?: string | null
          tips_earned?: number | null
        }
        Relationships: []
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
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          reputation: number | null
          total_comments: number | null
          total_upvotes: number | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          reputation?: number | null
          total_comments?: number | null
          total_upvotes?: number | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          reputation?: number | null
          total_comments?: number | null
          total_upvotes?: number | null
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      win_streaks: {
        Row: {
          best_streak_all_time: number | null
          best_streak_month: number | null
          current_streak: number | null
          id: string
          last_updated: string | null
        }
        Insert: {
          best_streak_all_time?: number | null
          best_streak_month?: number | null
          current_streak?: number | null
          id?: string
          last_updated?: string | null
        }
        Update: {
          best_streak_all_time?: number | null
          best_streak_month?: number | null
          current_streak?: number | null
          id?: string
          last_updated?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
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
