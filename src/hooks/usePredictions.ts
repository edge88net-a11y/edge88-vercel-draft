import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

// Direct API - no proxy needed
const API_BASE_URL = 'https://api.edge88.net/api/v1';
const FETCH_TIMEOUT_MS = 10000; // 10 second timeout

// Helper for fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

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
    console.warn('[usePredictions] Could not extract predictions array from response:', data);
    return [];
  }
  
  // Transform each prediction to match APIPrediction interface
  return rawArray.map((item) => transformPrediction(item as Record<string, unknown>));
}

// Fetch active predictions from API with detailed data - DIRECT API ONLY
export function useActivePredictions() {
  const { toast } = useToast();
  const previousCount = useRef<number>(0);
  const toastShownRef = useRef<boolean>(false);
  
  const query = useQuery({
    queryKey: ['predictions', 'active', 'detailed'],
    queryFn: async (): Promise<APIPrediction[]> => {
      console.log('[usePredictions] Fetching predictions from direct API...');
      
      try {
        const response = await fetchWithTimeout(
          `${API_BASE_URL}/predictions/active?include_details=true&limit=50`
        );
        
        if (response.status === 503) {
          throw new MaintenanceError('Prediction engine is updating');
        }
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        const predictions = extractPredictionsArray(data);
        
        if (predictions.length > 0) {
          console.log(`[usePredictions] Got ${predictions.length} predictions`);
          toastShownRef.current = false;
          return predictions;
        }
        
        // Empty response - maintenance mode
        throw new MaintenanceError('No predictions available');
      } catch (error) {
        if (error instanceof MaintenanceError) {
          throw error;
        }
        
        // Network error or timeout
        console.warn('[usePredictions] API error:', error);
        
        if (!toastShownRef.current) {
          toast({
            title: "⚙️ Connecting to prediction engine...",
            description: "Our AI is crunching the latest data. Auto-retrying...",
            variant: "default",
          });
          toastShownRef.current = true;
        }
        
        throw new MaintenanceError('Prediction engine is currently processing data');
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Toast notification for new predictions
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

// Fetch stats from API directly - NO PROXY
export function useStats() {
  const query = useQuery({
    queryKey: ['predictions', 'stats'],
    queryFn: async (): Promise<APIStats> => {
      console.log('[useStats] Fetching stats from direct API...');
      
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/predictions/stats`);
        
        if (response.status === 503) {
          throw new MaintenanceError('Stats engine is updating');
        }
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        const stats = extractStats(data);
        
        if (stats) {
          return stats;
        }
        
        throw new MaintenanceError('No stats available');
      } catch (error) {
        if (error instanceof MaintenanceError) {
          throw error;
        }
        console.warn('[useStats] API error:', error);
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

// Sport-specific stats interface
export interface SportSpecificStatsData {
  type: 'hockey' | 'soccer' | 'basketball' | 'ufc' | 'default';
  stats: Record<string, { value: string | number; confidence: number }>;
}

// Numerology data interface
export interface NumerologyData {
  numerologyScore: number;
  favoredTeam: string;
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

// Detailed analysis interface
export interface DetailedAnalysis {
  reasoning: string;
  keyStats: { label: string; homeValue: string; awayValue: string }[];
  formGuide: {
    home: { opponent: string; result: 'W' | 'L' | 'D'; score: string; date: string }[];
    away: { opponent: string; result: 'W' | 'L' | 'D'; score: string; date: string }[];
  };
  h2h: { date: string; homeTeam: string; awayTeam: string; homeScore: number; awayScore: number }[];
  injuries: {
    home: { player: string; status: string; impact: string }[];
    away: { player: string; status: string; impact: string }[];
  };
  sharpMoney: {
    direction: string;
    lineMovement: string;
    percentage: number;
    analysis: string;
  };
  conditions: {
    venue: string;
    weather: string;
    impact: string;
    restDays: { home: number; away: number };
  };
  riskFactors: { risk: string; severity: 'low' | 'medium' | 'high' }[];
}

// Full prediction detail from API
export interface FullPredictionDetail {
  id: string;
  sport: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  status: string;
  venue?: string;
  prediction: {
    type: string;
    pick: string;
    line?: string;
    odds: string;
  };
  confidence: number;
  expectedValue: number;
  reasoning: string;
  fullReasoning?: string;
  keyFactors?: string[];
  injuries?: {
    home: { player: string; status: string; impact: string }[];
    away: { player: string; status: string; impact: string }[];
  };
  bookmakerOdds?: {
    bookmaker: string;
    homeOdds: number;
    awayOdds: number;
    spreadHome?: number;
    total?: number;
  }[];
  confidenceBreakdown?: {
    total: number;
    fromResearch: number;
    fromOdds: number;
    fromHistorical: number;
  };
  modelVersion?: string;
  sourcesAnalyzed?: number;
  result?: 'win' | 'loss' | 'push' | 'pending';
}

// Transform full API response for single prediction
function transformFullPrediction(raw: Record<string, unknown>): FullPredictionDetail {
  const gamesObj = raw.games as Record<string, unknown> | undefined;
  const featuresObj = raw.features_used as Record<string, unknown> | undefined;
  const breakdownObj = raw.confidence_breakdown as Record<string, unknown> | undefined;
  
  // Parse bookmaker odds
  let bookmakerOdds: FullPredictionDetail['bookmakerOdds'];
  const rawOdds = raw.bookmaker_odds || raw.bookmakerOdds;
  if (Array.isArray(rawOdds)) {
    bookmakerOdds = rawOdds.map((o: Record<string, unknown>) => ({
      bookmaker: String(o.bookmaker || ''),
      homeOdds: Number(o.home_odds || o.homeOdds || 0),
      awayOdds: Number(o.away_odds || o.awayOdds || 0),
      spreadHome: o.spread_home ? Number(o.spread_home) : undefined,
      total: o.total ? Number(o.total) : undefined,
    }));
  }
  
  // Parse key factors from features_used
  let keyFactors: string[] | undefined;
  if (featuresObj && Array.isArray(featuresObj.key_factors)) {
    keyFactors = featuresObj.key_factors as string[];
  } else if (Array.isArray(raw.key_factors)) {
    keyFactors = raw.key_factors as string[];
  }
  
  // Parse injuries from features_used
  let injuries: FullPredictionDetail['injuries'];
  if (featuresObj?.injuries) {
    injuries = featuresObj.injuries as FullPredictionDetail['injuries'];
  } else if (raw.injuries) {
    injuries = raw.injuries as FullPredictionDetail['injuries'];
  }
  
  // Parse confidence breakdown
  let confidenceBreakdown: FullPredictionDetail['confidenceBreakdown'];
  if (breakdownObj) {
    confidenceBreakdown = {
      total: Number(breakdownObj.total || 0),
      fromResearch: Number(breakdownObj.from_research || breakdownObj.fromResearch || 0),
      fromOdds: Number(breakdownObj.from_odds || breakdownObj.fromOdds || 0),
      fromHistorical: Number(breakdownObj.from_historical || breakdownObj.fromHistorical || 0),
    };
  }
  
  // Sources count
  const sourcesAnalyzed = featuresObj?.sources_scanned 
    ? Number(featuresObj.sources_scanned) 
    : (raw.sources_analyzed ? Number(raw.sources_analyzed) : undefined);
  
  return {
    id: String(raw.id || ''),
    sport: String(raw.sport || gamesObj?.sport_id || ''),
    league: String(raw.league || ''),
    homeTeam: String(raw.home_team || gamesObj?.home_team || ''),
    awayTeam: String(raw.away_team || gamesObj?.away_team || ''),
    gameTime: String(raw.game_time || gamesObj?.commence_time || ''),
    status: String(raw.status || gamesObj?.status || 'scheduled'),
    venue: gamesObj?.venue ? String(gamesObj.venue) : undefined,
    prediction: {
      type: String(raw.prediction_type || 'h2h'),
      pick: String(raw.predicted_winner || ''),
      line: raw.predicted_spread ? String(raw.predicted_spread) : undefined,
      odds: '-110',
    },
    confidence: Number(raw.confidence || 0),
    expectedValue: Number(raw.expected_value || 0),
    reasoning: String(raw.reasoning || raw.full_reasoning || ''),
    fullReasoning: raw.full_reasoning ? String(raw.full_reasoning) : undefined,
    keyFactors,
    injuries,
    bookmakerOdds,
    confidenceBreakdown,
    modelVersion: String(raw.model_version || 'Edge88'),
    sourcesAnalyzed,
    result: raw.is_correct === null ? 'pending' : raw.is_correct === true ? 'win' : 'loss',
  };
}

// Fetch single prediction with full details from API
export function useSinglePrediction(predictionId: string | undefined) {
  return useQuery({
    queryKey: ['prediction', 'full', predictionId],
    queryFn: async (): Promise<FullPredictionDetail | null> => {
      if (!predictionId) return null;
      
      console.log(`[useSinglePrediction] Fetching prediction: ${predictionId}`);
      
      try {
        const response = await fetch(`${API_BASE_URL}/predictions/${predictionId}`);
        console.log(`[useSinglePrediction] Response status: ${response.status}`);
        
        if (!response.ok) {
          if (response.status === 404) return null;
          const errorText = await response.text();
          console.error(`[useSinglePrediction] API error: ${errorText}`);
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[useSinglePrediction] Raw response:', data);
        
        return transformFullPrediction(data);
      } catch (error) {
        console.error('[useSinglePrediction] Failed:', error);
        throw error;
      }
    },
    enabled: !!predictionId,
    staleTime: 30 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
}

// Legacy hook - keep for backward compatibility
export function usePredictionDetail(predictionId: string | undefined) {
  return useQuery({
    queryKey: ['prediction', 'detail', predictionId],
    queryFn: async (): Promise<DetailedAnalysis | null> => {
      if (!predictionId) return null;
      
      try {
        const response = await fetch(`${API_BASE_URL}/predictions/${predictionId}`);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data.analysis || data.details || null;
      } catch (error) {
        console.warn('Prediction detail API not available:', error);
        return null;
      }
    },
    enabled: !!predictionId,
    staleTime: 60 * 1000,
    retry: false,
  });
}

// Fetch sport-specific stats for a prediction
export function usePredictionStats(predictionId: string | undefined) {
  return useQuery({
    queryKey: ['prediction', 'stats', predictionId],
    queryFn: async (): Promise<SportSpecificStatsData | null> => {
      if (!predictionId) return null;
      
      try {
        const response = await fetch(`${API_BASE_URL}/predictions/${predictionId}/stats`);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.warn('Prediction stats API not available:', error);
        return null;
      }
    },
    enabled: !!predictionId,
    staleTime: 60 * 1000,
    retry: false,
  });
}

// Fetch numerology data for a prediction
export function usePredictionNumerology(predictionId: string | undefined) {
  return useQuery({
    queryKey: ['prediction', 'numerology', predictionId],
    queryFn: async (): Promise<NumerologyData | null> => {
      if (!predictionId) return null;
      
      try {
        const response = await fetch(`${API_BASE_URL}/predictions/${predictionId}/numerology`);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.warn('Numerology API not available:', error);
        return null;
      }
    },
    enabled: !!predictionId,
    staleTime: 60 * 1000,
    retry: false,
  });
}
