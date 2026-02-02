import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

interface CountdownLiveProps {
  gameTime: string;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export function CountdownLive({ gameTime, className, showIcon = true, compact = false }: CountdownLiveProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const gameDate = new Date(gameTime);
      const now = new Date();
      const diffMs = gameDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setIsLive(true);
        setTimeLeft('LIVE');
        return;
      }

      const hours = differenceInHours(gameDate, now);
      const minutes = differenceInMinutes(gameDate, now) % 60;
      const seconds = differenceInSeconds(gameDate, now) % 60;

      setIsUrgent(hours < 1);

      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [gameTime]);

  if (isLive) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 text-red-400 animate-pulse',
        className
      )}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className={cn('font-bold', compact ? 'text-[10px]' : 'text-xs')}>
          LIVE
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300',
      isUrgent 
        ? 'bg-amber-500/20 text-amber-400 countdown-urgent' 
        : 'bg-muted text-muted-foreground',
      className
    )}>
      {showIcon && <Clock className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      <span className={cn(
        'font-mono font-medium',
        compact ? 'text-[10px]' : 'text-xs',
        isUrgent && 'animate-tick'
      )}>
        {isUrgent && '⏰ '}
        {timeLeft}
      </span>
    </div>
  );
}
