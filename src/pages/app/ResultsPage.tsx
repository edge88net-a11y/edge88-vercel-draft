import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Target, Award, Calendar, Loader2, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { AccuracyChart } from '@/components/charts/AccuracyChart';
import { SportPerformanceChart } from '@/components/charts/SportPerformanceChart';
import { CalendarHeatmap } from '@/components/charts/CalendarHeatmap';
import { ConfidenceAccuracyChart } from '@/components/charts/ConfidenceAccuracyChart';
import { TeamLogo } from '@/components/TeamLogo';
import { useActivePredictions, useStats, useAccuracyStats } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { cn } from '@/lib/utils';

const timePeriods = ['Today', '7 Days', '30 Days', '90 Days', 'All Time'];
const sportFilters = ['All', 'NFL', 'NBA', 'NHL', 'MLB', 'Soccer', 'UFC'];

export default function ResultsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30 Days');
  const [selectedSport, setSelectedSport] = useState('All');
  const { t } = useLanguage();
  
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: accuracyData, isLoading: accuracyLoading } = useAccuracyStats();

  const isLoading = predictionsLoading || statsLoading || accuracyLoading;

  // Filter graded predictions
  const gradedPredictions = useMemo(() => {
    return predictions?.filter((p) => {
      if (p.result === 'pending') return false;
      if (selectedSport !== 'All') {
        const sportName = p.sport?.includes('-') 
          ? getSportFromTeams(p.homeTeam, p.awayTeam)
          : p.sport;
        if (sportName?.toUpperCase() !== selectedSport && sportName !== selectedSport) return false;
      }
      return true;
    }) || [];
  }, [predictions, selectedSport]);

  // Get stats from API response
  const wins = stats?.accuracy ? Math.round((stats.accuracy / 100) * (stats.totalPredictions || 0)) : gradedPredictions.filter((p) => p.result === 'win').length;
  const losses = (stats?.totalPredictions || 0) - wins || gradedPredictions.filter((p) => p.result === 'loss').length;
  const accuracy = stats?.accuracy || (wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0);
  const hasResults = gradedPredictions.length > 0 || (stats?.totalPredictions && stats.totalPredictions > 0);

  // Confidence breakdown for chart
  const confidenceBreakdown = stats?.byConfidence ? [
    { label: 'Lock (75%+)', ...stats.byConfidence.lock, icon: '🔒' },
    { label: 'High (65-74%)', ...stats.byConfidence.high, icon: '🔥' },
    { label: 'Medium (55-64%)', ...stats.byConfidence.medium, icon: '📊' },
    { label: 'Low (<55%)', ...stats.byConfidence.low, icon: '📉' },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.results || 'Results'}</h1>
        <p className="mt-2 text-muted-foreground">
          {t.verifiedPerformance || 'Verified performance across all predictions'}
        </p>
      </div>

      {/* Filters Row */}
      <div className="mb-8 glass-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Time Period Tabs */}
          <div className="flex flex-wrap gap-2">
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
          
          {/* Sport Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {sportFilters.map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    selectedSport === sport
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {sport !== 'All' && <span className="mr-1">{getSportEmoji(sport)}</span>}
                  {sport}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !hasResults ? (
        <div className="glass-card p-12 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Target className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No Results Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Predictions are being tracked. Once games complete and are graded, your results will appear here with full accuracy stats.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span>{stats?.totalPredictions || 0} predictions tracking</span>
            </div>
            <span>•</span>
            <span>{stats?.activePredictions || 0} upcoming</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t.accuracyRate || "Accuracy"}
              value={accuracy.toFixed(1)}
              suffix="%"
              icon={<Target className="h-5 w-5" />}
            />
            <StatCard
              title={t.winRate || "Win Rate"}
              value={`${wins}W-${losses}L`}
              icon={<Award className="h-5 w-5" />}
            />
            <StatCard
              title={t.roi || "ROI"}
              value={stats?.roi ?? 0}
              suffix="%"
              prefix={stats?.roi && stats.roi >= 0 ? "+" : ""}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              title={t.totalGraded || "Total Graded"}
              value={stats?.totalPredictions ?? gradedPredictions.length}
              icon={<BarChart3 className="h-5 w-5" />}
            />
          </div>

          {/* Calendar Heatmap */}
          <div className="mb-8 glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{t.dailyPerformance || 'Daily Performance'}</h3>
              </div>
              <span className="text-xs text-muted-foreground">GitHub-style accuracy heatmap</span>
            </div>
            <div className="p-6">
              <CalendarHeatmap data={stats?.dailyAccuracy || []} days={90} />
            </div>
          </div>

          {/* Charts Row */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="glass-card overflow-hidden">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-semibold">{t.accuracyTrend || 'Accuracy Trend'}</h3>
                <span className="text-xs text-muted-foreground">{t.last30Days || 'Last 30 days'}</span>
              </div>
              <div className="p-4">
                {stats?.dailyAccuracy ? (
                  <AccuracyChart data={stats.dailyAccuracy} />
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    {t.noChartData || 'No chart data available'}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-semibold">{t.accuracyByConfidence || 'Accuracy by Confidence'}</h3>
                <span className="text-xs text-muted-foreground">Higher confidence = better accuracy</span>
              </div>
              <div className="p-4">
                {confidenceBreakdown.length > 0 ? (
                  <ConfidenceAccuracyChart data={confidenceBreakdown} />
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    No confidence data available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Sport Leaderboard */}
            <div className="glass-card overflow-hidden">
              <div className="border-b border-border p-4">
                <h3 className="font-semibold">{t.sportLeaderboard || 'Sport Leaderboard'}</h3>
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
                      {stats.bySport.map((sport, index) => (
                        <tr key={sport.sport} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getSportEmoji(sport.sport)}</span>
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
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No sport data available</div>
                )}
              </div>
            </div>

            {/* Sport Performance Bar Chart */}
            <div className="glass-card overflow-hidden">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-semibold">{t.performanceBySport || 'Performance by Sport'}</h3>
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

          {/* Recent Results Feed */}
          <div className="mt-8 glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-semibold">{t.winLossFeed || 'Win/Loss Feed'}</h3>
              <span className="text-xs text-muted-foreground">Most recent</span>
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {gradedPredictions.length > 0 ? (
                gradedPredictions.slice(0, 20).map((prediction) => (
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
                        {getSportEmoji(prediction.sport)}
                      </div>
                      <div className="flex items-center gap-2">
                        <TeamLogo teamName={prediction.awayTeam} sport={prediction.sport} size="sm" />
                        <span className="text-sm text-muted-foreground">@</span>
                        <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport} size="sm" />
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
                          'rounded-lg px-3 py-1.5 text-sm font-bold uppercase',
                          prediction.result === 'win'
                            ? 'bg-success/20 text-success'
                            : 'bg-destructive/20 text-destructive'
                        )}
                      >
                        {prediction.result}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No graded predictions yet
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
