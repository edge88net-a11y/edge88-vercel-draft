import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, TrendingUp } from 'lucide-react';
import { APIPrediction } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { formatCurrency, toDecimalOdds } from '@/lib/oddsUtils';
import { getSportEmoji } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroNextGameProps {
  predictions: APIPrediction[];
  isLoading?: boolean;
}

export function HeroNextGame({ predictions, isLoading }: HeroNextGameProps) {
  const { language } = useLanguage();
  const { togglePick, isPicked } = useSavedPicks();
  const locale = language === 'cz' ? 'cz' : 'en';
  const [, setTick] = useState(0);

  // Find next upcoming game with highest confidence
  const nextGame = predictions
    .filter(p => p.result === 'pending' && new Date(p.gameTime) > new Date())
    .sort((a, b) => new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime())
    .find(p => normalizeConfidence(p.confidence) >= 55);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-4" />
        <div className="h-8 w-64 bg-muted rounded mb-2" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
    );
  }

  if (!nextGame) {
    return (
      <div className="glass-card p-6 bg-gradient-to-r from-muted/50 to-muted/30 border-muted-foreground/20">
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">
            {language === 'cz' 
              ? '⏳ Žádné aktivní zápasy. Další tipy brzy...' 
              : '⏳ No active games. More picks coming soon...'}
          </p>
        </div>
      </div>
    );
  }

  const gameDate = new Date(nextGame.gameTime);
  const now = new Date();
  const isLive = gameDate <= now;
  const totalSeconds = Math.max(0, Math.floor((gameDate.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const confidencePercent = normalizeConfidence(nextGame.confidence);
  const odds = toDecimalOdds(nextGame.prediction.odds);
  const potentialProfit = 1000 * (odds - 1);
  const saved = isPicked(nextGame.id);
  
  const watchingCount = Math.floor(150 + confidencePercent * 2.5 + Math.random() * 50);
  const communityVote = confidencePercent > 60 ? Math.floor(55 + confidencePercent * 0.3 + Math.random() * 10) : Math.floor(40 + Math.random() * 20);

  return (
    <div className={cn(
      "glass-card overflow-hidden transition-all relative",
      "border-emerald-500/20 hover:border-emerald-500/40"
    )}>
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 animate-mesh-gradient opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/30 via-transparent to-cyan-900/30" />
      
      <div className="p-4 md:p-6 relative z-10">
        {/* Top row: Live badge + Countdown */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isLive ? (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                ⚡ LIVE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {language === 'cz' ? 'Další zápas' : 'Next Game'}
              </span>
            )}
            
            {/* Flip-style countdown */}
            {!isLive && (
              <div className="flex items-center gap-1 font-mono text-lg md:text-xl font-bold">
                {hours > 0 && (
                  <>
                    <span className="flip-digit bg-gray-800 text-foreground">{String(hours).padStart(2, '0')}</span>
                    <span className="text-muted-foreground">:</span>
                  </>
                )}
                <span className="flip-digit bg-gray-800 text-foreground">{String(minutes).padStart(2, '0')}</span>
                <span className="text-muted-foreground">:</span>
                <span className="flip-digit bg-gray-800 text-cyan-400">{String(seconds).padStart(2, '0')}</span>
              </div>
            )}
          </div>
          
          <span className="text-4xl">{getSportEmoji(nextGame.sport || 'Sports')}</span>
        </div>

        {/* Teams + Confidence */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            <Link to={`/predictions/${nextGame.id}`} className="group">
              <h3 className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors">
                {nextGame.awayTeam} <span className="text-muted-foreground font-normal mx-2">@</span> {nextGame.homeTeam}
              </h3>
            </Link>
            
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                {language === 'cz' ? 'Tip' : 'Pick'}: {nextGame.prediction.pick}
              </span>
              <span className="text-muted-foreground font-mono">{odds.toFixed(2)}</span>
              <span className="text-success font-semibold stat-glow-green">
                {formatCurrency(potentialProfit, locale, { showSign: true })}
              </span>
            </div>
          </div>

          {/* Confidence Circle */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
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
                "absolute inset-0 flex items-center justify-center text-sm font-bold",
                confidencePercent >= 75 ? "text-success stat-glow-green" :
                confidencePercent >= 65 ? "text-primary" :
                "text-warning"
              )}>
                {confidencePercent}%
              </span>
            </div>

            <Button 
              size="default"
              variant={saved ? "default" : "outline"}
              className={cn(
                "gap-1.5 font-bold transition-all",
                !saved && "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
              )}
              onClick={() => togglePick(nextGame)}
            >
              {saved 
                ? (language === 'cz' ? '✓ Přidáno' : '✓ Added')
                : (language === 'cz' ? 'Detail →' : 'Details →')
              }
            </Button>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mb-4">
          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full animate-grow-width",
                confidencePercent >= 75 ? "bg-gradient-to-r from-success to-emerald-400" :
                confidencePercent >= 65 ? "bg-gradient-to-r from-primary to-cyan-400" :
                "bg-gradient-to-r from-warning to-amber-400"
              )}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            📊 {watchingCount} {language === 'cz' ? 'lidí sleduje' : 'watching'}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            🎯 {language === 'cz' ? 'Komunita' : 'Community'}: {communityVote}% {language === 'cz' ? 'souhlasí' : 'agrees'}
          </span>
        </div>
      </div>
    </div>
  );
}
