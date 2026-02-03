import { Clock, TrendingUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSportEmoji } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { formatOdds } from '@/lib/oddsUtils';
import { APIPrediction } from '@/hooks/usePredictions';
import { SavePickButton } from '@/components/SavePickButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { differenceInHours, differenceInMinutes, format } from 'date-fns';
import { Link } from 'react-router-dom';

interface CompactPredictionCardProps {
  prediction: APIPrediction;
  isLocked?: boolean;
}

export function CompactPredictionCard({ prediction, isLocked = false }: CompactPredictionCardProps) {
  const { language } = useLanguage();
  const confidence = normalizeConfidence(prediction.confidence);
  const gameTime = new Date(prediction.gameTime);
  const now = new Date();
  const hoursUntil = differenceInHours(gameTime, now);
  const minutesUntil = differenceInMinutes(gameTime, now);

  const getTimeText = () => {
    if (minutesUntil < 0) {
      return language === 'cz' ? 'ŽIVĚ' : 'LIVE';
    }
    if (hoursUntil < 1) {
      return `${minutesUntil}m`;
    }
    if (hoursUntil < 24) {
      return `${hoursUntil}h`;
    }
    return format(gameTime, 'MMM d');
  };

  const getConfidenceColor = () => {
    if (confidence >= 75) return 'text-yellow-400 bg-yellow-400/10';
    if (confidence >= 65) return 'text-orange-400 bg-orange-400/10';
    return 'text-blue-400 bg-blue-400/10';
  };

  return (
    <Link
      to={`/predictions/${prediction.id}`}
      className={cn(
        'block group relative',
        'bg-card border border-border rounded-lg',
        'hover:border-primary/50 hover:shadow-lg',
        'transition-all duration-200',
        isLocked && 'blur-sm pointer-events-none'
      )}
    >
      <div className="p-3 flex items-center gap-3">
        {/* Sport Icon & Time */}
        <div className="flex flex-col items-center gap-1 min-w-[48px]">
          <span className="text-2xl">
            {getSportEmoji(prediction.sport, prediction.homeTeam, prediction.awayTeam)}
          </span>
          <div className={cn(
            'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded',
            minutesUntil < 60 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
          )}>
            {getTimeText()}
          </div>
        </div>

        {/* Teams & Pick */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold truncate">
              {prediction.homeTeam}
            </span>
            <span className="text-xs text-muted-foreground">vs</span>
            <span className="text-sm font-semibold truncate">
              {prediction.awayTeam}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {language === 'cz' ? 'Tip:' : 'Pick:'}
            </span>
            <span className="text-sm font-bold text-primary truncate">
              {prediction.prediction.pick}
            </span>
            <span className="text-xs text-muted-foreground">
              @{formatOdds(prediction.prediction.odds)}
            </span>
          </div>
        </div>

        {/* Confidence & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Confidence Badge */}
          <div className={cn(
            'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg',
            getConfidenceColor()
          )}>
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs font-bold font-mono">{confidence}%</span>
          </div>

          {/* Save Button */}
          <SavePickButton prediction={prediction} variant="icon" />
        </div>
      </div>

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Lock className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              {language === 'cz' ? 'Vyžaduje Premium' : 'Premium Required'}
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}
