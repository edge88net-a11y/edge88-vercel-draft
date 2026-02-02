import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  isLoading?: boolean;
  delay?: number;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  prefix = '',
  trend,
  trendLabel,
  color = 'primary',
  isLoading = false,
  delay = 0,
  className,
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value, { duration: 1200, delay });

  const colorClasses = {
    primary: 'border-l-primary bg-primary/5 text-primary',
    success: 'border-l-success bg-success/5 text-success',
    warning: 'border-l-warning bg-warning/5 text-warning',
    destructive: 'border-l-destructive bg-destructive/5 text-destructive',
  };

  const glowClasses = {
    primary: 'stat-glow-cyan',
    success: 'stat-glow-green',
    warning: 'stat-glow-gold',
    destructive: 'stat-glow-red',
  };

  return (
    <div
      className={cn(
        'glass-card p-4 border-l-4 hover:scale-[1.02] transition-all duration-300 group',
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
            `bg-${color}/20`
          )}
        >
          <Icon className={cn('h-5 w-5', `text-${color}`)} />
        </div>

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-7 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className={cn('font-mono text-2xl font-black', glowClasses[color])}>
                {prefix}
                {Math.round(animatedValue)}
                {suffix}
              </div>
              <div className="text-xs text-muted-foreground truncate">{label}</div>
            </>
          )}
        </div>

        {trend !== undefined && !isLoading && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full',
              trend >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}
          >
            <span>{trend >= 0 ? '↑' : '↓'}</span>
            <span>
              {Math.abs(trend)}
              {trendLabel || '%'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-4 border-l-4 border-l-muted">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
