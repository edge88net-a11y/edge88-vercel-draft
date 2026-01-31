import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for external API
export interface APIPrediction {
  id: string;
  sport: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  prediction: {
    type: string;
    pick: string;
    line?: string;
    odds: string;
  };
  confidence: number;
  expectedValue: number;
  reasoning: string;
  result?: 'win' | 'loss' | 'push' | 'pending';
}

export interface APIStats {
  totalPredictions: number;
  accuracy: number;
  activePredictions: number;
  roi: number;
  winStreak: number;
  byConfidence: {
    lock: { total: number; wins: number };
    high: { total: number; wins: number };
    medium: { total: number; wins: number };
    low: { total: number; wins: number };
  };
  bySport: {
    sport: string;
    predictions: number;
    wins: number;
    losses: number;
    accuracy: number;
    roi: number;
  }[];
}

// Fetch active predictions from external API
export function useActivePredictions() {
  return useQuery({
    queryKey: ['predictions', 'active'],
    queryFn: async (): Promise<APIPrediction[]> => {
      const response = await fetch('https://api.edge88.net/api/v1/predictions/active');
      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // Refresh every 30 seconds
    refetchInterval: 30 * 1000,
  });
}

// Fetch stats from external API
export function useStats() {
  return useQuery({
    queryKey: ['predictions', 'stats'],
    queryFn: async (): Promise<APIStats> => {
      const response = await fetch('https://api.edge88.net/api/v1/predictions/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
    staleTime: 60 * 1000, // Refresh every minute
  });
}

// Fetch games from Supabase
export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*)
        `)
        .order('commence_time', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Fetch predictions from Supabase (historical/all)
export function useSupabasePredictions() {
  return useQuery({
    queryKey: ['supabase-predictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          game:games(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Fetch accuracy stats from Supabase
export function useAccuracyStats() {
  return useQuery({
    queryKey: ['accuracy-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accuracy_stats')
        .select(`
          *,
          sport:sports(*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Fetch sports from Supabase
export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}
