import { useState } from 'react';
import { ChevronDown, Clock, TrendingUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prediction, sportIcons, teamLogos } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

interface PredictionCardProps {
  prediction: Prediction;
  isLocked?: boolean;
}

export function PredictionCard({ prediction, isLocked = false }: PredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-success';
    if (confidence >= 65) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 75) return 'from-success/20 to-success/5';
    if (confidence >= 65) return 'from-yellow-400/20 to-yellow-400/5';
    return 'from-orange-400/20 to-orange-400/5';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 75) return '🔒 LOCK';
    if (confidence >= 65) return '🔥 HIGH';
    return '📊 MEDIUM';
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    if (diff < 0) return 'Live';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isLive = prediction.gameTime.getTime() < new Date().getTime();

  return (
    <div
      className={cn(
        'glass-card-hover group relative overflow-hidden p-5 transition-all duration-300',
        isLocked && 'blur-sm pointer-events-none'
      )}
    >
      {/* Sport & League Badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{sportIcons[prediction.sport]}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {prediction.league || prediction.sport}
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
            isLive
              ? 'bg-destructive/20 text-destructive animate-pulse'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Clock className="h-3 w-3" />
          {formatTimeUntil(prediction.gameTime)}
        </div>
      </div>

      {/* Teams */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{teamLogos[prediction.awayTeam] || '🏆'}</span>
            <span className="font-semibold">{prediction.awayTeam}</span>
          </div>
          <span className="text-xs text-muted-foreground">@</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">{teamLogos[prediction.homeTeam] || '🏠'}</span>
            <span className="font-semibold">{prediction.homeTeam}</span>
          </div>
        </div>

        {/* Confidence Circle */}
        <div className="relative flex flex-col items-center">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br',
              getConfidenceBg(prediction.confidence)
            )}
          >
            <span className={cn('font-mono text-xl font-bold', getConfidenceColor(prediction.confidence))}>
              {prediction.confidence}%
            </span>
          </div>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {getConfidenceLabel(prediction.confidence)}
          </span>
        </div>
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
          <span className="text-xs font-medium text-success">+{prediction.expectedValue}% EV</span>
        </div>
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
        View Analysis
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </Button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 animate-fade-in border-t border-border pt-4">
          <h4 className="mb-2 text-sm font-semibold">Full Analysis</h4>
          <p className="text-sm text-muted-foreground">{prediction.reasoning}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Data Sources</p>
              <p className="text-sm font-medium">12 verified sources</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Model Version</p>
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
