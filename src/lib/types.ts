// Unified prediction type that works with both API and mock data
export interface Prediction {
  id: string;
  sport: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: Date | string;
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

export interface UserStats {
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

export const sportIcons: Record<string, string> = {
  NFL: '🏈',
  NBA: '🏀',
  NHL: '🏒',
  MLB: '⚾',
  Soccer: '⚽',
  UFC: '🥊',
  Polymarket: '📊',
  Kalshi: '📈',
  // Handle lowercase from API
  nfl: '🏈',
  nba: '🏀',
  nhl: '🏒',
  mlb: '⚾',
  soccer: '⚽',
  ufc: '🥊',
};
