import { useState, useMemo } from 'react';
import { Filter, RefreshCw, Zap, Loader2, Grid3X3, List, Search, ArrowUpDown } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { PredictionCard } from '@/components/PredictionCard';
import { PredictionCardSkeletonList } from '@/components/PredictionCardSkeleton';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { MaintenanceState } from '@/components/MaintenanceState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActivePredictions } from '@/hooks/usePredictions';
import { sportIcons } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
const sortOptions = [
  { value: 'confidence', labelKey: 'confidence' },
  { value: 'gameTime', labelKey: 'type' },
  { value: 'sport', labelKey: 'sport' },
];

const FREE_PICKS_LIMIT = 3;

const Predictions = () => {
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedConfidence, setSelectedConfidence] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('confidence');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { data: predictions, isLoading, isError, refetch, isFetching, isMaintenanceMode } = useActivePredictions();

  const isPro = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'elite';

  const handleRefresh = () => {
    refetch();
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const activePredictions = predictions?.filter((p) => p.result === 'pending') || [];

  // Helper to normalize confidence to 0-100 range
  const normalizeConfidence = (confidence: number) => {
    return confidence <= 1 ? confidence * 100 : confidence;
  };

  const filteredAndSortedPredictions = useMemo(() => {
    let filtered = activePredictions.filter((prediction) => {
      const sportKey = prediction.sport?.toUpperCase() || prediction.sport;
      const normalizedConfidence = normalizeConfidence(prediction.confidence);
      
      // Sport filter
      if (selectedSport !== 'All' && sportKey !== selectedSport && prediction.sport !== selectedSport) {
        return false;
      }
      
      // Confidence filter
      const confidenceFilter = confidenceLevels.find((c) => c.label === selectedConfidence);
      if (confidenceFilter && normalizedConfidence < confidenceFilter.min) {
        return false;
      }
      
      // Type filter
      if (selectedType !== 'All' && prediction.prediction.type !== selectedType) {
        return false;
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesHome = prediction.homeTeam.toLowerCase().includes(query);
        const matchesAway = prediction.awayTeam.toLowerCase().includes(query);
        const matchesPick = prediction.prediction.pick.toLowerCase().includes(query);
        if (!matchesHome && !matchesAway && !matchesPick) {
          return false;
        }
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'confidence':
          comparison = normalizeConfidence(a.confidence) - normalizeConfidence(b.confidence);
          break;
        case 'gameTime':
          comparison = new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime();
          break;
        case 'sport':
          comparison = a.sport.localeCompare(b.sport);
          break;
        default:
          comparison = normalizeConfidence(b.confidence) - normalizeConfidence(a.confidence);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [activePredictions, selectedSport, selectedConfidence, selectedType, searchQuery, sortBy, sortOrder]);

  const shouldLockPrediction = (index: number) => {
    if (isPro) return false;
    if (user) return index >= FREE_PICKS_LIMIT * 2; // Logged in users get 6
    return index >= FREE_PICKS_LIMIT; // Non-logged in get 3
  };

  // Get translated sort options
  const translatedSortOptions = [
    { value: 'confidence', label: t.confidence },
    { value: 'gameTime', label: 'Game Time' },
    { value: 'sport', label: t.sport },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{t.predictions}</h1>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                {activePredictions.length} {t.active}
              </span>
            </div>
            <p className="mt-2 text-muted-foreground">
              {t.aiPoweredPicks}
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
              {isFetching ? t.loading : t.refresh}
            </Button>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`${t.search} teams...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.sortBy}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {translatedSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button variant="ghost" size="icon" onClick={toggleSortOrder}>
              <ArrowUpDown className={cn('h-4 w-4', sortOrder === 'asc' && 'rotate-180')} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card mb-8 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Filter className="h-4 w-4" />
            {t.filter}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Sport Filter */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.sport}
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
                    {sport === 'All' ? t.all : sport}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Filter */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.confidence}
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
                    {level.label === 'All' ? t.all : level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.type}
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
                    {type === 'All' ? t.all : type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t.showing} <span className="font-medium text-foreground">{filteredAndSortedPredictions.length}</span> {t.predictions.toLowerCase()}
            {!isPro && (
              <span className="ml-2 text-primary">
                ({user ? FREE_PICKS_LIMIT * 2 : FREE_PICKS_LIMIT} {t.unlocked})
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            {t.autoRefresh}
          </div>
        </div>

        {/* Maintenance State */}
        {isMaintenanceMode && (
          <div className="py-8">
            <MaintenanceState 
              onRetry={() => refetch()}
              title="Crunching the Latest Data"
              subtitle="Our AI is analyzing real-time odds, injury reports, and sharp money movements. Predictions will be available shortly."
              autoRetrySeconds={30}
            />
          </div>
        )}

        {/* Predictions Grid */}
        {isLoading && !isMaintenanceMode ? (
          <div className={cn(
            'grid gap-6',
            viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            <PredictionCardSkeletonList count={6} />
          </div>
        ) : !isMaintenanceMode && filteredAndSortedPredictions.length > 0 ? (
          <div className={cn(
            'grid gap-6',
            viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {filteredAndSortedPredictions.map((prediction, index) => {
              const isLocked = shouldLockPrediction(index);
              return (
                <SubscriptionGate key={prediction.id} isLocked={isLocked}>
                  <PredictionCard 
                    prediction={prediction} 
                    gameNumber={index + 1}
                  />
                </SubscriptionGate>
              );
            })}
          </div>
        ) : !isMaintenanceMode ? (
          <div className="glass-card py-16 text-center">
            <Zap className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">{t.noPredictions}</h3>
            <p className="mt-2 text-muted-foreground">
              {t.noPredictionsDesc}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSport('All');
                setSelectedConfidence('All');
                setSelectedType('All');
                setSearchQuery('');
              }}
              className="mt-4"
            >
              {t.adjustFilters}
            </Button>
          </div>
        ) : null}

        {/* Subscription Gate Notice */}
        {!isPro && !isMaintenanceMode && filteredAndSortedPredictions.length > (user ? FREE_PICKS_LIMIT * 2 : FREE_PICKS_LIMIT) && (
          <div className="mt-8 glass-card p-6 text-center bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <Zap className="h-5 w-5" />
              <span className="font-bold">{t.unlockAll} {filteredAndSortedPredictions.length} {t.predictions}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {user ? t.upgradeToSeeAll : t.signUpToSeeMore}
            </p>
            <div className="flex items-center justify-center gap-3">
              {!user && (
                <Link to="/signup">
                  <Button variant="outline">{t.signUpFree}</Button>
                </Link>
              )}
              <Link to="/pricing">
                <Button className="btn-gradient gap-2">
                  <Zap className="h-4 w-4" />
                  {t.upgradeToPro}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Predictions;
