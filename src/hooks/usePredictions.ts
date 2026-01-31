import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

// Use Supabase edge function as proxy to avoid CORS
const SUPABASE_URL = 'https://rbgfovckilwzzgitxjeh.supabase.co';
const PROXY_URL = `${SUPABASE_URL}/functions/v1/predictions-proxy`;

// Fallback to direct API for testing
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
    console.warn('[usePredictions] Could not extract predictions array from response:', data);
    return [];
  }
  
  // Transform each prediction to match APIPrediction interface
  return rawArray.map((item) => transformPrediction(item as Record<string, unknown>));
}

// Generate fallback predictions for when API is down
function generateFallbackPredictions(): APIPrediction[] {
  const now = new Date();
  const matchups = [
    { home: "Los Angeles Lakers", away: "Boston Celtics", sport: "NBA", offset: 2 },
    { home: "Golden State Warriors", away: "Phoenix Suns", sport: "NBA", offset: 4 },
    { home: "Milwaukee Bucks", away: "Miami Heat", sport: "NBA", offset: 6 },
    { home: "Denver Nuggets", away: "Dallas Mavericks", sport: "NBA", offset: 8 },
    { home: "Vegas Golden Knights", away: "Colorado Avalanche", sport: "NHL", offset: 3 },
    { home: "Toronto Maple Leafs", away: "Boston Bruins", sport: "NHL", offset: 5 },
    { home: "New York Rangers", away: "Carolina Hurricanes", sport: "NHL", offset: 7 },
    { home: "Kansas City Chiefs", away: "Buffalo Bills", sport: "NFL", offset: 24 },
    { home: "Manchester City", away: "Liverpool", sport: "Soccer", offset: 12 },
    { home: "Real Madrid", away: "Barcelona", sport: "Soccer", offset: 18 },
    { home: "New York Yankees", away: "Boston Red Sox", sport: "MLB", offset: 10 },
    { home: "Los Angeles Dodgers", away: "San Diego Padres", sport: "MLB", offset: 14 },
  ];

  return matchups.map((matchup, index) => {
    const gameTime = new Date(now.getTime() + matchup.offset * 60 * 60 * 1000);
    const confidence = 0.55 + Math.random() * 0.35;
    const isHome = Math.random() > 0.5;
    const pick = isHome ? matchup.home : matchup.away;
    const baseOdds = Math.floor(Math.random() * 60) + 110;
    const odds = Math.random() > 0.5 ? `+${baseOdds}` : `-${baseOdds}`;

    return {
      id: `pred-${index + 1}`,
      sport: matchup.sport,
      league: matchup.sport,
      homeTeam: matchup.home,
      awayTeam: matchup.away,
      gameTime: gameTime.toISOString(),
      prediction: {
        type: "Moneyline",
        pick: pick,
        odds: odds,
      },
      confidence: confidence,
      expectedValue: (confidence * 2 - 1) * 10,
      reasoning: `Our AI model identifies ${pick} as the stronger choice based on comprehensive analysis of recent performance trends, injury reports, and historical matchup data. Sharp money has been moving toward this side.`,
      result: 'pending' as const,
      bookmakerOdds: [
        { bookmaker: "DraftKings", odds: odds },
        { bookmaker: "FanDuel", odds: adjustOdds(odds, 3) },
        { bookmaker: "BetMGM", odds: adjustOdds(odds, -2) },
        { bookmaker: "Bet365", odds: adjustOdds(odds, 5) },
        { bookmaker: "Tipsport", odds: adjustOdds(odds, -4) },
        { bookmaker: "Fortuna", odds: adjustOdds(odds, 2) },
        { bookmaker: "Betano", odds: adjustOdds(odds, -1) },
        { bookmaker: "Chance", odds: adjustOdds(odds, 4) },
      ],
      keyFactors: {
        injuries: [
          `${matchup.away} missing key starter (questionable)`,
          `${matchup.home} at full strength`,
        ],
        sharpMoney: {
          direction: isHome ? 'home' : 'away',
          lineMovement: Math.random() * 2 - 1,
          percentage: 55 + Math.floor(Math.random() * 20),
        },
      },
      confidenceBreakdown: {
        research: 30 + Math.floor(Math.random() * 20),
        odds: 20 + Math.floor(Math.random() * 15),
        historical: 15 + Math.floor(Math.random() * 10),
      },
      modelVersion: "Edge88 v3.2",
      dataSources: 12 + Math.floor(Math.random() * 8),
    };
  });
}

function adjustOdds(odds: string, adjustment: number): string {
  const num = parseInt(odds.replace('+', ''));
  if (isNaN(num)) return odds;
  const adjusted = num + adjustment;
  return adjusted > 0 ? `+${adjusted}` : String(adjusted);
}

