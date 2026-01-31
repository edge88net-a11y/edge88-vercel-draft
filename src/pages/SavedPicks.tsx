import { Bookmark, TrendingUp, Target, Zap } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PredictionCard } from '@/components/PredictionCard';
import { Button } from '@/components/ui/button';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const SavedPicks = () => {
  const { user, loading: authLoading } = useAuth();
  const { savedPicks, stats } = useSavedPicks();
  const { t } = useLanguage();

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const pendingPicks = savedPicks.filter((p) => p.prediction.result === 'pending');
  const completedPicks = savedPicks.filter((p) => p.prediction.result !== 'pending');

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

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.totalPredictions}</span>
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </div>
          
          <div className="glass-card p-4">
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
          
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.accuracyRate}</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 text-3xl font-bold">
              {stats.accuracy.toFixed(1)}%
            </p>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.activePredictions}</span>
              <Zap className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="mt-2 text-3xl font-bold">{stats.pending}</p>
          </div>
        </div>

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
                  {pendingPicks.map((pick) => (
                    <PredictionCard key={pick.id} prediction={pick.prediction} />
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
                  {completedPicks.map((pick) => (
                    <div key={pick.id} className="relative">
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SavedPicks;
