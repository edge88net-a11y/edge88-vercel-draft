import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, TrendingUp, Lock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sportIcons } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { GameCountdown } from '@/components/GameCountdown';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { TeamLogo } from '@/components/TeamLogo';
import { SavePickButton } from '@/components/SavePickButton';
import { LiveGameBadge } from '@/components/LiveGameBadge';
import { AnalysisSection } from '@/components/AnalysisSection';
import { OddsComparison } from '@/components/OddsComparison';
import { APIPrediction } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';

interface PredictionCardProps {
  prediction: APIPrediction;
  isLocked?: boolean;
  gameNumber?: number;
}

// Generate unique teaser text based on prediction data
function generateTeaser(prediction: APIPrediction, language: 'en' | 'cz'): string {
  const homeTeam = prediction.homeTeam.split(' ').pop() || prediction.homeTeam;
  const awayTeam = prediction.awayTeam.split(' ').pop() || prediction.awayTeam;
  const confidence = prediction.confidence <= 1 
    ? Math.round(prediction.confidence * 100) 
    : Math.round(prediction.confidence);
  
  const teasers = {
    en: [
      `${homeTeam} strong at home, ${awayTeam} traveling...`,
      `Sharp money moving, ${confidence}% model confidence`,
      `Key matchup factors favor our pick`,
      `${homeTeam} vs ${awayTeam} - value opportunity`,
      `Historical trends support this selection`,
    ],
    cz: [
      `${homeTeam} silní doma, ${awayTeam} na cestě...`,
      `Sharp money se pohybuje, ${confidence}% důvěra modelu`,
      `Klíčové faktory favorizují náš tip`,
      `${homeTeam} vs ${awayTeam} - hodnotová příležitost`,
      `Historické trendy podporují tuto sázku`,
    ],
  };

  // Use prediction ID to deterministically pick a teaser
  const index = parseInt(prediction.id.replace(/[^0-9]/g, '').slice(0, 2) || '0', 10) % teasers[language].length;
  return teasers[language][index];
}

