import { useEffect, useState, useMemo } from 'react';
import { 
  Target, Activity, Loader2, Zap, Flame, TrendingUp, TrendingDown,
  Calendar, BookOpen, Users, Star, ChevronRight, Eye, CheckCircle,
  Bell, MessageCircle
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { PredictionCard } from '@/components/PredictionCard';
import { PredictionCardSkeletonList } from '@/components/PredictionCardSkeleton';
import { AccuracyChart } from '@/components/charts/AccuracyChart';
import { MaintenanceState } from '@/components/MaintenanceState';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useActivePredictions, useStats } from '@/hooks/usePredictions';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { useBlogArticles } from '@/hooks/useBlogArticles';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes } from 'date-fns';

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { data: predictions, isLoading: predictionsLoading, isError, refetch, isMaintenanceMode } = useActivePredictions();
  const { data: stats, isLoading: statsLoading, isMaintenanceMode: statsMaintenanceMode } = useStats();
  const { stats: savedStats, savedPicks } = useSavedPicks();
  const { data: blogArticles } = useBlogArticles({ limit: 1, sortBy: 'date' });

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
    const activities: { type: 'win' | 'follow' | 'new'; message: string; messageCz: string; time: Date }[] = [];
    
    // Add wins from saved picks
    savedPicks?.filter(p => p.prediction.result === 'win').slice(0, 2).forEach(pick => {
      activities.push({
        type: 'win',
        message: `Your pick won! ${pick.prediction.homeTeam} over ${pick.prediction.awayTeam}`,
        messageCz: `Váš tip vyhrál! ${pick.prediction.homeTeam} porazil ${pick.prediction.awayTeam}`,
        time: new Date(pick.prediction.gameTime),
      });
    });

    // Add recent follows
    savedPicks?.slice(0, 2).forEach(pick => {
      activities.push({
        type: 'follow',
        message: `You followed ${pick.prediction.homeTeam} vs ${pick.prediction.awayTeam}`,
        messageCz: `Sledujete ${pick.prediction.homeTeam} vs ${pick.prediction.awayTeam}`,
        time: new Date(pick.prediction.gameTime),
      });
    });

    // Add new predictions notification
    if (topPicks.length > 0) {
      activities.push({
        type: 'new',
        message: `${topPicks.length} new predictions available for tonight`,
        messageCz: `${topPicks.length} nových predikcí pro dnešek`,
        time: new Date(),
      });
    }

    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 4);
  }, [savedPicks, topPicks]);

  const isLoading = authLoading || (predictionsLoading && !isMaintenanceMode);
  const showMaintenanceState = isMaintenanceMode || statsMaintenanceMode;

  // Win rate trend (mock - compare to last week)
  const winRateTrend = 3.2; // +3.2% vs last week

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

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {language === 'cz' ? 'Vítej zpět' : 'Welcome back'}, {profile?.display_name || user?.email?.split('@')[0] || 'Analyst'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'cz' ? 'Přehled tvé aktivity a dnešní tipy' : "Your activity overview and today's picks"}
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
          {/* Top Stats Row - 4 Cards */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            {/* Today's Picks */}
            <div className="glass-card p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <Link to="/predictions" className="text-xs text-primary hover:underline flex items-center gap-1">
                  {language === 'cz' ? 'Zobrazit' : 'View'}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Dnešní tipy' : "Today's Picks"}
                </p>
                <p className="text-3xl md:text-4xl font-mono font-black mt-1">
                  {topPicks.length}
                </p>
              </div>
            </div>

            {/* Win Rate */}
            <div className="glass-card p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-success/10">
                  <Activity className="h-5 w-5 text-success" />
                </div>
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
                  winRateTrend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {winRateTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {winRateTrend >= 0 ? '+' : ''}{winRateTrend.toFixed(1)}%
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Úspěšnost' : 'Win Rate'}
                </p>
                <p className="text-3xl md:text-4xl font-mono font-black text-success mt-1">
                  {stats?.accuracy?.toFixed(0) || 73}%
                </p>
              </div>
            </div>

            {/* Current Streak */}
            <div className="glass-card p-4 md:p-5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className={cn(
                  "p-2 rounded-xl",
                  (stats?.winStreak || 0) >= 5 ? "bg-orange-500/20" : "bg-muted"
                )}>
                  <Flame className={cn(
                    "h-5 w-5",
                    (stats?.winStreak || 0) >= 5 ? "text-orange-400 animate-pulse" : "text-muted-foreground"
                  )} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Aktuální série' : 'Current Streak'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl md:text-4xl font-mono font-black">
                    {stats?.winStreak || 0}
                  </span>
                  {(stats?.winStreak || 0) >= 5 && (
                    <span className="text-2xl animate-bounce">🔥</span>
                  )}
                </div>
              </div>
              {(stats?.winStreak || 0) >= 5 && (
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />
              )}
            </div>

            {/* Estimated Profit */}
            <div className="glass-card p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Odhad. zisk' : 'Est. Profit'}
                </p>
                <p className={cn(
                  "text-2xl md:text-3xl font-mono font-black mt-1",
                  estimatedProfit >= 0 ? "text-success" : "text-destructive"
                )}>
                  {estimatedProfit >= 0 ? '+' : ''}{estimatedProfit.toLocaleString(language === 'cz' ? 'cs-CZ' : 'en-US')} {language === 'cz' ? 'Kč' : '$'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {language === 'cz' ? 'tento měsíc' : 'this month'}
                </p>
              </div>
            </div>
          </div>

          {/* Today's Top Picks - Horizontal Scroll */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {language === 'cz' ? 'Dnešní Top Tipy' : "Today's Top Picks"}
              </h2>
              <Link to="/predictions" className="text-sm text-primary hover:underline flex items-center gap-1">
                {language === 'cz' ? 'Zobrazit všechny' : 'See all'}
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
                {topPicks.map((pick, index) => {
                  const sport = pick.sport?.includes('-') 
                    ? getSportFromTeams(pick.homeTeam, pick.awayTeam)
                    : pick.sport;
                  
                  return (
                    <Link 
                      key={pick.id}
                      to={`/predictions/${pick.id}`}
                      className="glass-card p-4 min-w-[280px] md:min-w-[300px] flex-shrink-0 snap-start hover:border-primary/50 transition-all group"
                    >
                      {/* Sport & Confidence */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getSportEmoji(sport || 'Sports')}</span>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {sport || 'Sports'}
                          </span>
                        </div>
                        <span className={cn(
                          "text-sm font-bold px-2.5 py-1 rounded-lg",
                          pick.confidence >= 75 ? "bg-success/20 text-success" :
                          pick.confidence >= 65 ? "bg-primary/20 text-primary" :
                          "bg-warning/20 text-warning"
                        )}>
                          {(pick.confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Teams */}
                      <p className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                        {pick.homeTeam} vs {pick.awayTeam}
                      </p>

                      {/* Countdown */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>⏰ {language === 'cz' ? 'Za' : 'In'} {formatCountdown(pick.gameTime)}</span>
                      </div>

                      {/* Our Pick */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="text-xs">
                          <span className="text-muted-foreground">{language === 'cz' ? 'Náš tip:' : 'Our pick:'}</span>
                          <span className="font-semibold ml-1.5 text-foreground">{pick.prediction.pick}</span>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <Eye className="h-3 w-3" />
                          {language === 'cz' ? 'Sledovat' : 'Follow'}
                        </Button>
                      </div>
                    </Link>
                  );
                })}
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
            {/* Your Activity */}
            <section className="glass-card overflow-hidden">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  {language === 'cz' ? 'Tvá aktivita' : 'Your Activity'}
                </h3>
              </div>
              <div className="p-4">
                {activityFeed.length > 0 ? (
                  <div className="space-y-4">
                    {activityFeed.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={cn(
                          "mt-1 w-2 h-2 rounded-full flex-shrink-0",
                          activity.type === 'win' ? 'bg-success' :
                          activity.type === 'follow' ? 'bg-primary' :
                          'bg-accent'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="mr-1.5">
                              {activity.type === 'win' ? '✅' : 
                               activity.type === 'follow' ? '🎯' : '📊'}
                            </span>
                            {language === 'cz' ? activity.messageCz : activity.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(activity.time, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'cz' 
                        ? 'Začněte sledovat tipy a uvidíte svou aktivitu'
                        : 'Start following picks to see your activity'
                      }
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Accuracy Chart */}
            <section className="glass-card overflow-hidden">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {language === 'cz' ? 'Přesnost za 30 dní' : '30-Day Accuracy'}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {language === 'cz' ? '50% = break even' : '50% = break even'}
                </span>
              </div>
              <div className="p-4">
                {stats?.dailyAccuracy && stats.dailyAccuracy.length > 0 ? (
                  <div className="h-[200px]">
                    <AccuracyChart data={stats.dailyAccuracy} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                    {language === 'cz' ? 'Načítám data...' : 'Loading chart data...'}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sport Breakdown */}
          <section className="glass-card overflow-hidden">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                {language === 'cz' ? 'Přesnost podle sportu' : 'Accuracy by Sport'}
              </h3>
            </div>
            <div className="p-4">
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              ) : stats?.bySport && stats.bySport.length > 0 ? (
                <div className="space-y-3">
                  {stats.bySport.slice(0, 6).map((sport, index) => {
                    const accuracyColor = sport.accuracy >= 70 ? 'bg-success' : 
                                          sport.accuracy >= 60 ? 'bg-primary' : 
                                          sport.accuracy >= 50 ? 'bg-warning' : 'bg-destructive';
                    return (
                      <div key={sport.sport} className="flex items-center gap-3">
                        <span className="text-xl w-8 text-center">{getSportEmoji(sport.sport)}</span>
                        <span className="text-sm font-medium w-16 shrink-0">{sport.sport}</span>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-1000", accuracyColor)}
                            style={{ width: `${Math.min(sport.accuracy, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono font-semibold w-12 text-right">
                          {sport.accuracy.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  {language === 'cz' ? 'Žádná data k zobrazení' : 'No data available'}
                </div>
              )}
            </div>
          </section>

          {/* Quick Links */}
          <section className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
            {/* Latest Article */}
            <Link 
              to={blogArticles?.[0] ? `/blog/${blogArticles[0].slug}` : '/blog'}
              className="glass-card p-4 hover:border-primary/50 transition-all group flex items-center gap-4"
            >
              <div className="p-3 rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Nejnovější článek' : 'Latest Article'}
                </p>
                <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {blogArticles?.[0]?.title || (language === 'cz' ? 'Blog & Archiv' : 'Blog & Archive')}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            {/* Invite Friends */}
            <Link 
              to="/referral"
              className="glass-card p-4 hover:border-primary/50 transition-all group flex items-center gap-4"
            >
              <div className="p-3 rounded-xl bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Pozvat přátele' : 'Invite Friends'}
                </p>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {language === 'cz' ? 'Získej bonus za referral' : 'Earn referral bonus'}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            {/* Upgrade Plan */}
            <Link 
              to="/pricing"
              className="glass-card p-4 hover:border-primary/50 transition-all group flex items-center gap-4 bg-gradient-to-r from-primary/5 to-accent/5"
            >
              <div className="p-3 rounded-xl bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Upgradovat plán' : 'Upgrade Plan'}
                </p>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {language === 'cz' ? 'Získej neomezené tipy' : 'Get unlimited picks'}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
