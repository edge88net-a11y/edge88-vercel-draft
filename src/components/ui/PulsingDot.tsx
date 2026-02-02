import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PulsingDotProps {
  color?: 'red' | 'green' | 'blue' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  speed?: number;
  className?: string;
}

export function PulsingDot({ 
  color = 'green', 
  size = 'md',
  speed = 2,
  className 
}: PulsingDotProps) {
  const colors = {
    red: { base: 'bg-red-500', ping: 'bg-red-400' },
    green: { base: 'bg-emerald-500', ping: 'bg-emerald-400' },
    blue: { base: 'bg-cyan-500', ping: 'bg-cyan-400' },
    amber: { base: 'bg-amber-500', ping: 'bg-amber-400' },
  };

  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  return (
    <span className={cn('relative flex', sizes[size], className)}>
      <motion.span
        className={cn('absolute inline-flex h-full w-full rounded-full opacity-75', colors[color].ping)}
        animate={{
          scale: [1, 2, 2, 1],
          opacity: [0.75, 0, 0, 0.75],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <span className={cn('relative inline-flex rounded-full', sizes[size], colors[color].base)} />
    </span>
  );
}
