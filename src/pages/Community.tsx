import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, Crown, Flame, Star, Users, MessageCircle, Heart, Medal,
  TrendingUp, Upload, Lock, Check, Sparkles, Shield, ArrowUp, ArrowDown,
  Minus, ExternalLink, Send, Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { isAdminUser, getDisplayTier } from '@/lib/adminAccess';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

// Types
interface LeaderboardUser {
  rank: number;
  username: string;
  avatar?: string;
  accuracy: number;
  picksFollowed: number;
  estimatedProfit: number;
  tier: 'free' | 'basic' | 'pro' | 'elite';
  trend: number; // positive = moved up, negative = moved down
}

interface ActivityItem {
  id: string;
  type: 'win' | 'follow' | 'streak' | 'newMember' | 'achievement';
  username: string;
  message: string;
  amount?: number;
  timestamp: Date;
  link?: string;
}

interface Badge {
  id: string;
  name: string;
  nameCz: string;
  icon: string;
  description: string;
  descriptionCz: string;
  howToEarn: string;
  howToEarnCz: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  progressMax?: number;
}

interface WinShare {
  id: string;
  username: string;
  avatar?: string;
  image: string;
  description: string;
  likes: number;
  timestamp: Date;
  sport?: string;
  profit: number;
  liked?: boolean;
}

interface Comment {
  id: string;
  user: string;
  tier: string;
  comment: string;
  votes: number;
  reactions: { fire: number; thumbs: number; target: number; money: number };
  timestamp: Date;
}

// Mock Data Generators
const generateLeaderboard = (): LeaderboardUser[] => {
  const names = [
    'Petr M.', 'Jana K.', 'Tomáš R.', 'David H.', 'Martin S.',
    'Eva N.', 'Lukáš P.', 'Tereza V.', 'Jakub K.', 'Kristýna L.',
    'Ondřej B.', 'Kateřina M.', 'Filip H.', 'Adéla W.', 'Matěj Z.',
    'Barbora J.', 'Václav K.', 'Simona D.', 'Patrik R.', 'Michaela T.'
  ];
  
  return names.map((name, index) => ({
    rank: index + 1,
    username: name,
    accuracy: Math.round(85 - index * 1.2 + Math.random() * 5),
    picksFollowed: Math.round(120 - index * 4 + Math.random() * 20),
    estimatedProfit: Math.round((25000 - index * 1000 + Math.random() * 5000) / 100) * 100,
    tier: index < 3 ? 'elite' : index < 8 ? 'pro' : index < 15 ? 'basic' : 'free' as const,
    trend: index === 0 ? 0 : Math.floor(Math.random() * 7) - 3,
  }));
};

const generateActivities = (): ActivityItem[] => {
  const activities: ActivityItem[] = [
    { id: '1', type: 'win', username: 'Petr M.', message: 'vyhrál tip na Tampa Bay', amount: 1200, timestamp: new Date(), link: '/predictions' },
    { id: '2', type: 'follow', username: 'Jana K.', message: 'sleduje 5 dnešních tipů', timestamp: new Date(Date.now() - 30000), link: '/predictions' },
    { id: '3', type: 'streak', username: 'Tomáš R.', message: 'má sérii 8 výher v řadě', timestamp: new Date(Date.now() - 60000) },
    { id: '4', type: 'newMember', username: 'David H.', message: 'se stal Elite členem', timestamp: new Date(Date.now() - 90000), link: '/pricing' },
    { id: '5', type: 'win', username: 'Martin S.', message: 'vyhrál tip na Boston Celtics', amount: 2400, timestamp: new Date(Date.now() - 120000), link: '/predictions' },
    { id: '6', type: 'achievement', username: 'Eva N.', message: 'získala odznak 🔥 Hot Streak', timestamp: new Date(Date.now() - 150000) },
    { id: '7', type: 'follow', username: 'Lukáš P.', message: 'sleduje NHL tip', timestamp: new Date(Date.now() - 180000), link: '/predictions' },
    { id: '8', type: 'win', username: 'Tereza V.', message: 'vyhrála parlay sázku', amount: 5600, timestamp: new Date(Date.now() - 210000), link: '/predictions' },
  ];
  return activities;
};

