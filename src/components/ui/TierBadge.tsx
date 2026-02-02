import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock, Zap, Crown, Star } from 'lucide-react';

interface TierBadgeProps {
  tier: 'starter' | 'pro' | 'elite' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const tierConfig = {
  starter: {
    label: 'STARTER',
    icon: Star,
    color: 'from-gray-400 to-gray-600',
    glow: 'rgba(156, 163, 175, 0.5)',
    border: 'border-gray-500/30',
  },
  pro: {
    label: 'PRO',
    icon: Zap,
    color: 'from-cyan-400 to-blue-600',
    glow: 'rgba(6, 182, 212, 0.5)',
    border: 'border-cyan-500/30',
  },
  elite: {
    label: 'ELITE',
    icon: Crown,
    color: 'from-amber-400 to-orange-600',
    glow: 'rgba(251, 191, 36, 0.5)',
    border: 'border-amber-500/30',
  },
  admin: {
    label: 'ADMIN',
    icon: Lock,
    color: 'from-purple-400 to-pink-600',
    glow: 'rgba(168, 85, 247, 0.5)',
    border: 'border-purple-500/30',
  },
};

export function TierBadge({ tier, size = 'md', showIcon = true, className }: TierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold tracking-wider',
        'bg-gradient-to-r backdrop-blur-sm border',
        sizes[size],
        config.border,
        className
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${config.color})`,
        boxShadow: `0 0 20px ${config.glow}`,
      }}
      whileHover={{ scale: 1.05 }}
      animate={{
        boxShadow: [
          `0 0 20px ${config.glow}`,
          `0 0 30px ${config.glow}`,
          `0 0 20px ${config.glow}`,
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{config.label}</span>
    </motion.div>
  );
}
