import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Calendar, Plus, Flame } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const topPicks = predictions
    .filter(p => p.result === 'pending')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, [topPicks]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatCountdown = (gameTime: string) => {
    const game = new Date(gameTime);
    const now = new Date();
    const hoursUntil = differenceInHours(game, now);
    const minutesUntil = differenceInMinutes(game, now) % 60;
    
    if (hoursUntil < 0) return { text: 'LIVE', urgent: false, critical: true };
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
    <div className="relative">
      {/* Scroll arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory"
      >
        {topPicks.map((pick, index) => {
          const sport = pick.sport?.includes('-') 
            ? getSportFromTeams(pick.homeTeam, pick.awayTeam)
            : pick.sport;
          const confidencePercent = normalizeConfidence(pick.confidence);
          const isTopPick = index === 0;
          const isHotPick = confidencePercent >= 75;
          const countdown = formatCountdown(pick.gameTime);
          const odds = toDecimalOdds(pick.prediction.odds);
          const potentialProfit = stake * (odds - 1);
          const saved = isPicked(pick.id);

          return (
            <div
              key={pick.id}
              className={cn(
                "flex-shrink-0 snap-start rounded-xl border transition-all relative overflow-hidden card-tilt",
                "bg-gradient-to-br from-card via-card to-muted/30",
                isTopPick && "min-w-[320px] md:min-w-[340px] golden-glow",
                !isTopPick && "min-w-[280px] md:min-w-[300px]",
                isHotPick && !isTopPick && "border-success/30 shadow-lg shadow-success/10",
                !isHotPick && !isTopPick && "border-border hover:border-primary/50",
                countdown.critical && "border-red-500/50 animate-pulse"
              )}
              style={isTopPick ? { transform: 'scale(1.02)' } : undefined}
            >
              {/* Top Pick Crown Badge */}
              {isTopPick && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 py-1.5 px-3 flex items-center justify-center gap-1.5">
                  <span className="text-yellow-400 text-sm">👑</span>
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                    TOP TIP
                  </span>
                </div>
              )}

              <Link to={`/predictions/${pick.id}`} className={cn("block p-4 group", isTopPick && "pt-10")}>
                {/* Header: Sport + Hot Badge + Confidence */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getSportEmoji(sport || 'Sports')}</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {sport || 'Sports'}
                    </span>
                    {isHotPick && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-success/20 text-success relative">
                        <span className="animate-fire-bounce">🔥</span> HOT
                      </span>
                    )}
                    {countdown.critical && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 animate-pulse">
                        ⚡ LIVE
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
                          "animate-ring-fill",
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
                  countdown.critical ? "text-red-400 font-bold" :
                  countdown.urgent ? "text-warning font-medium" :
                  "text-muted-foreground"
                )}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {countdown.critical && '⚡ '}
                    {countdown.urgent && !countdown.critical && '⏰ '}
                    {countdown.text}
                  </span>
                </div>

                {/* Potential Profit */}
                <div className="text-xs text-success font-medium mb-3 stat-glow-green">
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
                  className={cn(
                    "h-8 text-xs gap-1.5 font-semibold",
                    !saved && "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-400"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    togglePick(pick);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {saved 
                    ? (language === 'cz' ? 'Na tiketu' : 'Added') 
                    : (language === 'cz' ? 'Přidat na tiket' : 'Add to slip')
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

      {/* Scroll indicator dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {topPicks.slice(0, 4).map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
        ))}
      </div>
    </div>
  );
}
