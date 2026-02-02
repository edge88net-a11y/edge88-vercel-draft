import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SportIconProps {
  sport: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const sportEmojis: Record<string, string> = {
  'NHL': '🏒',
  'NBA': '🏀',
  'NFL': '🏈',
  'MLB': '⚾',
  'Soccer': '⚽',
  'EPL': '⚽',
  'La Liga': '⚽',
  'Serie A': '⚽',
  'UFC': '🥊',
  'Polymarket': '📊',
  'Kalshi': '📈',
};

const sportLabels: Record<string, string> = {
  'NHL': 'Hockey',
  'NBA': 'Basketball',
  'NFL': 'Football',
  'MLB': 'Baseball',
  'Soccer': 'Soccer',
  'EPL': 'Premier League',
  'La Liga': 'La Liga',
  'Serie A': 'Serie A',
  'UFC': 'MMA',
  'Polymarket': 'Polymarket',
  'Kalshi': 'Kalshi',
};

export function SportIcon({ sport, size = 'md', animated = true, className }: SportIconProps) {
  const emoji = sportEmojis[sport] || '🎯';
  const label = sportLabels[sport] || sport;

  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {animated ? (
        <motion.span
          className={sizes[size]}
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          {emoji}
        </motion.span>
      ) : (
        <span className={sizes[size]}>{emoji}</span>
      )}
      <span className="text-sm font-medium text-gray-400">{label}</span>
    </div>
  );
}
