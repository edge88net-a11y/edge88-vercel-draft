import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, TrendingUp, Lock, ExternalLink, Flame, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence, getConfidenceLabel as getConfLabel, getConfidenceColorClass } from '@/lib/confidenceUtils';
import { formatOdds } from '@/lib/oddsUtils';
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
  const confidence = normalizeConfidence(prediction.confidence);
  
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

  // Infer sport from team names if sport field is UUID
  const sportName = prediction.sport?.includes('-') 
    ? getSportFromTeams(prediction.homeTeam, prediction.awayTeam)
    : prediction.sport;
    
  const expectedValue = typeof prediction.expectedValue === 'string' 
    ? parseFloat(prediction.expectedValue) 
    : prediction.expectedValue;

  // Format confidence as percentage (normalized to 0-100)
  const confidencePercent = normalizeConfidence(prediction.confidence);

  // Get confidence color class
  const getConfidenceColorClass = () => {
    if (confidencePercent >= 70) return 'confidence-high';
    if (confidencePercent >= 55) return 'confidence-medium';
    return 'confidence-low';
  };

  // Get confidence label
  const getConfidenceLabel = () => {
    return getConfLabel(prediction.confidence);
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
        'betting-slip group relative overflow-hidden transition-all duration-300',
        confidencePercent >= 70 && 'betting-slip-win',
        isLocked && 'blur-sm pointer-events-none'
      )}
    >
      {/* Header - Game Number, Sport, Confidence Badge & Save Button */}
      <div className="p-3 sm:p-5 pb-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
          {gameNumber && (
            <span className="font-mono text-[10px] sm:text-xs font-black text-primary bg-primary/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-primary/30 shrink-0">
              #{gameNumber}
            </span>
          )}
          <span className="text-xl sm:text-2xl shrink-0">{getSportEmoji(sportName, prediction.homeTeam, prediction.awayTeam)}</span>
          <span className="rounded-lg bg-muted px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-muted-foreground border border-border truncate max-w-[100px] sm:max-w-none">
            {sportName}
          </span>
          {isGameLive() && <LiveGameBadge gameTime={prediction.gameTime} />}
          {confidencePercent >= 70 && (
            <span className="badge-win text-[10px] sm:text-xs shrink-0 hidden sm:inline-flex">
              {getConfidenceLabel()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isGameLive() && <GameCountdown gameTime={prediction.gameTime} />}
          <SavePickButton prediction={prediction} />
        </div>
      </div>

      {/* Teams vs Section - Betting slip style */}
      <div className="p-3 sm:p-5 pt-3 sm:pt-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Teams Column */}
          <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
            {/* Away Team */}
            <Link 
              to={`/predictions/${prediction.id}`}
              className={cn(
                'flex items-center gap-2 sm:gap-3 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 transition-all duration-200 min-h-[44px]',
                prediction.prediction.pick.includes(prediction.awayTeam) 
                  ? 'bg-success/15 border border-success/40 shadow-[0_0_15px_hsl(var(--success)/0.2)]' 
                  : 'hover:bg-muted/50'
              )}
            >
              <TeamLogo teamName={prediction.awayTeam} sport={prediction.sport} size="md" />
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'font-bold text-xs sm:text-base leading-tight block',
                  prediction.prediction.pick.includes(prediction.awayTeam) && 'text-success'
                )}>
                  {prediction.awayTeam}
                </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{t.away}</span>
            </div>
            {prediction.prediction.pick.includes(prediction.awayTeam) && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-success bg-success/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shrink-0">
                ✓ <span className="hidden sm:inline">{language === 'cz' ? 'TIP' : 'PICK'}</span>
              </span>
            )}
            </Link>

            {/* VS Divider */}
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">VS</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Home Team */}
            <Link 
              to={`/predictions/${prediction.id}`}
              className={cn(
                'flex items-center gap-2 sm:gap-3 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 transition-all duration-200 min-h-[44px]',
                prediction.prediction.pick.includes(prediction.homeTeam) 
                  ? 'bg-success/15 border border-success/40 shadow-[0_0_15px_hsl(var(--success)/0.2)]' 
                  : 'hover:bg-muted/50'
              )}
            >
              <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport} size="md" />
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'font-bold text-xs sm:text-base leading-tight block',
                  prediction.prediction.pick.includes(prediction.homeTeam) && 'text-success'
                )}>
                  {prediction.homeTeam}
                </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{t.homeLabel}</span>
            </div>
            {prediction.prediction.pick.includes(prediction.homeTeam) && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-success bg-success/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shrink-0">
                ✓ <span className="hidden sm:inline">{language === 'cz' ? 'TIP' : 'PICK'}</span>
              </span>
            )}
            </Link>
          </div>

          {/* Confidence Column */}
          <div className="flex flex-col items-center gap-1 sm:gap-2 pl-2 sm:pl-4 border-l border-border shrink-0">
            <ConfidenceMeter value={confidencePercent} size="md" />
            <span className={cn('font-mono text-lg sm:text-2xl font-black', getConfidenceColorClass())}>
              {confidencePercent}%
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{t.confidence}</span>
          </div>
        </div>
      </div>

      {/* Pick & Odds Section - Highlighted */}
      <div className="mx-3 sm:mx-5 mb-3 sm:mb-4 pick-highlight">
        <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-4 flex-col sm:flex-row">
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
                {prediction.prediction.type}
              </span>
              <BarChart3 className="h-3 w-3 text-primary" />
            </div>
            <p className="text-base sm:text-xl font-black text-foreground truncate">{prediction.prediction.pick}</p>
            {prediction.prediction.line && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">{prediction.prediction.line}</p>
            )}
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{t.bestOdds}</p>
            <p className="font-mono text-xl sm:text-2xl font-black odds-number">
              {formatOdds(bookmakerOdds[bestOddsIndex]?.odds || prediction.prediction.odds, language)}
            </p>
          </div>
        </div>
        
        {/* EV Badge */}
        <div className="mt-2 sm:mt-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="ev-badge text-[10px] sm:text-xs">
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>+{expectedValue.toFixed(1)}% EV</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>Updated 2m ago</span>
          </div>
        </div>
      </div>

      {/* Teaser text */}
      <p className="px-3 sm:px-5 pb-3 sm:pb-4 text-xs sm:text-sm text-muted-foreground">
        <span className="text-primary">💡</span> "{teaser}"
      </p>

      {/* Expand Button */}
      <div className="px-3 sm:px-5 pb-3 sm:pb-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between border-primary/30 hover:bg-primary/10 hover:border-primary min-h-[44px] text-xs sm:text-sm"
        >
          <span className="flex items-center gap-1.5 sm:gap-2">
            <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            {isExpanded ? t.hideAnalysis : t.viewAnalysis}
          </span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300',
              isExpanded && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Expanded Content */}
      <div className={cn(
        'overflow-hidden transition-all duration-300 ease-out',
        isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="border-t border-border px-3 sm:px-5 pt-4 sm:pt-5 pb-4 sm:pb-5 space-y-3 sm:space-y-4 bg-card/50">
          {/* Analysis Section */}
          <AnalysisSection
            predictionId={prediction.id}
            reasoning={prediction.reasoning}
            reasoning_cs={prediction.reasoning_cs}
            pick={prediction.prediction.pick}
            confidence={confidencePercent}
            keyFactors={prediction.keyFactors}
            homeTeam={prediction.homeTeam}
            awayTeam={prediction.awayTeam}
          />

          {/* Odds Comparison */}
          <div className="pt-2">
            <h4 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              {t.oddsComparison}
            </h4>
            <OddsComparison bookmakerOdds={bookmakerOdds} />
          </div>

          {/* View Full Analysis Link */}
          <Link 
            to={`/predictions/${prediction.id}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold text-primary transition-all duration-200 hover:from-primary/30 hover:to-accent/30 border border-primary/30 min-h-[44px]"
          >
            {t.fullAnalysis}
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>
      </div>

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <p className="font-bold text-foreground">
              {language === 'cz' ? 'Upgradujte pro odemknutí' : 'Upgrade to Unlock'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'cz' ? 'Získejte přístup ke všem tipům' : 'Get access to all picks'}
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
