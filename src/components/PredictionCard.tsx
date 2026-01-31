import { useState } from 'react';
import { ChevronDown, TrendingUp, Lock, AlertTriangle, ThermometerSun, DollarSign, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prediction, sportIcons } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { GameCountdown } from '@/components/GameCountdown';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { TeamLogo } from '@/components/TeamLogo';
import { SavePickButton } from '@/components/SavePickButton';
import { APIPrediction } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';

interface PredictionCardProps {
  prediction: Prediction | APIPrediction;
  isLocked?: boolean;
}

export function PredictionCard({ prediction, isLocked = false }: PredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  const sportKey = prediction.sport?.toUpperCase() || prediction.sport;
  const expectedValue = typeof prediction.expectedValue === 'string' 
    ? parseFloat(prediction.expectedValue) 
    : prediction.expectedValue;

  // Mock key factors (would come from API in production)
  const keyFactors = {
    injuries: prediction.reasoning?.toLowerCase().includes('injur'),
    weather: prediction.reasoning?.toLowerCase().includes('weather'),
    sharpMoney: prediction.reasoning?.toLowerCase().includes('sharp') || prediction.reasoning?.toLowerCase().includes('line'),
    sentiment: prediction.reasoning?.toLowerCase().includes('sentiment') || prediction.reasoning?.toLowerCase().includes('public'),
  };

  return (
    <div
      className={cn(
        'glass-card-hover group relative overflow-hidden p-5 transition-all duration-300',
        isLocked && 'blur-sm pointer-events-none'
      )}
    >
      {/* Sport & League Badge + Save Button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{sportIcons[sportKey] || sportIcons[prediction.sport] || '🏆'}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {prediction.league || prediction.sport}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <GameCountdown gameTime={prediction.gameTime} />
          <SavePickButton prediction={prediction as APIPrediction} />
        </div>
      </div>

      {/* Teams with Logos */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-3">
            <TeamLogo teamName={prediction.awayTeam} sport={prediction.sport} size="md" />
            <span className="font-semibold">{prediction.awayTeam}</span>
          </div>
          <span className="ml-10 text-xs text-muted-foreground">@</span>
          <div className="flex items-center gap-3">
            <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport} size="md" />
            <span className="font-semibold">{prediction.homeTeam}</span>
          </div>
        </div>

        {/* Confidence Meter */}
        <ConfidenceMeter value={prediction.confidence} size="md" />
      </div>

      {/* Prediction Pick */}
      <div className="mb-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {prediction.prediction.type}
            </p>
            <p className="text-lg font-bold text-foreground">{prediction.prediction.pick}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Odds</p>
            <p className="font-mono text-lg font-bold text-primary">{prediction.prediction.odds}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-success" />
          <span className="text-xs font-medium text-success">+{expectedValue.toFixed(1)}% EV</span>
        </div>
      </div>

      {/* Key Factors Pills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {keyFactors.injuries && (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {t.injuries}
          </span>
        )}
        {keyFactors.weather && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
            <ThermometerSun className="h-3 w-3" />
            {t.weather}
          </span>
        )}
        {keyFactors.sharpMoney && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
            <DollarSign className="h-3 w-3" />
            {t.sharpMoney}
          </span>
        )}
        {keyFactors.sentiment && (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-400">
            <MessageCircle className="h-3 w-3" />
            {t.sentiment}
          </span>
        )}
      </div>

      {/* Reasoning Preview */}
      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
        {prediction.reasoning}
      </p>

      {/* Expand Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between text-muted-foreground hover:text-foreground"
      >
        {t.viewAnalysis}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </Button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 animate-fade-in border-t border-border pt-4 space-y-4">
          {/* Full Analysis */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">{t.fullAnalysis}</h4>
            <p className="text-sm text-muted-foreground">{prediction.reasoning}</p>
          </div>

          {/* Confidence Breakdown */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">{t.confidenceBreakdown}</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Historical matchup</span>
                <span className="font-medium">+12%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recent form</span>
                <span className="font-medium">+8%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Line movement</span>
                <span className="font-medium text-success">+5%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Public sentiment</span>
                <span className="font-medium text-destructive">-3%</span>
              </div>
            </div>
          </div>

          {/* Odds Comparison */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">{t.oddsComparison}</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">DraftKings</p>
                <p className="font-mono text-sm font-medium">{prediction.prediction.odds}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">FanDuel</p>
                <p className="font-mono text-sm font-medium">-108</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center border border-success/30">
                <p className="text-xs text-success">Best</p>
                <p className="font-mono text-sm font-medium text-success">-105</p>
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{t.dataSources}</p>
              <p className="text-sm font-medium">12 {t.verifiedSources}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{t.modelVersion}</p>
              <p className="text-sm font-medium">Edge88 v3.2</p>
            </div>
          </div>
        </div>
      )}

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
