import { useState } from 'react';
import { BarChart3, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { StatCard } from '@/components/StatCard';
import { mockPredictions, mockUserStats, sportIcons } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const timePeriods = ['Today', '7 Days', '30 Days', '90 Days', 'All Time'];

const Results = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30 Days');

  const gradedPredictions = mockPredictions.filter((p) => p.result !== 'pending');
  const wins = gradedPredictions.filter((p) => p.result === 'win').length;
  const losses = gradedPredictions.filter((p) => p.result === 'loss').length;
  const accuracy = (wins / (wins + losses)) * 100;

  // Generate calendar heatmap data (last 30 days)
  const generateHeatmapData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const accuracy = 50 + Math.random() * 30; // Random accuracy 50-80%
      data.push({
        date,
        accuracy,
        predictions: Math.floor(5 + Math.random() * 10),
      });
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  const getHeatmapColor = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-success';
    if (accuracy >= 60) return 'bg-success/60';
    if (accuracy >= 50) return 'bg-yellow-400/60';
    if (accuracy >= 40) return 'bg-orange-400/60';
    return 'bg-destructive/60';
  };

  const confidenceBreakdown = [
    { label: 'Lock (75%+)', ...mockUserStats.byConfidence.lock },
    { label: 'High (65-74%)', ...mockUserStats.byConfidence.high },
    { label: 'Medium (55-64%)', ...mockUserStats.byConfidence.medium },
    { label: 'Low (<55%)', ...mockUserStats.byConfidence.low },
  ];

  return (
    <div className="min-h-screen">
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

        {/* Stats Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Accuracy"
            value={accuracy.toFixed(1)}
            suffix="%"
            icon={<Target className="h-5 w-5" />}
          />
          <StatCard
            title="Win Rate"
            value={`${wins}W - ${losses}L`}
            icon={<Award className="h-5 w-5" />}
          />
          <StatCard
            title="ROI"
            value={mockUserStats.roi}
            suffix="%"
            prefix="+"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Total Graded"
            value={wins + losses}
            icon={<BarChart3 className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Accuracy by Confidence */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold">Accuracy by Confidence Level</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {confidenceBreakdown.map((level) => {
                  const levelAccuracy = (level.wins / level.total) * 100;
                  return (
                    <div key={level.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium">{level.label}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            {level.wins}/{level.total}
                          </span>
                          <span className="font-mono font-bold">
                            {levelAccuracy.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
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
            </div>
          </div>

          {/* Performance by Sport */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold">Performance by Sport</h3>
            </div>
            <div className="overflow-x-auto">
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
                  {mockUserStats.bySport.map((sport) => (
                    <tr key={sport.sport} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{sportIcons[sport.sport]}</span>
                          <span className="font-medium">{sport.sport}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono text-sm">
                        {sport.wins}-{sport.losses}
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
                        <span
                          className={cn(
                            'font-mono font-bold',
                            sport.roi >= 0 ? 'text-success' : 'text-destructive'
                          )}
                        >
                          {sport.roi >= 0 ? '+' : ''}{sport.roi.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              {heatmapData.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-8 w-8 rounded transition-all hover:scale-110 cursor-pointer',
                    getHeatmapColor(day.accuracy)
                  )}
                  title={`${day.date.toLocaleDateString()}: ${day.accuracy.toFixed(0)}% (${day.predictions} picks)`}
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

        {/* Recent Results */}
        <div className="mt-8 glass-card overflow-hidden">
          <div className="border-b border-border p-4">
            <h3 className="font-semibold">Recent Results</h3>
          </div>
          <div className="divide-y divide-border">
            {gradedPredictions.map((prediction) => (
              <div
                key={prediction.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{sportIcons[prediction.sport]}</span>
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
                      prediction.result === 'win' ? 'badge-win' : 'badge-loss'
                    )}
                  >
                    {prediction.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Notice */}
        <div className="mt-8 glass-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 Every prediction is timestamped before game start. Fully verifiable and transparent.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
