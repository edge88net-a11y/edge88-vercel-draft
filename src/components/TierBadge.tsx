import { cn } from '@/lib/utils';
import { Crown, Zap, Target, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isAdminUser } from '@/lib/adminAccess';

export type Tier = 'starter' | 'pro' | 'elite' | 'admin' | 'none';

interface TierBadgeProps {
  tier: Tier;
  className?: string;
  showLink?: boolean;
  language?: 'en' | 'cz';
}

const tierConfig: Record<Tier, { 
  label: string;
  labelCz: string;
  bgClass: string; 
  textClass: string;
  borderClass: string;
  glow?: boolean;
  icon?: React.ElementType;
  emoji?: string;
}> = {
  admin: {
    label: 'ADMIN',
    labelCz: 'ADMIN',
    bgClass: 'bg-gradient-to-r from-yellow-500/40 to-orange-500/40',
    textClass: 'text-yellow-300',
    borderClass: 'border-yellow-400/60',
    glow: true,
    icon: Crown,
    emoji: '👑',
  },
  elite: {
    label: 'ELITE',
    labelCz: 'ELITE',
    bgClass: 'bg-gradient-to-r from-purple-500/30 to-violet-500/30',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/50',
    glow: true,
    icon: Gem,
    emoji: '💎',
  },
  pro: {
    label: 'PRO',
    labelCz: 'PRO',
    bgClass: 'bg-primary/20',
    textClass: 'text-primary',
    borderClass: 'border-primary/40',
    icon: Zap,
    emoji: '⚡',
  },
  starter: {
    label: 'STARTER',
    labelCz: 'STARTER',
    bgClass: 'bg-blue-500/20',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/40',
    icon: Target,
    emoji: '🎯',
  },
  none: {
    label: 'Choose Plan',
    labelCz: 'Vyberte plán',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
    borderClass: 'border-border',
    emoji: '→',
  },
};

export function TierBadge({ tier, className, showLink = false, language = 'en' }: TierBadgeProps) {
  const config = tierConfig[tier];
  const label = language === 'cz' ? config.labelCz : config.label;
  const IconComponent = config.icon;

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border',
        config.bgClass,
        config.textClass,
        config.borderClass,
        config.glow && 'shadow-[0_0_10px_hsl(45,100%,50%,0.3)] animate-pulse',
        showLink && tier === 'none' && 'hover:bg-muted/80 cursor-pointer transition-colors',
        className
      )}
    >
      {config.emoji && <span>{config.emoji}</span>}
      {IconComponent && !config.emoji && <IconComponent className="h-2.5 w-2.5" />}
      {label}
    </span>
  );

  if (showLink && tier === 'none') {
    return <Link to="/pricing">{content}</Link>;
  }

  return content;
}

// Helper to determine prediction tier based on confidence
export function getPredictionTier(confidence: number): Tier {
  if (confidence >= 80) return 'elite';
  if (confidence >= 70) return 'pro';
  if (confidence >= 60) return 'starter';
  return 'starter'; // No more 'free' tier
}

// Helper to check if user can access prediction (includes admin check)
export function canAccessPrediction(
  predictionTier: Tier, 
  userTier: string | null | undefined,
  userEmail?: string | null
): boolean {
  // Admin users can access everything
  if (isAdminUser(userEmail)) return true;
  
  const tierHierarchy: Record<Tier, number> = {
    none: 0,
    starter: 1,
    pro: 2,
    elite: 3,
    admin: 4,
  };

  const userTierNormalized = (userTier?.toLowerCase() || 'none') as Tier;
  return tierHierarchy[userTierNormalized] >= tierHierarchy[predictionTier];
}
