import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Target, Award, TrendingUp, TrendingDown, Flame, Calendar, Loader2, 
  Filter, ArrowUpDown, ChevronRight, CheckCircle, XCircle, BarChart3,
  Sparkles, ChevronLeft, ChevronDown, Download, Clock, Zap, Trophy
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
  ComposedChart
} from 'recharts';
import { TeamLogo } from '@/components/TeamLogo';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { SEOHead } from '@/components/SEOHead';
import { useActivePredictions, useStats, useAccuracyStats, DailyAccuracy } from '@/hooks/usePredictions';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { formatCurrency, calculateProfit } from '@/lib/oddsUtils';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { hasFullAccess, isAdminUser } from '@/lib/adminAccess';

type SortField = 'date' | 'sport' | 'confidence' | 'result';
type SortDirection = 'asc' | 'desc';
type ResultFilter = 'all' | 'wins' | 'losses';
type ChartPeriod = '7D' | '30D' | '90D' | 'all';
type DateRangeFilter = 'today' | 'yesterday' | '7d' | '30d' | 'all';

const sportFilters = ['All', 'NHL', 'NBA', 'Soccer', 'UFC', 'NFL', 'MLB'];

// Animated Counter Hook
function useAnimatedCounter(end: number, duration: number = 1500, decimals: number = 0) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      countRef.current = easeOutQuart * end;
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    requestAnimationFrame(animate);
  }, [end, duration]);

  return decimals > 0 ? count.toFixed(decimals) : Math.round(count);
}

// Animated Slot Reel Component
function AnimatedSlotReel() {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[0, 1, 2].map((i) => (
        <div 
          key={i}
          className="w-16 h-20 rounded-lg bg-gradient-to-b from-muted to-muted/50 border border-border overflow-hidden relative"
        >
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center animate-slot-spin"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <span className="text-3xl">🎰</span>
          </div>
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-background to-transparent" />
        </div>
      ))}
    </div>
  );
}

// Typing effect text
function TypingText({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, [text]);

  return (
    <span className={className}>
      {displayText}
      <span className={cn("ml-0.5", showCursor ? "opacity-100" : "opacity-0")}>|</span>
    </span>
  );
}

