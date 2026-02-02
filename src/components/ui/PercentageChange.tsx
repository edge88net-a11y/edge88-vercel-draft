import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PercentageChangeProps {
  value: number;
  showIcon?: boolean;
  showSign?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PercentageChange({
  value,
  showIcon = true,
  showSign = true,
  className,
  size = 'md',
}: PercentageChangeProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        'inline-flex items-center font-semibold',
        isPositive && 'text-success',
        isNeutral && 'text-muted-foreground',
        !isPositive && !isNeutral && 'text-destructive',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>
        {showSign && !isNeutral && (isPositive ? '+' : '')}
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

export function PercentageBar({
  value,
  max = 100,
  label,
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  const getColor = () => {
    if (percentage >= 70) return 'bg-success';
    if (percentage >= 50) return 'bg-primary';
    if (percentage >= 30) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-mono font-semibold">{value.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            getColor(),
            'animate-grow-width'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 70) return 'stroke-success';
    if (percentage >= 50) return 'stroke-primary';
    if (percentage >= 30) return 'stroke-warning';
    return 'stroke-destructive';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn('transition-all duration-500', getColor())}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-xl font-black">
          {value.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
