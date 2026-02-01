import { useActivePredictions } from '@/hooks/usePredictions';
import { getSportEmoji } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
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

  // Get ALL pending predictions, deduplicated
  const seenGames = new Map<string, typeof predictions[0]>();
  predictions
    .filter((p) => p.result === 'pending')
    .forEach(p => {
      const key = `${p.homeTeam}-${p.awayTeam}-${p.gameTime.split('T')[0]}`;
      if (!seenGames.has(key)) {
        seenGames.set(key, p);
      }
    });
  
  // Show all predictions (up to 15) for scrolling
  const tickerItems = Array.from(seenGames.values())
    .sort((a, b) => {
      const confA = a.confidence <= 1 ? a.confidence * 100 : a.confidence;
      const confB = b.confidence <= 1 ? b.confidence * 100 : b.confidence;
      return confB - confA;
    })
    .slice(0, 15);
  
  // Duplicate for seamless infinite scroll
  const duplicatedItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="relative overflow-hidden border-y border-border/50 bg-muted/30 py-3">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent" />

      {/* Scrolling ticker - using CSS animation */}
      <div 
        className="flex whitespace-nowrap"
        style={{
          animation: `ticker ${tickerItems.length * 4}s linear infinite`,
        }}
      >
        {duplicatedItems.map((prediction, index) => {
          const confidencePercent = normalizeConfidence(prediction.confidence);
          const sportEmoji = getSportEmoji(prediction.sport, prediction.homeTeam, prediction.awayTeam);
          
          return (
            <div
              key={`${prediction.id}-${index}`}
              className="flex flex-shrink-0 items-center gap-6 px-8"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{sportEmoji}</span>
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

      {/* Add keyframe animation via style tag */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
