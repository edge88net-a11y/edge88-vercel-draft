import { useActivePredictions, useStats } from '@/hooks/usePredictions';
import { getSportEmoji } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useLanguage } from '@/contexts/LanguageContext';

export function LiveStatsTicker() {
  const { data: predictions } = useActivePredictions();
  const { data: stats } = useStats();
  const { winStreak } = useWinStreak();
  const { language } = useLanguage();

  // Build ticker items from real data
  const tickerItems: { emoji: string; text: string; value: string }[] = [];

  // Add top predictions
  if (predictions?.length) {
    const topPredictions = predictions
      .filter(p => p.result === 'pending')
      .sort((a, b) => {
        const confA = normalizeConfidence(a.confidence);
        const confB = normalizeConfidence(b.confidence);
        return confB - confA;
      })
      .slice(0, 5);

    topPredictions.forEach(p => {
      const conf = normalizeConfidence(p.confidence);
      const emoji = getSportEmoji(p.sport, p.homeTeam, p.awayTeam);
      tickerItems.push({
        emoji,
        text: p.prediction.pick,
        value: `${conf}%`
      });
    });
  }

  // Add streak and accuracy
  if (winStreak?.currentStreak && winStreak.currentStreak > 0) {
    tickerItems.push({
      emoji: '🔥',
      text: language === 'cz' ? 'Série' : 'Streak',
      value: `${winStreak.currentStreak} ${language === 'cz' ? 'výher' : 'wins'}`
    });
  }

  if (stats?.accuracy) {
    tickerItems.push({
      emoji: '📊',
      text: language === 'cz' ? 'Přesnost' : 'Accuracy',
      value: `${stats.accuracy}%`
    });
  }

  // Fallback items if no data
  if (tickerItems.length === 0) {
    return null;
  }

  // Duplicate for seamless scroll
  const duplicatedItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="relative h-8 overflow-hidden bg-gradient-to-r from-[hsl(230,25%,6%)] via-[hsl(230,20%,8%)] to-[hsl(230,25%,6%)] border-b border-white/[0.03]">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[hsl(230,25%,5%)] to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[hsl(230,25%,5%)] to-transparent" />

      {/* Scrolling ticker */}
      <div 
        className="flex items-center h-full whitespace-nowrap"
        style={{
          animation: `stats-ticker ${tickerItems.length * 5}s linear infinite`,
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-6"
          >
            <span className="text-sm">{item.emoji}</span>
            <span className="text-xs text-[#e6edf3]/60">{item.text}</span>
            <span className="text-xs font-semibold text-cyan-400">{item.value}</span>
            <span className="text-[#e6edf3]/20 ml-4">•</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes stats-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
