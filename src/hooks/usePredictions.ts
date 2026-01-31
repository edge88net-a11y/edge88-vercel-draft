import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

const API_BASE_URL = 'https://api.edge88.net/api/v1';

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
  expectedValue: number | string;
  reasoning: string;
  result?: 'win' | 'loss' | 'push' | 'pending';
}

export interface DailyAccuracy {
  date: string;
  accuracy: number;
  predictions: number;
  wins: number;
  losses: number;
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
  dailyAccuracy?: DailyAccuracy[];
}

// Transform snake_case API response to camelCase APIPrediction
function transformPrediction(raw: Record<string, unknown>): APIPrediction {
  return {
    id: String(raw.id || ''),
    sport: String(raw.sport || raw.sport_id || ''),
    league: String(raw.league || raw.sport || ''),
    homeTeam: String(raw.home_team || raw.homeTeam || ''),
    awayTeam: String(raw.away_team || raw.awayTeam || ''),
    gameTime: String(raw.game_time || raw.gameTime || raw.commence_time || ''),
    prediction: {
      type: String(raw.prediction_type || (raw.prediction as Record<string, unknown>)?.type || 'Moneyline'),
      pick: String(raw.predicted_winner || (raw.prediction as Record<string, unknown>)?.pick || ''),
      line: raw.predicted_spread ? String(raw.predicted_spread) : undefined,
      odds: String((raw.prediction as Record<string, unknown>)?.odds || '-110'),
    },
    confidence: Number(raw.confidence) || 0.65,
    expectedValue: Number(raw.expected_value ?? (raw.prediction as Record<string, unknown>)?.expectedValue ?? 0),
    reasoning: String(raw.reasoning || 'AI analysis based on historical data and current conditions.'),
    result: raw.is_correct === null 
      ? 'pending' 
      : raw.is_correct === true 
        ? 'win' 
        : 'loss',
  };
}

// Helper to safely extract predictions array from API response
function extractPredictionsArray(data: unknown): APIPrediction[] {
  let rawArray: unknown[] = [];
  
  if (Array.isArray(data)) {
    rawArray = data;
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.predictions)) rawArray = obj.predictions;
    else if (Array.isArray(obj.data)) rawArray = obj.data;
    else if (Array.isArray(obj.items)) rawArray = obj.items;
  }
  
  if (rawArray.length === 0) {
    console.warn('Could not extract predictions array from response:', data);
    return [];
  }
  
  // Transform each prediction to match APIPrediction interface
  return rawArray.map((item) => transformPrediction(item as Record<string, unknown>));
}

// Fetch active predictions from API directly
export function useActivePredictions() {
  const { toast } = useToast();
  const previousCount = useRef<number>(0);
  
  const query = useQuery({
    queryKey: ['predictions', 'active'],
    queryFn: async (): Promise<APIPrediction[]> => {
      const response = await fetch(`${API_BASE_URL}/predictions/active`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return extractPredictionsArray(data);
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Toast notification for new predictions
  useEffect(() => {
    if (query.data) {
      const activePredictions = query.data.filter(p => p.result === 'pending');
      if (previousCount.current > 0 && activePredictions.length > previousCount.current) {
        const newCount = activePredictions.length - previousCount.current;
        toast({
          title: '🔥 New Predictions!',
          description: `${newCount} new ${newCount === 1 ? 'pick' : 'picks'} just dropped.`,
        });
      }
      previousCount.current = activePredictions.length;
    }
  }, [query.data, toast]);

  return query;
}

// Helper to safely extract stats from API response
function extractStats(data: unknown): APIStats {
  const defaultStats: APIStats = {
    totalPredictions: 0,
    accuracy: 0,
    activePredictions: 0,
    roi: 0,
    winStreak: 0,
    byConfidence: {
      lock: { total: 0, wins: 0 },
      high: { total: 0, wins: 0 },
      medium: { total: 0, wins: 0 },
      low: { total: 0, wins: 0 },
    },
    bySport: [],
  };

  if (!data || typeof data !== 'object') return defaultStats;
  
  const obj = data as Record<string, unknown>;
  // Handle nested data structures
  const statsData = obj.stats || obj.data || obj;
  
  if (typeof statsData === 'object' && statsData !== null) {
    return { ...defaultStats, ...(statsData as Partial<APIStats>) };
  }
  
  return defaultStats;
}

// Fetch stats from API directly
export function useStats() {
  return useQuery({
    queryKey: ['predictions', 'stats'],
    queryFn: async (): Promise<APIStats> => {
      const response = await fetch(`${API_BASE_URL}/predictions/stats`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return extractStats(data);
    },
    staleTime: 60 * 1000,
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
