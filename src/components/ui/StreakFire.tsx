import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakFireProps {
  streak: number;
  className?: string;
}

export function StreakFire({ streak, className }: StreakFireProps) {
  const fireCount = Math.min(Math.floor(streak / 5), 5);
  const fires = Array.from({ length: fireCount || 1 }, (_, i) => i);

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className="flex items-center">
        {fires.map((i) => (
          <motion.span
            key={i}
            className="text-2xl"
            animate={{
              y: [0, -8, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          >
            🔥
          </motion.span>
        ))}
      </div>
      <motion.span
        className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
        style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.5)' }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {streak}
      </motion.span>
      <span className="text-sm text-gray-400 uppercase tracking-wider">Win Streak</span>
    </div>
  );
}
