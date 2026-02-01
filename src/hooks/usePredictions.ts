import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

// Direct API - no proxy needed
const API_BASE_URL = 'https://api.edge88.net/api/v1';

// Simple fetch with retry - NO AbortController, NO timeout
async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[API] Attempt ${i + 1}/${retries}: ${url}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log(`[API] Success: ${Array.isArray(data) ? data.length : 'object'} items`);
      return data;
    } catch (error) {
      console.error(`[API] Attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        console.log(`[API] Waiting 5s before retry...`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  throw new Error('All retries failed');
}

// Bookmaker odds interface
export interface BookmakerOdds {
  bookmaker: string;
  odds: string;
  line?: string;
  // Additional fields for detailed view
  homeOdds?: number | string;
  awayOdds?: number | string;
  spreadHome?: number | string;
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
  // Aliases for backwards compatibility
  fromResearch?: number;
  fromOdds?: number;
  fromHistorical?: number;
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
  bookmakerOdds?: BookmakerOdds[];
  keyFactors?: KeyFactors;
  confidenceBreakdown?: ConfidenceBreakdown;
  modelVersion?: string;
  dataSources?: number;
  // Additional fields for detailed view (used by PredictionDetail.tsx)
  sourcesAnalyzed?: number;
  injuries?: { home?: { player: string; status: string; impact: string }[]; away?: { player: string; status: string; impact: string }[] };
  fullReasoning?: string;
  venue?: string;
  keyFactorsList?: string[];
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

// Custom error for maintenance mode
export class MaintenanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MaintenanceError';
  }
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
    console.warn('[API] Could not extract predictions array from response:', data);
    return [];
  }
  
  return rawArray.map((item) => transformPrediction(item as Record<string, unknown>));
}

// Fetch active predictions from API with detailed data
export function useActivePredictions() {
  const { toast } = useToast();
  const previousCount = useRef<number>(0);
  const toastShownRef = useRef<boolean>(false);
  
  const query = useQuery({
    queryKey: ['predictions', 'active', 'detailed'],
    queryFn: async (): Promise<APIPrediction[]> => {
      const url = `${API_BASE_URL}/predictions/active?include_details=true`;
      
      try {
        const data = await fetchWithRetry(url);
        
        const predictions = extractPredictionsArray(data);
        console.log(`[API] Extracted ${predictions.length} predictions`);
        
        if (predictions.length > 0) {
          toastShownRef.current = false;
          return predictions;
        }
        
        throw new MaintenanceError('No predictions available');
      } catch (error) {
        if (error instanceof MaintenanceError) {
          throw error;
        }
        
        console.error('[API] All retries exhausted:', error);
        
        if (!toastShownRef.current) {
          toast({
            title: "⚙️ Connecting to prediction engine...",
            description: "Our AI is crunching the latest data. Will retry shortly.",
            variant: "default",
          });
          toastShownRef.current = true;
        }
        
        throw new MaintenanceError('Prediction engine is currently processing data');
      }
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
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

  const isMaintenanceMode = query.error instanceof MaintenanceError;

  return {
    ...query,
    isMaintenanceMode,
  };
}

// Helper to safely extract stats from API response
function extractStats(data: unknown): APIStats | null {
  if (!data || typeof data !== 'object') return null;
  
  const obj = data as Record<string, unknown>;
  const statsData = (obj.stats || obj.data || obj) as Record<string, unknown>;
  
  if (typeof statsData === 'object' && statsData !== null) {
    return {
      totalPredictions: Number(statsData.totalPredictions || statsData.total_predictions || 0),
      accuracy: Number(statsData.accuracy || 0),
      activePredictions: Number(statsData.activePredictions || statsData.active_predictions || 0),
      roi: Number(statsData.roi || 0),
      winStreak: Number(statsData.winStreak || statsData.win_streak || 0),
      byConfidence: (statsData.byConfidence || statsData.by_confidence) as APIStats['byConfidence'] || {
        lock: { total: 0, wins: 0 },
        high: { total: 0, wins: 0 },
        medium: { total: 0, wins: 0 },
        low: { total: 0, wins: 0 },
      },
      bySport: (statsData.bySport || statsData.by_sport) as APIStats['bySport'] || [],
      dailyAccuracy: (statsData.dailyAccuracy || statsData.daily_accuracy) as DailyAccuracy[] | undefined,
    };
  }
  
  return null;
}

// Fetch stats from API directly
export function useStats() {
  const query = useQuery({
    queryKey: ['predictions', 'stats'],
    queryFn: async (): Promise<APIStats> => {
      console.log('[API] Fetching stats...');
      
      try {
        const data = await fetchWithRetry(`${API_BASE_URL}/predictions/stats`);
        const stats = extractStats(data);
        
        if (stats) {
          return stats;
        }
        
        throw new MaintenanceError('No stats available');
      } catch (error) {
        if (error instanceof MaintenanceError) {
          throw error;
        }
        console.warn('[API] Stats error:', error);
        throw new MaintenanceError('Stats engine is currently processing data');
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
    retry: 3,
  });

  const isMaintenanceMode = query.error instanceof MaintenanceError;

  return {
    ...query,
    isMaintenanceMode,
  };
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

// Fetch single prediction by ID
export function usePrediction(id: string) {
  return useQuery({
    queryKey: ['prediction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          game:games(*),
          game_stats(*),
          numerology:numerology_analysis(*),
          player_stats(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Fetch detailed game data by prediction ID
export function useGameDetails(predictionId: string) {
  return useQuery({
    queryKey: ['game-details', predictionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_predictions_detailed')
        .select('*')
        .eq('prediction_id', predictionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!predictionId,
  });
}

// Fetch numerology analysis for a prediction
export function useNumerologyAnalysis(predictionId: string) {
  return useQuery({
    queryKey: ['numerology', predictionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('numerology_analysis')
        .select('*')
        .eq('prediction_id', predictionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!predictionId,
  });
}

// Fetch player stats for a prediction
export function usePlayerStats(predictionId: string) {
  return useQuery({
    queryKey: ['player-stats', predictionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('prediction_id', predictionId);

      if (error) throw error;
      return data;
    },
    enabled: !!predictionId,
  });
}

// Fetch game stats for a prediction
export function useGameStats(predictionId: string) {
  return useQuery({
    queryKey: ['game-stats', predictionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .eq('prediction_id', predictionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!predictionId,
  });
}

// ============ Type exports for components ============

// Numerology data type
export interface NumerologyData {
  favoredTeam: string;
  numerologyScore: number;
  dateNumber: number;
  dateMeaning: string;
  gameZodiac: {
    sign: string;
    symbol: string;
    element: string;
  };
  teamNumerology: {
    home: { number: number; meaning: string; zodiac: string; element: string };
    away: { number: number; meaning: string; zodiac: string; element: string };
  };
  elementCompatibility: 'harmonious' | 'supportive' | 'challenging';
  planetaryAlignment: {
    planet: string;
    retrograde: boolean;
    impact: string;
  };
  historicalPatterns: {
    gamesOnDay: number;
    favoriteWinRate: number;
    overUnderTrend: string;
  };
}

// Sport specific stats data type
export interface SportSpecificStatsData {
  type: 'hockey' | 'soccer' | 'basketball' | 'ufc' | 'default';
  stats: Record<string, { value: string | number; confidence: number }>;
}

// ============ Alias exports for backwards compatibility ============

// Fetch single prediction by ID from API (returns APIPrediction format)
export function useSinglePrediction(id: string | undefined) {
  return useQuery({
    queryKey: ['single-prediction', id],
    queryFn: async (): Promise<APIPrediction | null> => {
      if (!id) return null;
      try {
        const data = await fetchWithRetry(`${API_BASE_URL}/predictions/${id}`);
        if (data && typeof data === 'object') {
          return transformPrediction(data as Record<string, unknown>);
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!id,
  });
}

// Alias for usePredictionDetail (returns analysis data)
export function usePredictionDetail(predictionId: string) {
  return useQuery({
    queryKey: ['prediction-detail', predictionId],
    queryFn: async () => {
      try {
        const data = await fetchWithRetry(`${API_BASE_URL}/predictions/${predictionId}/analysis`);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!predictionId,
  });
}

// Alias for usePredictionNumerology
export function usePredictionNumerology(predictionId: string) {
  return useQuery({
    queryKey: ['prediction-numerology', predictionId],
    queryFn: async (): Promise<NumerologyData | null> => {
      try {
        const data = await fetchWithRetry(`${API_BASE_URL}/predictions/${predictionId}/numerology`);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!predictionId,
  });
}

// Alias for usePredictionStats
export function usePredictionStats(predictionId: string) {
  return useQuery({
    queryKey: ['prediction-stats', predictionId],
    queryFn: async (): Promise<SportSpecificStatsData | null> => {
      try {
        const data = await fetchWithRetry(`${API_BASE_URL}/predictions/${predictionId}/stats`);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!predictionId,
  });
}