export function PredictionCard({ prediction, isLocked = false, gameNumber }: PredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, language } = useLanguage();

  const sportKey = prediction.sport?.toUpperCase() || prediction.sport;
  const expectedValue = typeof prediction.expectedValue === 'string' 
    ? parseFloat(prediction.expectedValue) 
    : prediction.expectedValue;

  // Format confidence as percentage (handle both 0-1 and 0-100 ranges)
  const confidencePercent = prediction.confidence <= 1 
    ? Math.round(prediction.confidence * 100) 
    : Math.round(prediction.confidence);

  // Get confidence color
  const getConfidenceColor = () => {
    if (confidencePercent >= 70) return 'text-success';
    if (confidencePercent >= 55) return 'text-yellow-400';
    return 'text-orange-400';
  };

  // Check if game is live
  const isGameLive = () => {
    const gameDate = new Date(prediction.gameTime);
    const now = new Date();
    const diffMs = now.getTime() - gameDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours < 4;
  };

  // Get bookmaker odds (use API data or generate defaults)
  const bookmakerOdds = prediction.bookmakerOdds || [
    { bookmaker: 'DraftKings', odds: prediction.prediction.odds },
    { bookmaker: 'FanDuel', odds: adjustOdds(prediction.prediction.odds, 2) },
    { bookmaker: 'BetMGM', odds: adjustOdds(prediction.prediction.odds, -3) },
    { bookmaker: 'Bet365', odds: adjustOdds(prediction.prediction.odds, 5) },
    { bookmaker: 'Tipsport', odds: adjustOdds(prediction.prediction.odds, -1) },
    { bookmaker: 'Fortuna', odds: adjustOdds(prediction.prediction.odds, 3) },
  ];

  // Find best odds
  const bestOddsIndex = bookmakerOdds.reduce((best, curr, idx, arr) => {
    const currValue = parseOddsValue(curr.odds);
    const bestValue = parseOddsValue(arr[best].odds);
    return currValue > bestValue ? idx : best;
  }, 0);

  const teaser = generateTeaser(prediction, language);

  return (
    <div
      className={cn(
        'glass-card-hover group relative overflow-hidden transition-all duration-300',
        isLocked && 'blur-sm pointer-events-none'
      )}
    >
      {/* Header - Game Number, Sport, Live Badge & Save Button */}
      <div className="p-5 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {gameNumber && (
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              #{gameNumber}
            </span>
          )}
          <span className="text-2xl">{sportIcons[sportKey] || sportIcons[prediction.sport] || '🏆'}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {prediction.league || prediction.sport}
          </span>
          {isGameLive() && <LiveGameBadge gameTime={prediction.gameTime} />}
        </div>
        <div className="flex items-center gap-2">
          {!isGameLive() && <GameCountdown gameTime={prediction.gameTime} />}
          <SavePickButton prediction={prediction} />
        </div>
      </div>

      {/* Teams with Logos - More prominent */}
      <div className="p-5 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Link 
              to={`/predictions/${prediction.id}`}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-1.5 -ml-2 transition-colors hover:bg-muted/50',
                prediction.prediction.pick.includes(prediction.awayTeam) && 'bg-success/10 ring-1 ring-success/30'
              )}
            >
              <TeamLogo teamName={prediction.awayTeam} sport={prediction.sport} size="md" />
              <span className={cn(
                'font-bold text-lg',
                prediction.prediction.pick.includes(prediction.awayTeam) && 'text-success'
              )}>
                {prediction.awayTeam}
                {prediction.prediction.pick.includes(prediction.awayTeam) && (
                  <span className="ml-2 text-xs">✓</span>
                )}
              </span>
            </Link>
            <span className="ml-8 text-xs text-muted-foreground">@</span>
            <Link 
              to={`/predictions/${prediction.id}`}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-1.5 -ml-2 transition-colors hover:bg-muted/50',
                prediction.prediction.pick.includes(prediction.homeTeam) && 'bg-success/10 ring-1 ring-success/30'
              )}
            >
              <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport} size="md" />
              <span className={cn(
                'font-bold text-lg',
                prediction.prediction.pick.includes(prediction.homeTeam) && 'text-success'
              )}>
                {prediction.homeTeam}
                {prediction.prediction.pick.includes(prediction.homeTeam) && (
                  <span className="ml-2 text-xs">✓</span>
                )}
              </span>
            </Link>
          </div>

          {/* Confidence Meter */}
          <div className="flex flex-col items-center gap-1">
            <ConfidenceMeter value={confidencePercent} size="md" />
            <span className={cn('font-mono text-lg font-bold', getConfidenceColor())}>
              {confidencePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Prediction Pick */}
      <div className="mx-5 mb-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {prediction.prediction.type}
            </p>
            <p className="text-lg font-bold text-foreground">{prediction.prediction.pick}</p>
            {prediction.prediction.line && (
              <p className="text-sm text-muted-foreground">{prediction.prediction.line}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{t.bestOdds}</p>
            <p className="font-mono text-lg font-bold text-success">
              {bookmakerOdds[bestOddsIndex]?.odds || prediction.prediction.odds}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-success" />
          <span className="text-xs font-medium text-success">+{expectedValue.toFixed(1)}% EV</span>
        </div>
      </div>

      {/* Teaser text */}
      <p className="px-5 pb-3 text-sm text-muted-foreground italic">
        "{teaser}"
      </p>

      {/* Expand Button */}
      <div className="px-5 pb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? t.hideAnalysis : t.viewAnalysis}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-300',
              isExpanded && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Expanded Content - Accordion Animation */}
      <div className={cn(
        'overflow-hidden transition-all duration-300 ease-out',
        isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="border-t border-border px-5 pt-4 pb-5 space-y-4">
          {/* Analysis Section */}
          <AnalysisSection
            predictionId={prediction.id}
            reasoning={prediction.reasoning}
            pick={prediction.prediction.pick}
            confidence={confidencePercent}
            keyFactors={prediction.keyFactors}
            homeTeam={prediction.homeTeam}
            awayTeam={prediction.awayTeam}
          />

          {/* Odds Comparison */}
          <div className="pt-2">
            <h4 className="text-sm font-semibold mb-3">{t.oddsComparison}</h4>
            <OddsComparison bookmakerOdds={bookmakerOdds} />
          </div>

          {/* View Full Analysis Link */}
          <Link 
            to={`/predictions/${prediction.id}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            {t.fullAnalysis}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {language === 'cz' ? 'Upgradujte pro odemknutí' : 'Upgrade to unlock'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to adjust odds for mock bookmakers
function adjustOdds(odds: string, adjustment: number): string {
  const numOdds = parseInt(odds.replace('+', ''));
  if (isNaN(numOdds)) return odds;
  const adjusted = numOdds + adjustment;
  return adjusted > 0 ? `+${adjusted}` : String(adjusted);
}

// Helper to parse odds value for comparison
function parseOddsValue(odds: string): number {
  const num = parseInt(odds.replace('+', ''));
  if (isNaN(num)) return 0;
  // Higher positive odds = better, less negative odds = better
  return num > 0 ? 100 + num : 100 + (100 / Math.abs(num)) * 100;
}
