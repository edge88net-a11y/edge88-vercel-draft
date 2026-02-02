import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStats } from '@/hooks/usePredictions';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

export function LiveStatsTicker() {
  const { data: stats } = useStats();
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const items = [
    {
      icon: Target,
      label: 'Accuracy',
      value: stats.accuracy,
      suffix: '%',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Activity,
      label: 'Active Picks',
      value: stats.activePredictions,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: stats.roi >= 0 ? TrendingUp : TrendingDown,
      label: 'ROI',
      value: stats.roi,
      suffix: '%',
      prefix: stats.roi >= 0 ? '+' : '',
      color: stats.roi >= 0 ? 'text-success' : 'text-destructive',
      bgColor: stats.roi >= 0 ? 'bg-success/10' : 'bg-destructive/10',
    },
    {
      icon: Activity,
      label: 'Win Streak',
      value: stats.winStreak,
      color: stats.winStreak >= 5 ? 'text-orange-500' : 'text-muted-foreground',
      bgColor: stats.winStreak >= 5 ? 'bg-orange-500/10' : 'bg-muted/10',
    },
  ];

  const currentItem = items[ticker];
  const Icon = currentItem.icon;

  return (
    <div className="hidden lg:block fixed top-20 right-6 z-30">
      <div className="glass-card border-primary/20 px-4 py-3 min-w-[200px] animate-in slide-in-from-right">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', currentItem.bgColor)}>
            <Icon className={cn('h-4 w-4', currentItem.color)} />
          </div>

          <div className="flex-1">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {currentItem.label}
            </div>
            <div className={cn('font-mono text-lg font-black', currentItem.color)}>
              <AnimatedNumber
                value={currentItem.value}
                decimals={currentItem.suffix === '%' ? 1 : 0}
                prefix={currentItem.prefix}
                suffix={currentItem.suffix}
                duration={800}
              />
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mt-2">
          {items.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                i === ticker ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
