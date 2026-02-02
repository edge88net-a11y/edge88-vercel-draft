import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Prediction } from '@/lib/types';

interface StreakSportWidgetProps {
  predictions: Prediction[];
  winStreak?: number;
  bestStreak?: number;
}

export function StreakSportWidget({ predictions, winStreak = 0, bestStreak }: StreakSportWidgetProps) {
  const { language } = useLanguage();
  const [animatedBars, setAnimatedBars] = useState(false);

  // Trigger animation on mount
  useMemo(() => {
    const timer = setTimeout(() => setAnimatedBars(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Get last 10 results with game details
  const lastResults = useMemo(() => {
    return predictions
      .filter(p => p.result === 'win' || p.result === 'loss')
      .slice(0, 10)
      .map(p => ({
        result: p.result,
        homeTeam: p.homeTeam,
        awayTeam: p.awayTeam,
        sport: p.sport,
      }));
  }, [predictions]);

  // Calculate sport stats with profit
  const sportStats = useMemo(() => {
    const completed = predictions.filter(p => p.result === 'win' || p.result === 'loss');
    const sportMap = new Map<string, { wins: number; total: number; profit: number }>();
    
    completed.forEach(p => {
      const sport = p.sport?.includes('-') 
        ? getSportFromTeams(p.homeTeam, p.awayTeam)
        : p.sport || 'Other';
      
      if (!sportMap.has(sport)) {
        sportMap.set(sport, { wins: 0, total: 0, profit: 0 });
      }
      const stats = sportMap.get(sport)!;
      stats.total++;
      const odds = parseFloat(p.prediction?.odds?.replace(',', '.') || '1.85');
      if (p.result === 'win') {
        stats.wins++;
        stats.profit += 1000 * (odds - 1);
      } else {
        stats.profit -= 1000;
      }
    });

    return Array.from(sportMap.entries())
      .map(([name, { wins, total, profit }]) => ({
        name,
        emoji: getSportEmoji(name),
        wins,
        total,
        accuracy: Math.round((wins / total) * 100),
        profit: Math.round(profit),
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);
  }, [predictions]);

  // Sport accent colors
  const getSportBorderColor = (sport: string) => {
    const s = sport?.toLowerCase() || '';
    if (s.includes('hockey') || s.includes('nhl')) return 'border-l-blue-500';
    if (s.includes('basket') || s.includes('nba')) return 'border-l-orange-500';
    if (s.includes('football') || s.includes('nfl')) return 'border-l-emerald-500';
    if (s.includes('soccer')) return 'border-l-green-500';
    if (s.includes('baseball') || s.includes('mlb')) return 'border-l-red-500';
    return 'border-l-primary';
  };

  const getStreakText = (streak: number) => {
    if (streak === 0) return language === 'cz' ? 'Žádná série' : 'No streak';
    if (language === 'cz') {
      if (streak === 1) return '1 Výhra';
      if (streak < 5) return `${streak} Výhry`;
      return `${streak} Výher`;
    }
    return streak === 1 ? '1 Win' : `${streak} Wins`;
  };

  const isRecord = bestStreak && winStreak >= bestStreak && winStreak > 0;

  return (
    <div className="space-y-4">
      {/* Streak Section */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-base font-bold mb-3 flex items-center gap-2">
          🔥 {language === 'cz' ? 'Aktuální série' : 'Current Streak'}
        </h3>
        <div className="text-center">
          {/* Bouncing fire emojis */}
          <div className="text-4xl mb-1 flex justify-center gap-1">
            {winStreak > 0 ? (
              Array.from({ length: Math.min(winStreak, 5) }).map((_, i) => (
                <span 
                  key={i} 
                  className="animate-fire-bounce inline-block"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  🔥
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
          
          {/* Streak number with glow */}
          <div className={cn(
            "text-2xl font-bold",
            winStreak >= 5 ? "text-amber-400 stat-glow-gold animate-fire-glow" :
            winStreak >= 3 ? "text-success stat-glow-green" :
            "text-foreground"
          )}>
            {getStreakText(winStreak)}
          </div>

          {/* Record badge */}
          {isRecord && (
            <div className="mt-2 text-sm text-amber-400 font-medium flex items-center justify-center gap-1">
              🏆 {language === 'cz' ? `Rekord: ${bestStreak}!` : `Record: ${bestStreak}!`}
            </div>
          )}
          
          {/* Win/loss dots with tooltips */}
          {lastResults.length > 0 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {lastResults.map((r, i) => (
                <Tooltip key={i} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <span 
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-transform hover:scale-110",
                        r.result === 'win' ? 'bg-success/20 text-success border border-success/30' : 'bg-destructive/20 text-destructive border border-destructive/30'
                      )}
                    >
                      {r.result === 'win' ? '✓' : '✗'}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover border-border">
                    <p className="text-xs">
                      {getSportEmoji(r.sport)} {r.awayTeam} @ {r.homeTeam}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sport Accuracy Section */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-base font-bold mb-3 flex items-center gap-2">
          🏆 {language === 'cz' ? 'Přesnost podle sportu' : 'Accuracy by Sport'}
        </h3>
        {sportStats.length > 0 ? (
          <div className="space-y-3">
            {sportStats.map(sport => (
              <Tooltip key={sport.name} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "cursor-pointer border-l-2 pl-2 -ml-2 transition-all hover:bg-muted/30 rounded-r py-1",
                    getSportBorderColor(sport.name)
                  )}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        {sport.emoji} {sport.name}
                      </span>
                      <span className={cn(
                        "font-mono font-bold",
                        sport.accuracy >= 70 ? 'text-success' : 
                        sport.accuracy >= 50 ? 'text-warning' : 
                        'text-destructive'
                      )}>
                        {sport.accuracy}%
                        <span className="text-muted-foreground/70 text-xs ml-1 font-normal">
                          ({sport.wins}/{sport.total})
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          sport.accuracy >= 70 ? 'bg-gradient-to-r from-success to-emerald-400' : 
                          sport.accuracy >= 50 ? 'bg-gradient-to-r from-warning to-amber-400' : 
                          'bg-gradient-to-r from-destructive to-red-400'
                        )} 
                        style={{ 
                          width: animatedBars ? `${sport.accuracy}%` : '0%',
                          transitionDelay: `${sportStats.indexOf(sport) * 150}ms`
                        }} 
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-popover border-border">
                  <p className="text-xs font-medium">
                    {sport.name}: {sport.wins}/{sport.total} ({sport.accuracy}%)
                  </p>
                  <p className={cn(
                    "text-xs",
                    sport.profit >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {sport.profit >= 0 ? '+' : ''}{sport.profit.toLocaleString('cs-CZ')} Kč
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm py-4">
            ⏳ {language === 'cz' ? 'Čekáme na výsledky' : 'Waiting for results'}
          </div>
        )}
      </div>
    </div>
  );
}
