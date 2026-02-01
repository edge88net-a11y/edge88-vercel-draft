import { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Crown, Flame, Star, Users, MessageCircle, Heart, Medal,
  TrendingUp, Upload, Image as ImageIcon, Lock, Check, Sparkles, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { isAdminUser, getDisplayTier } from '@/lib/adminAccess';

// Types
interface LeaderboardUser {
  rank: number;
  username: string;
  avatar?: string;
  accuracy: number;
  picksFollowed: number;
  estimatedProfit: number;
  tier: 'free' | 'basic' | 'pro' | 'elite';
}

interface ActivityItem {
  id: string;
  type: 'win' | 'follow' | 'streak' | 'newMember' | 'achievement';
  username: string;
  message: string;
  amount?: number;
  timestamp: Date;
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
}

interface WinShare {
  id: string;
  username: string;
  avatar?: string;
  image: string;
  description: string;
  likes: number;
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
  
  const tiers: ('free' | 'basic' | 'pro' | 'elite')[] = ['free', 'basic', 'pro', 'elite'];
  
  return names.map((name, index) => ({
    rank: index + 1,
    username: name,
    accuracy: Math.round(85 - index * 1.2 + Math.random() * 5),
    picksFollowed: Math.round(120 - index * 4 + Math.random() * 20),
    estimatedProfit: Math.round((25000 - index * 1000 + Math.random() * 5000) / 100) * 100,
    tier: index < 3 ? 'elite' : index < 8 ? 'pro' : index < 15 ? 'basic' : 'free',
  }));
};

const generateActivities = (): ActivityItem[] => {
  const activities: ActivityItem[] = [
    { id: '1', type: 'win', username: 'Petr M.', message: 'vyhrál tip na Tampa Bay', amount: 1200, timestamp: new Date() },
    { id: '2', type: 'follow', username: 'Jana K.', message: 'sleduje 5 dnešních tipů', timestamp: new Date(Date.now() - 30000) },
    { id: '3', type: 'streak', username: 'Tomáš R.', message: 'má sérii 8 výher v řadě', timestamp: new Date(Date.now() - 60000) },
    { id: '4', type: 'newMember', username: 'David H.', message: 'se stal Elite členem', timestamp: new Date(Date.now() - 90000) },
    { id: '5', type: 'win', username: 'Martin S.', message: 'vyhrál tip na Boston Celtics', amount: 2400, timestamp: new Date(Date.now() - 120000) },
    { id: '6', type: 'achievement', username: 'Eva N.', message: 'získala odznak 🔥 Hot Streak', timestamp: new Date(Date.now() - 150000) },
    { id: '7', type: 'follow', username: 'Lukáš P.', message: 'sleduje NHL tip', timestamp: new Date(Date.now() - 180000) },
    { id: '8', type: 'win', username: 'Tereza V.', message: 'vyhrála parlay sázku', amount: 5600, timestamp: new Date(Date.now() - 210000) },
    { id: '9', type: 'streak', username: 'Jakub K.', message: 'má sérii 5 výher', timestamp: new Date(Date.now() - 240000) },
    { id: '10', type: 'newMember', username: 'Kristýna L.', message: 'se přidala k Edge88', timestamp: new Date(Date.now() - 270000) },
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
  },
];

const mockWinShares: WinShare[] = [
  {
    id: '1',
    username: 'Petr M.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    description: '+2,400 Kč na Boston Celtics! 🏀',
    likes: 24,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    username: 'Jana K.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    description: 'Parlay výhra +8,500 Kč! 🔥',
    likes: 47,
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    username: 'Tomáš R.',
    image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop',
    description: 'NHL triple +3,200 Kč 🏒',
    likes: 31,
    timestamp: new Date(Date.now() - 10800000),
  },
];

export default function Community() {
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const [leaderboard] = useState<LeaderboardUser[]>(generateLeaderboard);
  const [activities, setActivities] = useState<ActivityItem[]>(generateActivities);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Cycle activities every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const shuffled = [...prev];
        const first = shuffled.shift()!;
        first.timestamp = new Date();
        shuffled.push(first);
        return shuffled;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // User's rank (mock)
  const userRank = 147;

  const tierColors: Record<string, string> = {
    free: 'bg-muted/50 text-muted-foreground border-muted',
    basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    elite: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30',
    admin: 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-yellow-400/50 shadow-[0_0_10px_hsl(45,100%,50%,0.2)]',
  };

  // Check if current user is admin
  const isAdmin = isAdminUser(user?.email);
  const displayTier = getDisplayTier(user?.email, profile?.subscription_tier);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'win': return '✅';
      case 'follow': return '🎯';
      case 'streak': return '🔥';
      case 'newMember': return '⭐';
      case 'achievement': return '🏅';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
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
        {/* Leaderboard Section */}
        <div className="glass-card overflow-hidden">
          <div className="border-b border-border p-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              {t.topBettorsThisMonth}
            </h2>
          </div>
          
          {/* User's Rank Highlight */}
          {user && (
            <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
              <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                  {t.yourRank}
                </span>
                <span className="font-mono font-bold text-primary">#{userRank}</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">#</th>
                  <th className="p-3">{t.user}</th>
                  <th className="p-3 text-right">{t.accuracy}</th>
                  <th className="p-3 text-right hidden sm:table-cell">{t.picks}</th>
                  <th className="p-3 text-right hidden md:table-cell">{t.profit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard.slice(0, 10).map((user) => (
                  <tr key={user.rank} className={cn(
                    'hover:bg-muted/30 transition-colors',
                    user.rank <= 3 && 'bg-yellow-500/5'
                  )}>
                    <td className="p-3">
                      <span className={cn(
                        'font-bold',
                        user.rank <= 3 ? 'text-lg' : 'text-sm text-muted-foreground'
                      )}>
                        {getRankBadge(user.rank)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-primary/20 text-primary">
                            {user.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{user.username}</span>
                        <span className={cn(
                          'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border',
                          tierColors[user.tier]
                        )}>
                          {user.tier}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span className={cn(
                        'font-mono font-bold',
                        user.accuracy >= 75 ? 'text-success' : user.accuracy >= 65 ? 'text-warning' : 'text-foreground'
                      )}>
                        {user.accuracy}%
                      </span>
                    </td>
                    <td className="p-3 text-right hidden sm:table-cell font-mono text-sm">
                      {user.picksFollowed}
                    </td>
                    <td className="p-3 text-right hidden md:table-cell">
                      <span className="font-mono font-bold text-success">
                        +{user.estimatedProfit.toLocaleString()} {language === 'cz' ? 'Kč' : '$'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 text-center border-t border-border">
            <Button variant="ghost" size="sm" className="text-primary">
              {t.fullLeaderboard}
            </Button>
          </div>
        </div>

        {/* Live Feed Section */}
        <div className="glass-card overflow-hidden">
          <div className="border-b border-border p-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              {t.liveFeed}
            </h2>
          </div>
          
          <div className="h-[400px] overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
            
            <div className="p-4 space-y-3 animate-feed">
              {activities.map((activity, index) => (
                <div 
                  key={`${activity.id}-${index}`}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg bg-muted/30 transition-all duration-500',
                    index === 0 && 'animate-fade-in bg-primary/10 border border-primary/20'
                  )}
                >
                  <span className="text-xl">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.username}</span>
                      {' '}{activity.message}
                      {activity.amount && (
                        <span className="text-success font-mono font-bold ml-1">
                          (+{activity.amount.toLocaleString()} {language === 'cz' ? 'Kč' : '$'})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'cz' ? 'Právě teď' : 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Discussion Section */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            {language === 'cz' ? 'Diskuze' : 'Discussion'}
          </h2>
        </div>
        
        {/* Pinned Post */}
        <div className="p-4 bg-primary/5 border-b border-primary/20">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              E8
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">Edge88 Team</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  PINNED
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'cz' 
                  ? 'Vítejte! Sdílejte své výhry a spojte se s ostatními členy Edge88. 🎉'
                  : 'Welcome! Share your wins and connect with other Edge88 members. 🎉'}
              </p>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea 
                placeholder={language === 'cz' ? 'Sdílejte svůj názor...' : 'Share your thoughts...'}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button size="sm">
                  {language === 'cz' ? 'Odeslat' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Comments */}
        <div className="divide-y divide-border">
          {[
            { user: 'Martin S.', tier: 'pro', comment: language === 'cz' ? 'Dneska skvělé tipy! 🔥' : 'Great picks today! 🔥', votes: 12 },
            { user: 'Eva N.', tier: 'elite', comment: language === 'cz' ? 'NHL série pokračuje 💪' : 'NHL streak continues 💪', votes: 8 },
            { user: 'Lukáš P.', tier: 'basic', comment: language === 'cz' ? 'Díky za Boston tip!' : 'Thanks for the Boston pick!', votes: 5 },
          ].map((comment, idx) => (
            <div key={idx} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-muted">{comment.user[0]}</AvatarFallback>
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
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.comment}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-success transition-colors">
                      <TrendingUp className="h-3 w-3" />
                      {comment.votes}
                    </button>
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

      {/* Badges Section */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4">
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
        
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {allBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={cn(
                  'group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105',
                  badge.earned 
                    ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 hover:border-yellow-500/50'
                    : 'bg-muted/30 border-muted hover:border-muted-foreground/30'
                )}
              >
                <span className={cn(
                  'text-4xl transition-all',
                  !badge.earned && 'grayscale opacity-40'
                )}>
                  {badge.icon}
                </span>
                <span className={cn(
                  'text-xs font-medium text-center',
                  badge.earned ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {language === 'cz' ? badge.nameCz : badge.name}
                </span>
                {!badge.earned && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
                {badge.earned && (
                  <Check className="h-3 w-3 text-success" />
                )}
              </button>
            ))}
          </div>

          {/* Selected Badge Details */}
          {selectedBadge && (
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{selectedBadge.icon}</span>
                <div>
                  <h4 className="font-bold">
                    {language === 'cz' ? selectedBadge.nameCz : selectedBadge.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'cz' ? selectedBadge.descriptionCz : selectedBadge.description}
                  </p>
                </div>
              </div>
              {!selectedBadge.earned && (
                <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm">
                    <span className="font-semibold text-primary">
                      {language === 'cz' ? 'Jak získat:' : 'How to earn:'}
                    </span>
                    {' '}
                    {language === 'cz' ? selectedBadge.howToEarnCz : selectedBadge.howToEarn}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Your Wins Section */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" />
            {language === 'cz' ? 'Sdílejte své výhry' : 'Share Your Wins'}
          </h2>
        </div>

        {/* Upload Area */}
        <div className="p-4 border-b border-border">
          <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium mb-1">
              {language === 'cz' ? 'Nahrát výherní tiket' : 'Upload winning slip'}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'cz' ? 'nebo přetáhněte soubor sem' : 'or drag and drop here'}
            </p>
          </div>
        </div>

        {/* Wins Gallery */}
        <div className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockWinShares.map((win) => (
              <div key={win.id} className="rounded-xl overflow-hidden border border-border bg-muted/30 group">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src={win.image} 
                    alt="Win" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{win.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{win.username}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{win.description}</p>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-pink-400 transition-colors">
                    <Heart className="h-4 w-4" />
                    {win.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
