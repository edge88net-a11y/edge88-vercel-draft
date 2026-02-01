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
    },
    trending: {
      icon: TrendingUp,
      label: language === 'cz' ? '📈 TRENDING' : '📈 TRENDING',
      bgClass: 'bg-blue-500/20',
      textClass: 'text-blue-400',
      borderClass: 'border-blue-500/40',
    },
    followers: {
      icon: Users,
      label: `👥 ${value} ${language === 'cz' ? 'analytiků sleduje' : 'analysts following'}`,
      bgClass: 'bg-muted/50',
      textClass: 'text-muted-foreground',
      borderClass: 'border-border',
    },
    'starting-soon': {
      icon: Clock,
      label: language === 'cz' ? 'BRZY ZAČÍNÁ' : 'STARTING SOON',
      bgClass: 'bg-destructive/20',
      textClass: 'text-destructive',
      borderClass: 'border-destructive/40',
      pulse: true,
    },
  };

  const { icon: Icon, label, bgClass, textClass, borderClass, pulse } = config[type] as any;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border',
        bgClass,
        textClass,
        borderClass,
        pulse && 'animate-pulse',
        className
      )}
    >
      {label}
    </span>
  );
}
