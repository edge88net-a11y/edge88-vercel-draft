export interface Prediction {
  id: string;
  sport: 'NFL' | 'NBA' | 'NHL' | 'MLB' | 'Soccer' | 'UFC' | 'Polymarket' | 'Kalshi';
  league?: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: Date;
  prediction: {
    type: 'Moneyline' | 'Spread' | 'Over/Under' | 'Prop';
    pick: string;
    line?: string;
    odds: string;
  };
  confidence: number;
  expectedValue: number;
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
};

export const teamLogos: Record<string, string> = {
  'Lakers': '💜',
  'Celtics': '☘️',
  'Chiefs': '🔴',
  'Bills': '🦬',
  'Arsenal': '🔴',
  'Liverpool': '🔴',
  'Maple Leafs': '🍁',
  'Rangers': '🗽',
  '49ers': '⛏️',
  'Eagles': '🦅',
  'Warriors': '💛',
  'Heat': '🔥',
  'Bruins': '🐻',
  'Oilers': '🛢️',
  'Yankees': '⚾',
  'Dodgers': '💙',
  'Man City': '🩵',
  'Real Madrid': '⚪',
};

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

export const mockPredictions: Prediction[] = [
  {
    id: '1',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: 'Chiefs',
    awayTeam: 'Bills',
    gameTime: tomorrow,
    prediction: {
      type: 'Spread',
      pick: 'Chiefs -3.5',
      line: '-3.5',
      odds: '1.91',
    },
    confidence: 78,
    expectedValue: 4.2,
    reasoning: 'Chiefs at home with Mahomes are historically dominant.',
    result: 'pending',
  },
  {
    id: '2',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Celtics',
    gameTime: new Date(now.getTime() + 36 * 60 * 60 * 1000),
    prediction: {
      type: 'Over/Under',
      pick: 'Over 224.5',
      line: '224.5',
      odds: '1.87',
    },
    confidence: 72,
    expectedValue: 3.8,
    reasoning: 'Both teams have been scoring heavily recently.',
    result: 'pending',
  },
  {
    id: '3',
    sport: 'NHL',
    league: 'NHL',
    homeTeam: 'Maple Leafs',
    awayTeam: 'Rangers',
    gameTime: dayAfter,
    prediction: {
      type: 'Moneyline',
      pick: 'Maple Leafs',
      odds: '2.10',
    },
    confidence: 65,
    expectedValue: 2.1,
    reasoning: 'Home ice advantage and Matthews is on fire.',
    result: 'pending',
  },
  {
    id: '4',
    sport: 'Soccer',
    league: 'Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Liverpool',
    gameTime: new Date(now.getTime() + 72 * 60 * 60 * 1000),
    prediction: {
      type: 'Moneyline',
      pick: 'Draw',
      odds: '3.40',
    },
    confidence: 58,
    expectedValue: 5.2,
    reasoning: 'Top of the table clash, expect a cagey affair.',
    result: 'pending',
  },
  {
    id: '5',
    sport: 'UFC',
    league: 'UFC',
    homeTeam: 'Fighter A',
    awayTeam: 'Fighter B',
    gameTime: new Date(now.getTime() + 96 * 60 * 60 * 1000),
    prediction: {
      type: 'Moneyline',
      pick: 'Fighter A',
      odds: '1.65',
    },
    confidence: 82,
    expectedValue: 3.9,
    reasoning: 'Superior wrestling and ground game.',
    result: 'pending',
  },
  {
    id: '6',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Warriors',
    awayTeam: 'Heat',
    gameTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    prediction: {
      type: 'Spread',
      pick: 'Warriors -6.5',
      line: '-6.5',
      odds: '1.91',
    },
    confidence: 71,
    expectedValue: 3.2,
    reasoning: 'Warriors dominant at home.',
    result: 'win',
  },
  {
    id: '7',
    sport: 'NHL',
    league: 'NHL',
    homeTeam: 'Bruins',
    awayTeam: 'Oilers',
    gameTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    prediction: {
      type: 'Over/Under',
      pick: 'Under 5.5',
      line: '5.5',
      odds: '1.95',
    },
    confidence: 69,
    expectedValue: 2.8,
    reasoning: 'Strong goaltending on both sides.',
    result: 'loss',
  },
  {
    id: '8',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: '49ers',
    awayTeam: 'Eagles',
    gameTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    prediction: {
      type: 'Moneyline',
      pick: '49ers',
      odds: '1.75',
    },
    confidence: 76,
    expectedValue: 4.1,
    reasoning: 'Home field advantage and dominant defense.',
    result: 'win',
  },
  {
    id: '9',
    sport: 'MLB',
    league: 'MLB',
    homeTeam: 'Yankees',
    awayTeam: 'Dodgers',
    gameTime: tomorrow,
    prediction: {
      type: 'Moneyline',
      pick: 'Dodgers',
      odds: '2.20',
    },
    confidence: 63,
    expectedValue: 3.5,
    reasoning: 'Better pitching matchup for Dodgers.',
    result: 'pending',
  },
  {
    id: '10',
    sport: 'Soccer',
    league: 'La Liga',
    homeTeam: 'Real Madrid',
    awayTeam: 'Man City',
    gameTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    prediction: {
      type: 'Over/Under',
      pick: 'Over 2.5',
      line: '2.5',
      odds: '1.85',
    },
    confidence: 74,
    expectedValue: 3.1,
    reasoning: 'Both teams with lethal attacks.',
    result: 'pending',
  },
  {
    id: '11',
    sport: 'NHL',
    league: 'NHL',
    homeTeam: 'Rangers',
    awayTeam: 'Bruins',
    gameTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    prediction: {
      type: 'Moneyline',
      pick: 'Rangers',
      odds: '2.05',
    },
    confidence: 73,
    expectedValue: 3.6,
    reasoning: 'Rangers defense has been solid.',
    result: 'win',
  },
  {
    id: '12',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Celtics',
    awayTeam: 'Lakers',
    gameTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    prediction: {
      type: 'Spread',
      pick: 'Celtics -5.5',
      line: '-5.5',
      odds: '1.91',
    },
    confidence: 77,
    expectedValue: 4.0,
    reasoning: 'Celtics rolling at home.',
    result: 'win',
  },
  {
    id: '13',
    sport: 'NHL',
    league: 'NHL',
    homeTeam: 'Oilers',
    awayTeam: 'Maple Leafs',
    gameTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    prediction: {
      type: 'Over/Under',
      pick: 'Over 5.5',
      line: '5.5',
      odds: '1.90',
    },
    confidence: 68,
    expectedValue: 2.2,
    reasoning: 'Goaltending duel expected but offense showed up.',
    result: 'loss',
  },
  {
    id: '14',
    sport: 'Soccer',
    league: 'Premier League',
    homeTeam: 'Liverpool',
    awayTeam: 'Arsenal',
    gameTime: new Date(now.getTime() - 96 * 60 * 60 * 1000),
    prediction: {
      type: 'Moneyline',
      pick: 'Liverpool',
      odds: '1.70',
    },
    confidence: 79,
    expectedValue: 2.8,
    reasoning: 'Liverpool clinical at Anfield.',
    result: 'win',
  },
  {
    id: '15',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Heat',
    awayTeam: 'Warriors',
    gameTime: new Date(now.getTime() - 120 * 60 * 60 * 1000),
    prediction: {
      type: 'Spread',
      pick: 'Heat +4.5',
      line: '+4.5',
      odds: '1.91',
    },
    confidence: 66,
    expectedValue: 2.5,
    reasoning: 'Heat covered despite the loss.',
    result: 'win',
  },
];

