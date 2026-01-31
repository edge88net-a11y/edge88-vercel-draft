import { useState } from 'react';
import { Filter, RefreshCw, Zap, Loader2, Grid3X3, List } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PredictionCard } from '@/components/PredictionCard';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { Button } from '@/components/ui/button';
import { useActivePredictions } from '@/hooks/usePredictions';
import { sportIcons } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const sports = ['All', 'NFL', 'NBA', 'NHL', 'MLB', 'Soccer', 'UFC'];
const confidenceLevels = [
  { label: 'All', min: 0 },
  { label: 'Lock 75%+', min: 75 },
  { label: 'High 65%+', min: 65 },
  { label: 'Medium 55%+', min: 55 },
];
const predictionTypes = ['All', 'Moneyline', 'Spread', 'Over/Under', 'Prop'];

const FREE_PICKS_LIMIT = 3;

const Predictions = () => {
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedConfidence, setSelectedConfidence] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { user, profile } = useAuth();
  const { data: predictions, isLoading, refetch, isFetching } = useActivePredictions();

  const isPro = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'elite';

  const handleRefresh = () => {
    refetch();
  };

  const activePredictions = predictions?.filter((p) => p.result === 'pending') || [];

  const filteredPredictions = activePredictions.filter((prediction) => {
    const sportKey = prediction.sport?.toUpperCase() || prediction.sport;
    if (selectedSport !== 'All' && sportKey !== selectedSport && prediction.sport !== selectedSport) return false;
    const confidenceFilter = confidenceLevels.find((c) => c.label === selectedConfidence);
    if (confidenceFilter && prediction.confidence < confidenceFilter.min) return false;
    if (selectedType !== 'All' && prediction.prediction.type !== selectedType) return false;
    return true;
  });

  // Sort by confidence (highest first)
  const sortedPredictions = [...filteredPredictions].sort((a, b) => b.confidence - a.confidence);

  const shouldLockPrediction = (index: number) => {
    if (isPro) return false;
    if (user) return index >= FREE_PICKS_LIMIT * 2; // Logged in users get 6
    return index >= FREE_PICKS_LIMIT; // Non-logged in get 3
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Predictions</h1>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                {activePredictions.length} Active
              </span>
            </div>
            <p className="mt-2 text-muted-foreground">
              AI-powered picks across all major sports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-md p-2 transition-colors',
                  viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-md p-2 transition-colors',
                  viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card mb-8 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Filter className="h-4 w-4" />
            Filters
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Sport Filter */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sport
              </label>
              <div className="flex flex-wrap gap-2">
                {sports.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      selectedSport === sport
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {sport !== 'All' && <span>{sportIcons[sport] || sportIcons[sport.toUpperCase()]}</span>}
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Filter */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Confidence
              </label>
              <div className="flex flex-wrap gap-2">
                {confidenceLevels.map((level) => (
                  <button
                    key={level.label}
                    onClick={() => setSelectedConfidence(level.label)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      selectedConfidence === level.label
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {predictionTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      selectedType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{sortedPredictions.length}</span> predictions
            {!isPro && (
              <span className="ml-2 text-primary">
                ({user ? FREE_PICKS_LIMIT * 2 : FREE_PICKS_LIMIT} unlocked)
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            Auto-refresh in 30s
          </div>
        </div>

        {/* Predictions Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedPredictions.length > 0 ? (
          <div className={cn(
            'grid gap-6',
            viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {sortedPredictions.map((prediction, index) => {
              const isLocked = shouldLockPrediction(index);
              return (
                <SubscriptionGate key={prediction.id} isLocked={isLocked}>
                  <PredictionCard prediction={prediction} />
                </SubscriptionGate>
              );
            })}
          </div>
        ) : (
          <div className="glass-card py-16 text-center">
            <Zap className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No predictions found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your filters to see more predictions
            </p>
          </div>
        )}

        {/* Subscription Gate Notice */}
        {!isPro && sortedPredictions.length > (user ? FREE_PICKS_LIMIT * 2 : FREE_PICKS_LIMIT) && (
          <div className="mt-8 glass-card p-6 text-center bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <Zap className="h-5 w-5" />
              <span className="font-bold">Unlock All {sortedPredictions.length} Predictions</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {user ? 'Upgrade to Pro' : 'Sign up free'} to see all predictions and maximize your edge.
            </p>
            <div className="flex items-center justify-center gap-3">
              {!user && (
                <Link to="/signup">
                  <Button variant="outline">Sign Up Free</Button>
                </Link>
              )}
              <Link to="/pricing">
                <Button className="btn-gradient gap-2">
                  <Zap className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Predictions;
