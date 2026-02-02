import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedStatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  isLive?: boolean;
  gradient?: 'blue' | 'green' | 'yellow' | 'red' | 'cyan' | 'amber' | 'dynamic';
  dynamicValue?: number; // For dynamic gradient based on accuracy
}

export function EnhancedStatCard({
  title,
  value,
  suffix = '',
  prefix = '',
  icon,
  isLive = false,
  gradient = 'blue',
  dynamicValue,
}: EnhancedStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  const isNumeric = typeof value === 'number' && !isNaN(numericValue);

  useEffect(() => {
    if (!isNumeric) {
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
  }, [numericValue, isNumeric]);

  // Determine gradient based on type or dynamic value
  const getGradientClasses = () => {
    if (gradient === 'dynamic' && dynamicValue !== undefined) {
      if (dynamicValue >= 65) return 'from-success/10 to-success/5';
      if (dynamicValue >= 50) return 'from-yellow-500/10 to-yellow-600/5';
      return 'from-destructive/10 to-destructive/5';
    }
    
    switch (gradient) {
      case 'blue':
        return 'from-blue-500/10 to-blue-600/5';
      case 'green':
        return 'from-success/10 to-success/5';
      case 'yellow':
        return 'from-yellow-500/10 to-yellow-600/5';
      case 'red':
        return 'from-destructive/10 to-destructive/5';
      case 'cyan':
        return 'from-cyan-500/10 to-cyan-600/5';
      case 'amber':
        return 'from-amber-500/10 to-amber-600/5';
      default:
        return 'from-primary/10 to-primary/5';
    }
  };

  const getAccuracyColor = () => {
    if (gradient === 'dynamic' && dynamicValue !== undefined) {
      if (dynamicValue >= 65) return 'text-success';
      if (dynamicValue >= 50) return 'text-yellow-400';
      return 'text-destructive';
    }
    return 'text-foreground';
  };

  return (
    <div
      className={cn(
        'glass-card relative overflow-hidden p-3 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/30',
        `bg-gradient-to-br ${getGradientClasses()}`
      )}
    >
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 h-24 sm:h-32 w-24 sm:w-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/5 blur-3xl" />

      <div className="relative">
        <div className="mb-2 sm:mb-4 flex items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</h3>
          {icon && (
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              'font-mono text-xl sm:text-3xl font-bold tracking-tight',
              gradient === 'dynamic' ? getAccuracyColor() : 'text-foreground'
            )}
          >
            {prefix}
            {isNumeric ? Math.round(displayValue).toLocaleString() : value}
            {suffix}
          </span>
          {isLive && (
            <span className="relative ml-1.5 sm:ml-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
