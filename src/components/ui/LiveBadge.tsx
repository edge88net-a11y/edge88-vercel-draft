import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiveBadgeProps {
  isLive?: boolean;
  text?: string;
  className?: string;
}

export function LiveBadge({ isLive = true, text, className }: LiveBadgeProps) {
  const displayText = text || (isLive ? 'LIVE' : 'OFFLINE');
  
  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50', className)}>
      <motion.div
        className={cn('w-2 h-2 rounded-full', isLive ? 'bg-red-500' : 'bg-gray-500')}
        animate={isLive ? { 
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className={cn(
        'text-xs font-bold tracking-wider',
        isLive ? 'text-red-400' : 'text-gray-400'
      )}>
        {displayText}
      </span>
    </div>
  );
}
