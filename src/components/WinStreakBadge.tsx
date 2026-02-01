import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWinStreak } from '@/hooks/useWinStreak';

interface WinStreakBadgeProps {
  compact?: boolean;
  className?: string;
}

export function WinStreakBadge({ compact = false, className }: WinStreakBadgeProps) {
  const { winStreak } = useWinStreak();

  if (winStreak.currentStreak < 3) return null;

  const isHot = winStreak.currentStreak >= 5;

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
          isHot ? 'bg-orange-500/20 text-orange-400' : 'bg-success/20 text-success',
          className
        )}
      >
        <Flame className={cn('h-3 w-3', isHot && 'animate-pulse')} />
        {winStreak.currentStreak}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
        isHot 
          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/40 shadow-[0_0_15px_hsl(25,100%,50%,0.2)]' 
          : 'bg-success/10 border-success/30',
        className
      )}
    >
      <Flame className={cn('h-4 w-4', isHot ? 'text-orange-400 animate-pulse' : 'text-success')} />
      <span className={cn('font-mono font-bold', isHot ? 'text-orange-400' : 'text-success')}>
        🔥 {winStreak.currentStreak}
      </span>
    </div>
  );
}
