import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Target, TrendingUp, Loader2, Filter, CheckCircle, XCircle, 
  ChevronDown, ArrowRight, BarChart3, DollarSign, Calendar
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, ComposedChart
} from 'recharts';
import { TeamLogo } from '@/components/TeamLogo';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivePredictions, useStats, DailyAccuracy } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { cn } from '@/lib/utils';
import { format, subDays, isAfter } from 'date-fns';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PeriodFilter = '7' | '30' | 'all';
type ConfidenceFilter = 'all' | 'high' | 'medium';
type SportFilter = 'all' | 'nhl' | 'nba' | 'soccer' | 'ufc' | 'nfl' | 'mlb';

const ITEMS_PER_PAGE = 20;

// Calculate profit from a prediction (1000 Kč flat stake)
function calculateProfit(result: string, oddsStr: string): number {
  const odds = parseFloat(oddsStr) || 1.91;
  const stake = 1000;
  if (result === 'win') return Math.round((odds * stake) - stake);
  if (result === 'loss') return -stake;
  return 0;
}

// Format currency based on locale
function formatCurrency(amount: number, language: string): string {
  if (language === 'cz') {
    return `${amount >= 0 ? '+' : ''}${amount.toLocaleString('cs-CZ')} Kč`;
  }
  return `${amount >= 0 ? '+' : ''}$${Math.abs(amount / 25).toFixed(0)}`;
}

