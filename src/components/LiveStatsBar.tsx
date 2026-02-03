import { useEffect, useState } from 'react';
import { TrendingUp, Target, Flame, Zap, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface LiveStatsBarProps {
  totalPredictions: number;
  avgConfidence: number;
  winRate: number;
  hotStreak: number;
  profitToday: number;
  className?: string;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  suffix?: string;
  color: string;
  animate?: boolean;
}

function StatCard({ icon: Icon, label, value, suffix = '', color, animate = false }: StatCardProps) {
  const displayValue = typeof value === 'number' && animate 
    ? useAnimatedCounter(value, 1000) 
    : value;

  return (
    <div className={cn(
      'flex flex-col items-center gap-1 p-3 rounded-lg',
      'bg-muted/30 border border-border',
      'hover:bg-muted/50 transition-all duration-200',
      'min-w-[90px]'
    )}>
      <Icon className={cn('h-4 w-4', color)} />
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-bold font-mono">{displayValue}</span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

export function LiveStatsBar({
  totalPredictions,
  avgConfidence,
  winRate,
  hotStreak,
  profitToday,
  className
}: LiveStatsBarProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={cn(
        'overflow-x-auto scrollbar-hide',
        'transition-opacity duration-500',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <div className="flex gap-3 p-1 min-w-max">
        <StatCard
          icon={TrendingUp}
          label={language === 'cz' ? 'Aktivní' : 'Active'}
          value={totalPredictions}
          color="text-primary"
          animate
        />
        
        <StatCard
          icon={Target}
          label={language === 'cz' ? 'Průměr' : 'Avg Conf'}
          value={Math.round(avgConfidence)}
          suffix="%"
          color="text-blue-400"
          animate
        />
        
        <StatCard
          icon={Flame}
          label={language === 'cz' ? 'Přesnost' : 'Win Rate'}
          value={Math.round(winRate)}
          suffix="%"
          color={winRate >= 60 ? 'text-success' : winRate >= 50 ? 'text-yellow-400' : 'text-muted-foreground'}
          animate
        />
        
        {hotStreak > 0 && (
          <StatCard
            icon={Zap}
            label={language === 'cz' ? 'Série' : 'Streak'}
            value={hotStreak}
            suffix={language === 'cz' ? 'W' : 'W'}
            color="text-orange-400"
            animate
          />
        )}
        
        {profitToday !== 0 && (
          <StatCard
            icon={DollarSign}
            label={language === 'cz' ? 'Dnes' : 'Today'}
            value={profitToday > 0 ? `+${profitToday}` : profitToday}
            suffix={language === 'cz' ? 'Kč' : '$'}
            color={profitToday > 0 ? 'text-success' : 'text-destructive'}
          />
        )}
      </div>
    </div>
  );
}
