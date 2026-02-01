import { useActivePredictions } from '@/hooks/usePredictions';
import { getSportEmoji } from '@/lib/sportEmoji';
import { normalizeConfidence, getConfidenceColorClass } from '@/lib/confidenceUtils';
import { Skeleton } from '@/components/ui/skeleton';

export function LiveTicker() {
  const { data: predictions, isLoading, error } = useActivePredictions();

  if (isLoading) {
    return (
      <div className="relative overflow-hidden border-y border-border/50 bg-muted/30 py-3">
        <div className="flex gap-8 px-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !predictions?.length) {
    return null;
  }

  // Deduplicate predictions by game (team + date)
  const seenGames = new Map<string, typeof predictions[0]>();
  predictions
    .filter((p) => p.result === 'pending')
    .forEach(p => {
      const key = `${p.homeTeam}-${p.awayTeam}-${p.gameTime.split('T')[0]}`;
      if (!seenGames.has(key)) {
        seenGames.set(key, p);
      }
    });
  
  const tickerItems = Array.from(seenGames.values()).slice(0, 8);
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="relative overflow-hidden border-y border-border/50 bg-muted/30 py-3">
      <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent" />

      <div className="flex animate-ticker">
        {duplicatedItems.map((prediction, index) => {
          const confidencePercent = normalizeConfidence(prediction.confidence);
          
          return (
            <div
              key={`${prediction.id}-${index}`}
              className="flex flex-shrink-0 items-center gap-6 px-8"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getSportEmoji(prediction.sport, prediction.homeTeam, prediction.awayTeam)}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {prediction.awayTeam} @ {prediction.homeTeam}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {prediction.prediction.pick}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        confidencePercent >= 70
                          ? 'text-success'
                          : confidencePercent >= 55
                          ? 'text-yellow-400'
                          : 'text-orange-400'
                      }`}
                    >
                      {confidencePercent}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-4 w-px bg-border" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
