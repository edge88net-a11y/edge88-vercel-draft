import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TickerItem {
  text: string;
  type: 'win' | 'loss' | 'info';
}

interface LiveTickerProps {
  items?: TickerItem[];
  speed?: number;
  className?: string;
}

const defaultItems: TickerItem[] = [
  { text: '🔥 34-game win streak active', type: 'win' },
  { text: '💰 +59,520 Kč profit this month', type: 'win' },
  { text: '⚡ 92.4% accuracy rate', type: 'win' },
  { text: '🏒 NHL predictions live', type: 'info' },
  { text: '⚽ EPL picks updated', type: 'info' },
  { text: '🎯 347 active users', type: 'info' },
  { text: '💎 Elite picks unlocked', type: 'win' },
];

export function LiveTicker({ items = defaultItems, speed = 30, className }: LiveTickerProps) {
  const [displayItems, setDisplayItems] = useState(items);

  useEffect(() => {
    setDisplayItems([...items, ...items]); // Duplicate for seamless loop
  }, [items]);

  const getItemColor = (type: string) => {
    switch (type) {
      case 'win':
        return 'text-emerald-400';
      case 'loss':
        return 'text-red-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <div className={cn('overflow-hidden bg-black/30 backdrop-blur border-y border-gray-800 py-3', className)}>
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{
          x: ['-50%', '0%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {displayItems.map((item, index) => (
          <span
            key={index}
            className={cn('text-sm font-medium', getItemColor(item.type))}
          >
            {item.text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
