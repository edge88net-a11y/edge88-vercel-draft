import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamLogo } from '@/components/TeamLogo';
import { GameCountdown } from '@/components/GameCountdown';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { APIPrediction } from '@/hooks/usePredictions';
import { cn } from '@/lib/utils';
import { formatOdds } from '@/lib/oddsUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface TonightsGamesProps {
  predictions: APIPrediction[];
}

export function TonightsGames({ predictions }: TonightsGamesProps) {
  const { language } = useLanguage();
  const locale = language === 'cz' ? 'cz' : 'en';
  
  // Filter to show games within next 12 hours
  const now = new Date();
  const tonightsGames = predictions
    .filter((p) => {
      const gameDate = new Date(p.gameTime);
      const hoursUntil = (gameDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntil > 0 && hoursUntil <= 12 && p.result === 'pending';
    })
    .sort((a, b) => new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime())
    .slice(0, 5);

  if (tonightsGames.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-3 font-semibold">No games in next 12 hours</h3>
        <p className="mt-1 text-sm text-muted-foreground">Check back later for upcoming picks</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute -right-1 -top-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">Tonight's Games</h3>
        </div>
        <Link to="/predictions">
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
      
      <div className="divide-y divide-border">
        {tonightsGames.map((game) => (
          <div key={game.id} className="p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between gap-4">
              {/* Teams */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <TeamLogo teamName={game.awayTeam} sport={game.sport} size="sm" />
                  <span className="text-sm font-medium truncate">{game.awayTeam}</span>
                  <span className="text-xs text-muted-foreground">@</span>
                  <TeamLogo teamName={game.homeTeam} sport={game.sport} size="sm" />
                  <span className="text-sm font-medium truncate">{game.homeTeam}</span>
                </div>
                
                {/* Pick */}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    'bg-primary/10 text-primary'
                  )}>
                    {game.prediction.pick}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {game.prediction.odds ? formatOdds(game.prediction.odds, locale) : '—'}
                  </span>
                </div>
              </div>

              {/* Right side: Countdown & Confidence */}
              <div className="flex items-center gap-4">
                <GameCountdown gameTime={game.gameTime} compact />
                <ConfidenceMeter value={game.confidence} size="sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
