import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface LiveGameBadgeProps {
  gameTime: string | Date;
  className?: string;
  showScore?: boolean;
  homeScore?: number;
  awayScore?: number;
}

export function LiveGameBadge({ 
  gameTime, 
  className,
  showScore = false,
  homeScore,
  awayScore
}: LiveGameBadgeProps) {
  const [isLive, setIsLive] = useState(false);
  const [pulse, setPulse] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const checkLiveStatus = () => {
      const gameDate = new Date(gameTime);
      const now = new Date();
      const diffMs = now.getTime() - gameDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      // Game is "live" if it started and is within 4 hours (typical game duration)
      setIsLive(diffHours >= 0 && diffHours < 4);
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 30000); // Check every 30 seconds
    
    // Pulse animation toggle
    const pulseInterval = setInterval(() => {
      setPulse(p => !p);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(pulseInterval);
    };
  }, [gameTime]);

  if (!isLive) return null;

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full px-3 py-1',
      'bg-destructive/20 border border-destructive/30',
      className
    )}>
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <span className={cn(
          'absolute inline-flex h-full w-full rounded-full bg-destructive',
          pulse && 'animate-ping opacity-75'
        )} />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
      </span>
      
      <span className="text-xs font-bold uppercase text-destructive">
        {language === 'cz' ? 'ŽIVĚ' : 'LIVE'}
      </span>

      {showScore && homeScore !== undefined && awayScore !== undefined && (
        <span className="text-xs font-mono font-bold text-foreground">
          {homeScore} - {awayScore}
        </span>
      )}
    </div>
  );
}

interface WinProbabilityBarProps {
  homeTeam: string;
  awayTeam: string;
  homeProbability: number; // 0-100
  className?: string;
}

export function WinProbabilityBar({ 
  homeTeam, 
  awayTeam, 
  homeProbability,
  className 
}: WinProbabilityBarProps) {
  const awayProbability = 100 - homeProbability;
  const { language } = useLanguage();

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{homeTeam}</span>
        <span className="text-xs text-muted-foreground">
          {language === 'cz' ? 'Pravděpodobnost výhry' : 'Win Probability'}
        </span>
        <span className="font-medium">{awayTeam}</span>
      </div>
      
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
        <div 
          className="absolute left-0 top-0 h-full bg-success transition-all duration-500 ease-out"
          style={{ width: `${homeProbability}%` }}
        />
        <div 
          className="absolute right-0 top-0 h-full bg-destructive transition-all duration-500 ease-out"
          style={{ width: `${awayProbability}%` }}
        />
        
        {/* Center divider */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-foreground/50" />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-success">{homeProbability}%</span>
        <span className="font-mono font-bold text-destructive">{awayProbability}%</span>
      </div>
    </div>
  );
}
