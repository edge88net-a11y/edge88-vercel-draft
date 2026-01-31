import { BarChart3, TrendingUp, Target, Activity, Loader2, Zap } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { StatCard } from '@/components/StatCard';
import { PredictionCard } from '@/components/PredictionCard';
import { AccuracyChart } from '@/components/charts/AccuracyChart';
import { SportPerformanceChart } from '@/components/charts/SportPerformanceChart';
import { useActivePredictions, useStats } from '@/hooks/usePredictions';
import { sportIcons } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats, isLoading: statsLoading } = useStats();

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const activePredictions = predictions?.filter((p) => p.result === 'pending').slice(0, 6) || [];
  const recentResults = predictions?.filter((p) => p.result !== 'pending').slice(0, 5) || [];

  const isLoading = authLoading || predictionsLoading || statsLoading;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {profile?.display_name || user?.email?.split('@')[0] || 'Analyst'}
            </h1>
            <span className="rounded-full bg-gradient-to-r from-primary/20 to-accent/10 px-4 py-1 text-sm font-medium text-primary capitalize border border-primary/20">
              {profile?.subscription_tier || 'Free'} Member
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">
            Here's your performance overview and today's predictions
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Predictions"
                value={stats?.totalPredictions ?? 0}
                trend="up"
                trendValue="+12%"
                icon={<BarChart3 className="h-5 w-5" />}
              />
              <StatCard
                title="Accuracy Rate"
                value={stats?.accuracy ?? 0}
                suffix="%"
                trend="up"
                trendValue="+2.3%"
                icon={<Target className="h-5 w-5" />}
              />
              <StatCard
                title="Active Predictions"
                value={stats?.activePredictions ?? activePredictions.length}
                icon={<Activity className="h-5 w-5" />}
                isLive
              />
              <StatCard
                title="ROI"
                value={stats?.roi ?? 0}
                suffix="%"
                prefix="+"
                trend="up"
                trendValue="+1.4%"
                icon={<TrendingUp className="h-5 w-5" />}
              />
            </div>

            {/* Charts Row */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {/* Accuracy Over Time Chart */}
              <div className="glass-card overflow-hidden">
                <div className="border-b border-border p-4 flex items-center justify-between">
                  <h3 className="font-semibold">Accuracy Over Time</h3>
                  <span className="text-xs text-muted-foreground">Last 30 days</span>
                </div>
                <div className="p-4">
                  {stats?.dailyAccuracy ? (
                    <AccuracyChart data={stats.dailyAccuracy} />
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                      No chart data available
                    </div>
                  )}
                </div>
              </div>

              {/* Sport Performance Chart */}
              <div className="glass-card overflow-hidden">
                <div className="border-b border-border p-4 flex items-center justify-between">
                  <h3 className="font-semibold">Performance by Sport</h3>
                  <span className="text-xs text-muted-foreground">All time</span>
                </div>
                <div className="p-4">
                  {stats?.bySport && stats.bySport.length > 0 ? (
                    <SportPerformanceChart data={stats.bySport} />
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                      No sport data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Live Predictions */}
              <div className="lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Active Predictions</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm text-success">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                      </span>
                      Live Updates
                    </div>
                    <Link to="/predictions">
                      <Button variant="ghost" size="sm" className="gap-2">
                        View All
                        <Zap className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {activePredictions.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {activePredictions.map((prediction) => (
                      <PredictionCard key={prediction.id} prediction={prediction} />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card py-16 text-center">
                    <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No active predictions</h3>
                    <p className="mt-2 text-muted-foreground">Check back soon for new picks</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Win Streak */}
                <div className="glass-card overflow-hidden">
                  <div className="border-b border-border p-4">
                    <h3 className="font-semibold">Current Streak</h3>
                  </div>
                  <div className="p-6 text-center">
                    <div className="mb-2 text-5xl">🔥</div>
                    <div className="font-mono text-4xl font-bold text-success">
                      {stats?.winStreak ?? 0} Wins
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Keep it going!</p>
                  </div>
                </div>

                {/* Sport Breakdown */}
                <div className="glass-card overflow-hidden">
                  <div className="border-b border-border p-4">
                    <h3 className="font-semibold">Accuracy by Sport</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {(stats?.bySport || []).slice(0, 5).map((sport) => {
                        const sportKey = sport.sport?.toUpperCase() || sport.sport;
                        return (
                          <div key={sport.sport} className="flex items-center gap-3">
                            <span className="text-xl">{sportIcons[sportKey] || sportIcons[sport.sport] || '🏆'}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{sport.sport}</span>
                                <span className="font-mono text-muted-foreground">
                                  {sport.accuracy.toFixed(1)}%
                                </span>
                              </div>
                              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    sport.accuracy >= 65 ? 'bg-success' : sport.accuracy >= 55 ? 'bg-yellow-400' : 'bg-orange-400'
                                  )}
                                  style={{ width: `${sport.accuracy}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recent Results */}
                <div className="glass-card overflow-hidden">
                  <div className="border-b border-border p-4">
                    <h3 className="font-semibold">Recent Results</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {recentResults.length > 0 ? (
                      recentResults.map((prediction) => {
                        const sportKey = prediction.sport?.toUpperCase() || prediction.sport;
                        return (
                          <div key={prediction.id} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{sportIcons[sportKey] || sportIcons[prediction.sport] || '🏆'}</span>
                              <div>
                                <p className="text-sm font-medium">{prediction.prediction.pick}</p>
                                <p className="text-xs text-muted-foreground">
                                  {prediction.awayTeam} @ {prediction.homeTeam}
                                </p>
                              </div>
                            </div>
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-1 text-xs font-bold uppercase',
                                prediction.result === 'win'
                                  ? 'bg-success/20 text-success'
                                  : 'bg-destructive/20 text-destructive'
                              )}
                            >
                              {prediction.result}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No recent results yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