export default function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useLanguage();
  
  // URL-based filters
  const sportFilter = (searchParams.get('sport') || 'all') as SportFilter;
  const periodFilter = (searchParams.get('period') || '30') as PeriodFilter;
  const confidenceFilter = (searchParams.get('confidence') || 'all') as ConfidenceFilter;
  
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats, isLoading: statsLoading } = useStats();

  const isLoading = predictionsLoading || statsLoading;

  // Update URL params
  const updateFilter = useCallback((key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === '30') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  }, [searchParams, setSearchParams]);

  // Filter graded predictions
  const gradedPredictions = useMemo(() => {
    let filtered = predictions?.filter((p) => {
      // Only completed predictions
      if (p.result !== 'win' && p.result !== 'loss') return false;
      
      // Sport filter
      if (sportFilter !== 'all') {
        const sportName = p.sport?.includes('-') 
          ? getSportFromTeams(p.homeTeam, p.awayTeam)
          : p.sport;
        if (sportName?.toLowerCase() !== sportFilter) return false;
      }
      
      // Period filter
      if (periodFilter !== 'all') {
        const daysAgo = parseInt(periodFilter);
        const cutoffDate = subDays(new Date(), daysAgo);
        if (!isAfter(new Date(p.gameTime), cutoffDate)) return false;
      }
      
      // Confidence filter
      if (confidenceFilter !== 'all') {
        const conf = normalizeConfidence(p.confidence);
        if (confidenceFilter === 'high' && conf < 70) return false;
        if (confidenceFilter === 'medium' && (conf < 50 || conf >= 70)) return false;
      }
      
      return true;
    }) || [];

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.gameTime).getTime() - new Date(a.gameTime).getTime());

    return filtered;
  }, [predictions, sportFilter, periodFilter, confidenceFilter]);

  // Calculate stats from filtered predictions
  const filteredStats = useMemo(() => {
    const wins = gradedPredictions.filter((p) => p.result === 'win').length;
    const losses = gradedPredictions.filter((p) => p.result === 'loss').length;
    const total = wins + losses;
    const accuracy = total > 0 ? (wins / total) * 100 : 0;
    
    // Calculate total profit
    const totalProfit = gradedPredictions.reduce((sum, p) => {
      const odds = p.prediction?.odds || '1.91';
      return sum + calculateProfit(p.result || '', odds);
    }, 0);

    return { wins, losses, total, accuracy, totalProfit };
  }, [gradedPredictions]);

  // Animated counters
  const animatedWins = useAnimatedCounter(filteredStats.wins, { duration: 1500 });
  const animatedLosses = useAnimatedCounter(filteredStats.losses, { duration: 1500 });
  const animatedAccuracy = useAnimatedCounter(filteredStats.accuracy, { duration: 1500, decimals: 1 });
  const animatedProfit = useAnimatedCounter(Math.abs(filteredStats.totalProfit), { duration: 1500 });

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!stats?.dailyAccuracy) return [];
    
    let data = stats.dailyAccuracy.map((d, index, arr) => {
      // Calculate 7-day moving average
      const startIndex = Math.max(0, index - 6);
      const windowData = arr.slice(startIndex, index + 1);
      const movingAvg = windowData.reduce((sum, item) => sum + item.accuracy, 0) / windowData.length;
      
      return {
        date: format(new Date(d.date), 'MMM d'),
        fullDate: d.date,
        accuracy: d.accuracy,
        movingAvg: Math.round(movingAvg * 10) / 10,
        wins: d.wins,
        losses: d.losses,
      };
    });

    // Filter by period
    if (periodFilter === '7') return data.slice(-7);
    if (periodFilter === '30') return data.slice(-30);
    return data;
  }, [stats?.dailyAccuracy, periodFilter]);

  // Pagination
  const paginatedPredictions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return gradedPredictions.slice(start, start + ITEMS_PER_PAGE);
  }, [gradedPredictions, currentPage]);

  const totalPages = Math.ceil(gradedPredictions.length / ITEMS_PER_PAGE);
  const hasMore = currentPage < totalPages;

  const periodLabels = {
    '7': language === 'cz' ? '7 dní' : '7 Days',
    '30': language === 'cz' ? '30 dní' : '30 Days',
    'all': language === 'cz' ? 'Vše' : 'All Time',
  };

  const sportLabels = {
    all: language === 'cz' ? 'Všechny sporty' : 'All Sports',
    nhl: '🏒 NHL',
    nba: '🏀 NBA',
    soccer: '⚽ Soccer',
    ufc: '🥊 UFC',
    nfl: '🏈 NFL',
    mlb: '⚾ MLB',
  };

  const confidenceLabels = {
    all: language === 'cz' ? 'Všechny' : 'All',
    high: language === 'cz' ? 'Vysoká (70%+)' : 'High (70%+)',
    medium: language === 'cz' ? 'Střední (50-70%)' : 'Medium (50-70%)',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            📊 {language === 'cz' ? 'Výsledky predikcí' : 'Prediction Results'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {language === 'cz' 
              ? 'Kompletní transparentnost. Žádné skrývání proher.' 
              : 'Complete transparency. No hiding losses.'}
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Sport Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {sportLabels[sportFilter]}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(sportLabels).map(([value, label]) => (
                <DropdownMenuItem 
                  key={value}
                  onClick={() => updateFilter('sport', value)}
                  className={sportFilter === value ? 'bg-primary/10' : ''}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Period Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {periodLabels[periodFilter]}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(periodLabels).map(([value, label]) => (
                <DropdownMenuItem 
                  key={value}
                  onClick={() => updateFilter('period', value)}
                  className={periodFilter === value ? 'bg-primary/10' : ''}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Confidence Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Target className="h-4 w-4" />
                {confidenceLabels[confidenceFilter]}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(confidenceLabels).map(([value, label]) => (
                <DropdownMenuItem 
                  key={value}
                  onClick={() => updateFilter('confidence', value)}
                  className={confidenceFilter === value ? 'bg-primary/10' : ''}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-[350px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      ) : gradedPredictions.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <BarChart3 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {language === 'cz' ? '📊 Zatím žádné výsledky' : '📊 No Results Yet'}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {language === 'cz' 
              ? 'Predikce se vyhodnocují po skončení zápasů. První výsledky očekávejte do 24 hodin.'
              : 'Predictions are graded after games complete. Expect first results within 24 hours.'}
          </p>
          <Link to="/predictions">
            <Button className="btn-gradient gap-2">
              {language === 'cz' ? 'Zobrazit aktivní predikce' : 'View Active Predictions'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Summary Stats Bar */}
          <div className="glass-card p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Wins */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle className="h-6 w-6 text-success" />
                <div>
                  <p className="text-2xl font-mono font-bold text-success">{animatedWins}</p>
                  <p className="text-xs text-muted-foreground">{language === 'cz' ? 'Výher' : 'Wins'}</p>
                </div>
              </div>
              
              {/* Losses */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <XCircle className="h-6 w-6 text-destructive" />
                <div>
                  <p className="text-2xl font-mono font-bold text-destructive">{animatedLosses}</p>
                  <p className="text-xs text-muted-foreground">{language === 'cz' ? 'Proher' : 'Losses'}</p>
                </div>
              </div>
              
              {/* Accuracy */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Target className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-2xl font-mono font-bold">{animatedAccuracy}%</p>
                  <p className="text-xs text-muted-foreground">{language === 'cz' ? 'Přesnost' : 'Accuracy'}</p>
                </div>
              </div>
              
              {/* Profit */}
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                filteredStats.totalProfit >= 0 
                  ? "bg-success/10 border-success/20" 
                  : "bg-destructive/10 border-destructive/20"
              )}>
                <DollarSign className={cn(
                  "h-6 w-6",
                  filteredStats.totalProfit >= 0 ? "text-success" : "text-destructive"
                )} />
                <div>
                  <p className={cn(
                    "text-2xl font-mono font-bold",
                    filteredStats.totalProfit >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {filteredStats.totalProfit >= 0 ? '+' : '-'}
                    {language === 'cz' ? `${animatedProfit.toLocaleString()} Kč` : `$${Math.round(Number(animatedProfit) / 25)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{language === 'cz' ? 'Profit' : 'Profit'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accuracy Chart */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">
                  {language === 'cz' ? '📈 Přesnost v čase' : '📈 Accuracy Over Time'}
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">
                {language === 'cz' ? '7denní klouzavý průměr' : '7-day moving average'}
              </span>
            </div>
            <div className="p-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="accuracyFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
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
                      domain={[40, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`,
                        name === 'accuracy' 
                          ? (language === 'cz' ? 'Denní přesnost' : 'Daily Accuracy') 
                          : (language === 'cz' ? '7denní průměr' : '7-day Average')
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#accuracyFill)"
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>{language === 'cz' ? 'Sbíráme data pro graf...' : 'Collecting chart data...'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-semibold">
                📋 {language === 'cz' ? 'Výsledky' : 'Results'}
              </h2>
              <span className="text-xs text-muted-foreground">
                {gradedPredictions.length} {language === 'cz' ? 'celkem' : 'total'}
              </span>
            </div>
            
            <div className="divide-y divide-border">
              {paginatedPredictions.map((prediction) => {
                const odds = prediction.prediction?.odds || '1.91';
                const profit = calculateProfit(prediction.result || '', odds);
                const isWin = prediction.result === 'win';
                const gameDate = new Date(prediction.gameTime);
                const sportEmoji = getSportEmoji(prediction.sport);
                
                return (
                  <Link
                    key={prediction.id}
                    to={`/predictions/${prediction.id}`}
                    className={cn(
                      "flex items-center justify-between p-4 transition-colors hover:bg-muted/30",
                      isWin ? "border-l-4 border-l-success" : "border-l-4 border-l-destructive"
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Win/Loss Icon */}
                      <div className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                        isWin ? "bg-success/20" : "bg-destructive/20"
                      )}>
                        {isWin ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      
                      {/* Sport & Teams */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{sportEmoji}</span>
                          <span className="font-medium truncate">
                            {prediction.awayTeam} vs {prediction.homeTeam}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {language === 'cz' ? 'Tip:' : 'Pick:'} {prediction.prediction.pick}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 text-right">
                      <div className="hidden sm:block">
                        <p className="font-mono text-sm">{normalizeConfidence(prediction.confidence)}%</p>
                        <p className="text-xs text-muted-foreground">{language === 'cz' ? 'jistota' : 'conf'}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="font-mono text-sm">{odds}</p>
                        <p className="text-xs text-muted-foreground">{language === 'cz' ? 'kurz' : 'odds'}</p>
                      </div>
                      <div>
                        <p className={cn(
                          "font-mono font-bold",
                          isWin ? "text-success" : "text-destructive"
                        )}>
                          {formatCurrency(profit, language)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(gameDate, 'd.M.')}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Load More */}
            {hasMore && (
              <div className="p-4 text-center border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="gap-2"
                >
                  {language === 'cz' ? 'Načíst další' : 'Load More'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