const allBadges: Badge[] = [
  {
    id: 'first-pick',
    name: 'First Pick',
    nameCz: 'První tip',
    icon: '🌟',
    description: 'Followed your first prediction',
    descriptionCz: 'Sledujete svou první predikci',
    howToEarn: 'Follow any prediction',
    howToEarnCz: 'Sledujte jakoukoli predikci',
    earned: true,
    earnedDate: '15.01.2026',
  },
  {
    id: 'hot-streak',
    name: 'Hot Streak',
    nameCz: 'Série výher',
    icon: '🔥',
    description: 'Won 5 predictions in a row',
    descriptionCz: 'Vyhráli jste 5 predikcí v řadě',
    howToEarn: 'Win 5 consecutive predictions',
    howToEarnCz: 'Vyhrajte 5 po sobě jdoucích predikcí',
    earned: true,
    earnedDate: '28.01.2026',
  },
  {
    id: 'diamond-hands',
    name: 'Diamond Hands',
    nameCz: 'Diamantové ruce',
    icon: '💎',
    description: 'Held through 3 losing days and recovered',
    descriptionCz: 'Vydrželi jste 3 prohry a vrátili se',
    howToEarn: 'Stay active during losing streaks',
    howToEarnCz: 'Zůstaňte aktivní během proher',
    earned: false,
    progress: 3,
    progressMax: 5,
  },
  {
    id: 'top-analyst',
    name: 'Top Analyst',
    nameCz: 'Top analytik',
    icon: '🏆',
    description: 'Reached top 10 on the leaderboard',
    descriptionCz: 'Dosáhli jste top 10 v žebříčku',
    howToEarn: 'Climb to top 10 monthly ranking',
    howToEarnCz: 'Dostaňte se do top 10 měsíčního žebříčku',
    earned: false,
    progress: 147,
    progressMax: 10,
  },
  {
    id: 'elite-member',
    name: 'Elite Member',
    nameCz: 'Elite člen',
    icon: '👑',
    description: 'Subscribed to Elite tier',
    descriptionCz: 'Předplatné Elite tier',
    howToEarn: 'Upgrade to Elite subscription',
    howToEarnCz: 'Upgradujte na Elite předplatné',
    earned: false,
  },
  {
    id: 'connector',
    name: 'Connector',
    nameCz: 'Propojovač',
    icon: '🤝',
    description: 'Referred 3 friends who signed up',
    descriptionCz: 'Pozvali jste 3 přátele',
    howToEarn: 'Share your referral link and get 3 signups',
    howToEarnCz: 'Sdílejte odkaz a získejte 3 registrace',
    earned: false,
    progress: 1,
    progressMax: 3,
  },
  // NEW badges
  {
    id: 'night-owl',
    name: 'Night Owl',
    nameCz: 'Noční sova',
    icon: '🦉',
    description: 'Placed a pick after midnight',
    descriptionCz: 'Sledovali jste tip po půlnoci',
    howToEarn: 'Follow a prediction after midnight',
    howToEarnCz: 'Sledujte predikci po půlnoci',
    earned: false,
  },
  {
    id: 'lucky-seven',
    name: 'Lucky Seven',
    nameCz: 'Šťastná sedmička',
    icon: '🍀',
    description: 'Won 7 predictions in a row',
    descriptionCz: '7 výher v řadě',
    howToEarn: 'Win 7 consecutive predictions',
    howToEarnCz: 'Vyhrajte 7 po sobě jdoucích predikcí',
    earned: false,
    progress: 5,
    progressMax: 7,
  },
  {
    id: 'shark',
    name: 'Shark',
    nameCz: 'Žralok',
    icon: '🦈',
    description: 'Profit over 10,000 Kč',
    descriptionCz: 'Profit přes 10 000 Kč',
    howToEarn: 'Accumulate 10,000 Kč in profit',
    howToEarnCz: 'Dosáhněte 10 000 Kč profitu',
    earned: false,
    progress: 4200,
    progressMax: 10000,
  },
  {
    id: 'loyal-fan',
    name: 'Loyal Fan',
    nameCz: 'Věrný fanoušek',
    icon: '📅',
    description: 'Active 30 days in a row',
    descriptionCz: 'Aktivní 30 dní v řadě',
    howToEarn: 'Stay active for 30 consecutive days',
    howToEarnCz: 'Buďte aktivní 30 dní v řadě',
    earned: false,
    progress: 12,
    progressMax: 30,
  },
  {
    id: 'parlay-king',
    name: 'Parlay King',
    nameCz: 'Parlay král',
    icon: '🎰',
    description: 'Won a 5+ pick parlay',
    descriptionCz: 'Vyhráli jste 5+ parlay',
    howToEarn: 'Win a parlay with 5 or more picks',
    howToEarnCz: 'Vyhrajte parlay s 5+ tipy',
    earned: false,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    nameCz: 'Ranní ptáče',
    icon: '🐦',
    description: 'First to follow a new prediction',
    descriptionCz: 'První kdo sledoval novou predikci',
    howToEarn: 'Be the first to follow a prediction within 5 minutes of posting',
    howToEarnCz: 'Buďte první kdo sleduje predikci do 5 minut',
    earned: true,
    earnedDate: '01.02.2026',
  },
];

