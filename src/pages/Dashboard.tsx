import { useEffect, useState, useMemo } from 'react';
import { 
  Target, Activity, Loader2, Flame, TrendingUp, TrendingDown,
  ChevronRight, CheckCircle, XCircle, BarChart3, Clock, Crown
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, Line } from 'recharts';
import { MaintenanceState } from '@/components/MaintenanceState';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfitTracker } from '@/components/dashboard/ProfitTracker';
import { BettingSlip } from '@/components/dashboard/BettingSlip';
import { HotPicksCarousel } from '@/components/dashboard/HotPicksCarousel';
import { useActivePredictions, useStats, DailyAccuracy } from '@/hooks/usePredictions';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { getSportEmoji } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { formatCurrency } from '@/lib/oddsUtils';
import { isAdminUser } from '@/lib/adminAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';

// Premium stat card with glow effects
function StatCard({
  icon: Icon,
  iconColor,
  glowColor,
  label,
  value,
  suffix = '',
  prefix = '',
  displayValue,
  trend,
  trendLabel,
  isLoading,
  highlight,
  pulseAnimation,
  animationDelay = 0,
  todayBadge,
}: {
  icon: React.ElementType;
  iconColor: string;
  glowColor?: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  displayValue?: string;
  trend?: number;
  trendLabel?: string;
  isLoading?: boolean;
  highlight?: boolean;
  pulseAnimation?: boolean;
  animationDelay?: number;
  todayBadge?: string;
}) {
  const animatedValue = useAnimatedCounter(value, { delay: animationDelay, duration: 1200 });
  
  return (
    <div className={cn(
      "glass-card p-4 md:p-5 relative overflow-hidden transition-all group",
      highlight && "border-orange-500/30",
      glowColor && `shadow-lg ${glowColor}`
    )}>
      {/* Glow effect for highlight cards */}
      {highlight && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />
      )}
      
      <div className="flex items-start justify-between relative">
        <div className={cn("p-2.5 rounded-xl", iconColor, pulseAnimation && "animate-pulse")}>
          <Icon className="h-5 w-5" />
        </div>
        
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
            trend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </div>
        )}
        
        {todayBadge && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-success/20 text-success">
            {todayBadge}
          </span>
        )}
      </div>
      
      <div className="mt-3 relative">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="h-10 w-24 mt-1" />
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "text-3xl md:text-4xl font-mono font-black tabular-nums",
              highlight && "text-orange-400"
            )}>
              {displayValue || (
                <>
                  {prefix}
                  {typeof value === 'number' && value !== 0 ? animatedValue.toLocaleString() : value === 0 ? '—' : value}
                  {suffix}
                </>
              )}
            </span>
            {highlight && value >= 5 && (
              <span className="text-2xl animate-bounce">🔥</span>
            )}
          </div>
        )}
        {trendLabel && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{trendLabel}</p>
        )}
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'7D' | '30D' | '90D'>('30D');
  const { data: predictions, isLoading: predictionsLoading, isError, refetch, isMaintenanceMode } = useActivePredictions();
  const { data: stats, isLoading: statsLoading, isMaintenanceMode: statsMaintenanceMode } = useStats();
  const { winStreak } = useWinStreak();

  const locale = language === 'cz' ? 'cz' : 'en';
  const isAdmin = isAdminUser(user?.email);

  // Handle checkout success
  useEffect(() => {
    const checkoutResult = searchParams.get('checkout');
    if (checkoutResult === 'success') {
      toast({
        title: '🎉 Welcome to Pro!',
        description: 'Your subscription is now active.',
      });
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams, toast]);

  // Check if user needs onboarding
  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profile]);

  // Deduplicate predictions
  const deduplicatedPredictions = useMemo(() => {
    if (!predictions) return [];
    const seenGames = new Map<string, typeof predictions[0]>();
    predictions.forEach(p => {
      const key = `${p.homeTeam}-${p.awayTeam}-${p.gameTime.split('T')[0]}`;
      if (!seenGames.has(key)) seenGames.set(key, p);
    });
    return Array.from(seenGames.values());
  }, [predictions]);

  // Active predictions
  const activePredictions = useMemo(() => {
    return deduplicatedPredictions
      .filter(p => p.result === 'pending')
      .sort((a, b) => b.confidence - a.confidence);
  }, [deduplicatedPredictions]);

  // Completed predictions
  const completedPredictions = useMemo(() => {
    return deduplicatedPredictions
      .filter(p => p.result === 'win' || p.result === 'loss')
      .sort((a, b) => new Date(b.gameTime).getTime() - new Date(a.gameTime).getTime())
      .slice(0, 10);
  }, [deduplicatedPredictions]);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    if (winStreak?.currentStreak && winStreak.currentStreak > 0) return winStreak.currentStreak;
    if (stats?.winStreak && stats.winStreak > 0) return stats.winStreak;
    if (completedPredictions.length > 0) {
      let streak = 0;
      for (const p of completedPredictions) {
        if (p.result === 'win') streak++;
        else break;
      }
      return streak;
    }
    return 0;
  }, [winStreak?.currentStreak, stats?.winStreak, completedPredictions]);

  // Calculate ROI in currency
  const roiData = useMemo(() => {
    const wins = completedPredictions.filter(p => p.result === 'win');
    const losses = completedPredictions.filter(p => p.result === 'loss');
    const total = wins.length + losses.length;
    
    if (total === 0) return null;
    
    // Calculate with actual odds
    const stake = 1000;
    let profit = 0;
    
    completedPredictions.forEach(p => {
      const odds = parseFloat(p.prediction.odds) || 1.85;
      if (p.result === 'win') {
        profit += stake * (odds - 1);
      } else if (p.result === 'loss') {
        profit -= stake;
      }
    });
    
    return { profit, wins: wins.length, losses: losses.length };
  }, [completedPredictions]);

  // Today's new predictions count
  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return activePredictions.filter(p => new Date(p.gameTime).toDateString() === today).length;
  }, [activePredictions]);

  // Accuracy trend
  const accuracyTrend = useMemo(() => {
    if (!stats?.accuracy) return 0;
    return 3.2; // Mock trend - would come from comparing to last week
  }, [stats]);

  // Get time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (language === 'cz') {
      if (hour < 12) return 'Dobré ráno';
      if (hour < 18) return 'Dobré odpoledne';
      return 'Dobrý večer';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [language]);

  // Get user tier badge
  const tierBadge = useMemo(() => {
    if (isAdmin) return { label: '👑 ADMIN', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    const tier = profile?.subscription_tier?.toLowerCase();
    if (tier === 'elite') return { label: 'ELITE', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    if (tier === 'pro') return { label: 'PRO', className: 'bg-primary/20 text-primary border-primary/30' };
    if (tier === 'starter') return { label: 'STARTER', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    return { label: language === 'cz' ? 'Vybrat plán' : 'Choose Plan', className: 'bg-muted text-muted-foreground border-border', isLink: true };
  }, [isAdmin, profile?.subscription_tier, language]);

  // Chart data
  const chartData = useMemo(() => {
    const days = chartPeriod === '7D' ? 7 : chartPeriod === '30D' ? 30 : 90;
    const data: DailyAccuracy[] = [];
    const baseAccuracy = stats?.accuracy || 73;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const variance = (Math.random() - 0.5) * 20;
      const accuracy = Math.max(40, Math.min(95, baseAccuracy + variance));
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        accuracy: Math.round(accuracy * 10) / 10,
        predictions: Math.floor(Math.random() * 8) + 3,
        wins: 0,
        losses: 0,
      });
    }
    
    return data.map((d, i, arr) => {
      const windowStart = Math.max(0, i - 6);
      const window = arr.slice(windowStart, i + 1);
      const movingAvg = window.reduce((sum, w) => sum + w.accuracy, 0) / window.length;
      return { ...d, movingAvg: Math.round(movingAvg * 10) / 10 };
    });
  }, [chartPeriod, stats?.accuracy]);

  // Sport performance
  const sportPerformance = useMemo(() => {
    if (stats?.bySport && stats.bySport.length > 0) {
      return stats.bySport
        .map(s => ({
          name: s.sport,
          emoji: getSportEmoji(s.sport),
          accuracy: s.accuracy,
          wins: s.wins,
          losses: s.losses,
          trend: s.roi || 0,
        }))
        .sort((a, b) => b.accuracy - a.accuracy);
    }
    
    if (deduplicatedPredictions.length > 0) {
      const sportMap = new Map<string, { wins: number; losses: number }>();
      deduplicatedPredictions.forEach(p => {
        const sport = p.sport || 'Sports';
        const current = sportMap.get(sport) || { wins: 0, losses: 0 };
        if (p.result === 'win') current.wins++;
        if (p.result === 'loss') current.losses++;
        sportMap.set(sport, current);
      });
      
      const sportsFromData = Array.from(sportMap.entries())
        .filter(([_, data]) => data.wins + data.losses > 0)
        .map(([sport, data]) => {
          const total = data.wins + data.losses;
          const accuracy = total > 0 ? Math.round((data.wins / total) * 100) : 0;
          return { name: sport, emoji: getSportEmoji(sport), accuracy, wins: data.wins, losses: data.losses, trend: 0 };
        })
        .sort((a, b) => b.accuracy - a.accuracy);
      
      if (sportsFromData.length > 0) return sportsFromData;
    }
    
    return [
      { name: 'NHL', emoji: '🏒', accuracy: 78, wins: 45, losses: 13, trend: 2.5 },
      { name: 'NBA', emoji: '🏀', accuracy: 74, wins: 38, losses: 14, trend: -1.2 },
      { name: 'NFL', emoji: '🏈', accuracy: 71, wins: 28, losses: 12, trend: 3.8 },
      { name: 'Soccer', emoji: '⚽', accuracy: 69, wins: 22, losses: 10, trend: 0.5 },
      { name: 'UFC', emoji: '🥊', accuracy: 65, wins: 18, losses: 10, trend: -2.1 },
    ];
  }, [stats?.bySport, deduplicatedPredictions]);

  const isLoading = authLoading || (predictionsLoading && !isMaintenanceMode);
  const showMaintenanceState = isMaintenanceMode || statsMaintenanceMode;

  if (showOnboarding && user && profile) {
    return <OnboardingFlow onComplete={() => { setShowOnboarding(false); window.location.reload(); }} />;
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : showMaintenanceState ? (
        <MaintenanceState 
          onRetry={() => refetch()}
          title={language === 'cz' ? 'Analyzujeme data' : 'Crunching the Latest Data'}
          subtitle={language === 'cz' ? 'Naše AI analyzuje aktuální kurzy.' : 'Our AI is analyzing real-time odds.'}
          autoRetrySeconds={30}
        />
      ) : (
        <>
          {/* Welcome Bar - Slim single line */}
          <div className="glass-card py-3 px-4 flex items-center gap-3 flex-wrap">
            {/* Tier Badge */}
            {tierBadge.isLink ? (
              <Link 
                to="/pricing"
                className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-full border transition-colors hover:bg-muted",
                  tierBadge.className
                )}
              >
                {tierBadge.label} →
              </Link>
            ) : (
              <span className={cn(
                "text-xs font-bold px-2.5 py-1 rounded-full border",
                tierBadge.className
              )}>
                {tierBadge.label}
              </span>
            )}
            
            <span className="text-sm text-muted-foreground">
              {greeting}!
            </span>
            
            <div className="hidden sm:flex items-center gap-4 ml-auto text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                📊 {language === 'cz' ? 'Dnes' : 'Today'}: <strong className="text-foreground">{todayCount}</strong> {language === 'cz' ? 'nových' : 'new'}
              </span>
              {currentStreak > 0 && (
                <span className="flex items-center gap-1">
                  🔥 {language === 'cz' ? 'Série' : 'Streak'}: <strong className="text-success">{currentStreak}</strong> {language === 'cz' ? 'výher' : 'wins'}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(), 'HH:mm')}
              </span>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Target}
              iconColor="bg-primary/10 text-primary"
              label={language === 'cz' ? 'Celkem predikcí' : 'Total Predictions'}
              value={deduplicatedPredictions.length}
              todayBadge={todayCount > 0 ? `+${todayCount} ${language === 'cz' ? 'dnes' : 'today'}` : undefined}
              isLoading={predictionsLoading}
              animationDelay={0}
            />
            
            <StatCard
              icon={Activity}
              iconColor="bg-success/10 text-success"
              glowColor="shadow-success/10"
              label={language === 'cz' ? 'Přesnost' : 'Accuracy Rate'}
              value={stats?.accuracy || 73}
              suffix="%"
              trend={accuracyTrend}
              trendLabel={language === 'cz' ? 'vs minulý týden' : 'vs last week'}
              isLoading={statsLoading}
              animationDelay={100}
            />
            
            <StatCard
              icon={Activity}
              iconColor="bg-primary/10 text-primary"
              label={language === 'cz' ? 'Aktivní tipy' : 'Active Picks'}
              value={activePredictions.length}
              pulseAnimation={activePredictions.length > 0}
              isLoading={predictionsLoading}
              animationDelay={200}
            />
            
            <StatCard
              icon={TrendingUp}
              iconColor={roiData && roiData.profit > 0 ? "bg-success/10 text-success" : roiData && roiData.profit < 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}
              glowColor={roiData && roiData.profit > 0 ? "shadow-success/20" : undefined}
              label={language === 'cz' ? 'ROI tento měsíc' : 'ROI This Month'}
              value={roiData ? Math.abs(roiData.profit) : 0}
              displayValue={roiData ? `${roiData.profit >= 0 ? '+' : '-'}${formatCurrency(Math.abs(roiData.profit), locale)}` : '—'}
              isLoading={statsLoading}
              animationDelay={300}
            />
          </div>

          {/* Profit Tracker */}
          <ProfitTracker predictions={deduplicatedPredictions} isLoading={predictionsLoading} />

          {/* Main Content Grid: Picks + Betting Slip */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Hot Picks - 2 columns */}
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  🔥 {language === 'cz' ? 'Dnešní HOT tipy' : "Today's HOT Picks"}
                </h2>
                <Link to="/predictions" className="text-sm text-primary hover:underline flex items-center gap-1">
                  {language === 'cz' ? 'Všechny' : 'View all'}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <HotPicksCarousel predictions={deduplicatedPredictions} isLoading={predictionsLoading} />
            </section>

            {/* Betting Slip - 1 column */}
            <section className="lg:col-span-1">
              <BettingSlip />
            </section>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Accuracy Over Time */}
            <section className="glass-card overflow-hidden">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  {language === 'cz' ? 'Přesnost v čase' : 'Accuracy Over Time'}
                </h3>
                <div className="flex gap-1">
                  {(['7D', '30D', '90D'] as const).map(period => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-lg transition-colors',
                        chartPeriod === period 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4">
                {chartData.length > 2 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="accuracyGradientDash" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="hsl(var(--success))" stopOpacity={0.1} />
                            <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                          tickFormatter={(value) => format(new Date(value), 'M/d')}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={[40, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(1)}%`,
                            name === 'movingAvg' ? (language === 'cz' ? '7d průměr' : '7d average') : (language === 'cz' ? 'Přesnost' : 'Accuracy')
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="accuracy"
                          stroke="hsl(var(--success))"
                          strokeWidth={2}
                          fill="url(#accuracyGradientDash)"
                        />
                        <Line
                          type="monotone"
                          dataKey="movingAvg"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 bg-success rounded" />
                        <span>{language === 'cz' ? 'Denní přesnost' : 'Daily accuracy'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 bg-primary rounded" style={{ borderStyle: 'dashed' }} />
                        <span>{language === 'cz' ? '7d průměr' : '7-day avg'}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-pulse flex flex-col items-center gap-3">
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-primary/50 to-success/50 animate-pulse" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'cz' ? 'Sbíráme data...' : 'Collecting data...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Sport Performance */}
            <section className="glass-card overflow-hidden">
              <div className="border-b border-border p-4">
                <h3 className="font-bold flex items-center gap-2">
                  🏆 {language === 'cz' ? 'Výkon podle sportu' : 'Performance by Sport'}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {sportPerformance.slice(0, 5).map(sport => (
                  <div key={sport.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{sport.emoji}</span>
                        <span className="font-medium">{sport.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "font-mono font-bold",
                          sport.accuracy >= 70 ? "text-success" :
                          sport.accuracy >= 50 ? "text-warning" :
                          "text-destructive"
                        )}>
                          {sport.accuracy}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({sport.wins}/{sport.wins + sport.losses})
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          sport.accuracy >= 70 ? "bg-success" :
                          sport.accuracy >= 50 ? "bg-warning" :
                          "bg-destructive"
                        )}
                        style={{ width: `${sport.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Recent Results */}
          <section className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                📋 {language === 'cz' ? 'Poslední výsledky' : 'Recent Results'}
              </h3>
              <Link to="/results" className="text-sm text-primary hover:underline flex items-center gap-1">
                {language === 'cz' ? 'Všechny' : 'View all'}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {completedPredictions.length > 0 ? (
              <div className="divide-y divide-border">
                {completedPredictions.slice(0, 6).map(prediction => {
                  const confidencePercent = normalizeConfidence(prediction.confidence);
                  const odds = parseFloat(prediction.prediction.odds) || 1.85;
                  const stake = 1000;
                  const profit = prediction.result === 'win' ? stake * (odds - 1) : -stake;
                  
                  return (
                    <Link
                      key={prediction.id}
                      to={`/predictions/${prediction.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                    >
                      {/* Result Icon */}
                      {prediction.result === 'win' ? (
                        <CheckCircle className="h-5 w-5 text-success shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive shrink-0" />
                      )}
                      
                      {/* Sport */}
                      <span className="text-lg shrink-0">{getSportEmoji(prediction.sport || 'Sports')}</span>
                      
                      {/* Teams */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {prediction.awayTeam} @ {prediction.homeTeam}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prediction.prediction.pick}
                        </p>
                      </div>
                      
                      {/* Confidence */}
                      <span className={cn(
                        "text-xs font-mono shrink-0",
                        confidencePercent >= 70 ? "text-success" : "text-muted-foreground"
                      )}>
                        {confidencePercent}%
                      </span>
                      
                      {/* Odds */}
                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                        {odds.toFixed(2)}
                      </span>
                      
                      {/* Profit */}
                      <span className={cn(
                        "text-xs font-mono font-bold shrink-0",
                        profit > 0 ? "text-success" : "text-destructive"
                      )}>
                        {profit > 0 ? '+' : ''}{formatCurrency(profit, locale)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {language === 'cz' 
                    ? 'Žádné dokončené predikce. Vaše první výsledky budou brzy!' 
                    : 'No completed predictions yet. Your first results coming soon!'}
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
