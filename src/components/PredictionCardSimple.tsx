import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Coins, Zap, Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence, getConfidenceLabel } from '@/lib/confidenceUtils';
import { formatOdds, formatCurrency, calculateProfit, toDecimalOdds } from '@/lib/oddsUtils';
import { TeamLogo } from '@/components/TeamLogo';
import { TierBadge } from '@/components/TierBadge';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { APIPrediction } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { differenceInHours, differenceInMinutes } from 'date-fns';

interface PredictionCardSimpleProps {
  prediction: APIPrediction;
  isLocked?: boolean;
  gameNumber?: number;
}

// Generate teaser text based on prediction data
function generateTeaser(prediction: APIPrediction, language: 'en' | 'cz'): string {
  const homeTeam = prediction.homeTeam.split(' ').pop() || prediction.homeTeam;
  const confidence = normalizeConfidence(prediction.confidence);
  
  const teasers = {
    en: [
      `Strong home form, H2H advantage`,
      `Sharp money moving, ${confidence}% model confidence`,
      `Key matchup factors favor our pick`,
      `Historical trends support this selection`,
      `Value opportunity detected`,
    ],
    cz: [
      `Silná domácí forma, H2H výhoda`,
      `Sharp money se pohybuje, ${confidence}% důvěra`,
      `Klíčové faktory favorizují náš tip`,
      `Historické trendy podporují tuto sázku`,
      `Detekována hodnotová příležitost`,
    ],
  };

  const index = parseInt(prediction.id.replace(/[^0-9]/g, '').slice(0, 2) || '0', 10) % teasers[language].length;
  return teasers[language][index];
}