const mockWinShares: WinShare[] = [
  {
    id: '1',
    username: 'Petr M.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    description: 'Boston Celtics parlay! 🏀',
    likes: 24,
    profit: 2400,
    sport: 'NBA',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    username: 'Jana K.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    description: 'NHL triple výhra! 🏒',
    likes: 47,
    profit: 8500,
    sport: 'NHL',
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    username: 'Tomáš R.',
    image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop',
    description: 'UFC upset! 🥊',
    likes: 31,
    profit: 3200,
    sport: 'UFC',
    timestamp: new Date(Date.now() - 10800000),
  },
];

const mockComments: Comment[] = [
  { 
    id: '1', 
    user: 'Martin S.', 
    tier: 'pro', 
    comment: 'Dneska skvělé tipy! 🔥', 
    votes: 12,
    reactions: { fire: 8, thumbs: 5, target: 2, money: 1 },
    timestamp: new Date(Date.now() - 300000),
  },
  { 
    id: '2', 
    user: 'Eva N.', 
    tier: 'elite', 
    comment: 'NHL série pokračuje 💪', 
    votes: 8,
    reactions: { fire: 3, thumbs: 4, target: 1, money: 0 },
    timestamp: new Date(Date.now() - 600000),
  },
  { 
    id: '3', 
    user: 'Lukáš P.', 
    tier: 'basic', 
    comment: 'Díky za Boston tip!', 
    votes: 5,
    reactions: { fire: 1, thumbs: 3, target: 0, money: 1 },
    timestamp: new Date(Date.now() - 900000),
  },
];

