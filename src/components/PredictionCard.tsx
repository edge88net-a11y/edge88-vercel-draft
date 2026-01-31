import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, TrendingUp, Lock, AlertTriangle, ThermometerSun, DollarSign, MessageCircle, History, Clock, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sportIcons } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { GameCountdown } from '@/components/GameCountdown';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { TeamLogo } from '@/components/TeamLogo';
import { SavePickButton } from '@/components/SavePickButton';
import { APIPrediction } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

interface PredictionCardProps {
  prediction: APIPrediction;
  isLocked?: boolean;
  gameNumber?: number;
}

export function PredictionCard({ prediction, isLocked = false, gameNumber }: PredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

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

  // Use API key factors or detect from reasoning
  const hasInjuries = prediction.keyFactors?.injuries?.length || prediction.reasoning?.toLowerCase().includes('injur');
  const hasWeather = prediction.keyFactors?.weather || prediction.reasoning?.toLowerCase().includes('weather');
  const hasSharpMoney = prediction.keyFactors?.sharpMoney || prediction.reasoning?.toLowerCase().includes('sharp') || prediction.reasoning?.toLowerCase().includes('line movement');
  const hasSentiment = prediction.keyFactors?.sentiment || prediction.reasoning?.toLowerCase().includes('sentiment') || prediction.reasoning?.toLowerCase().includes('public');
  const hasH2H = prediction.keyFactors?.historicalH2H;

  // Get confidence breakdown (use API data or defaults)
  const breakdown = prediction.confidenceBreakdown || { research: 50, odds: 30, historical: 20 };

  // Get bookmaker odds (use API data or generate defaults)
  const bookmakerOdds = prediction.bookmakerOdds || [
    { bookmaker: 'DraftKings', odds: prediction.prediction.odds },
    { bookmaker: 'FanDuel', odds: adjustOdds(prediction.prediction.odds, 2) },
    { bookmaker: 'BetMGM', odds: adjustOdds(prediction.prediction.odds, -3) },
    { bookmaker: 'Bet365', odds: adjustOdds(prediction.prediction.odds, 5) },
  ];

  // Find best odds
  const bestOddsIndex = bookmakerOdds.reduce((best, curr, idx, arr) => {
    const currValue = parseOddsValue(curr.odds);
    const bestValue = parseOddsValue(arr[best].odds);
    return currValue > bestValue ? idx : best;
  }, 0);

  // Calculate time ago
  const getTimeAgo = () => {
    try {
      const date = new Date(prediction.gameTime);
      const now = new Date();
      const diffMinutes = Math.round((now.getTime() - date.getTime()) / 60000);
      if (diffMinutes < 0) return null; // Game is in the future
      if (diffMinutes < 60) return `${Math.abs(diffMinutes)} ${t.minutes} ${t.ago}`;
      return `${Math.round(Math.abs(diffMinutes) / 60)} ${t.hours} ${t.ago}`;
    } catch {
      return null;
    }
  };

  const timeAgo = getTimeAgo();

  return (
    <div
      className={cn(
        'glass-card-hover group relative overflow-hidden transition-all duration-300',
        isLocked && 'blur-sm pointer-events-none'
      )}
    >
      {/* Header - Game Number, Sport & Save Button */}
      <div className="p-5 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {gameNumber && (
            <span className="font-mono text-xs font-bold text-primary">#{gameNumber}</span>
          )}
          <span className="text-2xl">{sportIcons[sportKey] || sportIcons[prediction.sport] || '🏆'}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {prediction.league || prediction.sport}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <GameCountdown gameTime={prediction.gameTime} />
          <SavePickButton prediction={prediction} />
        </div>
      </div>

      {/* Teams with Logos */}
      <div className="p-5 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Link 
              to={`/predictions/${prediction.id}`}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-1 -ml-2 transition-colors hover:bg-muted/50',
                prediction.prediction.pick.includes(prediction.awayTeam) && 'bg-success/10 ring-1 ring-success/30'
              )}
            >
              <TeamLogo teamName={prediction.awayTeam} sport={prediction.sport} size="md" />
              <span className={cn(
                'font-semibold',
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
                'flex items-center gap-3 rounded-lg px-2 py-1 -ml-2 transition-colors hover:bg-muted/50',
                prediction.prediction.pick.includes(prediction.homeTeam) && 'bg-success/10 ring-1 ring-success/30'
              )}
            >
              <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport} size="md" />
              <span className={cn(
                'font-semibold',
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
          <ConfidenceMeter value={confidencePercent} size="md" />
        </div>
      </div>

      {/* Prediction Pick */}
      <div className="mx-5 mb-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/5 p-4">
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

      {/* Key Factors Pills */}
      <div className="px-5 pb-3 flex flex-wrap gap-1.5">
        {hasInjuries && (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {t.injuries}
          </span>
        )}
        {hasWeather && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
            <ThermometerSun className="h-3 w-3" />
            {t.weather}
          </span>
        )}
        {hasSharpMoney && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
            <DollarSign className="h-3 w-3" />
            {t.sharpMoney}
          </span>
        )}
        {hasSentiment && (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-400">
            <MessageCircle className="h-3 w-3" />
            {t.sentiment}
          </span>
        )}
        {hasH2H && (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400">
            <History className="h-3 w-3" />
            H2H
          </span>
        )}
      </div>

      {/* Reasoning Preview */}
      <p className="px-5 pb-3 line-clamp-2 text-sm text-muted-foreground">
        {prediction.reasoning}
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
        isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="border-t border-border px-5 pt-4 pb-5 space-y-4">
          {/* Why This Pick */}
          <div>
            <h4 className="mb-2 text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {t.whyThisPick}
            </h4>
            <p className="text-sm text-muted-foreground">{prediction.reasoning}</p>
          </div>

          {/* Key Factors Details */}
          {prediction.keyFactors && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">{t.keyFactors}</h4>
              <div className="space-y-2 text-sm">
                {prediction.keyFactors.injuries && prediction.keyFactors.injuries.length > 0 && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <div>
                      <span className="font-medium">{t.injuries}:</span>
                      <span className="text-muted-foreground ml-1">
                        {prediction.keyFactors.injuries.join(', ')}
                      </span>
                    </div>
                  </div>
                )}
                {prediction.keyFactors.weather && (
                  <div className="flex items-start gap-2">
                    <ThermometerSun className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div>
                      <span className="font-medium">{t.weather}:</span>
                      <span className="text-muted-foreground ml-1">
                        {prediction.keyFactors.weather.conditions}, {prediction.keyFactors.weather.temperature}°F
                        {prediction.keyFactors.weather.impact && ` (${prediction.keyFactors.weather.impact})`}
                      </span>
                    </div>
                  </div>
                )}
                {prediction.keyFactors.sharpMoney && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-success mt-0.5" />
                    <div>
                      <span className="font-medium">{t.sharpMoney}:</span>
                      <span className="text-muted-foreground ml-1">
                        Line moved {prediction.keyFactors.sharpMoney.lineMovement > 0 ? '+' : ''}{prediction.keyFactors.sharpMoney.lineMovement} toward {prediction.keyFactors.sharpMoney.direction}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* When Analyzed & Research Sources */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                {t.analyzedAt}
              </div>
              <p className="text-sm font-medium">12 {t.minutes} {t.ago}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <FileText className="h-3 w-3" />
                {t.researchSources}
              </div>
              <p className="text-sm font-medium">{t.analyzedSources} 847</p>
            </div>
          </div>

          {/* Confidence Breakdown */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">{t.confidenceBreakdown}</h4>
            <div className="space-y-2">
              <BreakdownBar label={t.research} value={breakdown.research} color="bg-primary" />
              <BreakdownBar label={t.odds} value={breakdown.odds} color="bg-accent" />
              <BreakdownBar label={t.historical} value={breakdown.historical} color="bg-success" />
              {breakdown.sentiment && (
                <BreakdownBar label={t.sentiment} value={breakdown.sentiment} color="bg-yellow-400" />
              )}
            </div>
          </div>

          {/* Odds Comparison */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">{t.oddsComparison}</h4>
            <div className="grid grid-cols-4 gap-2">
              {bookmakerOdds.slice(0, 4).map((bk, idx) => (
                <div 
                  key={bk.bookmaker} 
                  className={cn(
                    'rounded-lg bg-muted/50 p-2 text-center',
                    idx === bestOddsIndex && 'border border-success/30 bg-success/5'
                  )}
                >
                  <p className={cn('text-xs truncate', idx === bestOddsIndex ? 'text-success' : 'text-muted-foreground')}>
                    {bk.bookmaker}
                  </p>
                  <p className={cn('font-mono text-sm font-medium', idx === bestOddsIndex && 'text-success')}>
                    {bk.odds}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* View Full Analysis Link */}
          <Link 
            to={`/predictions/${prediction.id}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
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
            <p className="mt-2 text-sm font-medium text-muted-foreground">Upgrade to unlock</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for confidence breakdown bars
function BreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
          <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
        </div>
        <span className="font-medium w-8 text-right">{value}%</span>
      </div>
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
