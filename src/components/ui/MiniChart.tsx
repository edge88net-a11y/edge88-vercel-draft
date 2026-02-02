import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MiniChartProps {
  data: number[];
  height?: number;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function MiniChart({ data, height = 40, color = 'primary', className }: MiniChartProps) {
  const bars = useMemo(() => {
    if (!data || data.length === 0) return [];

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    return data.map((value, index) => ({
      height: ((value - min) / range) * 100,
      delay: index * 50,
      value,
    }));
  }, [data]);

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
  };

  return (
    <div className={cn('flex items-end gap-0.5', className)} style={{ height }}>
      {bars.map((bar, index) => (
        <div
          key={index}
          className={cn(
            'flex-1 rounded-t transition-all duration-500',
            colorClasses[color],
            'hover:opacity-80'
          )}
          style={{
            height: `${bar.height}%`,
            minHeight: '2px',
            animationDelay: `${bar.delay}ms`,
          }}
          title={`${bar.value}`}
        />
      ))}
    </div>
  );
}

export function MiniLineChart({ data, height = 40, color = 'primary', className }: MiniChartProps) {
  const points = useMemo(() => {
    if (!data || data.length === 0) return '';

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const width = 100;
    const step = width / (data.length - 1);

    return data
      .map((value, index) => {
        const x = index * step;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, height]);

  const colorStroke = {
    primary: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    destructive: 'stroke-destructive',
  };

  return (
    <svg
      width="100"
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 100 ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        className={cn(colorStroke[color], 'animate-draw-line')}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={points}
        fill="url(#gradient)"
        className="opacity-20"
        strokeWidth="0"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
