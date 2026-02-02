import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Coins, Zap, Star, Eye, Share2, Pin, BarChart3, CheckCircle2, XCircle } from 'lucide-react';
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
import { useBettingSlip } from '@/hooks/useBettingSlip';
import { differenceInHours, differenceInMinutes, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { translateSport, translatePredictionType, partialTranslateAnalysis, getCzechSummary } from '@/lib/translate';

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
  const { addToSlip, isInSlip } = useBettingSlip();
  const { toast } = useToast();
  const [showActions, setShowActions] = useState(false);
  
  const confidencePercent = normalizeConfidence(prediction.confidence);
  const isHotPick = confidencePercent >= 75;
  const isLockPick = confidencePercent >= 80;
  const isSaved = isPicked(prediction.id);
  
  // Check game result
  const isWon = prediction.result === 'win';
  const isLost = prediction.result === 'loss';
  const isCompleted = isWon || isLost;
  
  // Determine tier based on confidence
  const getTier = (): 'elite' | 'pro' | 'starter' | 'none' => {
    if (confidencePercent >= 80) return 'elite';
    if (confidencePercent >= 70) return 'pro';
    if (confidencePercent >= 60) return 'starter';
    return 'starter';
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
    
    if (minutesUntil <= 0 && !isCompleted) return 'live';
    if (hoursUntil < 1 && minutesUntil > 0) return 'critical';
    if (hoursUntil < 3) return 'urgent';
    return 'normal';
  }, [prediction.gameTime, isCompleted]);
  
  // Format countdown
  const countdown = useMemo(() => {
    const gameDate = new Date(prediction.gameTime);
    const now = new Date();
    const diffMs = gameDate.getTime() - now.getTime();
    
    if (isCompleted) return language === 'cz' ? 'Ukončeno' : 'Finished';
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
  }, [prediction.gameTime, language, isCompleted]);
  
  // Calculate potential profit
  const defaultBet = language === 'cz' ? 1000 : 100;
  const bestOdds = prediction.bookmakerOdds?.[0]?.odds || prediction.prediction.odds;
  const potentialProfit = calculateProfit(bestOdds, defaultBet);

  // Get EV value - calculate if not provided
  let expectedValue = typeof prediction.expectedValue === 'string' 
    ? parseFloat(prediction.expectedValue) 
    : (prediction.expectedValue || 0);
  
  // If EV is 0 or not set, calculate it
  if (expectedValue === 0) {
    const decimalOdds = toDecimalOdds(bestOdds);
    const winProb = confidencePercent / 100;
    expectedValue = (winProb * (decimalOdds - 1) - (1 - winProb)) * 100;
  }
  
  const teaser = generateTeaser(prediction, language);
  
  const handleCardClick = () => {
    navigate(`/predictions/${prediction.id}`);
  };
  
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePick(prediction);
    
    if (!isSaved) {
      // Celebration confetti for first save
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#10b981', '#34d399'],
      });
      toast({
        title: language === 'cz' ? '⭐ Tip uložen!' : '⭐ Pick saved!',
        description: language === 'cz' ? 'Přidáno do vašich uložených tipů' : 'Added to your saved picks',
      });
    }
  };

  const handleAddToSlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isInSlip(prediction.id)) {
      toast({
        title: language === 'cz' ? 'Již na tiketu' : 'Already on slip',
        description: language === 'cz' ? 'Tento tip už je na vašem tiketu' : 'This pick is already on your slip',
      });
      return;
    }
    
    addToSlip(prediction);
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#06b6d4', '#22c55e'],
    });
    toast({
      title: language === 'cz' ? '📌 Přidáno na tiket!' : '📌 Added to slip!',
      description: prediction.prediction.pick,
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/predictions/${prediction.id}`);
    toast({
      title: language === 'cz' ? '📤 Odkaz zkopírován!' : '📤 Link copied!',
    });
  };
  
  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        'relative rounded-2xl border bg-card overflow-hidden transition-all duration-300 cursor-pointer group',
        'hover:scale-[1.02] hover:shadow-xl',
        'min-h-[420px] flex flex-col',
        // Won game - green left border
        isWon && 'border-l-4 border-l-success bg-success/5',
        // Lost game - red left border, muted
        isLost && 'border-l-4 border-l-destructive opacity-75',
        // Hot pick glow
        isHotPick && !isCompleted && 'ring-2 ring-success/30 shadow-[0_0_25px_rgba(34,197,94,0.15)]',
        // Lock pick golden shimmer
        isLockPick && !isCompleted && 'golden-glow',
        // Live pulsing border
        timeUrgency === 'live' && 'border-red-500/50 ring-1 ring-red-500/30 animate-pulse',
        // Starting soon amber border
        timeUrgency === 'critical' && 'border-amber-500/50 ring-1 ring-amber-500/20',
        // Locked state
        isLocked && 'blur-sm pointer-events-none opacity-60',
        // Hover border
        !isCompleted && !isHotPick && 'hover:border-primary/50 hover:shadow-primary/10'
      )}
    >
      {/* Header Row */}
      <div className="p-4 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <TierBadge tier={predictionTier} />
          <span className="text-xl">{getSportEmoji(sportName, prediction.homeTeam, prediction.awayTeam)}</span>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded truncate max-w-[80px]">
            {translateSport(sportName, language)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {/* Result badge for completed games */}
          {isWon && (
            <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/20 px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              ✅ {language === 'cz' ? 'VÝHRA' : 'WIN'}
            </span>
          )}
          {isLost && (
            <span className="flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/20 px-2 py-1 rounded-full">
              <XCircle className="h-3 w-3" />
              ❌ {language === 'cz' ? 'PROHRA' : 'LOSS'}
            </span>
          )}
          
          {/* Live badge */}
          {timeUrgency === 'live' && !isCompleted && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-full animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              ⚡ LIVE
            </span>
          )}
          
          {/* Countdown */}
          {!isCompleted && timeUrgency !== 'live' && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              timeUrgency === 'critical' && 'bg-amber-500/20 text-amber-400 animate-pulse',
              timeUrgency === 'urgent' && 'bg-amber-500/20 text-amber-400',
              timeUrgency === 'normal' && 'bg-muted text-muted-foreground'
            )}>
              <Clock className="h-3 w-3" />
              {timeUrgency === 'critical' && '⏰ '}
              {countdown}
            </div>
          )}
          
          {/* Save button - Prominent */}
          <button
            onClick={handleSaveClick}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              isSaved 
                ? 'text-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/20' 
                : 'text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10'
            )}
            title={isSaved ? (language === 'cz' ? 'Uloženo' : 'Saved') : (language === 'cz' ? 'Uložit tip' : 'Save pick')}
          >
            <Star className={cn('h-4 w-4', isSaved && 'fill-current')} />
          </button>
        </div>
      </div>
      
      {/* Badges Row */}
      <div className="px-4 flex flex-wrap gap-1.5">
        {isHotPick && !isCompleted && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full shadow-lg shadow-success/10">
            <span className="animate-fire-bounce">🔥</span> HIGH VALUE
          </span>
        )}
        {isLockPick && !isCompleted && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/10">
            🔒 LOCK
          </span>
        )}
        {timeUrgency === 'critical' && !isCompleted && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">
            <Zap className="h-3 w-3" />
            {language === 'cz' ? `Za ${countdown}` : `In ${countdown}`}
          </span>
        )}
        {/* Win profit display */}
        {isWon && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/20 px-2 py-0.5 rounded-full">
            ✅ {formatCurrency(potentialProfit, language, { showSign: true })}
          </span>
        )}
      </div>
      
      {/* Teams Section - Main Content */}
      <div className="flex-1 p-4 flex items-center gap-4">
        {/* Teams Column */}
        <div className="flex-1 space-y-3">
          {/* Away Team */}
          <div className="flex items-center gap-3">
            <TeamLogo teamName={prediction.awayTeam} sport={prediction.sport} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={cn(
                  'font-bold text-sm leading-tight truncate',
                  prediction.prediction.pick.includes(prediction.awayTeam) && 'text-success'
                )}>
                  {prediction.awayTeam}
                </p>
                {prediction.prediction.pick.includes(prediction.awayTeam) && (
                  <span className="text-[10px] font-bold text-success bg-success/20 px-1.5 py-0.5 rounded shrink-0 shadow-lg shadow-success/20 animate-pulse">
                    ✓ TIP
                  </span>
                )}
              </div>
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
                  <span className="text-[10px] font-bold text-success bg-success/20 px-1.5 py-0.5 rounded shrink-0 shadow-lg shadow-success/20 animate-pulse">
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
            'font-mono text-2xl font-black drop-shadow-lg',
            confidencePercent >= 70 ? 'text-success' : 
            confidencePercent >= 55 ? 'text-amber-400' : 
            'text-foreground'
          )}>
            {confidencePercent}%
          </span>
          {/* Confidence bar */}
          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full animate-grow-width",
                confidencePercent >= 70 ? 'bg-success' : 
                confidencePercent >= 55 ? 'bg-amber-400' : 
                'bg-muted-foreground'
              )}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Pick & Odds Section */}
      <div className="mx-4 mb-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary stat-glow-cyan">
              {translatePredictionType(prediction.prediction.type, language)}
            </span>
            <BarChart3 className="h-3 w-3 text-primary" />
          </div>
          <span className="font-mono text-xl font-black text-foreground">
            {formatOdds(bestOdds, language)}
          </span>
        </div>
        
        {/* EV + Potential Profit */}
        <div className="flex items-center justify-between gap-2">
          {/* EV indicator - colored */}
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
            expectedValue > 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
          )}>
            {expectedValue > 0 ? '+' : ''}{expectedValue.toFixed(1)}% EV
          </div>
          
          {/* Potential Profit - PROMINENT */}
          <div className="flex items-center gap-1 text-sm font-bold text-success stat-glow-green">
            <Coins className="h-4 w-4 animate-pulse" />
            <span>
              {formatCurrency(potentialProfit, language, { showSign: true })} 
              <span className="text-muted-foreground font-normal text-xs ml-1">
                {language === 'cz' ? `z ${formatCurrency(defaultBet, language)}` : `from ${formatCurrency(defaultBet, language)}`}
              </span>
            </span>
          </div>
        </div>
      </div>
      
      {/* AI Analysis Preview OR Teaser */}
      <div className="px-4 pb-4 space-y-2">
        {prediction.ai_analysis ? (
          <div>
            {language === 'cz' && (
              <p className="text-xs font-semibold text-primary mb-1">
                {getCzechSummary(prediction)}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {language === 'cz' ? partialTranslateAnalysis(prediction.ai_analysis, 'cz') : prediction.ai_analysis}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/predictions/${prediction.id}`); }}
              className="text-xs text-primary hover:text-primary/80 font-medium mt-1"
            >
              {language === 'cz' ? 'Zobrazit více →' : 'Show more →'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground flex-1 truncate">
            💡 "{teaser}"
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span>{followerCount} {language === 'cz' ? 'sleduje' : ''}</span>
        </div>
      </div>

      {/* Quick Actions on Hover */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/90 to-transparent p-4 pt-8 transition-all duration-300",
        showActions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleAddToSlip}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold transition-colors"
          >
            <Pin className="h-3.5 w-3.5" />
            {language === 'cz' ? 'Na tiket' : 'To slip'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/predictions/${prediction.id}`); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            {language === 'cz' ? 'Detail' : 'Details'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            {language === 'cz' ? 'Sdílet' : 'Share'}
          </button>
          <button
            onClick={handleSaveClick}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              isSaved ? "bg-amber-500/20 text-amber-400" : "bg-muted hover:bg-amber-500/10 text-foreground hover:text-amber-400"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
            {isSaved ? (language === 'cz' ? 'Uloženo' : 'Saved') : (language === 'cz' ? 'Uložit' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}
