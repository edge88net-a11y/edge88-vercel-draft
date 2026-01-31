import { useState } from 'react';
import { ChevronDown, TrendingUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prediction, sportIcons } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { GameCountdown } from '@/components/GameCountdown';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';

// Team logos for display
const teamLogos: Record<string, string> = {
  'Lakers': '💜',
  'Celtics': '☘️',
  'Chiefs': '🔴',
  'Bills': '🦬',
  'Arsenal': '🔴',
  'Liverpool': '🔴',
  'Maple Leafs': '🍁',
  'Rangers': '🗽',
  '49ers': '⛏️',
  'Eagles': '🦅',
  'Warriors': '💛',
  'Heat': '🔥',
  'Bruins': '🐻',
  'Oilers': '🛢️',
  'Yankees': '⚾',
  'Dodgers': '💙',
  'Man City': '🩵',
  'Real Madrid': '⚪',
  'Cowboys': '⭐',
  'Giants': '🔵',
  'Ravens': '🟣',
  'Bengals': '🐅',
  'Dolphins': '🐬',
  'Jets': '✈️',
  'Packers': '💚',
  'Bears': '🐻',
  'Lions': '🦁',
  'Vikings': '⚔️',
  'Seahawks': '🦅',
  'Cardinals': '🔴',
  'Nuggets': '💛',
  'Suns': '🌞',
  'Bucks': '🦌',
  '76ers': '🔔',
  'Mavericks': '🐴',
  'Clippers': '⛵',
  'Nets': '🏀',
  'Knicks': '🏙️',
  'Grizzlies': '🐻',
  'Pelicans': '🦅',
  'Kings': '👑',
  'Thunder': '⚡',
  'Avalanche': '🏔️',
  'Stars': '⭐',
  'Panthers': '🐆',
  'Lightning': '⚡',
  'Canucks': '🐋',
  'Flames': '🔥',
  'Devils': '😈',
  'Hurricanes': '🌀',
  'Braves': '🪓',
  'Astros': '⭐',
  'Phillies': '🔔',
  'Padres': '🟤',
  'Orioles': '🐦',
  'Rays': '☀️',
  'Cubs': '🐻',
  'Mariners': '⚓',
  'Chelsea': '🔵',
  'Barcelona': '🔵🔴',
  'Bayern': '🔴',
  'Dortmund': '💛',
  'PSG': '🔵',
  'Marseille': '⚪',
  'Inter': '🔵⚫',
  'AC Milan': '🔴⚫',
};

interface PredictionCardProps {
  prediction: Prediction;
  isLocked?: boolean;
}

export function PredictionCard({ prediction, isLocked = false }: PredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sportKey = prediction.sport?.toUpperCase() || prediction.sport;
  const expectedValue = typeof prediction.expectedValue === 'string' 
    ? parseFloat(prediction.expectedValue) 
    : prediction.expectedValue;

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
          <span className="text-2xl">{sportIcons[sportKey] || sportIcons[prediction.sport] || '🏆'}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {prediction.league || prediction.sport}
          </span>
        </div>
        <GameCountdown gameTime={prediction.gameTime} />
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
