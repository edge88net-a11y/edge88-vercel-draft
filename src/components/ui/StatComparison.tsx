import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';
import { cn } from '@/lib/utils';

interface StatComparisonProps {
  label: string;
  value1: number;
  value2: number;
  label1?: string;
  label2?: string;
  suffix?: string;
  inverse?: boolean; // true if lower is better
  className?: string;
}

export function StatComparison({ 
  label, 
  value1, 
  value2, 
  label1 = 'Home',
  label2 = 'Away',
  suffix = '',
  inverse = false,
  className 
}: StatComparisonProps) {
  const diff = value1 - value2;
  const advantage = inverse ? (diff < 0 ? 'left' : 'right') : (diff > 0 ? 'left' : 'right');
  const maxValue = Math.max(value1, value2);
  const percent1 = (value1 / maxValue) * 100;
  const percent2 = (value2 / maxValue) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-xs text-gray-400 uppercase tracking-wider text-center">
        {label}
      </div>

      <div className="flex items-center gap-4">
        {/* Left value */}
        <div className={cn(
          'flex-1 text-right',
          advantage === 'left' ? 'text-emerald-400 font-bold' : 'text-gray-400'
        )}>
          <AnimatedNumber value={value1} decimals={1} suffix={suffix} />
        </div>

        {/* Visual bars */}
        <div className="flex-[2] flex items-center gap-1">
          <motion.div
            className={cn(
              'h-2 rounded-full',
              advantage === 'left' ? 'bg-emerald-500' : 'bg-gray-600'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percent1}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <div className="w-px h-4 bg-gray-700" />
          <motion.div
            className={cn(
              'h-2 rounded-full',
              advantage === 'right' ? 'bg-emerald-500' : 'bg-gray-600'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percent2}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {/* Right value */}
        <div className={cn(
          'flex-1 text-left',
          advantage === 'right' ? 'text-emerald-400 font-bold' : 'text-gray-400'
        )}>
          <AnimatedNumber value={value2} decimals={1} suffix={suffix} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{label1}</span>
        <span>{label2}</span>
      </div>
    </div>
  );
}
