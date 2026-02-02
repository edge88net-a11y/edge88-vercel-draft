import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';
import { cn } from '@/lib/utils';

interface ProfitDisplayProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showSign?: boolean;
  className?: string;
}

export function ProfitDisplay({ 
  amount, 
  currency = 'Kč', 
  size = 'md',
  showSign = true,
  className 
}: ProfitDisplayProps) {
  const isProfit = amount > 0;
  const isLoss = amount < 0;

  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const glowColor = isProfit ? 'emerald' : isLoss ? 'red' : 'gray';
  const textColor = isProfit ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      className={cn('inline-flex items-baseline gap-1 font-bold', className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <span className={cn(sizes[size], textColor)}>
        {showSign && amount !== 0 && (amount > 0 ? '+' : '')}
        <AnimatedNumber 
          value={Math.abs(amount)} 
          decimals={0}
          className={textColor}
        />
        {' '}
        <span className="text-gray-500">{currency}</span>
      </span>
      {isProfit && (
        <motion.span
          className="text-emerald-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ↗
        </motion.span>
      )}
      {isLoss && (
        <motion.span
          className="text-red-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ↘
        </motion.span>
      )}
    </motion.div>
  );
}
