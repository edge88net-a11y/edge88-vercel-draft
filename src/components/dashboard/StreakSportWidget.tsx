import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { cn } from '@/lib/utils';
import type { Prediction } from '@/lib/types';

interface StreakSportWidgetProps {
  predictions: Prediction[];
  winStreak?: number;
}

export function StreakSportWidget({ predictions, winStreak = 0 }: StreakSportWidgetProps) {
  const { language } = useLanguage();

  // Get last 10 results
  const lastResults = useMemo(() => {
    return predictions
      .filter(p => p.result === 'win' || p.result === 'loss')
      .slice(0, 10)
      .map(p => p.result);
  }, [predictions]);

  // Calculate sport stats
  const sportStats = useMemo(() => {
    const completed = predictions.filter(p => p.result === 'win' || p.result === 'loss');
    const sportMap = new Map<string, { wins: number; total: number }>();
    
    completed.forEach(p => {
      const sport = p.sport?.includes('-') 
        ? getSportFromTeams(p.homeTeam, p.awayTeam)
        : p.sport || 'Other';
      
      if (!sportMap.has(sport)) {
        sportMap.set(sport, { wins: 0, total: 0 });
      }
      const stats = sportMap.get(sport)!;
      stats.total++;
      if (p.result === 'win') stats.wins++;
    });

    return Array.from(sportMap.entries())
      .map(([name, { wins, total }]) => ({
        name,
        emoji: getSportEmoji(name),
        wins,
        total,
        accuracy: Math.round((wins / total) * 100)
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);
  }, [predictions]);

  // Streak text
  const getStreakText = (streak: number) => {
    if (streak === 0) return language === 'cz' ? 'Žádná série' : 'No streak';
    if (language === 'cz') {
      if (streak === 1) return '1 Výhra';
      if (streak < 5) return `${streak} Výhry`;
      return `${streak} Výher`;
    }
    return streak === 1 ? '1 Win' : `${streak} Wins`;
  };

  return (
    <div className="space-y-4">
      {/* Streak Section */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-base font-bold mb-3 flex items-center gap-2">
          🔥 {language === 'cz' ? 'Aktuální série' : 'Current Streak'}
        </h3>
        <div className="text-center">
          <div className="text-4xl mb-1">
            {winStreak > 0 ? '🔥'.repeat(Math.min(winStreak, 5)) : '—'}
          </div>
          <div className={cn(
            "text-2xl font-bold",
            winStreak >= 5 ? "text-success" :
            winStreak >= 3 ? "text-warning" :
            "text-foreground"
          )}>
            {getStreakText(winStreak)}
          </div>
          {lastResults.length > 0 && (
            <div className="flex justify-center gap-1 mt-3">
              {lastResults.map((r, i) => (
                <span 
                  key={i} 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    r === 'win' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  )}
                >
                  {r === 'win' ? '✓' : '✗'}
                </span>
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
              <div key={sport.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">
                    {sport.emoji} {sport.name}
                  </span>
                  <span className={cn(
                    "font-mono",
                    sport.accuracy >= 70 ? 'text-success' : 
                    sport.accuracy >= 50 ? 'text-warning' : 
                    'text-destructive'
                  )}>
                    {sport.accuracy}% 
                    <span className="text-muted-foreground/70 text-xs ml-1">
                      ({sport.wins}/{sport.total})
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      sport.accuracy >= 70 ? 'bg-success' : 
                      sport.accuracy >= 50 ? 'bg-warning' : 
                      'bg-destructive'
                    )} 
                    style={{ width: `${sport.accuracy}%` }} 
                  />
                </div>
              </div>
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
