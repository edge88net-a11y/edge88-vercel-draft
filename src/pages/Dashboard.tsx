import { BarChart3, TrendingUp, Target, Zap, Activity } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { StatCard } from '@/components/StatCard';
import { PredictionCard } from '@/components/PredictionCard';
import { mockPredictions, mockUserStats, sportIcons } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const activePredictions = mockPredictions.filter((p) => p.result === 'pending').slice(0, 6);
  const recentResults = mockPredictions.filter((p) => p.result !== 'pending').slice(0, 5);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Analyst</h1>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Pro Member
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">
            Here's your performance overview and today's predictions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Predictions"
            value={mockUserStats.totalPredictions}
            trend="up"
            trendValue="+12%"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatCard
            title="Accuracy Rate"
            value={mockUserStats.accuracy}
            suffix="%"
            trend="up"
            trendValue="+2.3%"
            icon={<Target className="h-5 w-5" />}
          />
          <StatCard
            title="Active Predictions"
            value={mockUserStats.activePredictions}
            icon={<Activity className="h-5 w-5" />}
            isLive
          />
          <StatCard
            title="ROI"
            value={mockUserStats.roi}
            suffix="%"
            prefix="+"
            trend="up"
            trendValue="+1.4%"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Live Predictions */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Predictions</h2>
              <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm text-success">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Live Updates
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {activePredictions.map((prediction) => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Win Streak */}
            <div className="glass-card overflow-hidden">
              <div className="border-b border-border p-4">
                <h3 className="font-semibold">Current Streak</h3>
              </div>
              <div className="p-6 text-center">
                <div className="mb-2 text-5xl">🔥</div>
                <div className="font-mono text-4xl font-bold text-success">
                  {mockUserStats.winStreak} Wins
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
                  {mockUserStats.bySport.slice(0, 5).map((sport) => (
                    <div key={sport.sport} className="flex items-center gap-3">
                      <span className="text-xl">{sportIcons[sport.sport]}</span>
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
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Results */}
            <div className="glass-card overflow-hidden">
              <div className="border-b border-border p-4">
                <h3 className="font-semibold">Recent Results</h3>
              </div>
              <div className="divide-y divide-border">
                {recentResults.map((prediction) => (
                  <div key={prediction.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{sportIcons[prediction.sport]}</span>
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
