import { useState, useEffect } from 'react';
import { Clock, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface GameCountdownProps {
  gameTime: string | Date;
  compact?: boolean;
  showLabel?: boolean;
}

export function GameCountdown({ gameTime, compact = false, showLabel = false }: GameCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'starting-soon' | 'live' | 'finished'>('upcoming');
  const { language } = useLanguage();

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const game = typeof gameTime === 'string' ? new Date(gameTime) : gameTime;
      const diff = game.getTime() - now.getTime();
      const hoursFromStart = -diff / (1000 * 60 * 60);

      // Game finished (more than 4 hours ago)
      if (hoursFromStart > 4) {
        setStatus('finished');
        setTimeLeft(language === 'cz' ? 'UKONČENO' : 'FINISHED');
        return;
      }

      // Game is live (started within last 4 hours)
      if (diff <= 0) {
        setStatus('live');
        setTimeLeft('LIVE');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Starting soon (less than 1 hour) - Critical
      if (hours < 1) {
        setStatus('starting-soon');
      } else if (hours < 3) {
        // Within 3 hours - urgent
        setStatus('starting-soon');
      } else {
        setStatus('upcoming');
      }

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
  }, [gameTime, language]);

  if (compact) {
    return (
      <span
        className={cn(
          'font-mono text-xs font-bold',
          status === 'live' && 'text-destructive animate-pulse',
          status === 'starting-soon' && 'text-yellow-400',
          status === 'finished' && 'text-success',
          status === 'upcoming' && 'text-muted-foreground'
        )}
      >
        {status === 'live' && '🔴 '}
        {status === 'finished' && '✅ '}
        {timeLeft}
      </span>
    );
  }

  // Live badge
  if (status === 'live') {
    return (
      <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-destructive/20 text-destructive animate-pulse border border-destructive/40">
        <Radio className="h-3 w-3 animate-pulse" />
        <span>🔴 LIVE</span>
      </div>
    );
  }

  // Finished badge
  if (status === 'finished') {
    return (
      <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-success/20 text-success border border-success/40">
        <span>✅ {language === 'cz' ? 'UKONČENO' : 'FINISHED'}</span>
      </div>
    );
  }

  // Starting soon badge (< 1 hour)
  if (status === 'starting-soon') {
    const game = typeof gameTime === 'string' ? new Date(gameTime) : gameTime;
    const diff = game.getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      return (
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-destructive/20 text-destructive animate-pulse border border-destructive/40">
          <Clock className="h-3 w-3" />
          <span>🔴 {language === 'cz' ? 'BRZY ZAČÍNÁ' : 'STARTING SOON'}</span>
          <span className="font-mono">{timeLeft}</span>
        </div>
      );
    }
  }

  // Regular countdown
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border',
        status === 'starting-soon'
          ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40'
          : 'bg-muted text-muted-foreground border-border'
      )}
    >
      <Clock className="h-3 w-3" />
      {showLabel && <span>⏰</span>}
      <span className={cn(status === 'starting-soon' && 'font-mono')}>
        {language === 'cz' ? 'Začíná za ' : 'Starts in '}
        {timeLeft}
      </span>
    </div>
  );
}