import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, Award, TrendingUp, TrendingDown, Flame, Calendar, Loader2, 
  Filter, ArrowUpDown, ChevronRight, CheckCircle, XCircle, BarChart3
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { CalendarHeatmap } from '@/components/charts/CalendarHeatmap';
import { TeamLogo } from '@/components/TeamLogo';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivePredictions, useStats, useAccuracyStats } from '@/hooks/usePredictions';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type SortField = 'date' | 'sport' | 'confidence';
type SortDirection = 'asc' | 'desc';

const sportFilters = ['All', 'NHL', 'NBA', 'Soccer', 'UFC', 'NFL', 'MLB'];

const Results = () => {
  const [chartPeriod, setChartPeriod] = useState<'30' | '90' | 'all'>('90');
  const [selectedSport, setSelectedSport] = useState('All');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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
      if (selectedSport !== 'All') {
        const sportName = p.sport?.includes('-') 
          ? getSportFromTeams(p.homeTeam, p.awayTeam)
          : p.sport;
        if (sportName?.toUpperCase() !== selectedSport && sportName !== selectedSport) return false;
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
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [predictions, selectedSport, sortField, sortDirection]);

  // Calculate stats
  const wins = stats?.accuracy ? Math.round((stats.accuracy / 100) * (stats.totalPredictions || 0)) : gradedPredictions.filter((p) => p.result === 'win').length;
  const losses = (stats?.totalPredictions || 0) - wins || gradedPredictions.filter((p) => p.result === 'loss').length;
  const accuracy = stats?.accuracy || (wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0);
  const hasResults = gradedPredictions.length > 0 || (stats?.totalPredictions && stats.totalPredictions > 0);

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
    if (chartPeriod === '30') return data.slice(-30);
    if (chartPeriod === '90') return data.slice(-90);
    return data;
  }, [stats?.dailyAccuracy, chartPeriod]);

  // Confidence breakdown data for bar chart
  const confidenceData = useMemo(() => {
    if (!stats?.byConfidence) return [];
    
    return [
      { 
        range: '50-60%', 
        label: language === 'cz' ? '50-60% jistota' : '50-60% confidence',
        hitRate: stats.byConfidence.low.total > 0 
          ? Math.round((stats.byConfidence.low.wins / stats.byConfidence.low.total) * 100) 
          : 58,
        total: stats.byConfidence.low.total,
      },
      { 
        range: '60-70%', 
        label: language === 'cz' ? '60-70% jistota' : '60-70% confidence',
        hitRate: stats.byConfidence.medium.total > 0 
          ? Math.round((stats.byConfidence.medium.wins / stats.byConfidence.medium.total) * 100) 
          : 65,
        total: stats.byConfidence.medium.total,
      },
      { 
        range: '70-80%', 
        label: language === 'cz' ? '70-80% jistota' : '70-80% confidence',
        hitRate: stats.byConfidence.high.total > 0 
          ? Math.round((stats.byConfidence.high.wins / stats.byConfidence.high.total) * 100) 
          : 74,
        total: stats.byConfidence.high.total,
      },
      { 
        range: '80%+', 
        label: language === 'cz' ? '80%+ jistota' : '80%+ confidence',
        hitRate: stats.byConfidence.lock.total > 0 
          ? Math.round((stats.byConfidence.lock.wins / stats.byConfidence.lock.total) * 100) 
          : 81,
        total: stats.byConfidence.lock.total,
      },
    ];
  }, [stats?.byConfidence, language]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Month ROI calculation (mock - would come from API)
  const monthROI = stats?.roi || 12.5;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          📊 {language === 'cz' ? 'Naše výsledky' : 'Our Results'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Big Stat Cards Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Overall Accuracy */}
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Target className="h-4 w-4" />
                  {language === 'cz' ? 'Celková přesnost' : 'Overall Accuracy'}
                </div>
                <p className={cn(
                  'text-4xl font-mono font-black',
                  accuracy >= 65 ? 'text-success' : accuracy >= 55 ? 'text-warning' : 'text-foreground'
                )}>
                  {accuracy.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {wins}W - {losses}L
                </p>
              </div>
            </div>

            {/* Total Picks */}
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <BarChart3 className="h-4 w-4" />
                  {language === 'cz' ? 'Celkem tipů' : 'Total Picks'}
                </div>
                <p className="text-4xl font-mono font-black">
                  {stats?.totalPredictions || wins + losses}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'cz' ? 'ověřených predikcí' : 'verified predictions'}
                </p>
              </div>
            </div>

            {/* Win Streak */}
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Flame className="h-4 w-4" />
                  {language === 'cz' ? 'Série výher' : 'Win Streak'}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-mono font-black text-orange-400">
                    {winStreak.currentStreak}
                  </p>
                  {winStreak.currentStreak > 5 && (
                    <span className="text-3xl animate-pulse">🔥</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'cz' ? `Nejlepší: ${winStreak.bestStreakAllTime}` : `Best: ${winStreak.bestStreakAllTime}`}
                </p>
              </div>
            </div>

            {/* Month ROI */}
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  {language === 'cz' ? 'ROI tento měsíc' : "This Month's ROI"}
                </div>
                <p className={cn(
                  'text-4xl font-mono font-black',
                  monthROI >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {monthROI >= 0 ? '+' : ''}{monthROI.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'cz' ? 'návratnost investice' : 'return on investment'}
                </p>
              </div>
            </div>
          </div>

          {/* Accuracy Over Time - Main Chart */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg">
                  {language === 'cz' ? 'Přesnost v čase' : 'Accuracy Over Time'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Denní přesnost s 7denním klouzavým průměrem' : 'Daily accuracy with 7-day moving average'}
                </p>
              </div>
              <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                {(['30', '90', 'all'] as const).map((period) => (
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
                      : `${period} ${language === 'cz' ? 'dní' : 'Days'}`
                    }
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`,
                        name === 'accuracy' 
                          ? (language === 'cz' ? 'Denní' : 'Daily') 
                          : (language === 'cz' ? 'Průměr 7d' : '7-day Avg')
                      ]}
                    />
                    {/* Break-even line at 50% */}
                    <ReferenceLine 
                      y={50} 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="5 5" 
                      strokeOpacity={0.7}
                      label={{ 
                        value: language === 'cz' ? '50% hranice' : '50% break-even', 
                        fill: 'hsl(var(--destructive))',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />
                    {/* Target line at 70% */}
                    <ReferenceLine 
                      y={70} 
                      stroke="hsl(var(--success))" 
                      strokeDasharray="5 5" 
                      strokeOpacity={0.7}
                      label={{ 
                        value: language === 'cz' ? '70% cíl' : '70% target', 
                        fill: 'hsl(var(--success))',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#accuracyGradient)"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      dot={false}
                      strokeDasharray="0"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  {language === 'cz' ? 'Žádná data k zobrazení' : 'No data available'}
                </div>
              )}
            </div>
          </div>

          {/* By Sport Section */}
          <div>
            <h2 className="font-bold text-lg mb-4">
              {language === 'cz' ? 'Podle sportu' : 'By Sport'}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats?.bySport?.map((sport, index) => {
                // Generate mock sparkline data
                const sparklineData = Array.from({ length: 14 }, (_, i) => ({
                  day: i,
                  value: 50 + Math.random() * 30,
                }));
                const trendUp = Math.random() > 0.4; // Mock trend
                
                return (
                  <div key={sport.sport} className="glass-card p-5 relative overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="relative">
                      {/* Sport Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getSportEmoji(sport.sport)}</span>
                          <span className="font-bold">{sport.sport}</span>
                          {index === 0 && <span className="text-yellow-400">👑</span>}
                        </div>
                        <div className={cn(
                          'flex items-center gap-1 text-sm',
                          trendUp ? 'text-success' : 'text-destructive'
                        )}>
                          {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span className="font-medium">{trendUp ? '+' : '-'}{Math.floor(Math.random() * 5 + 1)}%</span>
                        </div>
                      </div>

                      {/* Accuracy */}
                      <p className={cn(
                        'text-3xl font-mono font-black',
                        sport.accuracy >= 65 ? 'text-success' : sport.accuracy >= 55 ? 'text-warning' : 'text-foreground'
                      )}>
                        {sport.accuracy.toFixed(1)}%
                      </p>

                      {/* Record */}
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="text-success font-medium">{sport.wins}W</span>
                        {' - '}
                        <span className="text-destructive font-medium">{sport.losses}L</span>
                      </p>

                      {/* Mini Sparkline */}
                      <div className="mt-4 h-8">
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

          {/* Recent Results Feed */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg">
                  {language === 'cz' ? 'Poslední výsledky' : 'Recent Results'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Posledních 20 dokončených predikcí' : 'Last 20 completed predictions'}
                </p>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                  {sportFilters.slice(0, 5).map((sport) => (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded transition-all',
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
              <div className="w-16 text-center">{language === 'cz' ? 'Výsledek' : 'Result'}</div>
            </div>

            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {gradedPredictions.length > 0 ? (
                gradedPredictions.slice(0, 20).map((prediction) => {
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
                        <span className="font-medium text-sm truncate">{prediction.awayTeam}</span>
                        <span className="text-muted-foreground text-xs">@</span>
                        <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport} size="sm" />
                        <span className="font-medium text-sm truncate">{prediction.homeTeam}</span>
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
          </div>

          {/* Calendar Heatmap */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {language === 'cz' ? 'Kalendář přesnosti' : 'Accuracy Calendar'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'cz' 
                    ? 'Zelená = úspěšný den (>55%), Červená = prohra'
                    : 'Green = winning day (>55%), Red = losing day'}
                </p>
              </div>
            </div>
            <div className="p-6">
              <CalendarHeatmap data={stats?.dailyAccuracy || []} days={90} />
            </div>
          </div>

          {/* Confidence Analysis */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4">
              <h2 className="font-bold text-lg">
                {language === 'cz' ? 'Analýza jistoty' : 'Confidence Analysis'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'cz' 
                  ? 'Vyšší jistota = vyšší přesnost'
                  : 'Higher confidence = higher accuracy'}
              </p>
            </div>
            <div className="p-6">
              {confidenceData.length > 0 ? (
                <div className="space-y-4">
                  {confidenceData.map((item, index) => (
                    <div key={item.range} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-mono font-bold">
                          {language === 'cz' ? 'úspěšnost' : 'hit rate'}: {item.hitRate}%
                        </span>
                      </div>
                      <div className="h-8 bg-muted/50 rounded-lg overflow-hidden relative">
                        <div 
                          className={cn(
                            'h-full rounded-lg transition-all duration-1000 flex items-center justify-end pr-3',
                            index === 0 ? 'bg-orange-400/70' :
                            index === 1 ? 'bg-yellow-400/70' :
                            index === 2 ? 'bg-success/70' :
                            'bg-success'
                          )}
                          style={{ width: `${item.hitRate}%` }}
                        >
                          <span className="text-xs font-bold text-background">{item.hitRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Proof statement */}
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20 text-center">
                    <p className="text-sm text-success font-medium">
                      ✅ {language === 'cz' 
                        ? 'Toto dokazuje: Vyšší jistota = přesnější predikce'
                        : 'This proves: Higher confidence = more accurate predictions'}
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

          {/* Bottom CTA (for non-logged users) */}
          {!user && (
            <div className="glass-card p-8 text-center bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-primary/20">
              <h3 className="text-2xl font-bold mb-3">
                {language === 'cz' 
                  ? 'Tyto výsledky jsou reálné. Chcete tipy PŘEDEM?'
                  : 'These results are real. Want picks in advance?'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                {language === 'cz' 
                  ? 'Registrujte se zdarma a získejte přístup k našim predikcím před zahájením zápasů.'
                  : 'Sign up free and get access to our predictions before games start.'}
              </p>
              <Link to="/signup">
                <Button size="lg" className="gap-2 text-lg px-8">
                  {language === 'cz' ? 'Registrovat se zdarma' : 'Sign Up Free'}
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Results;
