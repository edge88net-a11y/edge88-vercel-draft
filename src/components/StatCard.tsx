import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  animate?: boolean;
  isLive?: boolean;
}

export function StatCard({
  title,
  value,
  suffix = '',
  prefix = '',
  trend,
  trendValue,
  icon,
  animate = true,
  isLive = false,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value);

  useEffect(() => {
    if (!animate || isNaN(numericValue)) {
      setDisplayValue(numericValue);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const stepValue = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue, animate]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="glass-card relative overflow-hidden p-6 transition-all duration-300 hover:border-primary/30">
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/5 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-mono text-3xl font-bold tracking-tight text-foreground">
            {prefix}
            {typeof value === 'number' ? Math.round(displayValue).toLocaleString() : value}
            {suffix}
          </span>
          {isLive && (
            <span className="relative ml-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
          )}
        </div>

        {trend && trendValue && (
          <div className={cn('mt-2 flex items-center gap-1 text-sm', getTrendColor())}>
            {getTrendIcon()}
            <span className="font-medium">{trendValue}</span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}
