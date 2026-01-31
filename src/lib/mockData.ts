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
    gameTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    prediction: {
      type: 'Spread',
      pick: 'Chiefs -3.5',
      line: '-3.5',
      odds: '-110',
    },
    confidence: 87,
    expectedValue: 4.2,
    reasoning: 'Patrick Mahomes has a 23-4 record at home in primetime games. Chiefs defense allowing just 18.2 PPG at home this season.',
    result: 'pending',
  },
  {
    id: '2',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Celtics',
    gameTime: new Date(now.getTime() + 5 * 60 * 60 * 1000),
    prediction: {
      type: 'Moneyline',
      pick: 'Celtics',
      odds: '-145',
    },
    confidence: 78,
    expectedValue: 3.1,
    reasoning: 'Celtics 8-2 ATS on the road this month. Lakers missing AD (probable out). Boston shooting 41% from 3 in road games.',
    result: 'pending',
  },
  {
    id: '3',
    sport: 'NHL',
    league: 'NHL',
    homeTeam: 'Maple Leafs',
    awayTeam: 'Rangers',
    gameTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    prediction: {
      type: 'Over/Under',
      pick: 'Over 6.5',
      line: '6.5',
      odds: '-115',
    },
    confidence: 72,
    expectedValue: 2.8,
    reasoning: 'Both teams averaging 3.5+ goals/game. Head-to-head average of 7.2 goals in last 10 meetings. Backup goalies expected.',
    result: 'pending',
  },
  {
    id: '4',
    sport: 'Soccer',
    league: 'Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Liverpool',
    gameTime: tomorrow,
    prediction: {
      type: 'Moneyline',
      pick: 'Draw',
      odds: '+245',
    },
    confidence: 65,
    expectedValue: 5.4,
    reasoning: 'Last 6 meetings: 3 draws. Arsenal unbeaten at home (12-0-4). Liverpool resting key players for UCL midweek.',
    result: 'pending',
  },
  {
    id: '5',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Warriors',
    awayTeam: 'Heat',
    gameTime: new Date(now.getTime() + 8 * 60 * 60 * 1000),
    prediction: {
      type: 'Spread',
      pick: 'Warriors -6.5',
      line: '-6.5',
      odds: '-105',
    },
    confidence: 82,
    expectedValue: 3.9,
    reasoning: 'Warriors 15-3 at Chase Center this season. Heat on second night of back-to-back, traveling from Denver altitude game.',
    result: 'pending',
  },
  {
    id: '6',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: '49ers',
    awayTeam: 'Eagles',
    gameTime: tomorrow,
    prediction: {
      type: 'Moneyline',
      pick: '49ers',
      odds: '-175',
    },
    confidence: 91,
    expectedValue: 2.1,
    reasoning: 'CMC averaging 142 scrimmage yards at home. 49ers defense #1 in pressure rate. Eagles struggling on West Coast trips (2-5 ATS).',
    result: 'pending',
  },
  {
    id: '7',
    sport: 'NHL',
    league: 'NHL',
    homeTeam: 'Bruins',
    awayTeam: 'Oilers',
    gameTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
    prediction: {
      type: 'Moneyline',
      pick: 'Bruins',
      odds: '-130',
    },
    confidence: 76,
    expectedValue: 2.4,
    reasoning: 'Bruins 22-5-3 at home. Swayman .932 save% at TD Garden. Oilers on tail end of 4-game road trip.',
    result: 'pending',
  },
  {
    id: '8',
    sport: 'UFC',
    league: 'UFC',
    homeTeam: 'Fighter A',
    awayTeam: 'Fighter B',
    gameTime: dayAfter,
    prediction: {
      type: 'Prop',
      pick: 'Fight goes to decision',
      odds: '+150',
    },
    confidence: 68,
    expectedValue: 4.8,
    reasoning: 'Both fighters have 70%+ decision rate in last 5 fights. Similar styles, expect a chess match.',
    result: 'pending',
  },
  {
    id: '9',
    sport: 'MLB',
    league: 'MLB',
    homeTeam: 'Yankees',
    awayTeam: 'Dodgers',
    gameTime: tomorrow,
    prediction: {
      type: 'Over/Under',
      pick: 'Under 8.5',
      line: '8.5',
      odds: '-120',
    },
    confidence: 74,
    expectedValue: 2.6,
    reasoning: 'Aces on the mound for both teams. Combined 2.89 ERA in last 10 starts. Wind blowing in at Yankee Stadium.',
    result: 'pending',
  },
  {
    id: '10',
    sport: 'Soccer',
    league: 'La Liga',
    homeTeam: 'Real Madrid',
    awayTeam: 'Man City',
    gameTime: dayAfter,
    prediction: {
      type: 'Spread',
      pick: 'Real Madrid +0.5',
      line: '+0.5',
      odds: '-135',
    },
    confidence: 70,
    expectedValue: 2.9,
    reasoning: 'Madrid unbeaten at Bernabeu in UCL (14 games). Haaland questionable with knock. Bellingham in career-best form.',
    result: 'pending',
  },
  // Past results
  {
    id: '11',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Celtics',
    awayTeam: 'Lakers',
    gameTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    prediction: {
      type: 'Spread',
      pick: 'Celtics -7.5',
      line: '-7.5',
      odds: '-110',
    },
    confidence: 85,
    expectedValue: 3.5,
    reasoning: 'Celtics dominated at home with strong 3-point shooting.',
    result: 'win',
  },
  {
    id: '12',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: 'Bills',
    awayTeam: 'Chiefs',
    gameTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    prediction: {
      type: 'Moneyline',
      pick: 'Bills',
      odds: '+125',
    },
    confidence: 72,
    expectedValue: 4.1,
    reasoning: 'Bills home field advantage proved decisive.',
    result: 'win',
  },
  {
    id: '13',
    sport: 'NHL',
    league: 'NHL',
    homeTeam: 'Rangers',
    awayTeam: 'Maple Leafs',
    gameTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    prediction: {
      type: 'Over/Under',
      pick: 'Under 5.5',
      line: '5.5',
      odds: '-105',
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
      odds: '-140',
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
      odds: '-110',
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

export const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic predictions',
    features: [
      '3 picks per day',
      'Basic sports coverage',
      'Daily results email',
      'Community access',
    ],
    notIncluded: [
      'Premium picks',
      'API access',
      'Real-time alerts',
      'Detailed analysis',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for casual bettors',
    features: [
      'Unlimited picks',
      'All sports coverage',
      'Email alerts',
      'Pick history',
      'Basic analysis',
      'Priority support',
    ],
    notIncluded: [
      'API access',
      'Real-time alerts',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 99,
    period: 'month',
    description: 'For serious analysts',
    features: [
      'Everything in Starter',
      'API access',
      'Arbitrage alerts',
      'Detailed analysis',
      'Priority support',
      'Custom filters',
      'Export data',
    ],
    notIncluded: [],
    cta: 'Go Pro',
    popular: true,
  },
  {
    name: 'Elite',
    price: 299,
    period: 'month',
    description: 'Maximum edge',
    features: [
      'Everything in Pro',
      'Real-time Telegram alerts',
      'Polymarket & Kalshi picks',
      '1-on-1 support calls',
      'Custom model training',
      'White-glove onboarding',
      'Exclusive Discord',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    popular: false,
  },
];
