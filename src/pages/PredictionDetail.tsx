import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, MapPin, Loader2, FileText, TrendingUp, TrendingDown,
  Share2, Plus, Target, Users, Calculator, ChevronRight, CheckCircle, XCircle,
  History, Sparkles, MessageCircle, Zap, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamLogo } from '@/components/TeamLogo';
import { SavePickButton } from '@/components/SavePickButton';
import { GameCountdown } from '@/components/GameCountdown';
import { LiveGameBadge } from '@/components/LiveGameBadge';
import { OddsComparison } from '@/components/OddsComparison';
import { SportSpecificStats } from '@/components/SportSpecificStats';
import { NumerologyTab } from '@/components/NumerologyTab';
import { DiscussionTab } from '@/components/DiscussionTab';
import { ShareModal } from '@/components/ShareModal';
import { useSinglePrediction, useActivePredictions, APIPrediction } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { cn } from '@/lib/utils';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';

export default function PredictionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: fullPrediction, isLoading: isLoadingFull, error: fullError } = useSinglePrediction(id);
  const { data: predictions, isLoading: isLoadingList } = useActivePredictions();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('discussion');
  const [bankroll, setBankroll] = useState(10000);
  const [showShareModal, setShowShareModal] = useState(false);

  // Use full prediction from API, fallback to list data
  const listPrediction = predictions?.find(p => p.id === id);
  const prediction = fullPrediction || listPrediction;
  const isLoading = isLoadingFull && isLoadingList;

  // Check if game is live or completed
  const getGameStatus = () => {
    if (!prediction) return 'scheduled';
    const gameDate = new Date(prediction.gameTime);
    const now = new Date();
    const diffMs = now.getTime() - gameDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (prediction.result && prediction.result !== 'pending') return 'completed';
    if (diffHours >= 0 && diffHours < 4) return 'live';
    return 'scheduled';
  };

  const gameStatus = getGameStatus();

  // Format countdown
  const formatCountdown = (gameTime: string) => {
    const game = new Date(gameTime);
    const now = new Date();
    const hoursUntil = differenceInHours(game, now);
    const minutesUntil = differenceInMinutes(game, now) % 60;
    
    if (hoursUntil < 0) return language === 'cz' ? 'Probíhá' : 'Live';
    if (hoursUntil === 0) return `${minutesUntil}m`;
    return `${hoursUntil}h ${minutesUntil}m`;
  };

  // Mock community pick data (would come from API)
  const communityPick = useMemo(() => {
    const homePercent = Math.round(45 + Math.random() * 30);
    return {
      home: homePercent,
      away: 100 - homePercent,
      totalVotes: Math.round(150 + Math.random() * 200),
    };
  }, [id]);

  // Mock H2H data (would come from API)
  const h2hData = useMemo(() => {
    if (!prediction) return null;
    return {
      homeWins: 8,
      awayWins: 5,
      lastMeetings: [
        { winner: prediction.homeTeam, score: '3-1', date: 'Oct 15' },
        { winner: prediction.awayTeam, score: '2-4', date: 'Sep 28' },
        { winner: prediction.homeTeam, score: '2-0', date: 'Sep 10' },
        { winner: prediction.homeTeam, score: '4-2', date: 'Aug 22' },
        { winner: prediction.awayTeam, score: '1-3', date: 'Aug 5' },
      ],
    };
  }, [prediction]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{language === 'cz' ? 'Načítám analýzu...' : 'Loading analysis...'}</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold">{t.noPredictions}</h1>
        <p className="mt-2 text-muted-foreground">
          {language === 'cz' ? 'Tato predikce nebyla nalezena.' : 'This prediction could not be found.'}
        </p>
        <Link to="/predictions">
          <Button className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t.viewAll} {t.predictions}
          </Button>
        </Link>
      </div>
    );
  }

  // Normalize data
  const confidencePercent = normalizeConfidence(prediction.confidence);
  const sportName = prediction.sport?.includes('-') 
    ? getSportFromTeams(prediction.homeTeam, prediction.awayTeam)
    : prediction.sport;

  // Get bookmaker odds
  const predictionWithOdds = listPrediction || fullPrediction;
  const bookmakerOdds = predictionWithOdds?.bookmakerOdds?.map(o => ({
    bookmaker: o.bookmaker.charAt(0).toUpperCase() + o.bookmaker.slice(1).replace(/([A-Z])/g, ' $1'),
    odds: typeof o.homeOdds === 'number' ? (o.homeOdds > 0 ? `+${o.homeOdds}` : String(o.homeOdds)) : (o.odds || ''),
    awayOdds: typeof o.awayOdds === 'number' ? (o.awayOdds > 0 ? `+${o.awayOdds}` : String(o.awayOdds)) : '',
    line: o.spreadHome ? String(o.spreadHome) : (o.line || undefined),
  })) || [];

  // Find best odds
  const bestOdds = bookmakerOdds.length > 0 ? bookmakerOdds.reduce((best, curr) => {
    const currValue = parseFloat(curr.odds.replace('+', ''));
    const bestValue = parseFloat(best.odds.replace('+', ''));
    return currValue > bestValue ? curr : best;
  }, bookmakerOdds[0]) : null;

  // Confidence breakdown from prediction
  const predictionBreakdown = predictionWithOdds?.confidenceBreakdown;
  const breakdown = predictionBreakdown 
    ? {
        form: Math.round((predictionBreakdown.fromResearch ?? predictionBreakdown.research ?? 0) * 100),
        injuries: Math.round(Math.random() * 20 + 10),
        h2h: Math.round((predictionBreakdown.fromHistorical ?? predictionBreakdown.historical ?? 0) * 100),
        odds: Math.round((predictionBreakdown.fromOdds ?? predictionBreakdown.odds ?? 0) * 100),
      }
    : { form: 25, injuries: 20, h2h: 15, odds: 12 };

  // Key factors
  const keyFactorsArray: string[] = language === 'cz' 
    ? (predictionWithOdds?.keyFactorsList_cs?.length ? predictionWithOdds.keyFactorsList_cs : predictionWithOdds?.keyFactorsList || [])
    : (predictionWithOdds?.keyFactorsList || []);

  // Analysis text
  const analysisText = language === 'cz'
    ? (prediction.reasoning_cs || prediction.reasoning || 'Analýza se připravuje...')
    : (prediction.reasoning || 'Analysis pending...');

  // Kelly criterion calculation
  const calculateKellyBet = () => {
    const probability = confidencePercent / 100;
    const decimalOdds = bestOdds ? parseAmericanToDecimal(bestOdds.odds) : 1.85;
    const kelly = (probability * decimalOdds - 1) / (decimalOdds - 1);
    const betAmount = Math.max(0, Math.round(bankroll * Math.min(kelly, 0.1) * 100) / 100); // Cap at 10%
    const potentialProfit = Math.round(betAmount * (decimalOdds - 1) * 100) / 100;
    return { betAmount, potentialProfit };
  };

  const parseAmericanToDecimal = (odds: string): number => {
    const num = parseInt(odds.replace('+', ''));
    if (isNaN(num)) return 1.85;
    if (num > 0) return (num / 100) + 1;
    return (100 / Math.abs(num)) + 1;
  };

  const { betAmount: kellyBet, potentialProfit } = calculateKellyBet();

  // Prediction object for save
  const predictionForSave = {
    id: prediction.id,
    sport: prediction.sport,
    homeTeam: prediction.homeTeam,
    awayTeam: prediction.awayTeam,
    gameTime: prediction.gameTime,
    prediction: prediction.prediction,
    confidence: prediction.confidence,
    expectedValue: prediction.expectedValue,
    reasoning: prediction.reasoning,
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/predictions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        {language === 'cz' ? '← Zpět na predikce' : '← Back to Predictions'}
      </Link>

      {/* Result Banner (if completed) */}
      {gameStatus === 'completed' && prediction.result && (
        <div className={cn(
          'rounded-2xl p-6 text-center',
          prediction.result === 'win' 
            ? 'bg-gradient-to-r from-success/20 via-success/10 to-success/20 border border-success/30'
            : 'bg-gradient-to-r from-destructive/20 via-destructive/10 to-destructive/20 border border-destructive/30'
        )}>
          <div className="flex items-center justify-center gap-3 mb-2">
            {prediction.result === 'win' ? (
              <CheckCircle className="h-8 w-8 text-success" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
            <span className={cn(
              'text-3xl font-black',
              prediction.result === 'win' ? 'text-success' : 'text-destructive'
            )}>
              {prediction.result === 'win' 
                ? (language === 'cz' ? '✅ VÝHRA' : '✅ WIN')
                : (language === 'cz' ? '❌ PROHRA' : '❌ LOSS')
              }
            </span>
          </div>
          <p className="text-muted-foreground">
            {language === 'cz' 
              ? `Naše jistota byla ${confidencePercent}%. ${prediction.result === 'win' ? 'Měli jsme pravdu!' : 'Tentokrát se nám to nepovedlo.'}`
              : `Our confidence was ${confidencePercent}%. ${prediction.result === 'win' ? 'We were right!' : 'We were wrong this time.'}`
            }
          </p>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Header Card */}
          <div className="glass-card p-6">
            {/* Sport & Live Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{getSportEmoji(sportName || 'Sports')}</span>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {sportName || 'Sports'}
                </span>
              </div>
              {gameStatus === 'live' && <LiveGameBadge gameTime={prediction.gameTime} />}
            </div>

            {/* Teams */}
            <h1 className="text-2xl md:text-3xl font-black mb-3">
              {prediction.homeTeam} vs {prediction.awayTeam}
            </h1>

            {/* Game Time Countdown */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {gameStatus === 'scheduled' ? (
                <span>
                  ⏰ {language === 'cz' ? `Začíná za ${formatCountdown(prediction.gameTime)}` : `Starts in ${formatCountdown(prediction.gameTime)}`}
                </span>
              ) : gameStatus === 'live' ? (
                <span className="text-success font-semibold">🔴 LIVE</span>
              ) : (
                <span>{format(new Date(prediction.gameTime), 'MMM d, yyyy • h:mm a')}</span>
              )}
            </div>
          </div>

          {/* Our Pick Card - Highlighted */}
          <div className="glass-card p-6 border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-background to-accent/5 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Pick Info */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    🎯 {language === 'cz' ? 'Náš tip' : 'Our Pick'}
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-primary">
                    {prediction.prediction.pick}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {prediction.prediction.type} {prediction.prediction.line && `• ${prediction.prediction.line}`}
                  </p>
                </div>

                {/* Animated Confidence Gauge */}
                <div className="flex items-center gap-6">
                  <CircularConfidence value={confidencePercent} />
                </div>
              </div>

              {/* Confidence Breakdown Bars */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  {language === 'cz' ? 'Rozklad důvěry' : 'Confidence Breakdown'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <BreakdownItem label={language === 'cz' ? 'Forma' : 'Form'} value={breakdown.form} color="bg-primary" />
                  <BreakdownItem label={language === 'cz' ? 'Zranění' : 'Injuries'} value={breakdown.injuries} color="bg-accent" />
                  <BreakdownItem label="H2H" value={breakdown.h2h} color="bg-success" />
                  <BreakdownItem label={language === 'cz' ? 'Kurzy' : 'Odds'} value={breakdown.odds} color="bg-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Odds Card */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {language === 'cz' ? 'Přehled kurzů' : 'Odds Overview'}
            </h3>
            
            {bookmakerOdds.length > 0 ? (
              <div className="space-y-4">
                {/* Odds Movement */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Pohyb kurzu' : 'Odds Movement'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">1.75</span>
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="font-mono font-bold text-success">1.85</span>
                    <span className="text-xs text-success">
                      ({language === 'cz' ? 'kurz roste' : 'odds rising'})
                    </span>
                  </div>
                </div>

                {/* Best Odds Highlight */}
                {bestOdds && (
                  <a 
                    href={`https://www.${bestOdds.bookmaker.toLowerCase().replace(/\s/g, '')}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-success/10 to-success/5 border border-success/30 hover:border-success/50 transition-colors group"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {language === 'cz' ? 'Nejlepší kurz u' : 'Best odds at'}
                      </p>
                      <p className="font-bold text-success">{bestOdds.bookmaker}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-mono font-black text-success">{bestOdds.odds}</span>
                      <ExternalLink className="h-4 w-4 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                )}

                {/* All Odds */}
                <OddsComparison bookmakerOdds={bookmakerOdds} />
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {language === 'cz' ? 'Kurzy se načítají...' : 'Loading odds...'}
              </p>
            )}
          </div>

          {/* Analysis Section */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {language === 'cz' ? 'Analýza' : 'Analysis'}
            </h3>
            
            {/* Key Factors */}
            {keyFactorsArray.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  {language === 'cz' ? 'Klíčové faktory' : 'Key Factors'}
                </p>
                <div className="space-y-2">
                  {keyFactorsArray.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-sm text-muted-foreground">{factor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Analysis */}
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {analysisText}
              </p>
            </div>
          </div>

          {/* Head-to-Head Stats */}
          {h2hData && (
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                {language === 'cz' ? 'Vzájemné zápasy' : 'Head-to-Head'}
              </h3>

              {/* Overall Record */}
              <div className="flex items-center justify-center gap-4 mb-6 p-4 rounded-xl bg-muted/50">
                <div className="text-center">
                  <p className="text-2xl font-mono font-black text-primary">{h2hData.homeWins}</p>
                  <p className="text-xs text-muted-foreground">{prediction.homeTeam}</p>
                </div>
                <span className="text-2xl text-muted-foreground">-</span>
                <div className="text-center">
                  <p className="text-2xl font-mono font-black">{h2hData.awayWins}</p>
                  <p className="text-xs text-muted-foreground">{prediction.awayTeam}</p>
                </div>
              </div>

              {/* Last 5 Meetings */}
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {language === 'cz' ? 'Posledních 5 zápasů' : 'Last 5 Meetings'}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {h2hData.lastMeetings.map((meeting, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      'flex-shrink-0 p-3 rounded-lg border text-center min-w-[100px]',
                      meeting.winner === prediction.homeTeam 
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted/50 border-border'
                    )}
                  >
                    <p className="text-xs text-muted-foreground mb-1">{meeting.date}</p>
                    <p className="font-mono font-bold text-sm">{meeting.score}</p>
                    <p className="text-xs text-muted-foreground truncate">{meeting.winner}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs for Additional Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-muted/50 overflow-x-auto">
              <TabsTrigger value="discussion" className="gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                {language === 'cz' ? 'Diskuze' : 'Discussion'}
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-1.5">
                {language === 'cz' ? 'Statistiky' : 'Stats'}
              </TabsTrigger>
              <TabsTrigger value="mystical" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {language === 'cz' ? 'Mystika' : 'Mystical'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussion" className="mt-4">
              <DiscussionTab
                predictionId={prediction.id}
                homeTeam={prediction.homeTeam}
                awayTeam={prediction.awayTeam}
              />
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <div className="glass-card p-6">
                <SportSpecificStats
                  predictionId={prediction.id}
                  sport={prediction.sport}
                  homeTeam={prediction.homeTeam}
                  awayTeam={prediction.awayTeam}
                  confidence={confidencePercent}
                />
              </div>
            </TabsContent>

            <TabsContent value="mystical" className="mt-4">
              <NumerologyTab
                predictionId={prediction.id}
                homeTeam={prediction.homeTeam}
                awayTeam={prediction.awayTeam}
                gameTime={prediction.gameTime}
                pick={prediction.prediction.pick}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* Community Pick */}
          <div className="glass-card p-5">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {language === 'cz' ? 'Tip komunity' : 'Community Pick'}
            </h4>
            
            <div className="space-y-3">
              {/* Home Team */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium truncate">{prediction.homeTeam}</span>
                  <span className="font-mono font-bold">{communityPick.home}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${communityPick.home}%` }}
                  />
                </div>
              </div>
              
              {/* Away Team */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium truncate">{prediction.awayTeam}</span>
                  <span className="font-mono font-bold">{communityPick.away}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-700"
                    style={{ width: `${communityPick.away}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center pt-2">
                {communityPick.totalVotes} {language === 'cz' ? 'hlasů' : 'votes'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass-card p-5 space-y-3">
            <SavePickButton prediction={predictionForSave} className="w-full justify-center" />
            
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="h-4 w-4" />
              {language === 'cz' ? 'Sdílet' : 'Share'}
            </Button>
          </div>

          {/* Bet Calculator */}
          <div className="glass-card p-5">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              {language === 'cz' ? 'Kalkulačka sázek' : 'Bet Calculator'}
            </h4>

            {/* Bankroll Input */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1.5 block">
                {language === 'cz' ? 'Váš bankroll' : 'Your Bankroll'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {language === 'cz' ? 'Kč' : '$'}
                </span>
                <Input
                  type="number"
                  value={bankroll}
                  onChange={(e) => setBankroll(Math.max(0, Number(e.target.value)))}
                  className="pl-9 font-mono"
                />
              </div>
            </div>

            {/* Kelly Criterion Result */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Doporučená sázka' : 'Recommended Bet'}
                </span>
                <span className="font-mono font-bold text-primary">
                  {kellyBet.toLocaleString(language === 'cz' ? 'cs-CZ' : 'en-US')} {language === 'cz' ? 'Kč' : '$'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                <span className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Potenciální výnos' : 'Potential Profit'}
                </span>
                <span className="font-mono font-bold text-success">
                  +{potentialProfit.toLocaleString(language === 'cz' ? 'cs-CZ' : 'en-US')} {language === 'cz' ? 'Kč' : '$'}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground mt-3 text-center">
              {language === 'cz' ? 'Založeno na Kelly Criterion' : 'Based on Kelly Criterion'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-mono font-black text-primary">{confidencePercent}%</p>
                <p className="text-xs text-muted-foreground">{language === 'cz' ? 'Jistota' : 'Confidence'}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className={cn(
                  'text-2xl font-mono font-black',
                  Number(prediction.expectedValue) > 0 ? 'text-success' : 'text-muted-foreground'
                )}>
                  {Number(prediction.expectedValue) > 0 ? '+' : ''}
                  {(Number(prediction.expectedValue) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">EV</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        prediction={predictionForSave as APIPrediction}
      />
    </div>
  );
}

// Circular Confidence Gauge Component
function CircularConfidence({ value }: { value: number }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  const getColor = () => {
    if (value >= 70) return { stroke: 'stroke-success', text: 'text-success' };
    if (value >= 55) return { stroke: 'stroke-warning', text: 'text-warning' };
    return { stroke: 'stroke-orange-400', text: 'text-orange-400' };
  };
  
  const colors = getColor();

  return (
    <div className="relative h-24 w-24 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(colors.stroke, 'transition-all duration-1000 ease-out')}
          style={{
            animation: 'confidence-fill 1.5s ease-out forwards',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-2xl font-mono font-black', colors.text)}>{value}%</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">confidence</span>
      </div>
    </div>
  );
}

// Breakdown Item Component
function BreakdownItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all duration-1000', color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
