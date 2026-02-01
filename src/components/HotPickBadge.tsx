import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Flame, TrendingUp, Users, Clock } from 'lucide-react';

interface HotPickBadgeProps {
  type: 'hot' | 'trending' | 'followers' | 'starting-soon';
  value?: number;
  className?: string;
}

export function HotPickBadge({ type, value, className }: HotPickBadgeProps) {
  const { language } = useLanguage();

  const config = {
    hot: {
      icon: Flame,
      label: language === 'cz' ? '🔥 HOT TIP' : '🔥 HOT PICK',
      bgClass: 'bg-gradient-to-r from-orange-500/20 to-red-500/20',
      textClass: 'text-orange-400',
      borderClass: 'border-orange-500/40',
      glow: true,
    },
    trending: {
      icon: TrendingUp,
      label: language === 'cz' ? '📈 TRENDING' : '📈 TRENDING',
      bgClass: 'bg-blue-500/20',
      textClass: 'text-blue-400',
      borderClass: 'border-blue-500/40',
      glow: false,
    },
    followers: {
      icon: Users,
      label: `👥 ${value} ${language === 'cz' ? 'sledujících' : 'following'}`,
      bgClass: 'bg-muted/50',
      textClass: 'text-muted-foreground',
      borderClass: 'border-border',
      glow: false,
    },
    'starting-soon': {
      icon: Clock,
      label: language === 'cz' ? '🔴 BRZY ZAČÍNÁ' : '🔴 STARTING SOON',
      bgClass: 'bg-destructive/20',
      textClass: 'text-destructive',
      borderClass: 'border-destructive/40',
      pulse: true,
      glow: false,
    },
  };

  const { icon: Icon, label, bgClass, textClass, borderClass, pulse, glow } = config[type] as any;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border',
        bgClass,
        textClass,
        borderClass,
        pulse && 'animate-pulse',
        glow && 'shadow-[0_0_10px_hsl(25,100%,50%,0.3)]',
        className
      )}
    >
      {type === 'hot' && <Flame className="h-3 w-3 animate-pulse" />}
      {label}
    </span>
  );
}

// Generate a random but consistent follower count based on prediction ID
export function generateFollowerCount(predictionId: string): number {
  const hash = predictionId.replace(/[^0-9]/g, '').slice(0, 4) || '100';
  return 50 + (parseInt(hash, 10) % 450); // 50-500 range
}

// Determine if a prediction should show trending badge
export function isTrending(predictionId: string): boolean {
  const hash = predictionId.replace(/[^0-9]/g, '').slice(0, 2) || '0';
  return parseInt(hash, 10) % 5 === 0; // ~20% of predictions
}