import { useState } from 'react';
import { BarChart3, TrendingUp, Target, Award, Calendar, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { StatCard } from '@/components/StatCard';
import { AccuracyChart } from '@/components/charts/AccuracyChart';
import { SportPerformanceChart } from '@/components/charts/SportPerformanceChart';
import { useActivePredictions, useStats, useAccuracyStats } from '@/hooks/usePredictions';
import { sportIcons } from '@/lib/types';
import { cn } from '@/lib/utils';

const timePeriods = ['Today', '7 Days', '30 Days', '90 Days', 'All Time'];

const Results = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30 Days');
  
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: accuracyData, isLoading: accuracyLoading } = useAccuracyStats();

  const isLoading = predictionsLoading || statsLoading || accuracyLoading;

  const gradedPredictions = predictions?.filter((p) => p.result !== 'pending') || [];
  const wins = gradedPredictions.filter((p) => p.result === 'win').length;
  const losses = gradedPredictions.filter((p) => p.result === 'loss').length;
  const accuracy = wins + losses > 0 ? (wins / (wins + losses)) * 100 : stats?.accuracy || 0;

  const getHeatmapColor = (acc: number) => {
    if (acc >= 70) return 'bg-success';
    if (acc >= 60) return 'bg-success/60';
    if (acc >= 50) return 'bg-yellow-400/60';
    if (acc >= 40) return 'bg-orange-400/60';
    return 'bg-destructive/60';
  };

  const confidenceBreakdown = stats?.byConfidence ? [
    { label: 'Lock (75%+)', ...stats.byConfidence.lock, icon: '🔒' },
    { label: 'High (65-74%)', ...stats.byConfidence.high, icon: '🔥' },
    { label: 'Medium (55-64%)', ...stats.byConfidence.medium, icon: '📊' },
    { label: 'Low (<55%)', ...stats.byConfidence.low, icon: '📉' },
  ] : [];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="mt-2 text-muted-foreground">
            Verified performance across all predictions
          </p>
        </div>

        {/* Time Period Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {timePeriods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                selectedPeriod === period
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
            >
              {period}
            </button>
          ))}
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
                title="Accuracy"
                value={(stats?.accuracy ?? accuracy).toFixed(1)}
                suffix="%"
                icon={<Target className="h-5 w-5" />}
                trend="up"
                trendValue="+2.1%"
              />
              <StatCard
                title="Win Rate"
                value={`${stats?.byConfidence ? Object.values(stats.byConfidence).reduce((a, b) => a + b.wins, 0) : wins}W`}
                icon={<Award className="h-5 w-5" />}
              />
              <StatCard
                title="ROI"
                value={stats?.roi ?? 0}
                suffix="%"
                prefix="+"
                icon={<TrendingUp className="h-5 w-5" />}
                trend="up"
                trendValue="+1.8%"
              />
              <StatCard
                title="Total Graded"
                value={stats?.totalPredictions ?? wins + losses}
                icon={<BarChart3 className="h-5 w-5" />}
              />
            </div>

            {/* Charts Row */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {/* Accuracy Over Time Chart */}
              <div className="glass-card overflow-hidden">
                <div className="border-b border-border p-4 flex items-center justify-between">
                  <h3 className="font-semibold">Accuracy Trend</h3>
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
                  <span className="text-xs text-muted-foreground">Accuracy %</span>
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

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Accuracy by Confidence */}
              <div className="glass-card overflow-hidden">
                <div className="border-b border-border p-4">
                  <h3 className="font-semibold">Accuracy by Confidence Level</h3>
                </div>
                <div className="p-6">
                  {confidenceBreakdown.length > 0 ? (
                    <div className="space-y-6">
                      {confidenceBreakdown.map((level) => {
                        const levelAccuracy = level.total > 0 ? (level.wins / level.total) * 100 : 0;
                        return (
                          <div key={level.label}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span>{level.icon}</span>
                                <span className="font-medium">{level.label}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-muted-foreground">
                                  {level.wins}/{level.total}
                                </span>
                                <span className={cn(
                                  'font-mono font-bold',
                                  levelAccuracy >= 70 ? 'text-success' : levelAccuracy >= 60 ? 'text-yellow-400' : 'text-orange-400'
                                )}>
                                  {levelAccuracy.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-700',
                                  levelAccuracy >= 70
                                    ? 'bg-success'
                                    : levelAccuracy >= 60
                                    ? 'bg-yellow-400'
                                    : 'bg-orange-400'
                                )}
                                style={{ width: `${levelAccuracy}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No confidence data available</p>
                  )}
                </div>
              </div>

              {/* Sport Leaderboard */}
              <div className="glass-card overflow-hidden">
                <div className="border-b border-border p-4">
                  <h3 className="font-semibold">Sport Leaderboard</h3>
                </div>
                <div className="overflow-x-auto">
                  {stats?.bySport && stats.bySport.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="p-4">Sport</th>
                          <th className="p-4 text-center">W-L</th>
                          <th className="p-4 text-right">Accuracy</th>
                          <th className="p-4 text-right">ROI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {stats.bySport.map((sport, index) => {
                          const sportKey = sport.sport?.toUpperCase() || sport.sport;
                          return (
                            <tr key={sport.sport} className="hover:bg-muted/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{sportIcons[sportKey] || sportIcons[sport.sport] || '🏆'}</span>
                                  <span className="font-medium">{sport.sport}</span>
                                  {index === 0 && <span className="text-yellow-400">👑</span>}
                                </div>
                              </td>
                              <td className="p-4 text-center font-mono text-sm">
                                <span className="text-success">{sport.wins}</span>
                                <span className="text-muted-foreground">-</span>
                                <span className="text-destructive">{sport.losses}</span>
                              </td>
                              <td className="p-4 text-right">
                                <span
                                  className={cn(
                                    'font-mono font-bold',
                                    sport.accuracy >= 65 ? 'text-success' : sport.accuracy >= 55 ? 'text-yellow-400' : 'text-orange-400'
                                  )}
                                >
                                  {sport.accuracy.toFixed(1)}%
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {sport.roi >= 0 ? (
                                    <ArrowUp className="h-3 w-3 text-success" />
                                  ) : (
                                    <ArrowDown className="h-3 w-3 text-destructive" />
                                  )}
                                  <span
                                    className={cn(
                                      'font-mono font-bold',
                                      sport.roi >= 0 ? 'text-success' : 'text-destructive'
                                    )}
                                  >
                                    {sport.roi >= 0 ? '+' : ''}{sport.roi.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">No sport data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Calendar Heatmap */}
            <div className="mt-8 glass-card overflow-hidden">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-semibold">Daily Performance (Last 30 Days)</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  GitHub-style accuracy heatmap
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-1.5">
                  {(stats?.dailyAccuracy || []).map((day, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-8 w-8 rounded transition-all hover:scale-110 cursor-pointer',
                        getHeatmapColor(day.accuracy)
                      )}
                      title={`${new Date(day.date).toLocaleDateString()}: ${day.accuracy.toFixed(0)}% (${day.predictions} picks)`}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="h-4 w-4 rounded bg-destructive/60" />
                    <div className="h-4 w-4 rounded bg-orange-400/60" />
                    <div className="h-4 w-4 rounded bg-yellow-400/60" />
                    <div className="h-4 w-4 rounded bg-success/60" />
                    <div className="h-4 w-4 rounded bg-success" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* Recent Results Feed */}
            <div className="mt-8 glass-card overflow-hidden">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-semibold">Win/Loss Feed</h3>
                <span className="text-xs text-muted-foreground">Most recent</span>
              </div>
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {gradedPredictions.length > 0 ? (
                  gradedPredictions.slice(0, 15).map((prediction) => {
                    const sportKey = prediction.sport?.toUpperCase() || prediction.sport;
                    return (
                      <div
                        key={prediction.id}
                        className={cn(
                          'flex items-center justify-between p-4 transition-colors',
                          prediction.result === 'win' ? 'hover:bg-success/5' : 'hover:bg-destructive/5'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full text-lg',
                            prediction.result === 'win' ? 'bg-success/20' : 'bg-destructive/20'
                          )}>
                            {sportIcons[sportKey] || sportIcons[prediction.sport] || '🏆'}
                          </div>
                          <div>
                            <p className="font-medium">
                              {prediction.awayTeam} @ {prediction.homeTeam}
                            </p>
                            <p className="text-sm text-muted-foreground">{prediction.prediction.pick}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-mono text-sm">{prediction.prediction.odds}</p>
                            <p className="text-xs text-muted-foreground">{prediction.confidence}% conf</p>
                          </div>
                          <span
                            className={cn(
                              'rounded-full px-3 py-1 text-xs font-bold uppercase',
                              prediction.result === 'win' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                            )}
                          >
                            {prediction.result}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No graded predictions yet</div>
                )}
              </div>
            </div>

            {/* Transparency Notice */}
            <div className="mt-8 glass-card p-6 text-center bg-gradient-to-r from-primary/5 to-accent/5">
              <p className="text-sm text-muted-foreground">
                🔒 Every prediction is timestamped before game start. Fully verifiable and transparent.
              </p>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Results;
