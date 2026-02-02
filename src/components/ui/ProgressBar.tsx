import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'cyan' | 'emerald' | 'amber' | 'red';
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'cyan',
  height = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayValue(percentage), 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated]);

  const colors = {
    cyan: {
      bg: 'bg-cyan-500/20',
      fill: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/50',
    },
    emerald: {
      bg: 'bg-emerald-500/20',
      fill: 'bg-gradient-to-r from-emerald-500 to-green-600',
      glow: 'shadow-emerald-500/50',
    },
    amber: {
      bg: 'bg-amber-500/20',
      fill: 'bg-gradient-to-r from-amber-500 to-orange-600',
      glow: 'shadow-amber-500/50',
    },
    red: {
      bg: 'bg-red-500/20',
      fill: 'bg-gradient-to-r from-red-500 to-rose-600',
      glow: 'shadow-red-500/50',
    },
  };

  const heights = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-gray-400">{label}</span>}
          {showPercentage && (
            <span className="font-bold text-white">{Math.round(displayValue)}%</span>
          )}
        </div>
      )}

      <div className={cn('relative rounded-full overflow-hidden', heights[height], colors[color].bg)}>
        <motion.div
          className={cn('absolute inset-y-0 left-0 rounded-full', colors[color].fill, colors[color].glow)}
          initial={{ width: '0%' }}
          animate={{ width: `${displayValue}%` }}
          transition={{ duration: animated ? 1.5 : 0, ease: 'easeOut' }}
        />
        
        {displayValue >= 100 && (
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>
    </div>
  );
}
