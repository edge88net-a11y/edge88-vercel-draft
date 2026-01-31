import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameCountdownProps {
  gameTime: string | Date;
  compact?: boolean;
}

export function GameCountdown({ gameTime, compact = false }: GameCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const game = typeof gameTime === 'string' ? new Date(gameTime) : gameTime;
      const diff = game.getTime() - now.getTime();

      if (diff <= 0) {
        setIsLive(true);
        setTimeLeft('LIVE');
        return;
      }

      setIsLive(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Urgent if less than 1 hour
      setIsUrgent(hours < 1);

      if (hours > 24) {
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

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [gameTime]);

  if (compact) {
    return (
      <span
        className={cn(
          'font-mono text-xs font-bold',
          isLive ? 'text-destructive animate-pulse' : isUrgent ? 'text-yellow-400' : 'text-muted-foreground'
        )}
      >
        {timeLeft}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
        isLive
          ? 'bg-destructive/20 text-destructive animate-pulse'
          : isUrgent
          ? 'bg-yellow-400/20 text-yellow-400'
          : 'bg-muted text-muted-foreground'
      )}
    >
      <Clock className="h-3 w-3" />
      {timeLeft}
    </div>
  );
}
