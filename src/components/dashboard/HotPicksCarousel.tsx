import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, Eye, Flame } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { formatCurrency, toDecimalOdds } from '@/lib/oddsUtils';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { APIPrediction } from '@/hooks/usePredictions';
import { cn } from '@/lib/utils';
import { differenceInHours, differenceInMinutes, format } from 'date-fns';

interface HotPicksCarouselProps {
  predictions: APIPrediction[];
  isLoading?: boolean;
}

export function HotPicksCarousel({ predictions, isLoading }: HotPicksCarouselProps) {
  const { language } = useLanguage();
  const { togglePick, isPicked } = useSavedPicks();
  const locale = language === 'cz' ? 'cz' : 'en';
  const stake = 1000;

  // Get top 6 picks sorted by confidence
  const topPicks = predictions
    .filter(p => p.result === 'pending')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);

  const formatCountdown = (gameTime: string) => {
    const game = new Date(gameTime);
    const now = new Date();
    const hoursUntil = differenceInHours(game, now);
    const minutesUntil = differenceInMinutes(game, now) % 60;
    
    if (hoursUntil < 0) return { text: language === 'cz' ? 'LIVE' : 'LIVE', urgent: false, critical: true };
    if (hoursUntil === 0) return { text: `${minutesUntil}m`, urgent: true, critical: minutesUntil < 30 };
    if (hoursUntil < 3) return { text: `${hoursUntil}h ${minutesUntil}m`, urgent: true, critical: false };
    if (hoursUntil < 24) return { text: `${hoursUntil}h`, urgent: false, critical: false };
    return { text: format(game, 'MMM d'), urgent: false, critical: false };
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card p-4 min-w-[280px] flex-shrink-0">
            <Skeleton className="h-6 w-16 mb-3" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (topPicks.length === 0) {
    return (
      <div className="glass-card py-12 text-center">
        <Flame className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-3 text-base font-semibold">
          {language === 'cz' ? 'Žádné aktivní tipy' : 'No active picks'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'cz' ? 'Nové predikce přibývají průběžně' : 'New predictions are added throughout the day'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
      {topPicks.map((pick) => {
        const sport = pick.sport?.includes('-') 
          ? getSportFromTeams(pick.homeTeam, pick.awayTeam)
          : pick.sport;
        const confidencePercent = normalizeConfidence(pick.confidence);
        const isHotPick = confidencePercent >= 75;
        const countdown = formatCountdown(pick.gameTime);
        const odds = toDecimalOdds(pick.prediction.odds);
        const potentialProfit = stake * (odds - 1);
        const saved = isPicked(pick.id);

        return (
          <div
            key={pick.id}
            className={cn(
              "min-w-[280px] md:min-w-[300px] flex-shrink-0 snap-start rounded-xl border transition-all",
              "bg-gradient-to-br from-card via-card to-muted/30",
              isHotPick && "border-success/30 shadow-lg shadow-success/10",
              !isHotPick && "border-border hover:border-primary/50"
            )}
          >
            <Link to={`/predictions/${pick.id}`} className="block p-4 group">
              {/* Header: Sport + Hot Badge + Confidence */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getSportEmoji(sport || 'Sports')}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {sport || 'Sports'}
                  </span>
                  {isHotPick && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-success/20 text-success animate-pulse">
                      🔥 HOT
                    </span>
                  )}
                </div>
                
                {/* Animated confidence circle */}
                <div className="relative h-12 w-12">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-muted/30"
                    />
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${confidencePercent} 100`}
                      strokeLinecap="round"
                      className={cn(
                        "transition-all duration-1000",
                        confidencePercent >= 75 ? "text-success" :
                        confidencePercent >= 65 ? "text-primary" :
                        "text-warning"
                      )}
                    />
                  </svg>
                  <span className={cn(
                    "absolute inset-0 flex items-center justify-center text-xs font-bold",
                    confidencePercent >= 75 ? "text-success" :
                    confidencePercent >= 65 ? "text-primary" :
                    "text-warning"
                  )}>
                    {confidencePercent}%
                  </span>
                </div>
              </div>

              {/* Teams */}
              <p className="font-bold text-sm mb-1 group-hover:text-primary transition-colors truncate">
                {pick.awayTeam} @ {pick.homeTeam}
              </p>

              {/* Countdown */}
              <div className={cn(
                "flex items-center gap-1.5 text-xs mb-2",
                countdown.critical ? "text-destructive font-bold animate-pulse" :
                countdown.urgent ? "text-warning font-medium" :
                "text-muted-foreground"
              )}>
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {countdown.critical && '⚡ '}
                  {countdown.urgent && !countdown.critical && '⏰ '}
                  {countdown.text}
                </span>
                {countdown.urgent && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning ml-1">
                    {language === 'cz' ? 'BRZY' : 'SOON'}
                  </span>
                )}
              </div>

              {/* Potential Profit */}
              <div className="text-xs text-success font-medium mb-3">
                💰 {formatCurrency(potentialProfit, locale, { showSign: true })} {language === 'cz' ? `z ${formatCurrency(stake, locale)}` : `from ${formatCurrency(stake, locale)}`}
              </div>
            </Link>

            {/* Footer: Pick + Follow */}
            <div className="flex items-center justify-between px-4 pb-4 pt-0">
              <div className="text-xs">
                <span className="text-muted-foreground">{language === 'cz' ? 'Tip:' : 'Pick:'}</span>
                <span className="font-bold ml-1.5 text-primary">{pick.prediction.pick}</span>
              </div>
              <Button 
                size="sm" 
                variant={saved ? "default" : "outline"} 
                className="h-7 text-xs gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  togglePick(pick);
                }}
              >
                <Eye className="h-3 w-3" />
                {saved 
                  ? (language === 'cz' ? 'Přidáno' : 'Added') 
                  : (language === 'cz' ? 'Sledovat' : 'Follow')
                }
              </Button>
            </div>
          </div>
        );
      })}
      
      {/* View All Card */}
      <Link 
        to="/predictions"
        className="glass-card p-4 min-w-[160px] flex-shrink-0 snap-start flex flex-col items-center justify-center text-center hover:border-primary/50 transition-all group"
      >
        <div className="p-3 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
          <ChevronRight className="h-6 w-6 text-primary" />
        </div>
        <span className="text-sm font-semibold text-primary">
          {language === 'cz' ? 'Všechny tipy →' : 'All picks →'}
        </span>
      </Link>
    </div>
  );
}
