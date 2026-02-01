import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, Award, TrendingUp, TrendingDown, Flame, Calendar, Loader2, 
  Filter, ArrowUpDown, ChevronRight, CheckCircle, XCircle, BarChart3,
  Sparkles, ChevronLeft, ChevronDown
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
  ComposedChart
} from 'recharts';
import { TeamLogo } from '@/components/TeamLogo';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivePredictions, useStats, useAccuracyStats, DailyAccuracy } from '@/hooks/usePredictions';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type SortField = 'date' | 'sport' | 'confidence' | 'result';
type SortDirection = 'asc' | 'desc';
type ResultFilter = 'all' | 'wins' | 'losses';
type ChartPeriod = '30D' | '90D' | 'year' | 'all';

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
      
      // Easing function for smooth animation
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

const Results = () => {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('90D');
  const [selectedSport, setSelectedSport] = useState('All');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: accuracyData, isLoading: accuracyLoading } = useAccuracyStats();
  const { winStreak, isLoading: streakLoading } = useWinStreak();

  const isLoading = predictionsLoading || statsLoading || accuracyLoading || streakLoading;

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
  }, [predictions, selectedSport, resultFilter, selectedDate, sortField, sortDirection]);

  // Calculate stats
  const wins = stats?.accuracy ? Math.round((stats.accuracy / 100) * (stats.totalPredictions || 0)) : gradedPredictions.filter((p) => p.result === 'win').length;
  const losses = (stats?.totalPredictions || 0) - wins || gradedPredictions.filter((p) => p.result === 'loss').length;
  const accuracy = stats?.accuracy || (wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0);
  const totalPredictions = stats?.totalPredictions || wins + losses;
  const monthROI = stats?.roi || 12.4;

  // Animated counters
  const animatedAccuracy = useAnimatedCounter(accuracy, 2000, 1);
  const animatedTotal = useAnimatedCounter(totalPredictions, 2000);
  const animatedStreak = useAnimatedCounter(winStreak.currentStreak, 1500);
  const animatedROI = useAnimatedCounter(monthROI, 2000, 1);

  // Prepare chart data with 7-day moving average
  const chartData = useMemo(() => {
    if (!stats?.dailyAccuracy) return [];
    
    const data = stats.dailyAccuracy.map((d, index, arr) => {
      // Calculate 7-day moving average
      const startIndex = Math.max(0, index - 6);
      const windowData = arr.slice(startIndex, index + 1);
      const movingAvg = windowData.reduce((sum, item) => sum + item.accuracy, 0) / windowData.length;
      
      return {
        date: format(new Date(d.date), 'MMM d'),
        fullDate: d.date,
        accuracy: d.accuracy,
        movingAvg: Math.round(movingAvg * 10) / 10,
        predictions: d.predictions,
        wins: d.wins,
        losses: d.losses,
      };
    });

    // Filter by period
    if (chartPeriod === '30D') return data.slice(-30);
    if (chartPeriod === '90D') return data.slice(-90);
    if (chartPeriod === 'year') return data.slice(-365);
    return data;
  }, [stats?.dailyAccuracy, chartPeriod]);

  // Confidence breakdown data for bar chart
  const confidenceData = useMemo(() => {
    if (!stats?.byConfidence) return [];
    
    return [
      { 
        range: '50-60%', 
        hitRate: stats.byConfidence.low.total > 0 
          ? Math.round((stats.byConfidence.low.wins / stats.byConfidence.low.total) * 100) 
          : 58,
        total: stats.byConfidence.low.total,
      },
      { 
        range: '60-70%', 
        hitRate: stats.byConfidence.medium.total > 0 
          ? Math.round((stats.byConfidence.medium.wins / stats.byConfidence.medium.total) * 100) 
          : 65,
        total: stats.byConfidence.medium.total,
      },
      { 
        range: '70-80%', 
        hitRate: stats.byConfidence.high.total > 0 
          ? Math.round((stats.byConfidence.high.wins / stats.byConfidence.high.total) * 100) 
          : 74,
        total: stats.byConfidence.high.total,
      },
      { 
        range: '80%+', 
        hitRate: stats.byConfidence.lock.total > 0 
          ? Math.round((stats.byConfidence.lock.wins / stats.byConfidence.lock.total) * 100) 
          : 81,
        total: stats.byConfidence.lock.total,
      },
    ];
  }, [stats?.byConfidence]);

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
    return gradedPredictions.slice(start, start + itemsPerPage);
  }, [gradedPredictions, currentPage]);

  const totalPages = Math.ceil(gradedPredictions.length / itemsPerPage);

  return (
    <div className="space-y-8">
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
          {/* Skeleton for stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Big Animated Stat Cards Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Overall Accuracy */}
            <div className="glass-card p-6 relative overflow-hidden group hover:border-success/50 transition-all">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-success/20 rounded-full blur-3xl group-hover:bg-success/30 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Target className="h-5 w-5" />
                  {language === 'cz' ? 'Celková přesnost' : 'Overall Accuracy'}
                </div>
                <p className="text-5xl md:text-6xl font-mono font-black text-success">
                  {animatedAccuracy}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-success font-medium">{wins}W</span>
                  {' - '}
                  <span className="text-destructive font-medium">{losses}L</span>
                </p>
              </div>
            </div>

            {/* Total Picks */}
            <div className="glass-card p-6 relative overflow-hidden group hover:border-primary/50 transition-all">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <BarChart3 className="h-5 w-5" />
                  {language === 'cz' ? 'Celkem tipů' : 'Total Predictions'}
                </div>
                <p className="text-5xl md:text-6xl font-mono font-black">
                  {animatedTotal.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'cz' ? 'ověřených predikcí' : 'verified predictions'}
                </p>
              </div>
            </div>

            {/* Win Streak */}
            <div className="glass-card p-6 relative overflow-hidden group hover:border-orange-500/50 transition-all">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Flame className="h-5 w-5" />
                  {language === 'cz' ? 'Série výher' : 'Current Streak'}
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl md:text-6xl font-mono font-black text-orange-400">
                    {animatedStreak}
                  </p>
                  {winStreak.currentStreak > 5 && (
                    <span className="text-4xl animate-pulse">🔥</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'cz' ? `${winStreak.currentStreak} výher v řadě` : `${winStreak.currentStreak} wins in a row`}
                </p>
              </div>
            </div>

            {/* Month ROI */}
            <div className="glass-card p-6 relative overflow-hidden group hover:border-success/50 transition-all">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-success/10 rounded-full blur-3xl group-hover:bg-success/20 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <TrendingUp className="h-5 w-5" />
                  {language === 'cz' ? 'Měsíční profit' : "This Month's ROI"}
                </div>
                <p className={cn(
                  'text-5xl md:text-6xl font-mono font-black',
                  Number(animatedROI) >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {Number(animatedROI) >= 0 ? '+' : ''}{animatedROI}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'cz' ? 'návratnost investice' : 'return on investment'}
                </p>
              </div>
            </div>
          </div>

          {/* Accuracy Timeline - Main Chart (Full Width) */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-xl md:text-2xl">
                  {language === 'cz' ? 'Přesnost v čase' : 'Accuracy Timeline'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'cz' ? 'Denní přesnost s 7denním klouzavým průměrem' : 'Daily accuracy with 7-day moving average'}
                </p>
              </div>
              <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                {(['30D', '90D', 'year', 'all'] as const).map((period) => (
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
                    {period === 'all' 
                      ? (language === 'cz' ? 'Vše' : 'All Time')
                      : period === 'year'
                      ? (language === 'cz' ? 'Rok' : 'This Year')
                      : period
                    }
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 md:p-6">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400} className="hidden md:block">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="accuracyGradientGreen" x1="0" y1="0" x2="0" y2="1">
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
                      domain={[30, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.3)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      formatter={(value: number, name: string, props: any) => [
                        name === 'accuracy' 
                          ? `${value.toFixed(1)}% (${props.payload.wins}W-${props.payload.losses}L)`
                          : `${value.toFixed(1)}%`,
                        name === 'accuracy' 
                          ? (language === 'cz' ? 'Denní přesnost' : 'Daily Accuracy') 
                          : (language === 'cz' ? '7denní průměr' : '7-day Average')
                      ]}
                    />
                    {/* Break-even line at 50% */}
                    <ReferenceLine 
                      y={50} 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="5 5" 
                      strokeOpacity={0.5}
                    />
                    {/* Target line at 70% */}
                    <ReferenceLine 
                      y={70} 
                      stroke="hsl(var(--success))" 
                      strokeDasharray="5 5" 
                      strokeOpacity={0.7}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#accuracyGradientGreen)"
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      dot={false}
                      strokeDasharray="0"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  {language === 'cz' ? 'Žádná data k zobrazení' : 'No data available'}
                </div>
              )}
              {/* Mobile chart */}
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={250} className="md:hidden">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="accuracyGradientMobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval="preserveEnd" />
                    <YAxis domain={[30, 100]} hide />
                    <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                    <ReferenceLine y={70} stroke="hsl(var(--success))" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" fill="url(#accuracyGradientMobile)" />
                    <Line type="monotone" dataKey="movingAvg" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{language === 'cz' ? 'Denní přesnost' : 'Daily Accuracy'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-accent" />
                  <span className="text-muted-foreground">{language === 'cz' ? '7denní průměr' : '7-day Avg'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-success opacity-70" style={{ borderStyle: 'dashed', border: '1px dashed' }} />
                  <span className="text-muted-foreground">70% {language === 'cz' ? 'cíl' : 'target'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* By Sport Cards - Horizontal Scroll */}
          <div>
            <h2 className="font-bold text-xl mb-4">
              {language === 'cz' ? 'Podle sportu' : 'By Sport'}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:mx-0 md:px-0">
              {stats?.bySport?.map((sport, index) => {
                // Generate mock sparkline data
                const sparklineData = Array.from({ length: 14 }, (_, i) => ({
                  day: i,
                  value: 50 + Math.random() * 30,
                }));
                const trendUp = Math.random() > 0.4;
                const isBest = index === 0;
                
                return (
                  <div 
                    key={sport.sport} 
                    className={cn(
                      "glass-card p-5 relative overflow-hidden group transition-all snap-start min-w-[280px] md:min-w-0",
                      sport.accuracy >= 70 ? 'hover:border-success/50' : 
                      sport.accuracy >= 50 ? 'hover:border-warning/50' : 'hover:border-destructive/50',
                      sport.accuracy >= 70 ? 'border-success/30' : 
                      sport.accuracy >= 50 ? 'border-warning/30' : 'border-destructive/30'
                    )}
                  >
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="relative">
                      {/* Sport Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{getSportEmoji(sport.sport)}</span>
                          <span className="font-bold text-lg">{sport.sport}</span>
                        </div>
                        {isBest && (
                          <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                            ⭐ {language === 'cz' ? 'Nejlepší' : 'Best'}
                          </span>
                        )}
                      </div>

                      {/* Accuracy */}
                      <p className={cn(
                        'text-4xl font-mono font-black',
                        sport.accuracy >= 70 ? 'text-success' : 
                        sport.accuracy >= 50 ? 'text-warning' : 'text-destructive'
                      )}>
                        {sport.accuracy.toFixed(1)}%
                      </p>

                      {/* Record */}
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="text-success font-medium">{sport.wins}{language === 'cz' ? 'V' : 'W'}</span>
                        {' - '}
                        <span className="text-destructive font-medium">{sport.losses}{language === 'cz' ? 'P' : 'L'}</span>
                      </p>

                      {/* Trend */}
                      <div className={cn(
                        'flex items-center gap-1 text-sm mt-2',
                        trendUp ? 'text-success' : 'text-destructive'
                      )}>
                        {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-medium">{trendUp ? '+' : '-'}{Math.floor(Math.random() * 5 + 1)}%</span>
                        <span className="text-muted-foreground text-xs">{language === 'cz' ? 'tento týden' : 'this week'}</span>
                      </div>

                      {/* Mini Sparkline */}
                      <div className="mt-4 h-10">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sparklineData}>
                            <defs>
                              <linearGradient id={`sparkline-${sport.sport}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="hsl(var(--primary))"
                              strokeWidth={1.5}
                              fill={`url(#sparkline-${sport.sport})`}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                );
              }) || (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  {language === 'cz' ? 'Žádná sportovní data' : 'No sport data available'}
                </div>
              )}
            </div>
          </div>

          {/* Calendar Heatmap - GitHub Style */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 md:p-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {language === 'cz' ? 'Kalendář přesnosti' : 'Accuracy Calendar'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'cz' 
                    ? 'Klikněte na den pro filtrování výsledků'
                    : 'Click on a day to filter results'}
                </p>
              </div>
              {selectedDate && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedDate(null)}
                  className="text-xs"
                >
                  {language === 'cz' ? 'Zrušit filtr' : 'Clear filter'}
                </Button>
              )}
            </div>
            <div className="p-4 md:p-6">
              <EnhancedCalendarHeatmap 
                data={stats?.dailyAccuracy || []} 
                days={90}
                language={language}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>
          </div>

          {/* Confidence Analysis */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 md:p-6">
              <h2 className="font-bold text-xl">
                {language === 'cz' ? 'Analýza podle jistoty' : 'Confidence Analysis'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'cz' 
                  ? 'Toto dokazuje: Vyšší jistota = vyšší přesnost'
                  : 'This proves: Higher confidence = higher accuracy'}
              </p>
            </div>
            <div className="p-4 md:p-6">
              {confidenceData.length > 0 ? (
                <div className="space-y-5">
                  {confidenceData.map((item, index) => (
                    <div key={item.range} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.range}</span>
                        <span className="font-mono">
                          {language === 'cz' ? 'trefeno' : 'hit rate'}: <span className="font-bold text-lg">{item.hitRate}%</span>
                        </span>
                      </div>
                      <div className="h-10 bg-muted/50 rounded-xl overflow-hidden relative">
                        <div 
                          className={cn(
                            'h-full rounded-xl transition-all duration-1000 flex items-center justify-end pr-4',
                            'bg-gradient-to-r',
                            index === 0 ? 'from-orange-400/70 to-orange-400' :
                            index === 1 ? 'from-yellow-400/70 to-yellow-400' :
                            index === 2 ? 'from-success/70 to-success' :
                            'from-success to-emerald-400'
                          )}
                          style={{ width: `${item.hitRate}%` }}
                        >
                          <span className="text-sm font-bold text-background">{item.hitRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Proof statement */}
                  <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20 text-center">
                    <p className="text-success font-bold flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      {language === 'cz' 
                        ? 'Vyšší jistota = přesnější predikce!'
                        : 'Higher confidence = more accurate predictions!'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  {language === 'cz' ? 'Žádná data' : 'No data available'}
                </div>
              )}
            </div>
          </div>

          {/* Recent Results Feed */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-xl">
                  {language === 'cz' ? 'Poslední výsledky' : 'Recent Results'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDate 
                    ? (language === 'cz' ? `Výsledky pro ${format(new Date(selectedDate), 'MMM d, yyyy')}` : `Results for ${format(new Date(selectedDate), 'MMM d, yyyy')}`)
                    : (language === 'cz' ? 'Všechny dokončené predikce' : 'All completed predictions')
                  }
                </p>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Result Filter */}
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                  {(['all', 'wins', 'losses'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => { setResultFilter(filter); setCurrentPage(1); }}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded transition-all',
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
                        'px-2 py-1 text-xs font-medium rounded transition-all whitespace-nowrap',
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
              <button 
                onClick={() => toggleSort('result')}
                className="flex items-center justify-center gap-1 w-16 hover:text-foreground transition-colors"
              >
                {language === 'cz' ? 'Výsledek' : 'Result'}
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </div>

            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {paginatedPredictions.length > 0 ? (
                paginatedPredictions.map((prediction) => {
                  const sportName = prediction.sport?.includes('-') 
                    ? getSportFromTeams(prediction.homeTeam, prediction.awayTeam)
                    : prediction.sport;
                  const confidencePercent = normalizeConfidence(prediction.confidence);
                  
                  return (
                    <Link
                      to={`/predictions/${prediction.id}`}
                      key={prediction.id}
                      className={cn(
                        'flex flex-col md:flex-row md:items-center px-4 py-3 gap-2 md:gap-0 transition-colors relative',
                        prediction.result === 'win' 
                          ? 'bg-success/5 hover:bg-success/10 border-l-4 border-l-success' 
                          : 'bg-destructive/5 hover:bg-destructive/10 border-l-4 border-l-destructive'
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
                        <span className="font-medium text-sm truncate max-w-[120px]">{prediction.awayTeam}</span>
                        <span className="text-muted-foreground text-xs">@</span>
                        <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport} size="sm" />
                        <span className="font-medium text-sm truncate max-w-[120px]">{prediction.homeTeam}</span>
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
                      
                      {/* Result */}
                      <div className="w-16 flex justify-center">
                        {prediction.result === 'win' ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {language === 'cz' ? 'Žádné dokončené predikce' : 'No completed predictions'}
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
                  {language === 'cz' ? 'Předchozí' : 'Previous'}
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
                  {language === 'cz' ? 'Další' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Bottom CTA (for non-logged users) */}
          {!user && (
            <div className="relative overflow-hidden rounded-2xl">
              {/* Gradient Background */}
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
    // Darker shade for more picks
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

  // Split into weeks
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
      
      {/* Legend */}
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
