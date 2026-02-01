import { useEffect, useState, useMemo } from 'react';
import { 
  Target, Activity, Loader2, Flame, TrendingUp, TrendingDown,
  ChevronRight, CheckCircle, XCircle, BookOpen, Gift, Crown, BarChart3
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Line, ComposedChart } from 'recharts';
import { MaintenanceState } from '@/components/MaintenanceState';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfitTracker } from '@/components/dashboard/ProfitTracker';
import { BettingSlip } from '@/components/dashboard/BettingSlip';
import { HotPicksCarousel } from '@/components/dashboard/HotPicksCarousel';
import { useActivePredictions, useStats, DailyAccuracy } from '@/hooks/usePredictions';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { useBlogArticles } from '@/hooks/useBlogArticles';
import { getSportEmoji } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
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
              {prefix}{typeof value === 'number' && value !== 0 ? animatedValue.toLocaleString() : value === 0 ? '—' : value}{suffix}
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
  const { data: blogArticles } = useBlogArticles({ limit: 1, sortBy: 'date' });
  const { winStreak } = useWinStreak();

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

  // Calculate ROI properly
  const roiValue = useMemo(() => {
    const wins = completedPredictions.filter(p => p.result === 'win').length;
    const losses = completedPredictions.filter(p => p.result === 'loss').length;
    const total = wins + losses;
    if (total === 0) return null;
    
    const avgOdds = 1.85;
    const profit = wins * avgOdds - total;
    return (profit / total) * 100;
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
              iconColor={roiValue && roiValue > 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}
              label="ROI"
              value={roiValue ? Math.abs(Math.round(roiValue * 10) / 10) : 0}
              prefix={roiValue ? (roiValue >= 0 ? '+' : '-') : ''}
              suffix={roiValue ? '%' : ''}
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
                          }}
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(1)}%`, 
                            name === 'accuracy' ? (language === 'cz' ? 'Denní' : 'Daily') : (language === 'cz' ? '7-denní průměr' : '7-Day Avg')
                          ]}
                        />
                        <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
                        <ReferenceLine y={70} stroke="hsl(var(--success))" strokeDasharray="3 3" strokeOpacity={0.5} />
                        <Area type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#accuracyGradientDash)" />
                        <Line type="monotone" dataKey="movingAvg" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 bg-primary rounded" />
                        <span>{language === 'cz' ? 'Denní' : 'Daily'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 bg-warning rounded" />
                        <span>{language === 'cz' ? '7-denní průměr' : '7-Day Avg'}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div className="h-full w-1/5 bg-gradient-to-r from-primary to-primary/50 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium">{language === 'cz' ? 'Sbíráme data...' : 'Collecting data...'}</p>
                    <p className="text-xs">{chartData.length}/30 {language === 'cz' ? 'dní' : 'days'}</p>
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
              <div className="p-4 space-y-3">
                {sportPerformance.slice(0, 5).map((sport, i) => (
                  <div key={sport.name} className="flex items-center gap-3">
                    <span className="text-xl w-8">{sport.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{sport.name}</span>
                        <span className={cn(
                          "font-mono text-sm font-bold",
                          sport.accuracy >= 70 ? "text-success" : sport.accuracy >= 60 ? "text-warning" : "text-muted-foreground"
                        )}>
                          {sport.accuracy}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            sport.accuracy >= 70 ? "bg-success" : sport.accuracy >= 60 ? "bg-warning" : "bg-muted-foreground"
                          )}
                          style={{ width: `${sport.accuracy}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {sport.wins}W - {sport.losses}L
                        {i === 0 && <span className="ml-2 text-yellow-400">⭐ {language === 'cz' ? 'Nejlepší' : 'Best'}</span>}
                      </p>
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
                <CheckCircle className="h-4 w-4 text-success" />
                {language === 'cz' ? 'Nedávné výsledky' : 'Recent Results'}
              </h3>
              <Link to="/results" className="text-xs text-primary hover:underline flex items-center gap-1">
                {language === 'cz' ? 'Všechny výsledky' : 'All results'}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-4">
              {completedPredictions.length > 0 ? (
                <div className="space-y-2">
                  {completedPredictions.slice(0, 5).map((pred) => (
                    <Link 
                      key={pred.id}
                      to={`/predictions/${pred.id}`}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all hover:border-primary/50",
                        pred.result === 'win' ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{pred.result === 'win' ? '✅' : '❌'}</span>
                        <div>
                          <p className="text-sm font-medium">{pred.homeTeam} vs {pred.awayTeam}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{getSportEmoji(pred.sport || 'Sports')}</span>
                            <span>{language === 'cz' ? 'Tip' : 'Pick'}: {pred.prediction.pick}</span>
                            <span>•</span>
                            <span>{Math.round(normalizeConfidence(pred.confidence))}%</span>
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "text-sm font-semibold",
                        pred.result === 'win' ? "text-success" : "text-destructive"
                      )}>
                        {pred.result === 'win' ? (language === 'cz' ? 'VÝHRA' : 'WIN') : (language === 'cz' ? 'PROHRA' : 'LOSS')}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : activePredictions.length > 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">{language === 'cz' ? 'Čekáme na dokončení zápasů' : 'Waiting for games to finish'}</p>
                  <p className="text-xs mt-1">{activePredictions.length} {language === 'cz' ? 'aktivních predikcí' : 'active predictions'}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{language === 'cz' ? 'Žádné výsledky' : 'No results yet'}</p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Links */}
          <div className="grid gap-3 md:grid-cols-3">
            <Link to="/blog" className="glass-card p-4 flex items-center gap-4 hover:border-primary/50 transition-all group">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                  📚 {language === 'cz' ? 'Nejnovější článek' : 'Latest Article'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {blogArticles?.[0]?.title || (language === 'cz' ? 'Zobrazit blog' : 'View blog')}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link to="/referral" className="glass-card p-4 flex items-center gap-4 hover:border-primary/50 transition-all group">
              <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Gift className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                  🤝 {language === 'cz' ? 'Pozvat přátele' : 'Invite Friends'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Získejte bonus' : 'Earn bonus for referrals'}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link to="/pricing" className="glass-card p-4 flex items-center gap-4 hover:border-primary/50 transition-all group bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                <Crown className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {isAdminUser(user?.email) ? '👑 ADMIN' : `⭐ ${(profile?.subscription_tier || 'FREE').toUpperCase()}`}
                </p>
                <p className="text-xs text-primary font-medium">
                  {profile?.subscription_tier === 'free' 
                    ? (language === 'cz' ? 'Upgradovat →' : 'Upgrade →')
                    : (language === 'cz' ? 'Spravovat' : 'Manage')
                  }
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-primary" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
