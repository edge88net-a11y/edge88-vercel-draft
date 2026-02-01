import { useEffect, useState, useMemo } from 'react';
import { 
  Target, Activity, Loader2, Zap, Flame, TrendingUp, TrendingDown,
  Calendar, BookOpen, Users, Star, ChevronRight, Eye, CheckCircle, XCircle,
  Bell, MessageCircle, Gift, Crown, BarChart3
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Line, ComposedChart, Bar, BarChart, Cell } from 'recharts';
import { MaintenanceState } from '@/components/MaintenanceState';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useActivePredictions, useStats, DailyAccuracy } from '@/hooks/usePredictions';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { useBlogArticles } from '@/hooks/useBlogArticles';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes, subDays } from 'date-fns';

// Animated stat card component
function AnimatedStatCard({
  icon: Icon,
  iconColor,
  label,
  value,
  suffix = '',
  prefix = '',
  trend,
  trendLabel,
  link,
  linkText,
  isLoading,
  highlight,
  animationDelay = 0,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: number;
  trendLabel?: string;
  link?: string;
  linkText?: string;
  isLoading?: boolean;
  highlight?: boolean;
  animationDelay?: number;
}) {
  const animatedValue = useAnimatedCounter(value, { delay: animationDelay, duration: 1200 });
  const { language } = useLanguage();
  
  return (
    <div className={cn(
      "glass-card p-4 md:p-5 relative overflow-hidden transition-all",
      highlight && "border-orange-500/30 shadow-lg shadow-orange-500/10"
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-xl", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        {link && linkText && (
          <Link to={link} className="text-xs text-primary hover:underline flex items-center gap-1">
            {linkText}
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
            trend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="h-10 w-24 mt-1" />
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "text-3xl md:text-4xl font-mono font-black tabular-nums",
              highlight && "text-orange-400"
            )}>
              {prefix}{animatedValue.toLocaleString()}{suffix}
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
      {highlight && value >= 5 && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />
      )}
    </div>
  );
}

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'7D' | '30D' | '90D'>('30D');
  const { data: predictions, isLoading: predictionsLoading, isError, refetch, isMaintenanceMode } = useActivePredictions();
  const { data: stats, isLoading: statsLoading, isMaintenanceMode: statsMaintenanceMode } = useStats();
  const { stats: savedStats, savedPicks } = useSavedPicks();
  const { data: blogArticles } = useBlogArticles({ limit: 1, sortBy: 'date' });
  const { winStreak } = useWinStreak();

  // Handle checkout success from URL
  useEffect(() => {
    const checkoutResult = searchParams.get('checkout');
    if (checkoutResult === 'success') {
      toast({
        title: '🎉 Welcome to Pro!',
        description: 'Your subscription is now active. Enjoy unlimited predictions!',
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
      if (!seenGames.has(key)) {
        seenGames.set(key, p);
      }
    });
    return Array.from(seenGames.values());
  }, [predictions]);

  // Top picks for today, sorted by confidence
  const topPicks = useMemo(() => {
    return deduplicatedPredictions
      .filter(p => p.result === 'pending')
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }, [deduplicatedPredictions]);

  // Calculate estimated monthly profit (simplified calculation)
  const estimatedProfit = useMemo(() => {
    const avgBet = 1000; // 1000 CZK per bet
    const avgOdds = 1.85;
    const accuracy = (stats?.accuracy || 73) / 100;
    const betsPerMonth = stats?.totalPredictions || 30;
    const profit = avgBet * betsPerMonth * (accuracy * avgOdds - 1);
    return Math.round(profit);
  }, [stats]);

  // Mock activity feed (in production this would come from API)
  const activityFeed = useMemo(() => {
    const activities: { type: 'win' | 'loss' | 'follow' | 'new'; message: string; messageCz: string; time: Date; amount?: string }[] = [];
    
    // Add wins/losses from saved picks
    savedPicks?.filter(p => p.prediction.result === 'win').slice(0, 2).forEach(pick => {
      activities.push({
        type: 'win',
        message: `Your pick won! ${pick.prediction.homeTeam} beat ${pick.prediction.awayTeam}`,
        messageCz: `Váš tip vyhrál! ${pick.prediction.homeTeam} porazil ${pick.prediction.awayTeam}`,
        time: new Date(pick.prediction.gameTime),
        amount: '+1,200 Kč',
      });
    });

    savedPicks?.filter(p => p.prediction.result === 'loss').slice(0, 1).forEach(pick => {
      activities.push({
        type: 'loss',
        message: `Loss: ${pick.prediction.homeTeam} lost to ${pick.prediction.awayTeam}`,
        messageCz: `Prohra: ${pick.prediction.homeTeam} prohrál proti ${pick.prediction.awayTeam}`,
        time: new Date(pick.prediction.gameTime),
      });
    });

    // Add recent follows
    savedPicks?.filter(p => p.prediction.result === 'pending').slice(0, 2).forEach(pick => {
      activities.push({
        type: 'follow',
        message: `Following ${pick.prediction.homeTeam} vs ${pick.prediction.awayTeam}`,
        messageCz: `Sledujete ${pick.prediction.homeTeam} vs ${pick.prediction.awayTeam}`,
        time: new Date(pick.savedAt),
      });
    });

    // Add new predictions notification
    if (topPicks.length > 0) {
      activities.push({
        type: 'new',
        message: `${topPicks.length} new predictions available for tonight`,
        messageCz: `${topPicks.length} nových predikcí pro dnešní večer`,
        time: new Date(),
      });
    }

    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
  }, [savedPicks, topPicks]);

  // Generate mock daily accuracy data for chart
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
    
    // Calculate 7-day moving average
    return data.map((d, i, arr) => {
      const windowStart = Math.max(0, i - 6);
      const window = arr.slice(windowStart, i + 1);
      const movingAvg = window.reduce((sum, w) => sum + w.accuracy, 0) / window.length;
      return { ...d, movingAvg: Math.round(movingAvg * 10) / 10 };
    });
  }, [chartPeriod, stats?.accuracy]);

  // Sport performance data
  const sportPerformance = useMemo(() => {
    const sports = [
      { name: 'NHL', emoji: '🏒', accuracy: 78, wins: 45, losses: 13, trend: 2.5 },
      { name: 'NBA', emoji: '🏀', accuracy: 74, wins: 38, losses: 14, trend: -1.2 },
      { name: 'NFL', emoji: '🏈', accuracy: 71, wins: 28, losses: 12, trend: 3.8 },
      { name: 'Soccer', emoji: '⚽', accuracy: 69, wins: 22, losses: 10, trend: 0.5 },
      { name: 'UFC', emoji: '🥊', accuracy: 65, wins: 18, losses: 10, trend: -2.1 },
    ].sort((a, b) => b.accuracy - a.accuracy);
    
    return sports;
  }, []);

  const isLoading = authLoading || (predictionsLoading && !isMaintenanceMode);
  const showMaintenanceState = isMaintenanceMode || statsMaintenanceMode;

  // Win rate trend (mock - compare to last week)
  const winRateTrend = 3.2; // +3.2% vs last week
  const currentStreak = winStreak?.currentStreak || stats?.winStreak || 0;

  // Show onboarding flow if needed
  if (showOnboarding && user && profile) {
    return (
      <OnboardingFlow 
        onComplete={() => {
          setShowOnboarding(false);
          window.location.reload();
        }} 
      />
    );
  }

  // Helper to format countdown
  const formatCountdown = (gameTime: string) => {
    const game = new Date(gameTime);
    const now = new Date();
    const hoursUntil = differenceInHours(game, now);
    const minutesUntil = differenceInMinutes(game, now) % 60;
    
    if (hoursUntil < 0) return language === 'cz' ? 'Probíhá' : 'Live';
    if (hoursUntil === 0) return `${minutesUntil}m`;
    if (hoursUntil < 24) return `${hoursUntil}h ${minutesUntil}m`;
    return format(game, 'MMM d');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'win': return { icon: CheckCircle, color: 'text-success', bg: 'bg-success' };
      case 'loss': return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive' };
      case 'follow': return { icon: Target, color: 'text-primary', bg: 'bg-primary' };
      case 'new': return { icon: BarChart3, color: 'text-cyan-400', bg: 'bg-cyan-400' };
      default: return { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {language === 'cz' ? 'Vítejte zpět' : 'Welcome back'}, {profile?.display_name || user?.email?.split('@')[0] || 'Analyst'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'cz' ? 'Vaše analytická centrála' : 'Your betting command center'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gradient-to-r from-primary/20 to-accent/10 px-4 py-1.5 text-sm font-semibold text-primary capitalize border border-primary/20">
            {profile?.subscription_tier || 'Free'} {language === 'cz' ? 'Člen' : 'Member'}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : showMaintenanceState ? (
        <MaintenanceState 
          onRetry={() => refetch()}
          title={language === 'cz' ? 'Analyzujeme data' : 'Crunching the Latest Data'}
          subtitle={language === 'cz' 
            ? 'Naše AI analyzuje aktuální kurzy a statistiky.'
            : 'Our AI is analyzing real-time odds and statistics.'
          }
          autoRetrySeconds={30}
        />
      ) : (
        <>
          {/* Top Stats Row - 4 Cards with animated counters */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <AnimatedStatCard
              icon={Target}
              iconColor="bg-primary/10 text-primary"
              label={language === 'cz' ? 'Dnešní tipy' : "Today's Picks"}
              value={topPicks.length}
              link="/predictions"
              linkText={language === 'cz' ? 'Zobrazit' : 'View'}
              isLoading={statsLoading}
              animationDelay={0}
            />
            
            <AnimatedStatCard
              icon={Activity}
              iconColor="bg-success/10 text-success"
              label={language === 'cz' ? 'Přesnost' : 'Accuracy'}
              value={stats?.accuracy || 73}
              suffix="%"
              trend={winRateTrend}
              isLoading={statsLoading}
              animationDelay={100}
            />
            
            <AnimatedStatCard
              icon={Flame}
              iconColor={currentStreak >= 5 ? "bg-orange-500/20 text-orange-400" : "bg-muted text-muted-foreground"}
              label={language === 'cz' ? 'Série výher' : 'Win Streak'}
              value={currentStreak}
              highlight={currentStreak >= 5}
              isLoading={statsLoading}
              animationDelay={200}
            />
            
            <AnimatedStatCard
              icon={TrendingUp}
              iconColor="bg-accent/10 text-accent"
              label={language === 'cz' ? 'Měsíční profit' : 'Monthly Profit'}
              value={Math.abs(estimatedProfit)}
              prefix={estimatedProfit >= 0 ? '+' : '-'}
              suffix={language === 'cz' ? ' Kč' : '$'}
              trendLabel={language === 'cz' ? 'tento měsíc' : 'this month'}
              isLoading={statsLoading}
              animationDelay={300}
            />
          </div>

          {/* Today's Top Picks - Horizontal Scroll */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {language === 'cz' ? 'Dnešní Top Tipy' : "Today's Top Picks"}
              </h2>
              <Link to="/predictions" className="text-sm text-primary hover:underline flex items-center gap-1">
                {language === 'cz' ? 'Všechny predikce' : 'All predictions'}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            {predictionsLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card p-4 min-w-[280px] flex-shrink-0">
                    <Skeleton className="h-6 w-16 mb-3" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            ) : topPicks.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                {topPicks.map((pick) => {
                  const sport = pick.sport?.includes('-') 
                    ? getSportFromTeams(pick.homeTeam, pick.awayTeam)
                    : pick.sport;
                  const confidencePercent = normalizeConfidence(pick.confidence);
                  
                  return (
                    <Link 
                      key={pick.id}
                      to={`/predictions/${pick.id}`}
                      className="glass-card p-4 min-w-[280px] md:min-w-[300px] flex-shrink-0 snap-start hover:border-primary/50 transition-all group bg-gradient-to-br from-card to-muted/20"
                    >
                      {/* Sport & Confidence Circle */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getSportEmoji(sport || 'Sports')}</span>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {sport || 'Sports'}
                          </span>
                        </div>
                        
                        {/* Animated confidence circle */}
                        <div className="relative h-12 w-12">
                          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18" cy="18" r="15.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-muted/30"
                            />
                            <circle
                              cx="18" cy="18" r="15.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${confidencePercent} 100`}
                              strokeLinecap="round"
                              className={cn(
                                "transition-all duration-1000",
                                confidencePercent >= 75 ? "text-success" :
                                confidencePercent >= 65 ? "text-primary" :
                                "text-warning"
                              )}
                              style={{
                                animation: 'dash 1s ease-out forwards',
                              }}
                            />
                          </svg>
                          <span className={cn(
                            "absolute inset-0 flex items-center justify-center text-xs font-bold",
                            confidencePercent >= 75 ? "text-success" :
                            confidencePercent >= 65 ? "text-primary" :
                            "text-warning"
                          )}>
                            {confidencePercent}%
                          </span>
                        </div>
                      </div>

                      {/* Teams */}
                      <p className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                        {pick.awayTeam} @ {pick.homeTeam}
                      </p>

                      {/* Countdown */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>⏰ {language === 'cz' ? 'Za' : 'In'} {formatCountdown(pick.gameTime)}</span>
                      </div>

                      {/* Our Pick + Follow Button */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="text-xs">
                          <span className="text-muted-foreground">{language === 'cz' ? 'Náš tip:' : 'Our pick:'}</span>
                          <span className="font-bold ml-1.5 text-primary">{pick.prediction.pick}</span>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 hover:bg-primary hover:text-primary-foreground">
                          <Eye className="h-3 w-3" />
                          {language === 'cz' ? 'Sledovat' : 'Follow'}
                        </Button>
                      </div>
                    </Link>
                  );
                })}
                
                {/* View All Card */}
                <Link 
                  to="/predictions"
                  className="glass-card p-4 min-w-[200px] flex-shrink-0 snap-start flex flex-col items-center justify-center text-center hover:border-primary/50 transition-all group"
                >
                  <div className="p-3 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                    <ChevronRight className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {language === 'cz' ? '➡️ Všechny predikce' : '➡️ All predictions'}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="glass-card py-12 text-center">
                <Activity className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <h3 className="mt-3 text-base font-semibold">
                  {language === 'cz' ? 'Zatím žádné tipy' : 'No picks yet'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Nové predikce přibývají průběžně' : 'New predictions are added throughout the day'}
                </p>
              </div>
            )}
          </section>

          {/* Two Column Layout: Activity + Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Your Activity Feed */}
            <section className="glass-card overflow-hidden">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  {language === 'cz' ? 'Vaše aktivita' : 'Your Activity'}
                </h3>
              </div>
              <div className="p-4">
                {activityFeed.length > 0 ? (
                  <div className="space-y-4">
                    {activityFeed.map((activity, i) => {
                      const { icon: ActivityIcon, color, bg } = getActivityIcon(activity.type);
                      return (
                        <div key={i} className="flex gap-3 items-start">
                          {/* Timeline dot */}
                          <div className="relative flex flex-col items-center">
                            <div className={cn("w-2.5 h-2.5 rounded-full", bg)} />
                            {i < activityFeed.length - 1 && (
                              <div className="w-0.5 flex-1 bg-border mt-1 min-h-[20px]" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn("text-sm", color)}>
                                {activity.type === 'win' && '✅ '}
                                {activity.type === 'loss' && '❌ '}
                                {activity.type === 'follow' && '🎯 '}
                                {activity.type === 'new' && '📊 '}
                                {language === 'cz' ? activity.messageCz : activity.message}
                                {activity.amount && (
                                  <span className="font-bold text-success ml-1">({activity.amount})</span>
                                )}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(activity.time, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {language === 'cz' 
                        ? 'Začněte sledovat tipy a uvidíte svou aktivitu'
                        : 'Start following picks to see your activity'
                      }
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Accuracy Over Time Chart */}
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
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`, 
                        name === 'accuracy' ? 'Daily' : '7-Day Avg'
                      ]}
                      labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                    />
                    <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <ReferenceLine y={70} stroke="hsl(var(--success))" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#accuracyGradientDash)"
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-primary rounded" />
                    <span>{language === 'cz' ? 'Denní' : 'Daily'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-warning rounded" style={{ borderStyle: 'dashed' }} />
                    <span>{language === 'cz' ? '7-denní průměr' : '7-Day Avg'}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sport Performance */}
          <section className="glass-card overflow-hidden">
            <div className="border-b border-border p-4">
              <h3 className="font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                {language === 'cz' ? 'Výkon podle sportu' : 'Sport Performance'}
              </h3>
            </div>
            <div className="p-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                {sportPerformance.map((sport, i) => (
                  <div 
                    key={sport.name}
                    className={cn(
                      "p-4 rounded-xl border bg-gradient-to-br from-card to-muted/20 transition-all hover:border-primary/50",
                      i === 0 && "border-yellow-500/30 ring-1 ring-yellow-500/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sport.emoji}</span>
                        <span className="font-semibold text-sm">{sport.name}</span>
                      </div>
                      {i === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                          ⭐ {language === 'cz' ? 'Nejlepší' : 'Best'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <span className={cn(
                          "text-2xl font-mono font-black",
                          sport.accuracy >= 70 ? "text-success" : 
                          sport.accuracy >= 60 ? "text-warning" : "text-destructive"
                        )}>
                          {sport.accuracy}%
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sport.wins}W - {sport.losses}L
                        </p>
                      </div>
                      <div className={cn(
                        "flex items-center gap-0.5 text-xs font-medium",
                        sport.trend >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {sport.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {sport.trend >= 0 ? '+' : ''}{sport.trend}%
                      </div>
                    </div>
                    
                    {/* Mini sparkline */}
                    <div className="mt-2 h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.slice(-14)}>
                          <Area
                            type="monotone"
                            dataKey="accuracy"
                            stroke={sport.accuracy >= 70 ? "hsl(var(--success))" : "hsl(var(--warning))"}
                            strokeWidth={1.5}
                            fill={sport.accuracy >= 70 ? "hsl(var(--success) / 0.1)" : "hsl(var(--warning) / 0.1)"}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Quick Links */}
          <section>
            <div className="grid gap-3 md:grid-cols-3">
              {/* Latest Article */}
              <Link 
                to="/blog"
                className="glass-card p-4 flex items-center gap-4 hover:border-primary/50 transition-all group"
              >
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {language === 'cz' ? '📚 Nejnovější článek' : '📚 Latest Article'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {blogArticles?.[0]?.title || (language === 'cz' ? 'Zobrazit blog' : 'View blog')}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              {/* Invite Friends */}
              <Link 
                to="/referral"
                className="glass-card p-4 flex items-center gap-4 hover:border-primary/50 transition-all group"
              >
                <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Gift className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {language === 'cz' ? '🤝 Pozvat přátele' : '🤝 Invite Friends'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'cz' ? 'Získejte bonus za doporučení' : 'Earn bonus for referrals'}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              {/* Upgrade Plan */}
              <Link 
                to="/pricing"
                className="glass-card p-4 flex items-center gap-4 hover:border-primary/50 transition-all group bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20"
              >
                <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                  <Crown className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                    ⭐ {language === 'cz' ? 'Váš plán' : 'Your Plan'}: <span className="uppercase">{profile?.subscription_tier || 'FREE'}</span>
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {profile?.subscription_tier === 'free' 
                      ? (language === 'cz' ? 'Upgradovat →' : 'Upgrade →')
                      : (language === 'cz' ? 'Spravovat předplatné' : 'Manage subscription')
                    }
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-primary" />
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
