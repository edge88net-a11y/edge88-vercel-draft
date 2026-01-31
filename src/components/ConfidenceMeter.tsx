import { cn } from '@/lib/utils';

interface ConfidenceMeterProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ConfidenceMeter({ value, size = 'md', showLabel = true }: ConfidenceMeterProps) {
  // Handle both 0-1 and 0-100 ranges
  const normalizedValue = value <= 1 ? Math.round(value * 100) : Math.round(value);
  
  const getColor = () => {
    if (normalizedValue >= 70) return { stroke: 'stroke-success', text: 'text-success', bg: 'bg-success/20' };
    if (normalizedValue >= 55) return { stroke: 'stroke-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    return { stroke: 'stroke-orange-400', text: 'text-orange-400', bg: 'bg-orange-400/20' };
  };

  const colors = getColor();

  const sizeClasses = {
    sm: { container: 'h-12 w-12', text: 'text-xs', strokeWidth: 3 },
    md: { container: 'h-16 w-16', text: 'text-sm', strokeWidth: 4 },
    lg: { container: 'h-20 w-20', text: 'text-lg', strokeWidth: 5 },
  };

  const { container, text, strokeWidth } = sizeClasses[size];

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className={cn('relative flex items-center justify-center', container)}>
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(colors.stroke, 'transition-all duration-1000 ease-out')}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-mono font-bold', text, colors.text)}>{normalizedValue}%</span>
        </div>
      )}
    </div>
  );
}
