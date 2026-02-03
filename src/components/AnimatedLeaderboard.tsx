import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Flame, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  winRate: number;
  wins: number;
  losses: number;
  profit: number;
  streak: number;
  isCurrentUser?: boolean;
}

interface AnimatedLeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  className?: string;
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const animatedWinRate = useAnimatedCounter(entry.winRate, 1500);
  const animatedProfit = useAnimatedCounter(entry.profit, 1500);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timeout);
  }, [index]);

  const getRankIcon = () => {
    switch (entry.rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-400" />;
      default:
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">#{entry.rank}</span>
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'border border-border bg-card',
        'transition-all duration-500',
        'hover:bg-muted/50 hover:border-primary/30',
        entry.isCurrentUser && 'ring-2 ring-primary bg-primary/5',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-8 flex justify-center">
        {getRankIcon()}
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          'bg-gradient-to-br from-primary/20 to-accent/20',
          'border-2 border-border',
          'font-bold text-sm'
        )}>
          {entry.avatar || entry.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{entry.name}</div>
          <div className="text-xs text-muted-foreground">
            {entry.wins}W - {entry.losses}L
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        {/* Win Rate */}
        <div className="text-center">
          <div className={cn(
            'text-lg font-bold font-mono',
            entry.winRate >= 60 ? 'text-success' : 
            entry.winRate >= 50 ? 'text-yellow-400' : 
            'text-muted-foreground'
          )}>
            {animatedWinRate}%
          </div>
          <div className="text-[10px] text-muted-foreground">
            {language === 'cz' ? 'Přesnost' : 'Win Rate'}
          </div>
        </div>

        {/* Profit */}
        <div className="text-center min-w-[60px]">
          <div className={cn(
            'text-lg font-bold font-mono',
            entry.profit > 0 ? 'text-success' : 
            entry.profit < 0 ? 'text-destructive' : 
            'text-muted-foreground'
          )}>
            {entry.profit > 0 ? '+' : ''}{animatedProfit}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {language === 'cz' ? 'Zisk' : 'Profit'}
          </div>
        </div>

        {/* Streak */}
        {entry.streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20">
            <Flame className="h-3 w-3 text-orange-400" />
            <span className="text-xs font-bold text-orange-400">{entry.streak}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AnimatedLeaderboard({ entries, title, className }: AnimatedLeaderboardProps) {
  const { language } = useLanguage();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {language === 'cz' 
                ? 'Žádná data k zobrazení' 
                : 'No data available'}
            </p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <LeaderboardRow key={entry.rank} entry={entry} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
