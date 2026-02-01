import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
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

    const stake = 1000; // 1000 Kč per bet

    let today = 0;
    let week = 0;
    let month = 0;
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

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
      }
      if (gameDate >= monthStart) {
        month += profit;
        monthCount++;
      }
    });

    return { today, week, month, todayCount, weekCount, monthCount };
  }, [predictions]);

  const animatedToday = useAnimatedCounter(Math.abs(profits.today), { duration: 1000 });
  const animatedWeek = useAnimatedCounter(Math.abs(profits.week), { duration: 1000, delay: 100 });
  const animatedMonth = useAnimatedCounter(Math.abs(profits.month), { duration: 1000, delay: 200 });

  const ProfitPill = ({ 
    label, 
    value, 
    animated,
    hasResults,
  }: { 
    label: string; 
    value: number; 
    animated: number;
    hasResults: boolean;
  }) => {
    const isPositive = value > 0;
    const isNegative = value < 0;

    return (
      <div className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all",
        isPositive && "bg-success/20 text-success border border-success/30",
        isNegative && "bg-destructive/20 text-destructive border border-destructive/30",
        !hasResults && "bg-muted text-muted-foreground border border-border"
      )}>
        {hasResults && isPositive && <TrendingUp className="h-4 w-4" />}
        {hasResults && isNegative && <TrendingDown className="h-4 w-4" />}
        <span className="text-sm">{label}:</span>
        <span className="font-bold font-mono">
          {!hasResults ? (
            language === 'cz' ? 'Čekáme...' : 'Waiting...'
          ) : (
            <>
              {isPositive ? '+' : isNegative ? '-' : ''}
              {formatCurrency(animated, locale).replace(/^[+-]/, '')}
            </>
          )}
        </span>
        {hasResults && (isPositive ? '📈' : isNegative ? '📉' : '')}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="glass-card p-4">
        <div className="animate-pulse flex flex-wrap gap-3 justify-center">
          <div className="h-10 w-40 bg-muted rounded-full" />
          <div className="h-10 w-44 bg-muted rounded-full" />
          <div className="h-10 w-48 bg-muted rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 bg-gradient-to-r from-card via-card to-success/5 border-success/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span className="text-lg">💰</span>
          {language === 'cz' ? 'Profit Tracker' : 'Profit Tracker'}
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
        />
        <ProfitPill 
          label={language === 'cz' ? 'Tento měsíc' : 'This Month'} 
          value={profits.month}
          animated={animatedMonth}
          hasResults={profits.monthCount > 0}
        />
      </div>
    </div>
  );
}
