import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

type Tier = 'free' | 'basic' | 'pro' | 'elite';

interface TierBadgeProps {
  tier: Tier;
  className?: string;
}

const tierConfig: Record<Tier, { 
  label: string; 
  bgClass: string; 
  textClass: string;
  borderClass: string;
  glow?: boolean;
}> = {
  free: {
    label: 'FREE',
    bgClass: 'bg-success/20',
    textClass: 'text-success',
    borderClass: 'border-success/40',
  },
  basic: {
    label: 'BASIC',
    bgClass: 'bg-blue-500/20',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/40',
  },
  pro: {
    label: 'PRO',
    bgClass: 'bg-purple-500/20',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/40',
  },
  elite: {
    label: 'ELITE',
    bgClass: 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/50',
    glow: true,
  },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border',
        config.bgClass,
        config.textClass,
        config.borderClass,
        config.glow && 'shadow-[0_0_10px_hsl(45,100%,50%,0.3)] animate-pulse',
        className
      )}
    >
      {tier === 'elite' && <Lock className="h-2.5 w-2.5" />}
      {config.label}
    </span>
  );
}

// Helper to determine prediction tier based on confidence
export function getPredictionTier(confidence: number): Tier {
  if (confidence >= 80) return 'elite';
  if (confidence >= 70) return 'pro';
  if (confidence >= 60) return 'basic';
  return 'free';
}

// Helper to check if user can access prediction
export function canAccessPrediction(predictionTier: Tier, userTier: string | null | undefined): boolean {
  const tierHierarchy: Record<Tier, number> = {
    free: 0,
    basic: 1,
    pro: 2,
    elite: 3,
  };

  const userTierNormalized = (userTier?.toLowerCase() || 'free') as Tier;
  return tierHierarchy[userTierNormalized] >= tierHierarchy[predictionTier];
}