export const mockUserStats: UserStats = {
  totalPredictions: 847,
  accuracy: 64.8,
  activePredictions: 12,
  roi: 8.7,
  winStreak: 5,
  byConfidence: {
    lock: { total: 89, wins: 72 },
    high: { total: 234, wins: 163 },
    medium: { total: 324, wins: 198 },
    low: { total: 200, wins: 116 },
  },
  bySport: [
    { sport: 'NFL', predictions: 156, wins: 105, losses: 51, accuracy: 67.3, roi: 12.4 },
    { sport: 'NBA', predictions: 234, wins: 152, losses: 82, accuracy: 65.0, roi: 9.2 },
    { sport: 'NHL', predictions: 123, wins: 78, losses: 45, accuracy: 63.4, roi: 7.1 },
    { sport: 'MLB', predictions: 145, wins: 89, losses: 56, accuracy: 61.4, roi: 5.8 },
    { sport: 'Soccer', predictions: 112, wins: 74, losses: 38, accuracy: 66.1, roi: 10.3 },
    { sport: 'UFC', predictions: 77, wins: 51, losses: 26, accuracy: 66.2, roi: 8.9 },
  ],
};

// UPDATED: Removed FREE tier, 3 tiers only with proper CZ/EN pricing
export interface PricingPlan {
  name: string;
  priceUsd: number;
  priceCzk: number;
  annualPriceUsd: number;
  annualPriceCzk: number;
  period: string;
  description: { en: string; cz: string };
  features: { en: string[]; cz: string[] };
  notIncluded: { en: string[]; cz: string[] };
  cta: { en: string; cz: string };
  popular: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    priceUsd: 29,
    priceCzk: 690,
    annualPriceUsd: 19,
    annualPriceCzk: 490,
    period: 'month',
    description: {
      en: 'Perfect for casual bettors',
      cz: 'Ideální pro příležitostné sázkaře',
    },
    features: {
      en: [
        '10 picks per day',
        'NHL + NBA coverage',
        'Basic analysis',
        'Email alerts',
        'Pick history',
        'Community access',
      ],
      cz: [
        '10 predikcí denně',
        'NHL + NBA pokrytí',
        'Základní analýza',
        'Email notifikace',
        'Historie výsledků',
        'Komunitní přístup',
      ],
    },
    notIncluded: {
      en: ['All sports', 'Arbitrage alerts', 'Telegram alerts'],
      cz: ['Všechny sporty', 'Arbitrážní upozornění', 'Telegram notifikace'],
    },
    cta: { en: 'Get Started', cz: 'Začít' },
    popular: false,
  },
  {
    name: 'Pro',
    priceUsd: 99,
    priceCzk: 2490,
    annualPriceUsd: 69,
    annualPriceCzk: 1790,
    period: 'month',
    description: {
      en: 'For serious analysts',
      cz: 'Pro vážné analytiky',
    },
    features: {
      en: [
        'Unlimited picks',
        'All sports coverage',
        'Detailed AI analysis',
        'Arbitrage alerts',
        'Priority support',
        'Custom filters',
        'Export data',
        'Telegram alerts',
      ],
      cz: [
        'Neomezené predikce',
        'Všechny sporty',
        'Detailní AI analýza',
        'Arbitrážní upozornění',
        'Prioritní podpora',
        'Vlastní filtry',
        'Export dat',
        'Telegram notifikace',
      ],
    },
    notIncluded: { en: [], cz: [] },
    cta: { en: 'Go Pro', cz: 'Přejít na Pro' },
    popular: true,
  },
  {
    name: 'Elite',
    priceUsd: 299,
    priceCzk: 6990,
    annualPriceUsd: 199,
    annualPriceCzk: 4990,
    period: 'month',
    description: {
      en: 'Maximum edge',
      cz: 'Maximální výhoda',
    },
    features: {
      en: [
        'Everything in Pro',
        'Real-time Telegram alerts',
        'Prediction markets (Polymarket, Kalshi)',
        '🔮 Mystical analysis',
        'Exclusive Discord',
        'White-glove onboarding',
        'Custom model training',
      ],
      cz: [
        'Vše z Pro',
        'Real-time Telegram upozornění',
        'Predikční trhy (Polymarket, Kalshi)',
        '🔮 Mystická analýza',
        'Exkluzivní Discord',
        'White-glove onboarding',
        'Vlastní model trénink',
      ],
    },
    notIncluded: { en: [], cz: [] },
    cta: { en: 'Contact Sales', cz: 'Kontaktovat prodej' },
    popular: false,
  },
];