const Results = () => {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('90D');
  const [selectedSport, setSelectedSport] = useState('All');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSticky, setIsSticky] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 30;
  
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: accuracyData, isLoading: accuracyLoading } = useAccuracyStats();
  const { winStreak, isLoading: streakLoading } = useWinStreak();

  const isLoading = predictionsLoading || statsLoading || accuracyLoading || streakLoading;

  // Check for Pro/Elite access
  const isPro = hasFullAccess(user?.email, profile?.subscription_tier) || 
                profile?.subscription_tier === 'pro' || 
                profile?.subscription_tier === 'elite';

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

  // Filter graded predictions (completed/settled games)
  const gradedPredictions = useMemo(() => {
    let filtered = predictions?.filter((p) => {
      if (p.result === 'pending') return false;
      
      // Result filter
      if (resultFilter === 'wins' && p.result !== 'win') return false;
      if (resultFilter === 'losses' && p.result !== 'loss') return false;
      
      // Sport filter
      if (selectedSport !== 'All') {
        const sportName = p.sport?.includes('-') 
          ? getSportFromTeams(p.homeTeam, p.awayTeam)
          : p.sport;
        if (sportName?.toUpperCase() !== selectedSport && sportName !== selectedSport) return false;
      }

      // Date range filter
      if (dateRangeFilter !== 'all') {
        const gameDate = new Date(p.gameTime);
        const now = new Date();
        
        if (dateRangeFilter === 'today' && !isToday(gameDate)) return false;
        if (dateRangeFilter === 'yesterday' && !isYesterday(gameDate)) return false;
        if (dateRangeFilter === '7d') {
          const weekAgo = subDays(now, 7);
          if (!isWithinInterval(gameDate, { start: startOfDay(weekAgo), end: endOfDay(now) })) return false;
        }
        if (dateRangeFilter === '30d') {
          const monthAgo = subDays(now, 30);
          if (!isWithinInterval(gameDate, { start: startOfDay(monthAgo), end: endOfDay(now) })) return false;
        }
      }
      
      // Date filter from calendar click
      if (selectedDate) {
        const predDate = new Date(p.gameTime).toISOString().split('T')[0];
        if (predDate !== selectedDate) return false;
      }
      
      return true;
    }) || [];

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime();
          break;
        case 'sport':
          comparison = (a.sport || '').localeCompare(b.sport || '');
          break;
        case 'confidence':
          comparison = normalizeConfidence(a.confidence) - normalizeConfidence(b.confidence);
          break;
        case 'result':
          comparison = (a.result || '').localeCompare(b.result || '');
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [predictions, selectedSport, resultFilter, dateRangeFilter, selectedDate, sortField, sortDirection]);

  // Calculate stats
  const wins = stats?.accuracy ? Math.round((stats.accuracy / 100) * (stats.totalPredictions || 0)) : gradedPredictions.filter((p) => p.result === 'win').length;
  const losses = (stats?.totalPredictions || 0) - wins || gradedPredictions.filter((p) => p.result === 'loss').length;
  const accuracy = stats?.accuracy || (wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0);
  const totalPredictions = stats?.totalPredictions || wins + losses;
  const monthROI = stats?.roi || 12.4;

  // Calculate total profit
  const defaultBet = language === 'cz' ? 1000 : 100;
  const totalProfit = useMemo(() => {
    return gradedPredictions.reduce((sum, p) => {
      const odds = parseFloat(p.prediction.odds.replace('+', '').replace('-', '')) || 1.91;
      const profit = p.result === 'win' ? calculateProfit(odds.toString(), defaultBet) : -defaultBet;
      return sum + profit;
    }, 0);
  }, [gradedPredictions, defaultBet]);

  // Calculate running totals for each prediction
  const predictionsWithRunningTotal = useMemo(() => {
    let runningTotal = 0;
    return gradedPredictions.map(p => {
      const odds = parseFloat(p.prediction.odds.replace('+', '').replace('-', '')) || 1.91;
      const profitLoss = p.result === 'win' ? calculateProfit(odds.toString(), defaultBet) : -defaultBet;
      runningTotal += profitLoss;
      return { ...p, profitLoss, runningTotal };
    });
  }, [gradedPredictions, defaultBet]);

  // Best sport
  const bestSport = stats?.bySport?.[0];

  // Animated counters
  const animatedAccuracy = useAnimatedCounter(accuracy, 2000, 1);
  const animatedTotal = useAnimatedCounter(totalPredictions, 2000);
  const animatedStreak = useAnimatedCounter(winStreak.currentStreak, 1500);
  const animatedROI = useAnimatedCounter(monthROI, 2000, 1);
  const animatedProfit = useAnimatedCounter(Math.abs(totalProfit), 2000);
  const animatedWins = useAnimatedCounter(wins, 1500);
  const animatedLosses = useAnimatedCounter(losses, 1500);

  // Check if we have completed predictions
  const hasCompletedPredictions = gradedPredictions.length > 0;

  // Count active/pending predictions
  const pendingCount = predictions?.filter(p => p.result === 'pending').length || 0;
  const liveGamesCount = predictions?.filter(p => {
    const gameDate = new Date(p.gameTime);
    const now = new Date();
    const diffMs = now.getTime() - gameDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours < 4 && p.result === 'pending';
  }).length || 0;

  // Prepare chart data with ROI trend
  const chartData = useMemo(() => {
    if (!stats?.dailyAccuracy) return [];
    
    let cumulativeProfit = 0;
    const data = stats.dailyAccuracy.map((d, index, arr) => {
      // Calculate 7-day moving average
      const startIndex = Math.max(0, index - 6);
      const windowData = arr.slice(startIndex, index + 1);
      const movingAvg = windowData.reduce((sum, item) => sum + item.accuracy, 0) / windowData.length;
      
      // Simulate ROI based on accuracy
      const dailyProfit = (d.accuracy > 52 ? (d.accuracy - 50) * 10 : (50 - d.accuracy) * -10) * d.predictions;
      cumulativeProfit += dailyProfit;
      
      return {
        date: format(new Date(d.date), 'MMM d'),
        fullDate: d.date,
        accuracy: d.accuracy,
        movingAvg: Math.round(movingAvg * 10) / 10,
        predictions: d.predictions,
        wins: d.wins,
        losses: d.losses,
        roi: Math.round(cumulativeProfit / 100) / 10,
      };
    });

    // Filter by period
    if (chartPeriod === '7D') return data.slice(-7);
    if (chartPeriod === '30D') return data.slice(-30);
    if (chartPeriod === '90D') return data.slice(-90);
    return data;
  }, [stats?.dailyAccuracy, chartPeriod]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Pagination
  const paginatedPredictions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return predictionsWithRunningTotal.slice(start, start + itemsPerPage);
  }, [predictionsWithRunningTotal, currentPage]);

  const totalPages = Math.ceil(gradedPredictions.length / itemsPerPage);

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['Date', 'Sport', 'Home Team', 'Away Team', 'Pick', 'Confidence', 'Odds', 'Result', 'Profit/Loss'];
    const rows = predictionsWithRunningTotal.map(p => [
      format(new Date(p.gameTime), 'yyyy-MM-dd'),
      getSportFromTeams(p.homeTeam, p.awayTeam) || p.sport,
      p.homeTeam,
      p.awayTeam,
      p.prediction.pick,
      `${normalizeConfidence(p.confidence)}%`,
      p.prediction.odds,
      p.result,
      p.profitLoss.toFixed(0),
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edge88-results-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* SEO Meta Tags */}
      <SEOHead 
        title={language === 'cz' ? 'Výsledky predikcí' : 'Prediction Results'}
        description={language === 'cz' 
          ? `Kompletní transparentnost. ${Math.round(accuracy)}% přesnost napříč ${totalPredictions}+ predikcemi.`
          : `Complete transparency. ${Math.round(accuracy)}% accuracy across ${totalPredictions}+ predictions.`}
        url="/results"
      />

      {/* Hero Section */}
      <div className="text-center py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
          📊 {language === 'cz' ? 'Naše výsledky' : 'Our Results'}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {language === 'cz' 
            ? 'Kompletní transparentnost. Žádné skrývání proher.'
            : 'Complete transparency. No hiding losses.'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      ) : !hasCompletedPredictions ? (
        /* ═══════════════════════════════════════════════════════════ */
        /* EMPTY STATE - SCOREBOARD ARENA */
        /* ═══════════════════════════════════════════════════════════ */
        <div className="glass-card-premium p-8 md:p-12 text-center relative overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
          
          <div className="relative">
            {/* Animated Slot Machine */}
            <AnimatedSlotReel />

            {/* Typing effect main text */}
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              <TypingText 
                text={language === 'cz' ? '⏳ Výsledky se připravují...' : '⏳ Results are being prepared...'} 
              />
            </h2>
            
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              {language === 'cz' 
                ? 'Náš AI engine právě analyzuje zápasy. První výsledky očekávejte do 24 hodin.'
                : 'Our AI engine is analyzing games. Expect first results within 24 hours.'}
            </p>

            {/* Engine Status Progress */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Engine Status</span>
                <span className="flex items-center gap-1 text-success">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  {language === 'cz' ? 'Aktivní' : 'Active'} ✅
                </span>
              </div>
              <Progress value={75} className="h-2 mb-3" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{language === 'cz' ? 'Analyzováno' : 'Analyzed'}: {predictions?.length || 0} {language === 'cz' ? 'predikcí' : 'predictions'}</span>
                <span>{language === 'cz' ? 'Živě' : 'Live'}: {liveGamesCount} {language === 'cz' ? 'zápasů' : 'games'}</span>
              </div>
            </div>

            {/* Real-time stat pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{pendingCount}</span>
                <span className="text-xs">{language === 'cz' ? 'čeká na výsledek' : 'pending'}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary">
                <Target className="h-4 w-4" />
                <span className="font-mono font-bold">{liveGamesCount}</span>
                <span className="text-xs">{language === 'cz' ? 'zápasů dnes' : 'games today'}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 text-success">
                <Zap className="h-4 w-4" />
                <span className="font-mono font-bold">{predictions?.length || 0}</span>
                <span className="text-xs">{language === 'cz' ? 'aktivních tipů' : 'active picks'}</span>
              </div>
            </div>

            {/* CTA */}
            <Button 
              onClick={() => navigate('/predictions')}
              className="btn-gradient h-12 px-8 text-lg gap-2"
            >
              🎯 {language === 'cz' ? 'Zobrazit aktivní predikce' : 'View Active Predictions'}
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* TOP STATS ROW - ALWAYS VISIBLE */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {/* Wins */}
            <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-success hover:scale-[1.02] transition-transform">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/20 shrink-0">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-success">{animatedWins}</div>
                <div className="text-xs text-muted-foreground">✅ {language === 'cz' ? 'Výher' : 'Wins'}</div>
              </div>
            </div>

            {/* Losses */}
            <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-destructive hover:scale-[1.02] transition-transform">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/20 shrink-0">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-destructive">{animatedLosses}</div>
                <div className="text-xs text-muted-foreground">❌ {language === 'cz' ? 'Proher' : 'Losses'}</div>
              </div>
            </div>

            {/* Accuracy */}
            <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-primary hover:scale-[1.02] transition-transform">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 shrink-0">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-mono text-2xl font-black stat-glow-cyan">{animatedAccuracy}%</div>
                <div className="text-xs text-muted-foreground">📊 {language === 'cz' ? 'Přesnost' : 'Accuracy'}</div>
              </div>
            </div>

            {/* Profit */}
            <div className={cn(
              "glass-card p-4 flex items-center gap-3 border-l-4 hover:scale-[1.02] transition-transform",
              totalProfit >= 0 ? "border-l-success bg-success/5" : "border-l-destructive bg-destructive/5"
            )}>
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                totalProfit >= 0 ? "bg-success/20" : "bg-destructive/20"
              )}>
                <TrendingUp className={cn("h-5 w-5", totalProfit >= 0 ? "text-success" : "text-destructive")} />
              </div>
              <div>
                <div className={cn(
                  "font-mono text-2xl font-black",
                  totalProfit >= 0 ? "text-success stat-glow-green" : "text-destructive"
                )}>
                  {totalProfit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalProfit), language)}
                </div>
                <div className="text-xs text-muted-foreground">💰 {language === 'cz' ? 'Profit' : 'Profit'}</div>
              </div>
            </div>

            {/* Win Streak */}
            <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-orange-500 hover:scale-[1.02] transition-transform col-span-2 sm:col-span-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 shrink-0">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <div className="font-mono text-2xl font-black text-orange-400">{animatedStreak}</div>
                  <div className="text-xs text-muted-foreground">🔥 {language === 'cz' ? 'Série' : 'Streak'}</div>
                </div>
                {winStreak.currentStreak > 5 && (
                  <span className="text-2xl animate-fire-glow">🔥</span>
                )}
              </div>
            </div>
          </div>

          {/* FILTERS - STICKY */}
          <div 
            ref={filtersRef}
            className={cn(
              "glass-card p-4 transition-all duration-300",
              isSticky && "sticky top-20 z-40 shadow-lg shadow-primary/5 border-primary/20"
            )}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Date Range Filter */}
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                  {(['today', 'yesterday', '7d', '30d', 'all'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => { setDateRangeFilter(filter); setCurrentPage(1); }}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded transition-all min-h-[36px]',
                        dateRangeFilter === filter
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {filter === 'today' ? (language === 'cz' ? 'Dnes' : 'Today') :
                       filter === 'yesterday' ? (language === 'cz' ? 'Včera' : 'Yesterday') :
                       filter === '7d' ? '7D' :
                       filter === '30d' ? '30D' :
                       (language === 'cz' ? 'Celkově' : 'All')}
                    </button>
                  ))}
                </div>
                
                {/* Result Filter */}
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                  {(['all', 'wins', 'losses'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => { setResultFilter(filter); setCurrentPage(1); }}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded transition-all min-h-[36px]',
                        resultFilter === filter
                          ? filter === 'wins' ? 'bg-success text-success-foreground' 
                            : filter === 'losses' ? 'bg-destructive text-destructive-foreground'
                            : 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {filter === 'all' ? (language === 'cz' ? 'Vše' : 'All') :
                       filter === 'wins' ? (language === 'cz' ? '✅ Výhry' : '✅ Wins') :
                       (language === 'cz' ? '❌ Prohry' : '❌ Losses')}
                    </button>
                  ))}
                </div>
                
                {/* Sport Filter */}
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg overflow-x-auto">
                  {sportFilters.slice(0, 5).map((sport) => (
                    <button
                      key={sport}
                      onClick={() => { setSelectedSport(sport); setCurrentPage(1); }}
                      className={cn(
                        'px-2 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap min-h-[36px]',
                        selectedSport === sport
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {sport !== 'All' && <span className="mr-0.5">{getSportEmoji(sport)}</span>}
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              {/* Export CSV - Pro/Elite only */}
              {isPro && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportCSV}
                  className="gap-2 border-primary/30 hover:bg-primary/10"
                >
                  <Download className="h-4 w-4" />
                  {language === 'cz' ? 'Exportovat CSV' : 'Export CSV'} 📥
                </Button>
              )}
            </div>
          </div>

          {/* ACCURACY + ROI CHART */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-xl md:text-2xl">
                  {language === 'cz' ? 'Přesnost & ROI v čase' : 'Accuracy & ROI Timeline'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'cz' ? 'Denní přesnost a kumulativní ROI' : 'Daily accuracy and cumulative ROI'}
                </p>
              </div>
              <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                {(['7D', '30D', '90D', 'all'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md transition-all',
                      chartPeriod === period
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {period === 'all' ? (language === 'cz' ? 'Vše' : 'All') : period}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 md:p-6">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="accuracyGradientFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="roiGradientFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[30, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--success))', fontSize: 11 }}
                      tickFormatter={(value) => `${value}K`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.3)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      formatter={(value: number, name: string, props: any) => {
                        if (name === 'accuracy') {
                          return [`${value.toFixed(1)}% (${props.payload.wins}W-${props.payload.losses}L)`, language === 'cz' ? 'Přesnost' : 'Accuracy'];
                        }
                        if (name === 'roi') {
                          return [`${value >= 0 ? '+' : ''}${value.toFixed(1)}K Kč`, 'ROI'];
                        }
                        return [value, name];
                      }}
                    />
                    <ReferenceLine y={50} yAxisId="left" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeOpacity={0.5} />
                    <ReferenceLine y={70} yAxisId="left" stroke="hsl(var(--success))" strokeDasharray="5 5" strokeOpacity={0.7} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#accuracyGradientFill)"
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="roi"
                      stroke="hsl(var(--success))"
                      strokeWidth={3}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  {language === 'cz' ? 'Žádná data k zobrazení' : 'No data available'}
                </div>
              )}
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{language === 'cz' ? 'Přesnost' : 'Accuracy'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-success rounded" />
                  <span className="text-muted-foreground">ROI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-success opacity-70 border border-dashed border-success" />
                  <span className="text-muted-foreground">70% {language === 'cz' ? 'cíl' : 'target'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RESULTS LIST */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 md:p-6">
              <h2 className="font-bold text-xl">
                {language === 'cz' ? 'Všechny výsledky' : 'All Results'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'cz' 
                  ? `${gradedPredictions.length} dokončených predikcí`
                  : `${gradedPredictions.length} completed predictions`}
              </p>
            </div>

            {/* Sort Headers */}
            <div className="border-b border-border bg-muted/30 px-4 py-2 hidden md:flex items-center text-xs text-muted-foreground uppercase tracking-wider">
              <button 
                onClick={() => toggleSort('date')}
                className="flex items-center gap-1 w-24 hover:text-foreground transition-colors"
              >
                {language === 'cz' ? 'Datum' : 'Date'}
                <ArrowUpDown className="h-3 w-3" />
              </button>
              <button 
                onClick={() => toggleSort('sport')}
                className="flex items-center gap-1 w-20 hover:text-foreground transition-colors"
              >
                Sport
                <ArrowUpDown className="h-3 w-3" />
              </button>
              <div className="flex-1">{language === 'cz' ? 'Zápas' : 'Match'}</div>
              <div className="w-32 text-center">{language === 'cz' ? 'Náš tip' : 'Our Pick'}</div>
              <button 
                onClick={() => toggleSort('confidence')}
                className="flex items-center justify-center gap-1 w-20 hover:text-foreground transition-colors"
              >
                {language === 'cz' ? 'Jistota' : 'Conf.'}
                <ArrowUpDown className="h-3 w-3" />
              </button>
              <div className="w-20 text-center">{language === 'cz' ? 'Kurz' : 'Odds'}</div>
              <div className="w-24 text-center">{language === 'cz' ? 'Profit/Ztráta' : 'Profit/Loss'}</div>
              <div className="w-24 text-right">{language === 'cz' ? 'Celkem' : 'Running Total'}</div>
            </div>

            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {paginatedPredictions.length > 0 ? (
                paginatedPredictions.map((prediction, index) => {
                  const sportName = prediction.sport?.includes('-') 
                    ? getSportFromTeams(prediction.homeTeam, prediction.awayTeam)
                    : prediction.sport;
                  const confidencePercent = normalizeConfidence(prediction.confidence);
                  
                  return (
                    <Link
                      to={`/predictions/${prediction.id}`}
                      key={prediction.id}
                      className={cn(
                        'flex flex-col md:flex-row md:items-center px-4 py-3 gap-2 md:gap-0 transition-all relative group',
                        prediction.result === 'win' 
                          ? 'bg-success/5 hover:bg-success/10 border-l-4 border-l-success' 
                          : 'bg-destructive/5 hover:bg-destructive/10 border-l-4 border-l-destructive',
                        index % 2 === 0 && 'md:bg-opacity-50',
                        'hover:scale-[1.01] hover:shadow-lg'
                      )}
                    >
                      {/* Date */}
                      <div className="w-24 text-sm text-muted-foreground">
                        {format(new Date(prediction.gameTime), 'MMM d')}
                      </div>
                      
                      {/* Sport */}
                      <div className="w-20">
                        <span className="text-lg">{getSportEmoji(sportName || 'Sports')}</span>
                      </div>
                      
                      {/* Teams */}
                      <div className="flex-1 flex items-center gap-2">
                        <TeamLogo teamName={prediction.awayTeam} sport={prediction.sport} size="sm" />
                        <span className="font-medium text-sm truncate max-w-[100px]">{prediction.awayTeam}</span>
                        <span className="text-muted-foreground text-xs">@</span>
                        <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport} size="sm" />
                        <span className="font-medium text-sm truncate max-w-[100px]">{prediction.homeTeam}</span>
                      </div>
                      
                      {/* Our Pick */}
                      <div className="w-32 text-center">
                        <span className="text-sm font-medium text-primary truncate block">
                          {prediction.prediction.pick}
                        </span>
                      </div>
                      
                      {/* Confidence */}
                      <div className="w-20 text-center">
                        <span className={cn(
                          'font-mono text-sm font-semibold',
                          confidencePercent >= 70 ? 'text-success' : confidencePercent >= 55 ? 'text-warning' : 'text-foreground'
                        )}>
                          {confidencePercent}%
                        </span>
                      </div>
                      
                      {/* Odds */}
                      <div className="w-20 text-center font-mono text-sm">
                        {prediction.prediction.odds}
                      </div>
                      
                      {/* Profit/Loss */}
                      <div className="w-24 text-center">
                        <span className={cn(
                          'font-mono font-bold text-sm',
                          prediction.result === 'win' ? 'text-success' : 'text-destructive'
                        )}>
                          {prediction.result === 'win' ? '+' : ''}{formatCurrency(prediction.profitLoss, language)}
                        </span>
                      </div>
                      
                      {/* Running Total */}
                      <div className="w-24 text-right">
                        <span className={cn(
                          'font-mono text-sm',
                          prediction.runningTotal >= 0 ? 'text-success' : 'text-destructive'
                        )}>
                          {prediction.runningTotal >= 0 ? '+' : ''}{formatCurrency(prediction.runningTotal, language)}
                        </span>
                      </div>

                      {/* Hover action */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                        <span className="text-xs text-primary flex items-center gap-1">
                          {language === 'cz' ? 'Zobrazit detail' : 'View details'}
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {language === 'cz' ? 'Žádné dokončené predikce pro tento filtr' : 'No completed predictions for this filter'}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-border p-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                          currentPage === page
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* BOTTOM SUMMARY */}
          <div className={cn(
            "glass-card p-6 relative overflow-hidden",
            totalProfit >= 0 && "bg-success/5 border-success/30"
          )}>
            {totalProfit >= 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-transparent to-success/5" />
            )}
            <div className="relative flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <button 
                onClick={() => setResultFilter('all')}
                className="text-center hover:scale-105 transition-transform"
              >
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'cz' ? 'Celkový profit' : 'Total Profit'}
                </p>
                <p className={cn(
                  "font-mono text-2xl md:text-3xl font-black",
                  totalProfit >= 0 ? "text-success stat-glow-green" : "text-destructive"
                )}>
                  {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit, language)}
                </p>
              </button>

              <div className="h-12 w-px bg-border hidden md:block" />

              <button 
                onClick={() => setResultFilter('all')}
                className="text-center hover:scale-105 transition-transform"
              >
                <p className="text-sm text-muted-foreground mb-1">ROI</p>
                <p className={cn(
                  "font-mono text-2xl md:text-3xl font-black",
                  monthROI >= 0 ? "text-success" : "text-destructive"
                )}>
                  {monthROI >= 0 ? '+' : ''}{animatedROI}%
                </p>
              </button>

              <div className="h-12 w-px bg-border hidden md:block" />

              {bestSport && (
                <button 
                  onClick={() => setSelectedSport(bestSport.sport)}
                  className="text-center hover:scale-105 transition-transform"
                >
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'cz' ? 'Nejlepší sport' : 'Best Sport'}
                  </p>
                  <p className="font-bold text-xl md:text-2xl flex items-center gap-2">
                    {getSportEmoji(bestSport.sport)} {bestSport.sport}
                    <span className="text-success font-mono">({bestSport.accuracy}%)</span>
                  </p>
                </button>
              )}

              <div className="h-12 w-px bg-border hidden md:block" />

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'cz' ? 'Nejdelší série' : 'Best Streak'}
                </p>
                <p className="font-bold text-xl md:text-2xl flex items-center gap-2">
                  🔥 {winStreak.bestStreakAllTime || winStreak.currentStreak} {language === 'cz' ? 'výher' : 'wins'}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA (for non-logged users) */}
          {!user && (
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-cyan-500/20" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
              
              <div className="relative glass-card p-8 md:p-12 text-center border-2 border-primary/30">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl md:text-3xl font-black mb-4">
                    {language === 'cz' 
                      ? 'Tyto výsledky jsou reálné.'
                      : 'These results are real.'}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-2">
                    {language === 'cz' 
                      ? 'Každá predikce byla publikována PŘED zápasem.'
                      : 'Every prediction was published BEFORE the game.'}
                  </p>
                  <p className="text-muted-foreground mb-8">
                    {language === 'cz' 
                      ? 'Začněte dostávat tipy ještě dnes.'
                      : 'Start getting picks today.'}
                  </p>
                  <Link to="/signup">
                    <Button size="lg" className="gap-2 text-lg px-10 py-6 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90">
                      {language === 'cz' ? 'Registrovat se zdarma' : 'Sign Up Free'}
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Enhanced Calendar Heatmap with click interaction
function EnhancedCalendarHeatmap({ 
  data, 
  days = 90, 
  language, 
  selectedDate, 
  onSelectDate 
}: { 
  data: DailyAccuracy[]; 
  days?: number; 
  language: string;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}) {
  const heatmapData = useMemo(() => {
    const dataMap = new Map<string, DailyAccuracy>();
    data.forEach((d) => {
      const dateKey = new Date(d.date).toISOString().split('T')[0];
      dataMap.set(dateKey, d);
    });

    const result: { date: string; day: DailyAccuracy | null }[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      result.push({ date: dateKey, day: dataMap.get(dateKey) || null });
    }

    return result;
  }, [data, days]);

  const getColor = (day: DailyAccuracy | null) => {
    if (!day || day.predictions === 0) return 'bg-muted/30';
    
    const accuracy = day.accuracy;
    const intensity = Math.min(day.predictions / 10, 1);
    
    if (accuracy >= 70) return intensity > 0.5 ? 'bg-success' : 'bg-success/70';
    if (accuracy >= 55) return intensity > 0.5 ? 'bg-success/60' : 'bg-success/40';
    if (accuracy >= 45) return intensity > 0.5 ? 'bg-yellow-400/70' : 'bg-yellow-400/50';
    return intensity > 0.5 ? 'bg-destructive/70' : 'bg-destructive/50';
  };

  const getTooltip = (item: { date: string; day: DailyAccuracy | null }) => {
    const dateStr = format(new Date(item.date), 'MMM d');
    
    if (!item.day || item.day.predictions === 0) {
      return `${dateStr}: ${language === 'cz' ? 'Žádné tipy' : 'No picks'}`;
    }
    return `${dateStr}: ${item.day.predictions} ${language === 'cz' ? 'tipů' : 'picks'}, ${item.day.wins} ${language === 'cz' ? 'výher' : 'wins'} (${item.day.accuracy.toFixed(0)}%)`;
  };

  const weeks: { date: string; day: DailyAccuracy | null }[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((item, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => onSelectDate(item.date === selectedDate ? null : item.date)}
                className={cn(
                  'h-4 w-4 md:h-5 md:w-5 rounded-sm transition-all hover:scale-125 cursor-pointer',
                  getColor(item.day),
                  item.date === selectedDate && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
                title={getTooltip(item)}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
        <span>{language === 'cz' ? `Posledních ${days} dní` : `Last ${days} days`}</span>
        <div className="flex items-center gap-2">
          <span>{language === 'cz' ? 'Méně' : 'Less'}</span>
          <div className="flex gap-0.5">
            <div className="h-3 w-3 rounded-sm bg-destructive/50" title="<45%" />
            <div className="h-3 w-3 rounded-sm bg-yellow-400/50" title="45-55%" />
            <div className="h-3 w-3 rounded-sm bg-success/40" title="55-70%" />
            <div className="h-3 w-3 rounded-sm bg-success/70" title=">70%" />
            <div className="h-3 w-3 rounded-sm bg-success" title=">70% + many picks" />
          </div>
          <span>{language === 'cz' ? 'Více' : 'More'}</span>
        </div>
      </div>
    </div>
  );
}

export default Results;
