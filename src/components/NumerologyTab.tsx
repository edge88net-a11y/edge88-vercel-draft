import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePredictionNumerology, NumerologyData } from '@/hooks/usePredictions';
import { Star, Moon, Sun, Sparkles, Calendar, Eye, Triangle, CircleDot, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface NumerologyTabProps {
  predictionId: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string | Date;
  pick: string;
  className?: string;
}

// Beautiful coming soon placeholder
function NumerologyComingSoon() {
  const { language } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Mystical Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-violet-900/40 border border-purple-500/20 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSI0MCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjEwIiByPSIwLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-6">
            <Star className="h-8 w-8 text-purple-400 animate-pulse" />
            <Moon className="h-10 w-10 text-indigo-300" />
            <Star className="h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            {language === 'cz' ? 'Numerologie & Astrologie' : 'Numerology & Astrology'}
          </h3>
          
          <p className="text-purple-200/80 text-sm md:text-base max-w-md mb-6">
            {language === 'cz' 
              ? 'Mystická analýza kosmických energií pro tento zápas se připravuje'
              : 'Mystical analysis of cosmic energies for this match is being prepared'}
          </p>

          <div className="flex items-center gap-2 text-purple-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">
              {language === 'cz' ? 'Čtení hvězd...' : 'Reading the stars...'}
            </span>
          </div>
        </div>
      </div>

      {/* Placeholder cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-muted/30 border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
        </div>

        <div className="rounded-xl bg-muted/30 border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      {/* Coming soon message */}
      <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-6 text-center">
        <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-4" />
        <h4 className="font-semibold text-purple-300 mb-2">
          {language === 'cz' ? 'Již brzy' : 'Coming Soon'}
        </h4>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {language === 'cz'
            ? 'Naše mystické analýzy budou brzy k dispozici. Zatím se spoléhejte na naši datově řízenou AI predikci.'
            : 'Our mystical analysis will be available soon. For now, rely on our data-driven AI prediction.'}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-gradient-to-r from-purple-500/5 to-indigo-500/5 border border-purple-500/10 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-purple-300">
              {language === 'cz' ? 'Upozornění:' : 'Disclaimer:'}
            </span>{' '}
            {language === 'cz'
              ? 'Tato sekce je pouze pro zábavu. Naše hlavní predikce využívá datově řízenou AI analýzu.'
              : 'This section is for entertainment purposes only. Our main prediction uses data-driven AI analysis.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Render numerology data from API
function RenderNumerologyData({ data, homeTeam, awayTeam }: { data: NumerologyData; homeTeam: string; awayTeam: string }) {
  const { language } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Mystical Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-violet-900/40 border border-purple-500/20 p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSI0MCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjEwIiByPSIwLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative flex items-center justify-center gap-3 mb-4">
          <Star className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
          <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            {language === 'cz' ? 'Numerologie & Astrologie' : 'Numerology & Astrology'}
          </h3>
          <Moon className="h-5 w-5 md:h-6 md:w-6 text-indigo-400" />
        </div>
        
        <p className="text-center text-xs md:text-sm text-purple-200/70">
          {language === 'cz' 
            ? 'Mystická analýza kosmických energií'
            : 'Mystical analysis of cosmic energies'}
        </p>
      </div>

      {/* Numerology Score */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h4 className="text-base md:text-lg font-semibold text-purple-300 flex items-center justify-center md:justify-start gap-2">
              <CircleDot className="h-4 w-4 md:h-5 md:w-5" />
              {language === 'cz' ? 'Numerologické skóre' : 'Numerology Score'}
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {language === 'cz' 
                ? `Kosmická energie favorizuje: ${data.favoredTeam}`
                : `Cosmic energy favors: ${data.favoredTeam}`}
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-mono font-bold text-purple-400">{data.numerologyScore}%</div>
            <p className="text-xs text-purple-300/70">
              {language === 'cz' ? 'Mystické skóre' : 'Mystical Score'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 h-2 w-full rounded-full bg-purple-900/50 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-1000"
            style={{ width: `${data.numerologyScore}%` }}
          />
        </div>
      </div>

      {/* Date & Zodiac */}
      <div className="rounded-xl bg-muted/30 border border-border p-4 md:p-6">
        <h4 className="text-base md:text-lg font-semibold flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 md:h-5 md:w-5 text-indigo-400" />
          {language === 'cz' ? 'Význam data' : 'Date Significance'}
        </h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{data.gameZodiac.symbol}</span>
              <span className="font-medium text-indigo-300">{data.gameZodiac.sign}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              {language === 'cz' 
                ? `Element: ${data.gameZodiac.element}`
                : `Element: ${data.gameZodiac.element}`}
            </p>
          </div>
          
          <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-mono text-purple-400">{data.dateNumber}</span>
              <span className="font-medium text-purple-300">
                {language === 'cz' ? 'Číslo dne' : 'Day Number'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">{data.dateMeaning}</p>
          </div>
        </div>
      </div>

      {/* Team Numerology */}
      <div className="rounded-xl bg-muted/30 border border-border p-4 md:p-6">
        <h4 className="text-base md:text-lg font-semibold flex items-center gap-2 mb-4">
          <Triangle className="h-4 w-4 md:h-5 md:w-5 text-pink-400" />
          {language === 'cz' ? 'Numerologie týmů' : 'Team Numerology'}
        </h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{homeTeam}</span>
              <span className="text-2xl md:text-3xl font-mono font-bold text-purple-400">
                {data.teamNumerology.home.number}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-2">
              {data.teamNumerology.home.meaning}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{data.teamNumerology.home.zodiac}</span>
              <span>•</span>
              <span>{data.teamNumerology.home.element}</span>
            </div>
          </div>
          
          <div className="rounded-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{awayTeam}</span>
              <span className="text-2xl md:text-3xl font-mono font-bold text-indigo-400">
                {data.teamNumerology.away.number}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-2">
              {data.teamNumerology.away.meaning}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{data.teamNumerology.away.zodiac}</span>
              <span>•</span>
              <span>{data.teamNumerology.away.element}</span>
            </div>
          </div>
        </div>
        
        {/* Element Compatibility */}
        <div className="mt-4 rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className={cn(
              'h-4 w-4',
              data.elementCompatibility === 'harmonious' ? 'text-success' :
              data.elementCompatibility === 'supportive' ? 'text-yellow-400' :
              'text-orange-400'
            )} />
            <span className="text-xs md:text-sm">
              {language === 'cz' ? 'Kompatibilita:' : 'Compatibility:'}{' '}
              <span className={cn(
                'font-medium capitalize',
                data.elementCompatibility === 'harmonious' ? 'text-success' :
                data.elementCompatibility === 'supportive' ? 'text-yellow-400' :
                'text-orange-400'
              )}>
                {language === 'cz' 
                  ? (data.elementCompatibility === 'harmonious' ? 'Harmonická' : 
                     data.elementCompatibility === 'supportive' ? 'Podpůrná' : 'Vyzývající')
                  : data.elementCompatibility}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Planetary Alignment */}
      <div className="rounded-xl bg-muted/30 border border-border p-4 md:p-6">
        <h4 className="text-base md:text-lg font-semibold flex items-center gap-2 mb-4">
          <Sun className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
          {language === 'cz' ? 'Planetární uspořádání' : 'Planetary Alignment'}
        </h4>
        
        <div className="flex items-center gap-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 md:p-4">
          <div className="text-3xl md:text-4xl">
            {data.planetaryAlignment.planet === 'Mercury' ? '☿' : 
             data.planetaryAlignment.planet === 'Venus' ? '♀' :
             data.planetaryAlignment.planet === 'Mars' ? '♂' :
             data.planetaryAlignment.planet === 'Jupiter' ? '♃' :
             data.planetaryAlignment.planet === 'Saturn' ? '♄' :
             data.planetaryAlignment.planet === 'Uranus' ? '♅' : '♆'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-yellow-300 text-sm md:text-base">
                {data.planetaryAlignment.planet}
              </span>
              {data.planetaryAlignment.retrograde && (
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                  {language === 'cz' ? 'Retrográdní' : 'Retrograde'}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {data.planetaryAlignment.impact}
            </p>
          </div>
        </div>
      </div>

      {/* Historical Patterns */}
      <div className="rounded-xl bg-muted/30 border border-border p-4 md:p-6">
        <h4 className="text-base md:text-lg font-semibold flex items-center gap-2 mb-4">
          <Eye className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
          {language === 'cz' ? 'Historické vzorce' : 'Historical Patterns'}
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-xs md:text-sm text-muted-foreground">
              {language === 'cz' ? 'Zápasy v tento den' : 'Games on this day'}
            </span>
            <span className="font-mono font-bold">{data.historicalPatterns.gamesOnDay}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-xs md:text-sm text-muted-foreground">
              {language === 'cz' ? 'Úspěšnost favoritů' : 'Favorite win rate'}
            </span>
            <span className="font-mono font-bold text-success">{data.historicalPatterns.favoriteWinRate}%</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-xs md:text-sm text-muted-foreground">
              {language === 'cz' ? 'Over/Under trend' : 'Over/Under trend'}
            </span>
            <span className="font-mono font-bold">{data.historicalPatterns.overUnderTrend}</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-gradient-to-r from-purple-500/5 to-indigo-500/5 border border-purple-500/10 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-purple-300">
              {language === 'cz' ? 'Upozornění:' : 'Disclaimer:'}
            </span>{' '}
            {language === 'cz'
              ? 'Tato sekce je pouze pro zábavu. Naše hlavní predikce využívá datově řízenou AI analýzu, statistiky a tržní data.'
              : 'This section is for entertainment purposes only. Our main prediction uses data-driven AI analysis, statistics, and market data.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NumerologyTab({ predictionId, homeTeam, awayTeam, gameTime, pick, className }: NumerologyTabProps) {
  const { data: numerologyData, isLoading, error } = usePredictionNumerology(predictionId);

  // Show loading or coming soon if no API data
  if (isLoading) {
    return (
      <div className={className}>
        <NumerologyComingSoon />
      </div>
    );
  }

  // Show coming soon placeholder if API not ready
  if (!numerologyData || error) {
    return (
      <div className={className}>
        <NumerologyComingSoon />
      </div>
    );
  }

  return (
    <div className={className}>
      <RenderNumerologyData data={numerologyData} homeTeam={homeTeam} awayTeam={awayTeam} />
    </div>
  );
}
