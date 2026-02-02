import { useMemo } from 'react';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { formatCurrency } from '@/lib/oddsUtils';
import { APIPrediction } from '@/hooks/usePredictions';
import { cn } from '@/lib/utils';

interface ProfitTrackerProps {
  predictions: APIPrediction[];
  isLoading?: boolean;
}

export function ProfitTracker({ predictions, isLoading }: ProfitTrackerProps) {
  const { language } = useLanguage();
  const locale = language === 'cz' ? 'cz' : 'en';

  const profits = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Previous periods for trend comparison
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const stake = 1000;

    let today = 0, week = 0, month = 0;
    let todayCount = 0, weekCount = 0, monthCount = 0;
    let lastWeek = 0, lastMonth = 0;

    predictions.forEach(p => {
      if (p.result !== 'win' && p.result !== 'loss') return;
      
      const gameDate = new Date(p.gameTime);
      const odds = parseFloat(p.prediction.odds) || 1.85;
      const profit = p.result === 'win' ? stake * (odds - 1) : -stake;

      if (gameDate >= todayStart) {
        today += profit;
        todayCount++;
      }
      if (gameDate >= weekStart) {
        week += profit;
        weekCount++;
      } else if (gameDate >= lastWeekStart) {
        lastWeek += profit;
      }
      if (gameDate >= monthStart) {
        month += profit;
        monthCount++;
      } else if (gameDate >= lastMonthStart) {
        lastMonth += profit;
      }
    });

    const weekTrend: 'up' | 'down' | 'flat' = week > lastWeek ? 'up' : week < lastWeek ? 'down' : 'flat';
    const monthTrend: 'up' | 'down' | 'flat' = month > lastMonth ? 'up' : month < lastMonth ? 'down' : 'flat';

    return { 
      today, week, month, 
      todayCount, weekCount, monthCount,
      weekTrend,
      monthTrend,
    };
  }, [predictions]);

  const animatedToday = useAnimatedCounter(Math.abs(profits.today), { duration: 1000 });
  const animatedWeek = useAnimatedCounter(Math.abs(profits.week), { duration: 1000, delay: 100 });
  const animatedMonth = useAnimatedCounter(Math.abs(profits.month), { duration: 1000, delay: 200 });

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
    if (trend === 'up') return <ArrowUp className="h-3 w-3 text-success" />;
    if (trend === 'down') return <ArrowDown className="h-3 w-3 text-destructive" />;
    return <ArrowRight className="h-3 w-3 text-muted-foreground" />;
  };

  const ProfitPill = ({ 
    label, 
    value, 
    animated,
    hasResults,
    trend,
  }: { 
    label: string; 
    value: number; 
    animated: number;
    hasResults: boolean;
    trend?: 'up' | 'down' | 'flat';
  }) => {
    const isPositive = value > 0;
    const isNegative = value < 0;

    return (
      <div className={cn(
        "relative flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all overflow-hidden",
        isPositive && "bg-success/20 text-success border-2 border-success/40 shadow-lg shadow-success/10",
        isNegative && "bg-destructive/20 text-destructive border-2 border-destructive/40 shadow-lg shadow-destructive/10",
        !hasResults && "bg-muted text-muted-foreground border border-border"
      )}>
        {/* Shimmer effect when waiting */}
        {!hasResults && (
          <div className="absolute inset-0 animate-premium-shimmer" />
        )}
        
        {hasResults && isPositive && <TrendingUp className="h-4 w-4" />}
        {hasResults && isNegative && <TrendingDown className="h-4 w-4" />}
        {!hasResults && <span className="animate-hourglass">⏳</span>}
        
        <span className="text-sm relative z-10">{label}:</span>
        <span className="font-bold font-mono relative z-10">
          {!hasResults ? (
            language === 'cz' ? 'Čekáme na výsledky...' : 'Waiting for results...'
          ) : (
            <>
              {isPositive ? '+' : isNegative ? '-' : ''}
              {formatCurrency(animated, locale).replace(/^[+-]/, '')}
            </>
          )}
        </span>
        
        {/* Trend arrow */}
        {hasResults && trend && <TrendIcon trend={trend} />}
        
        {hasResults && (isPositive ? '📈' : isNegative ? '📉' : '')}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="glass-card p-4">
        <div className="animate-pulse flex flex-wrap gap-3 justify-center">
          <div className="h-10 w-40 bg-muted rounded-full animate-premium-shimmer" />
          <div className="h-10 w-44 bg-muted rounded-full animate-premium-shimmer" />
          <div className="h-10 w-48 bg-muted rounded-full animate-premium-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 bg-gradient-to-r from-card via-card to-success/5 border-success/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span className="text-lg">💰</span>
          Profit Tracker
        </h3>
        <span className="text-[10px] text-muted-foreground px-2 py-1 rounded-full bg-muted">
          {language === 'cz' ? 'při 1 000 Kč sázkách' : 'based on 1,000 Kč bets'}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        <ProfitPill 
          label={language === 'cz' ? 'Dnes' : 'Today'} 
          value={profits.today}
          animated={animatedToday}
          hasResults={profits.todayCount > 0}
        />
        <ProfitPill 
          label={language === 'cz' ? 'Tento týden' : 'This Week'} 
          value={profits.week}
          animated={animatedWeek}
          hasResults={profits.weekCount > 0}
          trend={profits.weekTrend}
        />
        <ProfitPill 
          label={language === 'cz' ? 'Tento měsíc' : 'This Month'} 
          value={profits.month}
          animated={animatedMonth}
          hasResults={profits.monthCount > 0}
          trend={profits.monthTrend}
        />
      </div>
    </div>
  );
}
