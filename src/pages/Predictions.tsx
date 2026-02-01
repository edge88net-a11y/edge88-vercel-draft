import { useState, useMemo } from 'react';
import { Filter, RefreshCw, Zap, Loader2, Grid3X3, List, Search, ArrowUpDown, Flame, TrendingUp, Target, Trophy } from 'lucide-react';
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
  { label: 'All', min: 0, icon: null },
  { label: '🔒 Lock 75%+', min: 75, color: 'success' },
  { label: '🔥 High 65%+', min: 65, color: 'warning' },
  { label: '📊 Medium 55%+', min: 55, color: 'orange' },
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

  // Calculate stats
  const stats = useMemo(() => {
    const total = activePredictions.length;
    const highConfidence = activePredictions.filter(p => normalizeConfidence(p.confidence) >= 70).length;
    const locks = activePredictions.filter(p => normalizeConfidence(p.confidence) >= 75).length;
    return { total, highConfidence, locks };
  }, [activePredictions]);

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
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black tracking-tight">{t.predictions}</h1>
                <div className="live-badge">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  <span>LIVE</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                {t.aiPoweredPicks}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-border p-1 bg-card">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'rounded-lg p-2.5 transition-all duration-200',
                    viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'rounded-lg p-2.5 transition-all duration-200',
                    viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isFetching}
                className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? t.loading : t.refresh}
              </Button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="stat-card flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-foreground">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Active Picks</div>
              </div>
            </div>
            <div className="stat-card flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/20">
                <Flame className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-success">{stats.highConfidence}</div>
                <div className="text-xs text-muted-foreground">High Confidence</div>
              </div>
            </div>
            <div className="stat-card flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20">
                <Trophy className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-warning">{stats.locks}</div>
                <div className="text-xs text-muted-foreground">🔒 Locks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`${t.search} teams...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-card border-border focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.sortBy}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              {translatedSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button variant="outline" size="icon" onClick={toggleSortOrder} className="border-border hover:border-primary hover:bg-primary/10">
              <ArrowUpDown className={cn('h-4 w-4', sortOrder === 'asc' && 'rotate-180')} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card mb-8 p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-semibold">{t.filter}</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {/* Sport Filter */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t.sport}
              </label>
              <div className="flex flex-wrap gap-2">
                {sports.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200',
                      selectedSport === sport
                        ? 'filter-chip-active'
                        : 'filter-chip'
                    )}
                  >
                    {sport !== 'All' && <span>{sportIcons[sport] || sportIcons[sport.toUpperCase()]}</span>}
                    {sport === 'All' ? t.all : sport}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Filter */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t.confidence}
              </label>
              <div className="flex flex-wrap gap-2">
                {confidenceLevels.map((level) => (
                  <button
                    key={level.label}
                    onClick={() => setSelectedConfidence(level.label)}
                    className={cn(
                      'rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200',
                      selectedConfidence === level.label
                        ? 'filter-chip-active'
                        : 'filter-chip'
                    )}
                  >
                    {level.label === 'All' ? t.all : level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t.type}
              </label>
              <div className="flex flex-wrap gap-2">
                {predictionTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      'rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200',
                      selectedType === type
                        ? 'filter-chip-active'
                        : 'filter-chip'
                    )}
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
            {t.showing} <span className="font-bold text-foreground">{filteredAndSortedPredictions.length}</span> {t.predictions.toLowerCase()}
            {!isPro && (
              <span className="ml-2 text-primary font-semibold">
                ({user ? FREE_PICKS_LIMIT * 2 : FREE_PICKS_LIMIT} {t.unlocked})
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success/10 text-success">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-xs font-semibold">{t.autoRefresh}</span>
            </div>
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
          <div className="glass-card-premium py-20 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">{t.noPredictions}</h3>
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
              className="mt-6 border-primary/30 hover:bg-primary/10 hover:border-primary"
            >
              {t.adjustFilters}
            </Button>
          </div>
        ) : null}

        {/* Subscription Gate Notice */}
        {!isPro && !isMaintenanceMode && filteredAndSortedPredictions.length > (user ? FREE_PICKS_LIMIT * 2 : FREE_PICKS_LIMIT) && (
          <div className="mt-8 glass-card-premium p-8 text-center relative overflow-hidden">
            {/* Glow background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-xl font-black text-foreground">{t.unlockAll} {filteredAndSortedPredictions.length} {t.predictions}</span>
              </div>
              <p className="text-muted-foreground mb-6">
                {user ? t.upgradeToSeeAll : t.signUpToSeeMore}
              </p>
              <div className="flex items-center justify-center gap-4">
                {!user && (
                  <Link to="/signup">
                    <Button variant="outline" className="h-12 px-6 border-primary/30 hover:bg-primary/10 hover:border-primary">{t.signUpFree}</Button>
                  </Link>
                )}
                <Link to="/pricing">
                  <Button className="btn-gradient h-12 px-8 gap-2">
                    <Zap className="h-4 w-4" />
                    {t.upgradeToPro}
                  </Button>
                </Link>
              </div>
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