export default function Community() {
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [leaderboard] = useState<LeaderboardUser[]>(generateLeaderboard);
  const [activities, setActivities] = useState<ActivityItem[]>(generateActivities);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('month');
  const [winShares, setWinShares] = useState(mockWinShares);
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');
  const activityRef = useRef<HTMLDivElement>(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-refresh activities every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const shuffled = [...prev];
        const first = shuffled.shift()!;
        first.timestamp = new Date();
        first.id = `${first.id}-${Date.now()}`;
        shuffled.push(first);
        return [first, ...shuffled.slice(0, 7)];
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // User's rank (mock)
  const userRank = 147;
  const totalBettors = 847;

  const tierColors: Record<string, string> = {
    free: 'bg-muted/50 text-muted-foreground border-muted',
    basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    elite: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30',
    admin: 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-yellow-400/50 shadow-[0_0_10px_hsl(45,100%,50%,0.2)]',
  };

  const isAdmin = isAdminUser(user?.email);
  const displayTier = getDisplayTier(user?.email, profile?.subscription_tier);

  const getActivityStyle = (type: ActivityItem['type']) => {
    switch (type) {
      case 'win': return { icon: '✅', color: 'text-success bg-success/10 border-success/30', glow: 'shadow-success/20' };
      case 'follow': return { icon: '👁', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', glow: '' };
      case 'streak': return { icon: '🔥', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', glow: 'shadow-orange-500/20' };
      case 'newMember': return { icon: '⭐', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', glow: 'shadow-yellow-500/20' };
      case 'achievement': return { icon: '🏅', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', glow: '' };
    }
  };

  const handlePodiumHover = (rank: number) => {
    if (rank === 1) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.4 },
        colors: ['#fbbf24', '#f59e0b', '#d97706'],
      });
    }
  };

  const handleLikeWin = (id: string) => {
    setWinShares(prev => prev.map(w => 
      w.id === id ? { ...w, likes: w.liked ? w.likes - 1 : w.likes + 1, liked: !w.liked } : w
    ));
  };

  const handleReaction = (commentId: string, reactionType: keyof Comment['reactions']) => {
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, reactions: { ...c.reactions, [reactionType]: c.reactions[reactionType] + 1 } }
        : c
    ));
  };

  const formatProfit = (amount: number) => {
    if (language === 'cz') {
      return '+' + amount.toLocaleString('cs-CZ').replace(/,/g, ' ') + ' Kč';
    }
    return '+$' + amount.toLocaleString('en-US');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          {t.community}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t.communityDesc}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* LEADERBOARD SECTION */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="glass-card overflow-hidden">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                {language === 'cz' ? 'Top sázkaři' : 'Top Bettors'}
              </h2>
              
              {/* Period Tabs */}
              <Tabs value={leaderboardPeriod} onValueChange={setLeaderboardPeriod} className="h-auto">
                <TabsList className="h-8 bg-muted/50">
                  <TabsTrigger value="week" className="text-xs px-2 py-1">
                    {language === 'cz' ? 'Týden' : 'Week'}
                  </TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-2 py-1">
                    {language === 'cz' ? 'Měsíc' : 'Month'}
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-xs px-2 py-1">
                    {language === 'cz' ? 'Celkově' : 'All Time'}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* PODIUM - Top 3 */}
          <div className="p-4 pb-2">
            <div className="flex items-end justify-center gap-3 mb-4">
              {/* 2nd Place */}
              <div 
                className="flex-1 max-w-[140px] animate-slide-up"
                style={{ animationDelay: '100ms' }}
              >
                <div className={cn(
                  "p-3 rounded-xl border-2 bg-gradient-to-br from-slate-300/10 to-slate-400/10",
                  "border-slate-400/40 hover:border-slate-400/60 transition-all duration-300 hover:scale-[1.02]"
                )}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🥈</div>
                    <Avatar className="h-12 w-12 mx-auto ring-2 ring-slate-400/50">
                      <AvatarFallback className="bg-slate-500/30 text-slate-300 font-bold">
                        {top3[1]?.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-sm mt-2 truncate">{top3[1]?.username}</p>
                    <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', tierColors[top3[1]?.tier])}>
                      {top3[1]?.tier}
                    </span>
                    <p className="font-mono text-lg font-bold text-success mt-2">
                      {top3[1]?.accuracy}%
                    </p>
                    <p className="text-xs text-success font-mono">
                      {formatProfit(top3[1]?.estimatedProfit || 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {top3[1]?.picksFollowed} {language === 'cz' ? 'tipů' : 'picks'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 1st Place - GOLD */}
              <div 
                className="flex-1 max-w-[160px] animate-slide-up z-10"
                style={{ animationDelay: '0ms' }}
                onMouseEnter={() => handlePodiumHover(1)}
              >
                <div className={cn(
                  "p-4 rounded-xl border-2 bg-gradient-to-br from-yellow-500/15 to-orange-500/15",
                  "border-yellow-500/50 shadow-lg shadow-yellow-500/20",
                  "hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 hover:scale-[1.03]",
                  "golden-glow"
                )}>
                  <div className="text-center">
                    <div className="relative">
                      <Crown className="h-6 w-6 text-yellow-400 mx-auto mb-1 animate-bounce" style={{ animationDuration: '2s' }} />
                      <div className="text-3xl mb-1">🥇</div>
                    </div>
                    <Avatar className="h-14 w-14 mx-auto ring-2 ring-yellow-500/70 shadow-lg shadow-yellow-500/30">
                      <AvatarFallback className="bg-yellow-500/30 text-yellow-300 font-bold text-lg">
                        {top3[0]?.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-base mt-2 truncate">{top3[0]?.username}</p>
                    <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', tierColors[top3[0]?.tier])}>
                      {top3[0]?.tier}
                    </span>
                    <p className="font-mono text-2xl font-black text-success mt-2 stat-glow-green">
                      {top3[0]?.accuracy}%
                    </p>
                    <p className="text-sm text-success font-mono font-bold">
                      {formatProfit(top3[0]?.estimatedProfit || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {top3[0]?.picksFollowed} {language === 'cz' ? 'tipů' : 'picks'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div 
                className="flex-1 max-w-[140px] animate-slide-up"
                style={{ animationDelay: '200ms' }}
              >
                <div className={cn(
                  "p-3 rounded-xl border-2 bg-gradient-to-br from-orange-600/10 to-orange-700/10",
                  "border-orange-600/40 hover:border-orange-600/60 transition-all duration-300 hover:scale-[1.02]"
                )}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🥉</div>
                    <Avatar className="h-12 w-12 mx-auto ring-2 ring-orange-600/50">
                      <AvatarFallback className="bg-orange-600/30 text-orange-300 font-bold">
                        {top3[2]?.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-sm mt-2 truncate">{top3[2]?.username}</p>
                    <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', tierColors[top3[2]?.tier])}>
                      {top3[2]?.tier}
                    </span>
                    <p className="font-mono text-lg font-bold text-success mt-2">
                      {top3[2]?.accuracy}%
                    </p>
                    <p className="text-xs text-success font-mono">
                      {formatProfit(top3[2]?.estimatedProfit || 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {top3[2]?.picksFollowed} {language === 'cz' ? 'tipů' : 'picks'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of Leaderboard - Table */}
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">#</th>
                  <th className="p-3">{t.user}</th>
                  <th className="p-3 text-right">{t.accuracy}</th>
                  <th className="p-3 text-right hidden sm:table-cell">{language === 'cz' ? 'Trend' : 'Trend'}</th>
                  <th className="p-3 text-right hidden md:table-cell">{t.profit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rest.map((u, idx) => (
                  <tr key={u.rank} className={cn(
                    'transition-all duration-200 hover:bg-primary/5 hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]',
                  )}>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground font-mono">#{u.rank}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-primary/20 text-primary">
                            {u.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{u.username}</span>
                        <span className={cn(
                          'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border',
                          tierColors[u.tier]
                        )}>
                          {u.tier}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-mono font-bold text-success">
                        {u.accuracy}%
                      </span>
                    </td>
                    <td className="p-3 text-right hidden sm:table-cell">
                      <span className={cn(
                        'flex items-center justify-end gap-0.5 text-xs font-bold',
                        u.trend > 0 && 'text-success',
                        u.trend < 0 && 'text-destructive',
                        u.trend === 0 && 'text-muted-foreground'
                      )}>
                        {u.trend > 0 && <><ArrowUp className="h-3 w-3" />{u.trend}</>}
                        {u.trend < 0 && <><ArrowDown className="h-3 w-3" />{Math.abs(u.trend)}</>}
                        {u.trend === 0 && <><Minus className="h-3 w-3" /></>}
                      </span>
                    </td>
                    <td className="p-3 text-right hidden md:table-cell">
                      <span className="font-mono font-bold text-success">
                        {formatProfit(u.estimatedProfit)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* User's Position */}
          {user && (
            <div className="px-4 py-3 bg-primary/10 border-t border-primary/30">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  📍 {language === 'cz' ? 'Vaše pozice' : 'Your position'}:
                  <span className="font-mono font-bold text-primary">#{userRank}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Ještě 137 bodů do TOP 10' : '137 points to TOP 10'}
                </span>
              </div>
            </div>
          )}
          
          <div className="p-3 text-center border-t border-border">
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              {language === 'cz' ? 'Zobrazit celý žebříček' : 'View full leaderboard'}
              <span className="text-muted-foreground">({totalBettors} {language === 'cz' ? 'sázkaři' : 'bettors'})</span>
            </Button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* LIVE ACTIVITY FEED */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="glass-card overflow-hidden">
          <div className="border-b border-border p-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <span className="text-success">⚡</span>
              {language === 'cz' ? 'Živě' : 'Live'}
            </h2>
          </div>
          
          <div ref={activityRef} className="h-[450px] overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
            
            <div className="p-4 space-y-3">
              {activities.slice(0, 8).map((activity, index) => {
                const style = getActivityStyle(activity.type);
                return (
                  <div 
                    key={activity.id}
                    onClick={() => activity.link && navigate(activity.link)}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-all duration-500',
                      style.color,
                      style.glow && `shadow-lg ${style.glow}`,
                      index === 0 && 'animate-slide-in-right',
                      activity.link && 'cursor-pointer hover:scale-[1.02]'
                    )}
                    style={{ animationDuration: '400ms' }}
                  >
                    <span className="text-xl shrink-0">{style.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.username}</span>
                        {' '}{activity.message}
                        {activity.amount && (
                          <span className="text-success font-mono font-bold ml-1">
                            {formatProfit(activity.amount)}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {language === 'cz' ? 'Právě teď' : 'Just now'}
                      </p>
                    </div>
                    {activity.link && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-3 border-t border-border text-center text-xs text-muted-foreground">
            {language === 'cz' ? 'Automatická aktualizace každých 30s' : 'Auto-refresh every 30s'}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DISCUSSION SECTION */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            {language === 'cz' ? 'Diskuze' : 'Discussion'}
          </h2>
        </div>
        
        {/* Pinned Post - Enhanced */}
        <div className="p-4 bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border-b border-yellow-500/30">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0 ring-2 ring-yellow-500/50">
              E8
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">Edge88 Team</span>
                <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', tierColors.admin)}>
                  TEAM
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  📌 PINNED
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'cz' 
                  ? 'Vítejte v komunitě Edge88! 🎉 Sdílejte své výhry, tipy a spojte se s ostatními členy. Pravidla: buďte slušní, žádný spam.'
                  : 'Welcome to the Edge88 community! 🎉 Share your wins, tips and connect with other members. Rules: be respectful, no spam.'}
              </p>
            </div>
          </div>
        </div>

        {/* Comment Input - Enhanced */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={language === 'cz' ? 'Sdílejte svůj tip nebo výhru... 🎯' : 'Share your pick or win... 🎯'}
                className="min-h-[80px] resize-none text-base"
              />
              <div className="flex justify-between mt-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Smile className="h-4 w-4 mr-1" />
                  {language === 'cz' ? 'Emoji' : 'Emoji'}
                </Button>
                <Button size="sm" className="gap-1">
                  <Send className="h-4 w-4" />
                  {language === 'cz' ? 'Odeslat' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments with Reactions */}
        <div className="divide-y divide-border">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 hover:bg-muted/30 transition-colors animate-fade-in">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs bg-muted font-bold">{comment.user[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.user}</span>
                    <span className={cn(
                      'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border',
                      tierColors[comment.tier]
                    )}>
                      {comment.tier}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {language === 'cz' ? 'před 5m' : '5m ago'}
                    </span>
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                  
                  {/* Reactions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button 
                      onClick={() => handleReaction(comment.id, 'fire')}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted/50 hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
                    >
                      🔥 <span className="font-mono">{comment.reactions.fire}</span>
                    </button>
                    <button 
                      onClick={() => handleReaction(comment.id, 'thumbs')}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted/50 hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                      👍 <span className="font-mono">{comment.reactions.thumbs}</span>
                    </button>
                    <button 
                      onClick={() => handleReaction(comment.id, 'target')}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted/50 hover:bg-success/20 hover:text-success transition-colors"
                    >
                      🎯 <span className="font-mono">{comment.reactions.target}</span>
                    </button>
                    <button 
                      onClick={() => handleReaction(comment.id, 'money')}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted/50 hover:bg-success/20 hover:text-success transition-colors"
                    >
                      💰 <span className="font-mono">{comment.reactions.money}</span>
                    </button>
                    <span className="mx-2 text-border">|</span>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {language === 'cz' ? 'Odpovědět' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BADGES/ACHIEVEMENTS SECTION */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-400" />
                {language === 'cz' ? 'Odznaky' : 'Badges'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'cz' 
                  ? 'Sbírejte odznaky za své úspěchy'
                  : 'Collect badges for your achievements'}
              </p>
            </div>
            {/* Progress notification */}
            <div className="hidden sm:block px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-xs text-primary font-semibold">
                🏆 {language === 'cz' ? 'Ještě 2 výhry do odznaku "Šťastná sedmička"!' : '2 more wins for "Lucky Seven"!'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {/* Grid layout - 3 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={cn(
                  'group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300',
                  badge.earned 
                    ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 hover:border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                    : 'bg-muted/30 border-muted hover:border-muted-foreground/30'
                )}
              >
                {/* Locked overlay */}
                {!badge.earned && (
                  <div className="absolute inset-0 rounded-xl bg-background/30 backdrop-blur-[1px] flex items-center justify-center">
                    <Lock className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                )}
                
                <span className={cn(
                  'text-4xl transition-all group-hover:scale-110',
                  !badge.earned && 'grayscale opacity-50'
                )}>
                  {badge.icon}
                </span>
                <span className={cn(
                  'text-xs font-semibold text-center',
                  badge.earned ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {language === 'cz' ? badge.nameCz : badge.name}
                </span>
                
                {/* Earned date or Progress */}
                {badge.earned && badge.earnedDate && (
                  <div className="flex items-center gap-1 text-[10px] text-success">
                    <Check className="h-3 w-3" />
                    {badge.earnedDate}
                  </div>
                )}
                
                {!badge.earned && badge.progress !== undefined && badge.progressMax && (
                  <div className="w-full mt-1">
                    <Progress 
                      value={badge.progressMax <= badge.progress ? 100 : (badge.progress / badge.progressMax) * 100} 
                      className="h-1.5"
                    />
                    <p className="text-[10px] text-muted-foreground text-center mt-1">
                      {badge.progress}/{badge.progressMax}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Selected Badge Details */}
          {selectedBadge && (
            <div className={cn(
              "mt-6 p-4 rounded-xl border animate-scale-in",
              selectedBadge.earned 
                ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                : "bg-muted/50 border-border"
            )}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{selectedBadge.icon}</span>
                <div>
                  <h4 className="font-bold text-lg">
                    {language === 'cz' ? selectedBadge.nameCz : selectedBadge.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'cz' ? selectedBadge.descriptionCz : selectedBadge.description}
                  </p>
                </div>
              </div>
              {selectedBadge.earned && selectedBadge.earnedDate && (
                <p className="text-sm text-success flex items-center gap-1 mt-2">
                  <Check className="h-4 w-4" />
                  {language === 'cz' ? `Získáno ${selectedBadge.earnedDate}` : `Earned ${selectedBadge.earnedDate}`}
                </p>
              )}
              {!selectedBadge.earned && (
                <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm">
                    <span className="font-semibold text-primary">
                      {language === 'cz' ? 'Jak získat:' : 'How to earn:'}
                    </span>
                    {' '}
                    {language === 'cz' ? selectedBadge.howToEarnCz : selectedBadge.howToEarn}
                  </p>
                  {selectedBadge.progress !== undefined && selectedBadge.progressMax && (
                    <div className="mt-2">
                      <Progress 
                        value={selectedBadge.progressMax <= selectedBadge.progress ? 100 : (selectedBadge.progress / selectedBadge.progressMax) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'cz' 
                          ? `${selectedBadge.progress}/${selectedBadge.progressMax} do odemknutí`
                          : `${selectedBadge.progress}/${selectedBadge.progressMax} to unlock`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SHARE YOUR WINS SECTION */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" />
            {language === 'cz' ? 'Sdílejte své výhry' : 'Share Your Wins'}
          </h2>
        </div>

        {/* Upload Area */}
        <div className="p-4 border-b border-border">
          <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3 group-hover:text-primary transition-colors group-hover:scale-110" />
            <p className="font-semibold mb-1 group-hover:text-primary transition-colors">
              📸 {language === 'cz' ? 'Nahrát výherní tiket' : 'Upload winning slip'}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'cz' ? 'nebo přetáhněte soubor sem' : 'or drag and drop here'}
            </p>
          </div>
        </div>

        {/* Wins Gallery - Masonry style */}
        <div className="p-4">
          {winShares.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border-2 border-dashed border-muted p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    📸 {language === 'cz' ? 'Buďte první kdo sdílí výhru!' : 'Be the first to share a win!'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {winShares.map((win) => (
                <div key={win.id} className="rounded-xl overflow-hidden border border-border bg-muted/30 group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img 
                      src={win.image} 
                      alt="Win" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Sport tag */}
                    {win.sport && (
                      <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                        {win.sport}
                      </span>
                    )}
                    {/* Profit overlay */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-success/90 backdrop-blur-sm">
                      <span className="text-sm font-bold text-success-foreground font-mono">
                        {formatProfit(win.profit)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs font-bold">{win.username[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{win.username}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{win.description}</p>
                    <button 
                      onClick={() => handleLikeWin(win.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-sm transition-all duration-200",
                        win.liked 
                          ? "text-pink-500" 
                          : "text-muted-foreground hover:text-pink-400"
                      )}
                    >
                      <Heart className={cn("h-4 w-4 transition-transform", win.liked && "fill-current scale-110")} />
                      <span className="font-mono">{win.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
