import { useState, useMemo, useEffect, useRef } from 'react';
import { Filter, RefreshCw, Zap, Grid3X3, List, Search, ArrowUpDown, Flame, Target, Trophy, Clock, Calendar } from 'lucide-react';
import { PredictionCardSimple } from '@/components/PredictionCardSimple';
import { PredictionCardSkeletonList } from '@/components/PredictionCardSkeleton';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { MaintenanceState } from '@/components/MaintenanceState';
import { SocialProofToast } from '@/components/SocialProofToast';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActivePredictions } from '@/hooks/usePredictions';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isAdminUser, hasFullAccess } from '@/lib/adminAccess';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { differenceInHours, isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const sports = ['All', 'NFL', 'NBA', 'NHL', 'MLB', 'Soccer', 'EPL', 'UFC'];
const confidenceLevels = [
  { label: 'All', labelCz: 'Vše', min: 0, icon: null },
  { label: '🔒 Lock 75%+', labelCz: '🔒 Lock 75%+', min: 75, color: 'gold' },
  { label: '🔥 High 65%+', labelCz: '🔥 High 65%+', min: 65, color: 'orange' },
  { label: '📊 Medium 55%+', labelCz: '📊 Medium 55%+', min: 55, color: 'cyan' },
];
const predictionTypes = ['All', 'Moneyline', 'Spread', 'Over/Under', 'Prop'];
const timeFilters = [
  { value: 'all', labelCz: 'Vše', labelEn: 'All' },
  { value: 'live', labelCz: 'Živě teď', labelEn: 'Live Now' },
  { value: 'today', labelCz: 'Dnes', labelEn: 'Today' },
  { value: 'tomorrow', labelCz: 'Zítra', labelEn: 'Tomorrow' },
  { value: 'week', labelCz: 'Tento týden', labelEn: 'This Week' },
];
const sortOptions = [
  { value: 'confidence', labelCz: 'Podle jistoty', labelEn: 'By Confidence' },
  { value: 'gameTime', labelCz: 'Podle času', labelEn: 'By Time' },
  { value: 'odds', labelCz: 'Podle kurzu', labelEn: 'By Odds' },
  { value: 'ev', labelCz: 'Podle hodnoty (EV)', labelEn: 'By EV' },
];

const FREE_PICKS_LIMIT = 3;

const Predictions = () => {
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedConfidence, setSelectedConfidence] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedTime, setSelectedTime] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('confidence');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [autoRefreshCounter, setAutoRefreshCounter] = useState(30);
  const [isSticky, setIsSticky] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const { data: predictions, isLoading, isError, refetch, isFetching, isMaintenanceMode } = useActivePredictions();

  // Admin and Elite users have full access - never see locked content
  const isAdmin = isAdminUser(user?.email);
  const isPro = hasFullAccess(user?.email, profile?.subscription_tier) || 
                profile?.subscription_tier === 'pro' || 
                profile?.subscription_tier === 'elite';

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoRefreshCounter(prev => {
        if (prev <= 1) {
          refetch();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Sticky filters on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (filtersRef.current) {
        const rect = filtersRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 80);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRefresh = () => {
    refetch();
    setAutoRefreshCounter(30);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Deduplicate predictions by game
  const allPredictions = useMemo(() => {
    if (!predictions || predictions.length === 0) return [];
    
    const seenGames = new Map<string, typeof predictions[0]>();
    
    predictions.forEach(p => {
      const key = `${p.homeTeam}-${p.awayTeam}-${p.gameTime.split('T')[0]}`;
      const existing = seenGames.get(key);
      if (!existing || new Date(p.gameTime) > new Date(existing.gameTime)) {
        seenGames.set(key, p);
      }
    });
    
    return Array.from(seenGames.values());
  }, [predictions]);

  // Check for live games
  const hasLiveGames = useMemo(() => {
    return allPredictions.some(p => {
      const gameDate = new Date(p.gameTime);
      const now = new Date();
      const diffMs = now.getTime() - gameDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours < 4;
    });
  }, [allPredictions]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allPredictions.length;
    const highConfidence = allPredictions.filter(p => normalizeConfidence(p.confidence) >= 70).length;
    const locks = allPredictions.filter(p => normalizeConfidence(p.confidence) >= 75).length;
    return { total, highConfidence, locks };
  }, [allPredictions]);

  // Animated counters
  const animatedTotal = useAnimatedCounter(stats.total, { duration: 1200 });
  const animatedHighConf = useAnimatedCounter(stats.highConfidence, { duration: 1200, delay: 100 });
  const animatedLocks = useAnimatedCounter(stats.locks, { duration: 1200, delay: 200 });

  const filteredAndSortedPredictions = useMemo(() => {
    let filtered = allPredictions.filter((prediction) => {
      const sportName = prediction.sport?.includes('-') 
        ? getSportFromTeams(prediction.homeTeam, prediction.awayTeam)
        : prediction.sport;
      const normalizedConfidence = normalizeConfidence(prediction.confidence);
      const gameDate = new Date(prediction.gameTime);
      const now = new Date();
      
      // Sport filter
      if (selectedSport !== 'All') {
        const sportMatch = (sportName || '').toLowerCase();
        const filterMatch = selectedSport.toLowerCase();
        if (!sportMatch.includes(filterMatch) && !filterMatch.includes(sportMatch)) {
          return false;
        }
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

      // Time filter
      if (selectedTime !== 'all') {
        const diffMs = now.getTime() - gameDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const isLive = diffHours >= 0 && diffHours < 4;
        
        if (selectedTime === 'live' && !isLive) return false;
        if (selectedTime === 'today' && !isToday(gameDate)) return false;
        if (selectedTime === 'tomorrow' && !isTomorrow(gameDate)) return false;
        if (selectedTime === 'week') {
          const weekStart = startOfWeek(now, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
          if (!isWithinInterval(gameDate, { start: weekStart, end: weekEnd })) return false;
        }
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
        case 'odds':
          const oddsA = parseFloat(a.prediction.odds.replace('+', '')) || 0;
          const oddsB = parseFloat(b.prediction.odds.replace('+', '')) || 0;
          comparison = oddsA - oddsB;
          break;
        case 'ev':
          const evA = typeof a.expectedValue === 'string' ? parseFloat(a.expectedValue) : a.expectedValue;
          const evB = typeof b.expectedValue === 'string' ? parseFloat(b.expectedValue) : b.expectedValue;
          comparison = evA - evB;
          break;
        default:
          comparison = normalizeConfidence(b.confidence) - normalizeConfidence(a.confidence);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [allPredictions, selectedSport, selectedConfidence, selectedType, selectedTime, searchQuery, sortBy, sortOrder]);

  // Admin users NEVER see locked predictions
  const shouldLockPrediction = (index: number) => {
    if (isAdmin) return false;
    if (isPro) return false;
    if (user) return index >= FREE_PICKS_LIMIT * 2;
    return index >= FREE_PICKS_LIMIT;
  };

  // Get translated sort options
  const translatedSortOptions = sortOptions.map(opt => ({
    value: opt.value,
    label: language === 'cz' ? opt.labelCz : opt.labelEn
  }));

  return (
    <div className="space-y-6">
      {/* SEO Meta Tags */}
      <SEOHead 
        title={language === 'cz' ? 'Dnešní predikce' : "Today's Predictions"}
        description={language === 'cz' 
          ? 'Aktuální sportovní predikce poháněné AI. NHL, NBA, fotbal, UFC tipy s detailní analýzou.'
          : 'Current AI-powered sports predictions. NHL, NBA, soccer, UFC picks with detailed analysis.'}
        url="/predictions"
      />
      
      {/* Social Proof Toast */}
      <SocialProofToast />

      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tight">{t.predictions}</h1>
              <div className="live-badge flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/20 border border-success/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-xs font-bold text-success">LIVE</span>
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

        {/* Animated gradient line */}
        <div className="h-1 rounded-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500 animate-premium-shimmer mb-6" />

        {/* Quick Stats Row - Animated */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="stat-card flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-l-4 border-l-primary hover:scale-[1.02] transition-transform">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/20 shrink-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-lg sm:text-2xl font-black text-foreground stat-glow-cyan">{Math.round(animatedTotal)}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{language === 'cz' ? 'Aktivní tipy' : 'Active Picks'}</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-l-4 border-l-success hover:scale-[1.02] transition-transform">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-success/20 shrink-0">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-lg sm:text-2xl font-black text-success stat-glow-green">{Math.round(animatedHighConf)}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{language === 'cz' ? 'Vysoká jistota' : 'High Conf.'}</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-l-4 border-l-warning hover:scale-[1.02] transition-transform">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-warning/20 shrink-0">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-lg sm:text-2xl font-black text-warning stat-glow-gold">{Math.round(animatedLocks)}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">🔒 Locks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="mb-4 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`${t.search} teams...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 sm:pl-11 h-11 sm:h-12 bg-card border-border focus:border-primary text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs sm:text-sm text-muted-foreground shrink-0">{t.sortBy}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 sm:flex-none rounded-xl border border-border bg-card px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:border-primary focus:outline-none min-h-[44px]"
          >
            {translatedSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon" onClick={toggleSortOrder} className="border-border hover:border-primary hover:bg-primary/10 h-11 w-11 shrink-0">
            <ArrowUpDown className={cn('h-4 w-4', sortOrder === 'asc' && 'rotate-180')} />
          </Button>
        </div>
      </div>

      {/* Filters - Sticky on scroll */}
      <div 
        ref={filtersRef}
        className={cn(
          "glass-card mb-6 sm:mb-8 p-3 sm:p-5 transition-all duration-300",
          isSticky && "sticky top-20 z-40 shadow-lg shadow-primary/5 border-primary/20"
        )}
      >
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-semibold">{t.filter}</span>
          </div>
          {/* Auto-refresh indicator with animated ring */}
          <div className="flex items-center gap-2 text-xs">
            <div className="relative h-6 w-6">
              <svg className="h-6 w-6 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted/30"
                />
                <circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${(autoRefreshCounter / 30) * 94} 94`}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000"
                />
              </svg>
            </div>
            <span className="text-muted-foreground">
              {language === 'cz' ? `Auto-obnovení za ${autoRefreshCounter}s` : `Auto-refresh in ${autoRefreshCounter}s`}
            </span>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-0 sm:grid sm:gap-5 sm:grid-cols-4">
          {/* Sport Filter */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t.sport}
            </label>
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide -mx-1 px-1">
              {sports.map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={cn(
                    'flex items-center gap-1 sm:gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 min-h-[44px]',
                    selectedSport === sport
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'filter-chip hover:bg-muted'
                  )}
                >
                  {sport !== 'All' && <span className="text-base">{getSportEmoji(sport)}</span>}
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
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide -mx-1 px-1">
              {confidenceLevels.map((level) => (
                <button
                  key={level.label}
                  onClick={() => setSelectedConfidence(level.label)}
                  className={cn(
                    'rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 min-h-[44px]',
                    selectedConfidence === level.label && level.color === 'gold' && 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/20',
                    selectedConfidence === level.label && level.color === 'orange' && 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-lg shadow-orange-500/20',
                    selectedConfidence === level.label && level.color === 'cyan' && 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20',
                    selectedConfidence === level.label && !level.color && 'bg-primary text-primary-foreground',
                    selectedConfidence !== level.label && 'filter-chip hover:bg-muted'
                  )}
                >
                  {level.label === 'All' ? t.all : level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Filter - NEW */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              ⏰ {language === 'cz' ? 'Čas' : 'Time'}
            </label>
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide -mx-1 px-1">
              {timeFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedTime(filter.value)}
                  className={cn(
                    'flex items-center gap-1 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 min-h-[44px]',
                    filter.value === 'live' && hasLiveGames && selectedTime !== 'live' && 'border-2 border-red-500/50',
                    selectedTime === filter.value && filter.value === 'live' && 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/20',
                    selectedTime === filter.value && filter.value !== 'live' && 'bg-primary text-primary-foreground',
                    selectedTime !== filter.value && 'filter-chip hover:bg-muted'
                  )}
                >
                  {filter.value === 'live' && (
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                  {language === 'cz' ? filter.labelCz : filter.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t.type}
            </label>
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide -mx-1 px-1">
              {predictionTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    'rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 min-h-[44px]',
                    selectedType === type
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'filter-chip hover:bg-muted'
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
      <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t.showing} <span className="font-bold text-foreground">{filteredAndSortedPredictions.length}</span> {t.predictions.toLowerCase()}
          {!isPro && (
            <span className="ml-1 sm:ml-2 text-primary font-semibold">
              ({user ? FREE_PICKS_LIMIT * 2 : FREE_PICKS_LIMIT} {t.unlocked})
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-success/10 text-success">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-semibold">{t.autoRefresh}</span>
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
          'grid gap-4 md:gap-6',
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr' 
            : 'grid-cols-1'
        )}>
          <PredictionCardSkeletonList count={6} />
        </div>
      ) : !isMaintenanceMode && filteredAndSortedPredictions.length > 0 ? (
        <div className={cn(
          'grid gap-4 md:gap-6',
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr' 
            : 'grid-cols-1'
        )}>
          {filteredAndSortedPredictions.map((prediction, index) => {
            const isLocked = shouldLockPrediction(index);
            return (
              <SubscriptionGate key={prediction.id} isLocked={isLocked}>
                <PredictionCardSimple 
                  prediction={prediction} 
                  gameNumber={index + 1}
                  isLocked={isLocked}
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
              setSelectedTime('all');
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
    </div>
  );
};

export default Predictions;