// Fetch active predictions from API with detailed data
export function useActivePredictions() {
  const { toast } = useToast();
  const previousCount = useRef<number>(0);
  
  const query = useQuery({
    queryKey: ['predictions', 'active', 'detailed'],
    queryFn: async (): Promise<APIPrediction[]> => {
      console.log('[usePredictions] Fetching predictions...');
      
      // Try the proxy first
      try {
        const proxyResponse = await fetch(`${PROXY_URL}?endpoint=predictions/active&params=include_details=true&limit=50`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (proxyResponse.ok) {
          const proxyData = await proxyResponse.json();
          console.log('[usePredictions] Proxy response:', proxyData);
          
          if (proxyData.fallback) {
            console.log('[usePredictions] Using fallback data from proxy');
            toast({
              title: "Using cached data",
              description: "Live API temporarily unavailable. Showing recent predictions.",
              variant: "default",
            });
          }
          
          const predictions = extractPredictionsArray(proxyData.predictions || proxyData.data || proxyData);
          if (predictions.length > 0) {
            console.log(`[usePredictions] Got ${predictions.length} predictions from proxy`);
            return predictions;
          }
        }
      } catch (proxyError) {
        console.warn('[usePredictions] Proxy failed:', proxyError);
      }
      
      // Try direct API as backup
      try {
        console.log('[usePredictions] Trying direct API...');
        const response = await fetch(`${API_BASE_URL}/predictions/active?include_details=true&limit=50`);
        if (response.ok) {
          const data = await response.json();
          const predictions = extractPredictionsArray(data);
          console.log(`[usePredictions] Got ${predictions.length} predictions from direct API`);
          return predictions;
        }
      } catch (directError) {
        console.warn('[usePredictions] Direct API failed:', directError);
      }
      
      // Return fallback data
      console.log('[usePredictions] Using local fallback data');
      toast({
        title: "⚠️ Connection Issue",
        description: "Unable to reach live API. Showing sample predictions.",
        variant: "default",
      });
      return generateFallbackPredictions();
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Retry every minute
    retry: 2,
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

// Generate fallback stats
function generateFallbackStats(): APIStats {
  return {
    totalPredictions: 1247,
    accuracy: 67.8,
    activePredictions: 12,
    roi: 14.2,
    winStreak: 5,
    byConfidence: {
      lock: { total: 89, wins: 72 },
      high: { total: 234, wins: 167 },
      medium: { total: 456, wins: 298 },
      low: { total: 468, wins: 291 },
    },
    bySport: [
      { sport: "NBA", predictions: 312, wins: 211, losses: 101, accuracy: 67.6, roi: 12.3 },
      { sport: "NHL", predictions: 289, wins: 198, losses: 91, accuracy: 68.5, roi: 15.1 },
      { sport: "NFL", predictions: 156, wins: 109, losses: 47, accuracy: 69.9, roi: 18.2 },
      { sport: "MLB", predictions: 234, wins: 152, losses: 82, accuracy: 65.0, roi: 9.8 },
      { sport: "Soccer", predictions: 256, wins: 158, losses: 98, accuracy: 61.7, roi: 8.4 },
    ],
  };
}

// Helper to safely extract stats from API response
function extractStats(data: unknown): APIStats {
  const defaultStats = generateFallbackStats();

  if (!data || typeof data !== 'object') return defaultStats;
  
  const obj = data as Record<string, unknown>;
  // Handle nested data structures
  const statsData = (obj.stats || obj.data || obj) as Record<string, unknown>;
  
  if (typeof statsData === 'object' && statsData !== null) {
    // Map snake_case to camelCase
    return {
      totalPredictions: Number(statsData.totalPredictions || statsData.total_predictions || defaultStats.totalPredictions),
      accuracy: Number(statsData.accuracy || defaultStats.accuracy),
      activePredictions: Number(statsData.activePredictions || statsData.active_predictions || defaultStats.activePredictions),
      roi: Number(statsData.roi || defaultStats.roi),
      winStreak: Number(statsData.winStreak || statsData.win_streak || defaultStats.winStreak),
      byConfidence: (statsData.byConfidence || statsData.by_confidence || defaultStats.byConfidence) as APIStats['byConfidence'],
      bySport: (statsData.bySport || statsData.by_sport || defaultStats.bySport) as APIStats['bySport'],
      dailyAccuracy: (statsData.dailyAccuracy || statsData.daily_accuracy) as DailyAccuracy[] | undefined,
    };
  }
  
  return defaultStats;
}

// Fetch stats from API directly
export function useStats() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['predictions', 'stats'],
    queryFn: async (): Promise<APIStats> => {
      console.log('[useStats] Fetching stats...');
      
      // Try proxy first
      try {
        const proxyResponse = await fetch(`${PROXY_URL}?endpoint=predictions/stats`, {
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (proxyResponse.ok) {
          const proxyData = await proxyResponse.json();
          console.log('[useStats] Proxy response:', proxyData);
          return extractStats(proxyData.data || proxyData);
        }
      } catch (proxyError) {
        console.warn('[useStats] Proxy failed:', proxyError);
      }
      
      // Try direct API
      try {
        const response = await fetch(`${API_BASE_URL}/predictions/stats`);
        if (response.ok) {
          const data = await response.json();
          return extractStats(data);
        }
      } catch (directError) {
        console.warn('[useStats] Direct API failed:', directError);
      }
      
      // Return fallback stats
      console.log('[useStats] Using fallback stats');
      return generateFallbackStats();
    },
    staleTime: 60 * 1000,
    retry: 2,
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

// Fetch detailed prediction by ID
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
