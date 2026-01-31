import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Loader2, FileText, BarChart3, AlertTriangle, DollarSign, History, Sparkles, MessageCircle, Database, Cpu, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { TeamLogo } from '@/components/TeamLogo';
import { SavePickButton } from '@/components/SavePickButton';
import { GameCountdown } from '@/components/GameCountdown';
import { LiveGameBadge, WinProbabilityBar } from '@/components/LiveGameBadge';
import { OddsComparison } from '@/components/OddsComparison';
import { BankrollCalculator } from '@/components/BankrollCalculator';
import { SportSpecificStats } from '@/components/SportSpecificStats';
import { NumerologyTab } from '@/components/NumerologyTab';
import { DiscussionTab } from '@/components/DiscussionTab';
import { useSinglePrediction, useActivePredictions } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function PredictionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: fullPrediction, isLoading: isLoadingFull, error: fullError } = useSinglePrediction(id);
  const { data: predictions, isLoading: isLoadingList } = useActivePredictions();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [winProbability, setWinProbability] = useState(50);

  // Use full prediction from API, fallback to list data
  const listPrediction = predictions?.find(p => p.id === id);
  const prediction = fullPrediction || listPrediction;
  const isLoading = isLoadingFull && isLoadingList;

  // Check if game is live
  const isGameLive = () => {
    if (!prediction) return false;
    const gameDate = new Date(prediction.gameTime);
    const now = new Date();
    const diffMs = now.getTime() - gameDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours < 4;
  };

  // Simulate live probability updates
  useEffect(() => {
    if (isGameLive() && prediction) {
      const isPredictingHome = prediction.prediction.pick.includes(prediction.homeTeam);
      const confidence = prediction.confidence <= 1 
        ? Math.round(prediction.confidence * 100) 
        : Math.round(prediction.confidence);
      setWinProbability(isPredictingHome ? confidence : 100 - confidence);

      const interval = setInterval(() => {
        setWinProbability(prev => {
          const change = (Math.random() - 0.5) * 10;
          return Math.max(10, Math.min(90, prev + change));
        });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [prediction]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{language === 'cz' ? 'Načítám analýzu...' : 'Loading analysis...'}</p>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 pt-24 text-center">
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
        <Footer />
        <MobileNav />
      </div>
    );
  }

  // Get confidence color
  const getConfidenceColor = (value: number) => {
    if (value >= 70) return 'text-success';
    if (value >= 55) return 'text-yellow-400';
    return 'text-orange-400';
  };

  // Format confidence as percentage
  const confidencePercent = prediction.confidence <= 1 
    ? Math.round(prediction.confidence * 100) 
    : Math.round(prediction.confidence);

  // Get bookmaker odds from full prediction or transform from list
  const bookmakerOdds = fullPrediction?.bookmakerOdds?.map(o => ({
    bookmaker: o.bookmaker.charAt(0).toUpperCase() + o.bookmaker.slice(1).replace(/([A-Z])/g, ' $1'),
    odds: o.homeOdds > 0 ? `+${o.homeOdds}` : String(o.homeOdds),
    awayOdds: o.awayOdds > 0 ? `+${o.awayOdds}` : String(o.awayOdds),
    line: o.spreadHome ? String(o.spreadHome) : undefined,
  })) || listPrediction?.bookmakerOdds || [];

  // Get confidence breakdown from full prediction
  const breakdown = fullPrediction?.confidenceBreakdown 
    ? {
        research: Math.round(fullPrediction.confidenceBreakdown.fromResearch * 100),
        odds: Math.round(fullPrediction.confidenceBreakdown.fromOdds * 100),
        historical: Math.round(fullPrediction.confidenceBreakdown.fromHistorical * 100),
      }
    : { research: 50, odds: 30, historical: 20 };

  // Research stats from full prediction
  const researchStats = {
    sources: fullPrediction?.sourcesAnalyzed || 0,
    modelVersion: fullPrediction?.modelVersion || 'Edge88',
    ev: typeof prediction.expectedValue === 'number' 
      ? (prediction.expectedValue * 100).toFixed(1) 
      : prediction.expectedValue,
  };

  // Get key factors from full prediction
  const keyFactors = fullPrediction?.keyFactors || [];

  // Get injuries from full prediction
  const injuries = fullPrediction?.injuries;

  // Get full analysis text
  const analysisText = fullPrediction?.fullReasoning || fullPrediction?.reasoning || prediction.reasoning;

  const live = isGameLive();

  // Create prediction object for SavePickButton
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
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/predictions" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t.predictions}
        </Link>

        {/* Hero Section */}
        <div className="glass-card relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          
          {/* Live Badge */}
          {live && (
            <div className="absolute right-4 top-4 z-10">
              <LiveGameBadge gameTime={prediction.gameTime} />
            </div>
          )}

          <div className="relative p-8">
            {/* Teams */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
              {/* Away Team */}
              <div className="flex flex-col items-center text-center flex-1">
                <TeamLogo 
                  teamName={prediction.awayTeam} 
                  sport={prediction.sport} 
                  size="lg" 
                  className="h-24 w-24 mb-4" 
                />
                <h2 className={cn(
                  'text-2xl md:text-3xl font-bold',
                  prediction.prediction.pick.includes(prediction.awayTeam) && 'text-success'
                )}>
                  {prediction.awayTeam}
                </h2>
                {prediction.prediction.pick.includes(prediction.awayTeam) && (
                  <span className="mt-2 rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success">
                    {language === 'cz' ? 'Náš tip' : 'Our Pick'}
                  </span>
                )}
              </div>

              {/* VS / Game Info */}
              <div className="flex flex-col items-center gap-4">
                <span className="text-4xl font-bold text-muted-foreground">VS</span>
                {!live ? (
                  <GameCountdown gameTime={prediction.gameTime} />
                ) : (
                  <div className="text-center">
                    <span className="text-3xl font-mono font-bold">LIVE</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{fullPrediction?.venue || `${prediction.homeTeam} Stadium`}</span>
                </div>
              </div>

              {/* Home Team */}
              <div className="flex flex-col items-center text-center flex-1">
                <TeamLogo 
                  teamName={prediction.homeTeam} 
                  sport={prediction.sport} 
                  size="lg" 
                  className="h-24 w-24 mb-4" 
                />
                <h2 className={cn(
                  'text-2xl md:text-3xl font-bold',
                  prediction.prediction.pick.includes(prediction.homeTeam) && 'text-success'
                )}>
                  {prediction.homeTeam}
                </h2>
                {prediction.prediction.pick.includes(prediction.homeTeam) && (
                  <span className="mt-2 rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success">
                    {language === 'cz' ? 'Náš tip' : 'Our Pick'}
                  </span>
                )}
              </div>
            </div>

            {/* Live Win Probability */}
            {live && (
              <div className="mb-6 rounded-lg bg-muted/50 p-4">
                <WinProbabilityBar
                  homeTeam={prediction.homeTeam}
                  awayTeam={prediction.awayTeam}
                  homeProbability={Math.round(winProbability)}
                />
              </div>
            )}

            {/* Save Button */}
            <div className="absolute right-4 top-4 md:right-8 md:top-8">
              <SavePickButton prediction={predictionForSave} />
            </div>
          </div>
        </div>

        {/* Our Pick Card */}
        <div className="glass-card p-6 mb-8 bg-gradient-to-r from-primary/10 to-accent/5 border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
                🏆 {t.ourPick}
              </h3>
              <p className="text-2xl md:text-3xl font-bold">{prediction.prediction.pick}</p>
              <p className="text-muted-foreground mt-1">
                {prediction.prediction.type} • {prediction.prediction.line || prediction.prediction.odds}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <ConfidenceMeter value={confidencePercent} size="lg" />
              <div className="text-center">
                <p className={cn('text-4xl font-mono font-bold', getConfidenceColor(confidencePercent))}>
                  {confidencePercent}%
                </p>
                <p className="text-sm text-muted-foreground">{t.confidence}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Factors Pills - Only show if we have real data */}
        {keyFactors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {language === 'cz' ? 'Klíčové faktory' : 'Key Factors'}
            </h3>
            <div className="space-y-3">
              {keyFactors.map((factor, idx) => (
                <div key={idx} className="glass-card p-4 border-l-4 border-primary">
                  <p className="text-sm">{factor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full justify-start mb-6 bg-muted/50 overflow-x-auto">
            <TabsTrigger value="overview" className="flex-1 md:flex-initial">
              {language === 'cz' ? 'Analýza' : 'Analysis'}
            </TabsTrigger>
            <TabsTrigger value="odds" className="flex-1 md:flex-initial">
              {language === 'cz' ? 'Kurzy' : 'Odds'}
            </TabsTrigger>
            <TabsTrigger value="injuries" className="flex-1 md:flex-initial">
              {language === 'cz' ? 'Zranění' : 'Injuries'}
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 md:flex-initial">
              {language === 'cz' ? 'Statistiky' : 'Stats'}
            </TabsTrigger>
            <TabsTrigger value="mystical" className="flex-1 md:flex-initial gap-1">
              <Sparkles className="h-3 w-3" />
              {language === 'cz' ? 'Mystika' : 'Mystical'}
            </TabsTrigger>
            <TabsTrigger value="discussion" className="flex-1 md:flex-initial gap-1">
              <MessageCircle className="h-3 w-3" />
              {language === 'cz' ? 'Diskuze' : 'Discussion'}
            </TabsTrigger>
          </TabsList>

          {/* Overview/Analysis Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Full Analysis */}
              <div className="lg:col-span-2">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {language === 'cz' ? 'AI Analýza' : 'AI Analysis'}
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {analysisText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Confidence Breakdown */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4">{t.confidenceBreakdown}</h3>
                  <div className="space-y-4">
                    <BreakdownBar label={t.research} value={breakdown.research} color="bg-primary" />
                    <BreakdownBar label={t.odds} value={breakdown.odds} color="bg-accent" />
                    <BreakdownBar label={t.historical} value={breakdown.historical} color="bg-success" />
                  </div>
                </div>

                {/* Model Stats */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    {language === 'cz' ? 'Model Info' : 'Model Info'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        {language === 'cz' ? 'Zdroje analyzovány' : 'Sources Analyzed'}
                      </span>
                      <span className="font-mono font-bold text-primary">
                        {researchStats.sources > 0 ? researchStats.sources.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        {language === 'cz' ? 'Verze modelu' : 'Model Version'}
                      </span>
                      <span className="font-mono font-bold">{researchStats.modelVersion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {language === 'cz' ? 'Očekávaná hodnota' : 'Expected Value'}
                      </span>
                      <span className={cn(
                        'font-mono font-bold',
                        Number(researchStats.ev) > 0 ? 'text-success' : 'text-muted-foreground'
                      )}>
                        {Number(researchStats.ev) > 0 ? '+' : ''}{researchStats.ev}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Odds Tab */}
          <TabsContent value="odds" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    {t.oddsComparison}
                  </h3>
                  {bookmakerOdds.length > 0 ? (
                    <OddsComparison bookmakerOdds={bookmakerOdds} />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {language === 'cz' ? 'Kurzy se načítají...' : 'Loading odds...'}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <BankrollCalculator bookmakerOdds={bookmakerOdds} />
              </div>
            </div>
          </TabsContent>

          {/* Injuries Tab */}
          <TabsContent value="injuries" className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {language === 'cz' ? 'Hlášení zranění' : 'Injury Report'}
              </h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Home Team Injuries */}
                <div>
                  <h4 className="font-medium mb-3">{prediction.homeTeam}</h4>
                  <div className="space-y-2">
                    {injuries?.home && injuries.home.length > 0 ? (
                      injuries.home.map((injury, idx) => (
                        <div key={idx} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">{injury.player}</p>
                            <p className="text-xs text-muted-foreground">{injury.status} - {injury.impact}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3">
                        <span className="text-sm text-success">
                          {language === 'cz' ? 'Žádná významná zranění' : 'No significant injuries'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Away Team Injuries */}
                <div>
                  <h4 className="font-medium mb-3">{prediction.awayTeam}</h4>
                  <div className="space-y-2">
                    {injuries?.away && injuries.away.length > 0 ? (
                      injuries.away.map((injury, idx) => (
                        <div key={idx} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">{injury.player}</p>
                            <p className="text-xs text-muted-foreground">{injury.status} - {injury.impact}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3">
                        <span className="text-sm text-success">
                          {language === 'cz' ? 'Žádná významná zranění' : 'No significant injuries'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
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

          {/* Mystical Tab */}
          <TabsContent value="mystical" className="space-y-6">
            <NumerologyTab
              predictionId={prediction.id}
              homeTeam={prediction.homeTeam}
              awayTeam={prediction.awayTeam}
              gameTime={prediction.gameTime}
              pick={prediction.prediction.pick}
            />
          </TabsContent>

          {/* Discussion Tab */}
          <TabsContent value="discussion" className="space-y-6">
            <DiscussionTab
              predictionId={prediction.id}
              homeTeam={prediction.homeTeam}
              awayTeam={prediction.awayTeam}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

// Helper component
function BreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-bold">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-1000', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
