import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HotPickIndicatorProps {
  temperature: 'cold' | 'warm' | 'hot' | 'fire';
  followers?: number;
  className?: string;
}

const tempConfig = {
  cold: {
    label: 'VALUE PLAY',
    color: 'from-blue-400 to-cyan-600',
    glow: 'rgba(6, 182, 212, 0.3)',
    fires: 0,
  },
  warm: {
    label: 'GETTING HOT',
    color: 'from-yellow-400 to-amber-600',
    glow: 'rgba(245, 158, 11, 0.4)',
    fires: 1,
  },
  hot: {
    label: 'HOT PICK',
    color: 'from-orange-500 to-red-600',
    glow: 'rgba(239, 68, 68, 0.5)',
    fires: 2,
  },
  fire: {
    label: '🔥 ON FIRE',
    color: 'from-red-500 to-rose-700',
    glow: 'rgba(239, 68, 68, 0.7)',
    fires: 3,
  },
};

export function HotPickIndicator({ temperature, followers, className }: HotPickIndicatorProps) {
  const config = tempConfig[temperature];

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-gradient-to-r backdrop-blur-sm border border-white/20',
        'font-bold text-white text-sm',
        className
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${config.color})`,
        boxShadow: `0 0 25px ${config.glow}`,
      }}
      animate={{
        boxShadow: [
          `0 0 20px ${config.glow}`,
          `0 0 35px ${config.glow}`,
          `0 0 20px ${config.glow}`,
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {config.fires > 0 && (
        <div className="flex">
          {Array.from({ length: config.fires }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -4, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              <Flame className="w-4 h-4" />
            </motion.div>
          ))}
        </div>
      )}
      
      <span>{config.label}</span>
      
      {followers && (
        <span className="text-xs opacity-90">
          • {followers} watching
        </span>
      )}
    </motion.div>
  );
}