export function PredictionCardSimple({ prediction, isLocked = false, gameNumber }: PredictionCardSimpleProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isPicked, togglePick } = useSavedPicks();
  
  const confidencePercent = normalizeConfidence(prediction.confidence);
  const isHotPick = confidencePercent >= 75;
  const isSaved = isPicked(prediction.id);
  
  // Determine tier based on confidence
  const getTier = () => {
    if (confidencePercent >= 80) return 'elite';
    if (confidencePercent >= 70) return 'pro';
    if (confidencePercent >= 60) return 'basic';
    return 'free';
  };
  const predictionTier = getTier();
  
  // Infer sport from team names if sport field is UUID
  const sportName = prediction.sport?.includes('-') 
    ? getSportFromTeams(prediction.homeTeam, prediction.awayTeam)
    : prediction.sport;
  
  // Generate follower count based on prediction ID
  const followerCount = 100 + parseInt(prediction.id.replace(/[^0-9]/g, '').slice(0, 3) || '0', 10) % 400;
  
  // Calculate time urgency
  const timeUrgency = useMemo(() => {
    const gameDate = new Date(prediction.gameTime);
    const now = new Date();
    const hoursUntil = differenceInHours(gameDate, now);
    const minutesUntil = differenceInMinutes(gameDate, now);
    
    if (minutesUntil <= 0) return 'live';
    if (hoursUntil < 1) return 'critical';
    if (hoursUntil < 3) return 'urgent';
    return 'normal';
  }, [prediction.gameTime]);
  
  // Format countdown
  const countdown = useMemo(() => {
    const gameDate = new Date(prediction.gameTime);
    const now = new Date();
    const diffMs = gameDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return language === 'cz' ? 'Probíhá' : 'Live';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [prediction.gameTime, language]);
  
  // Calculate potential profit
  const defaultBet = language === 'cz' ? 1000 : 100;
  const bestOdds = prediction.bookmakerOdds?.[0]?.odds || prediction.prediction.odds;
  const potentialProfit = calculateProfit(bestOdds, defaultBet);
  
  const teaser = generateTeaser(prediction, language);
  
  const handleCardClick = () => {
    navigate(`/predictions/${prediction.id}`);
  };
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePick(prediction);
  };
  
  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'relative rounded-2xl border bg-card overflow-hidden transition-all duration-300 cursor-pointer',
        'hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10',
        'min-h-[420px] flex flex-col',
        // Hot pick glow
        isHotPick && 'ring-2 ring-success/30 shadow-[0_0_25px_rgba(34,197,94,0.15)]',
        // Locked state
        isLocked && 'blur-sm pointer-events-none opacity-60'
      )}
    >
      {/* Header Row */}
      <div className="p-4 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <TierBadge tier={predictionTier} />
          <span className="text-xl">{getSportEmoji(sportName, prediction.homeTeam, prediction.awayTeam)}</span>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded truncate max-w-[80px]">
            {sportName}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {/* Countdown */}
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            timeUrgency === 'critical' && 'bg-destructive/20 text-destructive animate-pulse',
            timeUrgency === 'urgent' && 'bg-amber-500/20 text-amber-400',
            timeUrgency === 'normal' && 'bg-muted text-muted-foreground',
            timeUrgency === 'live' && 'bg-destructive/20 text-destructive animate-pulse'
          )}>
            <Clock className="h-3 w-3" />
            {countdown}
          </div>
          
          {/* Bookmark */}
          <button
            onClick={handleBookmarkClick}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isSaved ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted'
            )}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {/* Hot Pick Badge */}
      {isHotPick && (
        <div className="px-4">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
            🔥 {language === 'cz' ? 'HIGH VALUE' : 'HIGH VALUE'}
          </span>
        </div>
      )}
      
      {/* Critical Urgency Badge */}
      {timeUrgency === 'critical' && (
        <div className="px-4 mt-1">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full animate-pulse">
            <Zap className="h-3 w-3" />
            {language === 'cz' ? 'ZAČÍNÁ BRZY' : 'STARTING SOON'}
          </span>
        </div>
      )}
      
      {/* Teams Section - Main Content */}
      <div className="flex-1 p-4 flex items-center gap-4">
        {/* Teams Column */}
        <div className="flex-1 space-y-3">
          {/* Away Team */}
          <div className="flex items-center gap-3">
            <TeamLogo teamName={prediction.awayTeam} sport={prediction.sport} size="md" />
            <div className="min-w-0 flex-1">
              <p className={cn(
                'font-bold text-sm leading-tight truncate',
                prediction.prediction.pick.includes(prediction.awayTeam) && 'text-success'
              )}>
                {prediction.awayTeam}
              </p>
              <p className="text-xs text-muted-foreground">{t.away}</p>
            </div>
          </div>
          
          {/* VS */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-muted-foreground">VS</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          
          {/* Home Team */}
          <div className="flex items-center gap-3">
            <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={cn(
                  'font-bold text-sm leading-tight truncate',
                  prediction.prediction.pick.includes(prediction.homeTeam) && 'text-success'
                )}>
                  {prediction.homeTeam}
                </p>
                {prediction.prediction.pick.includes(prediction.homeTeam) && (
                  <span className="text-[10px] font-bold text-success bg-success/20 px-1.5 py-0.5 rounded shrink-0">
                    ✓ TIP
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t.homeLabel}</p>
            </div>
          </div>
        </div>
        
        {/* Confidence Column */}
        <div className="flex flex-col items-center gap-1 pl-4 border-l border-border shrink-0">
          <ConfidenceMeter value={confidencePercent} size="md" />
          <span className={cn(
            'font-mono text-2xl font-black',
            confidencePercent >= 70 ? 'text-success' : confidencePercent >= 55 ? 'text-amber-400' : 'text-muted-foreground'
          )}>
            {confidencePercent}%
          </span>
        </div>
      </div>
      
      {/* Pick & Odds Section */}
      <div className="mx-4 mb-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {prediction.prediction.type}
          </span>
          <span className="font-mono text-lg font-black text-foreground">
            {formatOdds(bestOdds, language)}
          </span>
        </div>
        
        {/* Potential Profit */}
        <div className="flex items-center gap-1 text-sm font-semibold text-success">
          <Coins className="h-3.5 w-3.5" />
          <span>
            {formatCurrency(potentialProfit, language, { showSign: true })} 
            <span className="text-muted-foreground font-normal text-xs ml-1">
              {language === 'cz' ? `z ${formatCurrency(defaultBet, language)}` : `from ${formatCurrency(defaultBet, language)}`}
            </span>
          </span>
        </div>
      </div>
      
      {/* Teaser + Followers */}
      <div className="px-4 pb-4 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground flex-1 truncate">
          💡 "{teaser}"
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Users className="h-3 w-3" />
          <span>{followerCount} {language === 'cz' ? 'sleduje' : 'following'}</span>
        </div>
      </div>
    </div>
  );
}
