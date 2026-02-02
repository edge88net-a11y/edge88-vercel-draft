import { useEffect, useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Target, Activity, Loader2, Zap } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { PredictionCard } from '@/components/PredictionCard';
import { PredictionCardSkeletonList } from '@/components/PredictionCardSkeleton';
import { TonightsGames } from '@/components/TonightsGames';
import { MaintenanceState } from '@/components/MaintenanceState';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { ReferralWidget } from '@/components/dashboard/ReferralWidget';
import { TelegramWidget } from '@/components/dashboard/TelegramWidget';
import { SlimWelcomeBar } from '@/components/dashboard/SlimWelcomeBar';
import { EnhancedStatCard } from '@/components/dashboard/EnhancedStatCard';
import { ProfitPill } from '@/components/dashboard/ProfitPill';
import { HeroNextGame } from '@/components/dashboard/HeroNextGame';
import { HotPicksCarousel } from '@/components/dashboard/HotPicksCarousel';
import { BettingSlipWidget } from '@/components/dashboard/BettingSlipWidget';
import { StreakSportWidget } from '@/components/dashboard/StreakSportWidget';
import { RecentResultsWidget } from '@/components/dashboard/RecentResultsWidget';
import { useActivePredictions, useStats } from '@/hooks/usePredictions';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { data: predictions, isLoading: predictionsLoading, isError, refetch, isMaintenanceMode } = useActivePredictions();
  const { data: stats, isLoading: statsLoading, isMaintenanceMode: statsMaintenanceMode } = useStats();
  const { stats: savedStats } = useSavedPicks();
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

  const activePredictions = deduplicatedPredictions.filter((p) => p.result === 'pending').slice(0, 6);

  const isLoading = authLoading || (predictionsLoading && !isMaintenanceMode);
  const showMaintenanceState = isMaintenanceMode || statsMaintenanceMode;

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

  return (
    <div>
      {/* Slim Welcome Bar */}
      <SlimWelcomeBar 
        picksToday={stats?.picksToday || 0} 
        currentStreak={stats?.winStreak || 0}
        isLoading={statsLoading}
      />

      {/* Your Picks Summary */}
      {savedStats.total > 0 && (
        <div className="mb-6 glass-card p-4 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-sm text-muted-foreground">{t.yourPicks}</p>
                <p className="text-xl font-bold">
                  <span className="text-success">{savedStats.wins}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-destructive">{savedStats.losses}</span>
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({savedStats.accuracy.toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
            <Link to="/saved-picks">
              <Button variant="outline" size="sm">{t.viewAll}</Button>
            </Link>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : showMaintenanceState ? (
        <div className="py-8">
          <MaintenanceState 
            onRetry={() => refetch()}
            title="Crunching the Latest Data"
            subtitle="Our AI is analyzing real-time odds, injury reports, and sharp money movements. Your dashboard will be ready shortly."
            autoRetrySeconds={30}
          />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="mb-4 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {statsLoading ? (
              <>
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </>
            ) : (
              <>
                <EnhancedStatCard
                  title={t.totalPredictions}
                  value={stats?.totalPredictions ?? 0}
                  icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />}
                  gradient="blue"
                />
                <EnhancedStatCard
                  title={t.accuracyRate}
                  value={stats?.accuracy !== null && stats?.accuracy !== undefined && stats.accuracy > 0 ? stats.accuracy : '—'}
                  suffix={stats?.accuracy !== null && stats?.accuracy !== undefined && stats.accuracy > 0 ? '%' : ''}
                  icon={<Target className="h-4 w-4 sm:h-5 sm:w-5" />}
                  gradient="dynamic"
                  dynamicValue={stats?.accuracy ?? 0}
                />
                <EnhancedStatCard
                  title={t.activePredictions}
                  value={stats?.activePredictions ?? activePredictions.length}
                  icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5" />}
                  isLive
                  gradient="cyan"
                />
                <EnhancedStatCard
                  title={t.roi}
                  value={stats?.roi !== null && stats?.roi !== undefined && stats.roi !== 0 ? stats.roi : '—'}
                  suffix={stats?.roi !== null && stats?.roi !== undefined && stats.roi !== 0 ? '%' : ''}
                  prefix={stats?.roi !== null && stats?.roi !== undefined && stats.roi > 0 ? '+' : ''}
                  icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
                  gradient={stats?.roi && stats.roi >= 0 ? 'amber' : 'red'}
                />
              </>
            )}
          </div>

          {/* Profit Tracker Pills */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <ProfitPill 
              label={language === 'cz' ? 'Dnes' : 'Today'} 
              amount={null} 
            />
            <ProfitPill 
              label={language === 'cz' ? 'Tento týden' : 'This week'} 
              amount={null} 
            />
            <ProfitPill 
              label={language === 'cz' ? 'Tento měsíc' : 'This month'} 
              amount={null} 
            />
          </div>

          {/* Hero Next Game */}
          <div className="mb-6">
            <HeroNextGame predictions={deduplicatedPredictions} isLoading={predictionsLoading} />
          </div>

          {/* HOT Picks Carousel */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                🔥 {language === 'cz' ? 'Dnešní HOT tipy' : "Today's HOT Picks"}
              </h3>
              <Link to="/predictions" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                {language === 'cz' ? 'Zobrazit vše →' : 'View all →'}
              </Link>
            </div>
            <HotPicksCarousel predictions={deduplicatedPredictions} isLoading={predictionsLoading} />
          </div>

          {/* Betting Slip + Streak/Sport Accuracy Row */}
          <div className="mb-6 sm:mb-8 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-5">
            {/* Left: Betting Slip (60%) */}
            <div className="lg:col-span-3">
              <BettingSlipWidget />
            </div>
            
            {/* Right: Streak + Sport Accuracy (40%) */}
            <div className="lg:col-span-2">
              <StreakSportWidget 
                predictions={deduplicatedPredictions} 
                winStreak={stats?.winStreak ?? 0} 
              />
            </div>
          </div>

          {/* Recent Results Section */}
          <RecentResultsWidget predictions={deduplicatedPredictions} />

          {/* Tonight's Games Section */}
          <div className="mb-8">
            <TonightsGames predictions={predictions || []} />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {/* Live Predictions */}
            <div className="lg:col-span-2">
              <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">{t.activePredictions}</h2>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-success/10 px-2.5 sm:px-3 py-1 text-xs sm:text-sm text-success">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                    </span>
                    {t.liveUpdates}
                  </div>
                  <Link to="/predictions">
                    <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 h-9 text-xs sm:text-sm">
                      {t.viewAll}
                      <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {predictionsLoading ? (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <PredictionCardSkeletonList count={4} />
                </div>
              ) : activePredictions.length > 0 ? (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  {activePredictions.map((prediction, index) => (
                    <div key={prediction.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <PredictionCard prediction={prediction} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card py-12 sm:py-16 text-center">
                  <Activity className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold">{t.noActivePredictions}</h3>
                  <p className="mt-1.5 sm:mt-2 text-sm text-muted-foreground">{t.checkBackSoon}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Referral Widget */}
              <ReferralWidget />

              {/* Telegram Widget */}
              <TelegramWidget />

              {/* Telegram Widget */}
              <TelegramWidget />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
