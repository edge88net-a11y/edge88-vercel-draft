import { Bookmark, TrendingUp, Target, Zap, Flame, DollarSign } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { PredictionCard } from '@/components/PredictionCard';
import { Button } from '@/components/ui/button';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const SavedPicks = () => {
  const { user, loading: authLoading } = useAuth();
  const { savedPicks, stats } = useSavedPicks();
  const { t, language } = useLanguage();

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const pendingPicks = savedPicks.filter((p) => p.prediction.result === 'pending');
  const completedPicks = savedPicks.filter((p) => p.prediction.result !== 'pending');

  // Calculate ROI (assuming $100 unit size and -110 odds)
  const calculateROI = () => {
    if (stats.wins + stats.losses === 0) return 0;
    // Simplified ROI calculation: (wins * 0.91 - losses) / total * 100
    const profit = (stats.wins * 0.91) - stats.losses;
    const roi = (profit / (stats.wins + stats.losses)) * 100;
    return roi;
  };

  // Calculate current streak
  const calculateStreak = () => {
    let streak = 0;
    let lastResult: 'win' | 'loss' | null = null;
    
    for (const pick of completedPicks) {
      if (lastResult === null) {
        lastResult = pick.prediction.result as 'win' | 'loss';
        streak = 1;
      } else if (pick.prediction.result === lastResult) {
        streak++;
      } else {
        break;
      }
    }
    
    return { count: streak, type: lastResult };
  };

  const roi = calculateROI();
  const streak = calculateStreak();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{t.savedPicks}</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            {t.savePredictions}
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="glass-card p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.totalPredictions}</span>
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </div>
          
          <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.trackRecord}</span>
              <Target className="h-5 w-5 text-success" />
            </div>
            <p className="mt-2 text-3xl font-bold">
              <span className="text-success">{stats.wins}</span>
              <span className="text-muted-foreground">-</span>
              <span className="text-destructive">{stats.losses}</span>
            </p>
          </div>
          
          <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.accuracyRate}</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className={cn(
              'mt-2 text-3xl font-bold',
              stats.accuracy >= 55 ? 'text-success' : 'text-foreground'
            )}>
              {stats.accuracy.toFixed(1)}%
            </p>
          </div>

          {/* ROI Card */}
          <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.roi}</span>
              <DollarSign className={cn('h-5 w-5', roi >= 0 ? 'text-success' : 'text-destructive')} />
            </div>
            <p className={cn(
              'mt-2 text-3xl font-bold',
              roi >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </p>
          </div>

          {/* Streak Card */}
          <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.currentStreak}</span>
              <Flame className={cn(
                'h-5 w-5',
                streak.type === 'win' ? 'text-orange-400' : 'text-blue-400'
              )} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className={cn(
                'text-3xl font-bold',
                streak.type === 'win' ? 'text-success' : 'text-destructive'
              )}>
                {streak.count}
              </p>
              <span className="text-sm text-muted-foreground">
                {streak.type === 'win' 
                  ? (language === 'cz' ? 'výher v řadě' : 'wins in a row')
                  : streak.type === 'loss'
                    ? (language === 'cz' ? 'proher v řadě' : 'losses in a row')
                    : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Streak Banner (if on a hot streak) */}
        {streak.type === 'win' && streak.count >= 3 && (
          <div className="mb-8 glass-card p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔥</div>
              <div>
                <p className="text-lg font-bold text-orange-400">
                  {language === 'cz' ? 'Jste ve formě!' : "You're on fire!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {streak.count} {language === 'cz' ? 'výher v řadě - pokračujte!' : 'wins in a row - keep it going!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {savedPicks.length === 0 ? (
          <div className="glass-card py-16 text-center">
            <Bookmark className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-xl font-semibold">{t.noSavedPicks}</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              {t.savePredictions}
            </p>
            <Link to="/predictions" className="mt-6 inline-block">
              <Button className="btn-gradient gap-2">
                <Zap className="h-4 w-4" />
                {t.viewPredictions}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Pending Picks */}
            {pendingPicks.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400" />
                  </span>
                  {t.activePredictions} ({pendingPicks.length})
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingPicks.map((pick, index) => (
                    <div 
                      key={pick.id} 
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <PredictionCard prediction={pick.prediction} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Picks */}
            {completedPicks.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  {t.recentResults} ({completedPicks.length})
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {completedPicks.map((pick, index) => (
                    <div 
                      key={pick.id} 
                      className="relative animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <PredictionCard prediction={pick.prediction} />
                      <div
                        className={cn(
                          'absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold uppercase',
                          pick.prediction.result === 'win'
                            ? 'bg-success/20 text-success'
                            : 'bg-destructive/20 text-destructive'
                        )}
                      >
                        {pick.prediction.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Summary */}
            {completedPicks.length >= 5 && (
              <div className="mt-8 glass-card p-6 bg-gradient-to-r from-primary/5 to-accent/5">
                <h3 className="font-semibold mb-4">
                  {language === 'cz' ? 'Souhrn výkonu' : 'Performance Summary'}
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.accuracy.toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">{t.accuracyRate}</p>
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      'text-3xl font-bold',
                      roi >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">{t.roi}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {stats.wins + stats.losses}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'cz' ? 'Celkem tipů' : 'Total Picks'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default SavedPicks;
