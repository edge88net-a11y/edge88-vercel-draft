import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
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

    predictions.forEach(p => {
      if (p.result !== 'win' && p.result !== 'loss') return;
      
      const gameDate = new Date(p.gameTime);
      const odds = parseFloat(p.prediction.odds) || 1.85;
      const profit = p.result === 'win' ? stake * (odds - 1) : -stake;

      if (gameDate >= todayStart) {
        today += profit;
      }
      if (gameDate >= weekStart) {
        week += profit;
      }
      if (gameDate >= monthStart) {
        month += profit;
      }
    });

    return { today, week, month };
  }, [predictions]);

  const animatedToday = useAnimatedCounter(Math.abs(profits.today), { duration: 1000 });
  const animatedWeek = useAnimatedCounter(Math.abs(profits.week), { duration: 1000, delay: 100 });
  const animatedMonth = useAnimatedCounter(Math.abs(profits.month), { duration: 1000, delay: 200 });

  const ProfitItem = ({ 
    label, 
    value, 
    animated 
  }: { 
    label: string; 
    value: number; 
    animated: number;
  }) => {
    const isPositive = value > 0;
    const isNegative = value < 0;
    const isZero = value === 0;

    return (
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isPositive && "bg-success/10",
          isNegative && "bg-destructive/10",
          isZero && "bg-muted"
        )}>
          {isPositive && <TrendingUp className="h-4 w-4 text-success" />}
          {isNegative && <TrendingDown className="h-4 w-4 text-destructive" />}
          {isZero && <Minus className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn(
            "font-mono font-bold text-lg",
            isPositive && "text-success",
            isNegative && "text-destructive",
            isZero && "text-muted-foreground"
          )}>
            {isZero ? (
              language === 'cz' ? 'Žádné výsledky' : 'No results'
            ) : (
              <>
                {isPositive ? '+' : '-'}
                {formatCurrency(animated, locale).replace(/^[+-]/, '')}
              </>
            )}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="glass-card p-4">
        <div className="animate-pulse flex gap-8">
          <div className="h-12 w-32 bg-muted rounded" />
          <div className="h-12 w-32 bg-muted rounded" />
          <div className="h-12 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 bg-gradient-to-r from-card via-card to-success/5 border-success/20">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💰</span>
        <h3 className="font-bold text-sm">
          {language === 'cz' ? 'Sledování profitu' : 'Profit Tracker'}
        </h3>
        <span className="text-[10px] text-muted-foreground ml-auto">
          ({language === 'cz' ? 'při 1 000 Kč sázkách' : 'based on 1,000 Kč bets'})
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <ProfitItem 
          label={language === 'cz' ? 'Dnes' : 'Today'} 
          value={profits.today}
          animated={animatedToday}
        />
        <ProfitItem 
          label={language === 'cz' ? 'Tento týden' : 'This Week'} 
          value={profits.week}
          animated={animatedWeek}
        />
        <ProfitItem 
          label={language === 'cz' ? 'Tento měsíc' : 'This Month'} 
          value={profits.month}
          animated={animatedMonth}
        />
      </div>
    </div>
  );
}
