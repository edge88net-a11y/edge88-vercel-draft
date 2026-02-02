import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProfitMeterProps {
  current: number;
  target: number;
  currency?: string;
  label?: string;
  className?: string;
}

export function ProfitMeter({ 
  current, 
  target, 
  currency = 'Kč',
  label = 'Monthly Target',
  className 
}: ProfitMeterProps) {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPercentage((current / target) * 100);
    }, 100);

    return () => clearTimeout(timer);
  }, [current, target]);

  const getColor = () => {
    if (percentage >= 100) return 'from-emerald-500 to-green-600';
    if (percentage >= 75) return 'from-cyan-500 to-blue-600';
    if (percentage >= 50) return 'from-amber-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold text-white">
          {Math.min(percentage, 100).toFixed(0)}%
        </span>
      </div>

      <div className="relative h-4 rounded-full bg-gray-800 overflow-hidden">
        <motion.div
          className={cn('absolute inset-y-0 left-0 rounded-full bg-gradient-to-r', getColor())}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            boxShadow: percentage >= 100 
              ? '0 0 20px rgba(16, 185, 129, 0.6)'
              : '0 0 10px rgba(6, 182, 212, 0.4)',
          }}
        />
        
        {percentage >= 100 && (
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

      <div className="flex items-center justify-between text-xs">
        <span className={cn(
          'font-bold',
          current >= target ? 'text-emerald-400' : 'text-cyan-400'
        )}>
          {current.toLocaleString()} {currency}
        </span>
        <span className="text-gray-500">
          / {target.toLocaleString()} {currency}
        </span>
      </div>
    </div>
  );
}
