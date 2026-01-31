import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

const API_BASE_URL = 'https://api.edge88.net/api/v1';

// Bookmaker odds interface
export interface BookmakerOdds {
  bookmaker: string;
  odds: string;
  line?: string;
}

// Key factors interface
export interface KeyFactors {
  injuries?: string[];
  weather?: {
    conditions: string;
    temperature: number;
    impact: string;
  };
  sharpMoney?: {
    direction: 'home' | 'away';
    lineMovement: number;
    percentage: number;
  };
  sentiment?: {
    public: number;
    sharp: number;
  };
  historicalH2H?: {
    homeWins: number;
    awayWins: number;
    lastMeetings: string[];
  };
}

// Confidence breakdown interface
export interface ConfidenceBreakdown {
  research: number;
  odds: number;
  historical: number;
  sentiment?: number;
  injuries?: number;
  weather?: number;
}

// Types for external API with enriched data
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
  // Enriched data fields
  bookmakerOdds?: BookmakerOdds[];
  keyFactors?: KeyFactors;
  confidenceBreakdown?: ConfidenceBreakdown;
  modelVersion?: string;
  dataSources?: number;
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
  const predObj = raw.prediction as Record<string, unknown> | undefined;
  
  // Parse bookmaker odds
  let bookmakerOdds: BookmakerOdds[] | undefined;
  const rawOdds = raw.bookmaker_odds || raw.bookmakerOdds || predObj?.bookmakerOdds;
  if (Array.isArray(rawOdds)) {
    bookmakerOdds = rawOdds.map((o: Record<string, unknown>) => ({
      bookmaker: String(o.bookmaker || o.name || ''),
      odds: String(o.odds || o.price || ''),
      line: o.line ? String(o.line) : undefined,
    }));
  }
  
  // Parse key factors
  let keyFactors: KeyFactors | undefined;
  const rawFactors = raw.key_factors || raw.keyFactors || predObj?.keyFactors;
  if (rawFactors && typeof rawFactors === 'object') {
    const factors = rawFactors as Record<string, unknown>;
    keyFactors = {
      injuries: factors.injuries as string[] | undefined,
      weather: factors.weather as KeyFactors['weather'] | undefined,
      sharpMoney: (factors.sharp_money || factors.sharpMoney) as KeyFactors['sharpMoney'] | undefined,
      sentiment: factors.sentiment as KeyFactors['sentiment'] | undefined,
      historicalH2H: (factors.historical_h2h || factors.historicalH2H) as KeyFactors['historicalH2H'] | undefined,
    };
  }
  
  // Parse confidence breakdown
  let confidenceBreakdown: ConfidenceBreakdown | undefined;
  const rawBreakdown = raw.confidence_breakdown || raw.confidenceBreakdown || predObj?.confidenceBreakdown;
  if (rawBreakdown && typeof rawBreakdown === 'object') {
    const breakdown = rawBreakdown as Record<string, unknown>;
    confidenceBreakdown = {
      research: Number(breakdown.research || 50),
      odds: Number(breakdown.odds || 30),
      historical: Number(breakdown.historical || 20),
      sentiment: breakdown.sentiment ? Number(breakdown.sentiment) : undefined,
      injuries: breakdown.injuries ? Number(breakdown.injuries) : undefined,
      weather: breakdown.weather ? Number(breakdown.weather) : undefined,
    };
  }

  return {
    id: String(raw.id || ''),
    sport: String(raw.sport || raw.sport_id || ''),
    league: String(raw.league || raw.sport || ''),
    homeTeam: String(raw.home_team || raw.homeTeam || ''),
    awayTeam: String(raw.away_team || raw.awayTeam || ''),
    gameTime: String(raw.game_time || raw.gameTime || raw.commence_time || ''),
    prediction: {
      type: String(raw.prediction_type || predObj?.type || 'Moneyline'),
      pick: String(raw.predicted_winner || predObj?.pick || ''),
      line: raw.predicted_spread ? String(raw.predicted_spread) : (predObj?.line ? String(predObj.line) : undefined),
      odds: String(predObj?.odds || raw.odds || '-110'),
    },
    confidence: Number(raw.confidence) || 0.65,
    expectedValue: Number(raw.expected_value ?? predObj?.expectedValue ?? raw.ev ?? 0),
    reasoning: String(raw.reasoning || raw.analysis || 'AI analysis based on historical data and current conditions.'),
    result: raw.is_correct === null || raw.result === 'pending'
      ? 'pending' 
      : raw.is_correct === true || raw.result === 'win'
        ? 'win' 
        : 'loss',
    bookmakerOdds,
    keyFactors,
    confidenceBreakdown,
    modelVersion: String(raw.model_version || raw.modelVersion || 'Edge88 v3.2'),
    dataSources: Number(raw.data_sources || raw.dataSources || 12),
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

// Fetch active predictions from API with detailed data
export function useActivePredictions() {
  const { toast } = useToast();
  const previousCount = useRef<number>(0);
  
  const query = useQuery({
    queryKey: ['predictions', 'active', 'detailed'],
    queryFn: async (): Promise<APIPrediction[]> => {
      const response = await fetch(`${API_BASE_URL}/predictions/active?include_details=true&limit=50`);
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
  const statsData = (obj.stats || obj.data || obj) as Record<string, unknown>;
  
  if (typeof statsData === 'object' && statsData !== null) {
    // Map snake_case to camelCase
    return {
      totalPredictions: Number(statsData.totalPredictions || statsData.total_predictions || 0),
      accuracy: Number(statsData.accuracy || 0),
      activePredictions: Number(statsData.activePredictions || statsData.active_predictions || 0),
      roi: Number(statsData.roi || 0),
      winStreak: Number(statsData.winStreak || statsData.win_streak || 0),
      byConfidence: (statsData.byConfidence || statsData.by_confidence || defaultStats.byConfidence) as APIStats['byConfidence'],
      bySport: (statsData.bySport || statsData.by_sport || []) as APIStats['bySport'],
      dailyAccuracy: (statsData.dailyAccuracy || statsData.daily_accuracy) as DailyAccuracy[] | undefined,
    };
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
