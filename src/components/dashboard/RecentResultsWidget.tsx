import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { toDecimalOdds } from '@/lib/oddsUtils';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { cn } from '@/lib/utils';
import type { Prediction } from '@/lib/types';

interface RecentResultsWidgetProps {
  predictions: Prediction[];
}

export function RecentResultsWidget({ predictions }: RecentResultsWidgetProps) {
  const { language } = useLanguage();

  // Get last 10 completed predictions
  const recentResults = useMemo(() => {
    return predictions
      .filter(p => p.result === 'win' || p.result === 'loss')
      .sort((a, b) => new Date(b.gameTime).getTime() - new Date(a.gameTime).getTime())
      .slice(0, 10);
  }, [predictions]);

  // Calculate total profit
  const totalProfit = useMemo(() => {
    return recentResults.reduce((acc, r) => {
      const odds = toDecimalOdds(r.prediction.odds);
      if (r.result === 'win') {
        return acc + Math.round((odds - 1) * 1000);
      } else {
        return acc - 1000;
      }
    }, 0);
  }, [recentResults]);

  const winsCount = recentResults.filter(r => r.result === 'win').length;
  const accuracy = recentResults.length > 0 ? Math.round((winsCount / recentResults.length) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          📋 {language === 'cz' ? 'Poslední výsledky' : 'Recent Results'}
        </h3>
        <Link 
          to="/results" 
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {language === 'cz' ? 'Vše →' : 'All →'}
        </Link>
      </div>
      
      {recentResults.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm py-6">
          {language === 'cz' 
            ? 'Žádné dokončené predikce zatím. Výsledky se zobrazí po skončení zápasů.'
            : 'No completed predictions yet. Results will appear after games finish.'
          }
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {recentResults.map(r => {
              const isWin = r.result === 'win';
              const sport = r.sport?.includes('-') 
                ? getSportFromTeams(r.homeTeam, r.awayTeam)
                : r.sport;
              const odds = toDecimalOdds(r.prediction.odds);
              const confidence = normalizeConfidence(r.confidence);
              const profit = isWin ? Math.round((odds - 1) * 1000) : -1000;
              
              return (
                <Link 
                  key={r.id} 
                  to={`/predictions/${r.id}`}
                  className={cn(
                    "flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors group",
                    isWin ? 'bg-success/5 hover:bg-success/10' : 'bg-destructive/5 hover:bg-destructive/10'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={isWin ? 'text-success' : 'text-destructive'}>
                      {isWin ? '✅' : '❌'}
                    </span>
                    <span className="text-sm shrink-0">{getSportEmoji(sport || 'Sports')}</span>
                    <span className="text-sm truncate group-hover:text-primary transition-colors">
                      {r.homeTeam} vs {r.awayTeam}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {r.prediction.pick}
                    </span>
                    <span className={cn(
                      "text-xs",
                      confidence >= 70 ? 'text-success' : 
                      confidence >= 55 ? 'text-warning' : 
                      'text-muted-foreground'
                    )}>
                      {confidence}%
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {odds.toFixed(2)}
                    </span>
                    <span className={cn(
                      "text-xs font-bold font-mono min-w-[70px] text-right",
                      isWin ? 'text-success' : 'text-destructive'
                    )}>
                      {isWin 
                        ? `+${profit.toLocaleString('cs-CZ')} Kč`
                        : `-1 000 Kč`
                      }
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Summary row */}
          <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'cz' ? 'Celkem' : 'Total'}: {winsCount}/{recentResults.length}
              <span className={cn(
                "ml-1.5",
                accuracy >= 60 ? 'text-success' : 
                accuracy >= 50 ? 'text-warning' : 
                'text-destructive'
              )}>
                ({accuracy}%)
              </span>
            </span>
            <span className={cn(
              "font-bold font-mono",
              totalProfit >= 0 ? 'text-success' : 'text-destructive'
            )}>
              💰 {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('cs-CZ')} Kč
            </span>
          </div>
        </>
      )}
    </div>
  );
}
