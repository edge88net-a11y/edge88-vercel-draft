import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Loader2, FileText, BarChart3, AlertTriangle, DollarSign, History } from 'lucide-react';
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
import { AnalysisSection } from '@/components/AnalysisSection';
import { OddsComparison } from '@/components/OddsComparison';
import { BankrollCalculator } from '@/components/BankrollCalculator';
import { useActivePredictions } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

export default function PredictionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: predictions, isLoading } = useActivePredictions();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [winProbability, setWinProbability] = useState(50);

  const prediction = predictions?.find(p => p.id === id);

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
      // Set initial probability based on our pick
      const isPredictingHome = prediction.prediction.pick.includes(prediction.homeTeam);
      const confidence = prediction.confidence <= 1 
        ? Math.round(prediction.confidence * 100) 
        : Math.round(prediction.confidence);
      setWinProbability(isPredictingHome ? confidence : 100 - confidence);

      // Simulate updates every 30 seconds
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
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  // Get bookmaker odds
  const bookmakerOdds = prediction.bookmakerOdds || [
    { bookmaker: 'DraftKings', odds: prediction.prediction.odds },
    { bookmaker: 'FanDuel', odds: adjustOdds(prediction.prediction.odds, 2) },
    { bookmaker: 'BetMGM', odds: adjustOdds(prediction.prediction.odds, -3) },
    { bookmaker: 'Bet365', odds: adjustOdds(prediction.prediction.odds, 5) },
    { bookmaker: 'Tipsport', odds: adjustOdds(prediction.prediction.odds, -1) },
    { bookmaker: 'Fortuna', odds: adjustOdds(prediction.prediction.odds, 3) },
    { bookmaker: 'Betano', odds: adjustOdds(prediction.prediction.odds, 4) },
    { bookmaker: 'Chance', odds: adjustOdds(prediction.prediction.odds, -2) },
  ];

  // Find best odds
  const bestOddsIndex = bookmakerOdds.reduce((best, curr, idx, arr) => {
    const currValue = parseOddsValue(curr.odds);
    const bestValue = parseOddsValue(arr[best].odds);
    return currValue > bestValue ? idx : best;
  }, 0);

  // Get breakdown
  const breakdown = prediction.confidenceBreakdown || { research: 50, odds: 30, historical: 20 };

  // Mock timeline data
  const timeline = [
    { 
      time: format(new Date(prediction.gameTime), 'HH:mm') + ' UTC', 
      event: language === 'cz' ? 'Analýza zahájena' : 'Analysis started', 
      icon: FileText 
    },
    { 
      time: format(new Date(new Date(prediction.gameTime).getTime() - 30 * 60000), 'HH:mm') + ' UTC', 
      event: language === 'cz' ? 'Model aktualizován' : 'Model updated', 
      icon: BarChart3 
    },
    { 
      time: format(new Date(new Date(prediction.gameTime).getTime() - 15 * 60000), 'HH:mm') + ' UTC', 
      event: language === 'cz' ? 'Linka se posunula' : 'Line moved', 
      icon: DollarSign 
    },
  ];

  // Research stats
  const researchStats = {
    articles: prediction.dataSources ? prediction.dataSources * 100 : 1247,
    experts: Math.floor(Math.random() * 30) + 30,
    injuries: prediction.keyFactors?.injuries?.length || 12,
  };

  const live = isGameLive();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/predictions" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t.predictions}
        </Link>

        {/* Hero Section - Premium Design */}
        <div className="glass-card relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          
          {/* Live Badge - Top Right */}
          {live && (
            <div className="absolute right-4 top-4 z-10">
              <LiveGameBadge gameTime={prediction.gameTime} />
            </div>
          )}

          <div className="relative p-8">
            {/* Teams - Large Layout */}
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
                    <span className="text-3xl font-mono font-bold">
                      {Math.floor(Math.random() * 30)} - {Math.floor(Math.random() * 30)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'cz' ? 'Živé skóre' : 'Live Score'}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{prediction.homeTeam} Stadium</span>
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
              <SavePickButton prediction={prediction} />
            </div>
          </div>
        </div>

        {/* Our Pick Card - Prominent */}
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

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full justify-start mb-6 bg-muted/50">
            <TabsTrigger value="overview" className="flex-1 md:flex-initial">
              {language === 'cz' ? 'Přehled' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 md:flex-initial">
              {language === 'cz' ? 'Statistiky' : 'Stats'}
            </TabsTrigger>
            <TabsTrigger value="injuries" className="flex-1 md:flex-initial">
              {language === 'cz' ? 'Zranění' : 'Injuries'}
            </TabsTrigger>
            <TabsTrigger value="odds" className="flex-1 md:flex-initial">
              {language === 'cz' ? 'Kurzy' : 'Odds'}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 md:flex-initial">
              {language === 'cz' ? 'Časová osa' : 'Timeline'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="glass-card p-6">
                  <AnalysisSection
                    reasoning={prediction.reasoning}
                    pick={prediction.prediction.pick}
                    confidence={confidencePercent}
                    keyFactors={prediction.keyFactors}
                    homeTeam={prediction.homeTeam}
                    awayTeam={prediction.awayTeam}
                  />
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

                {/* Research Stats */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4">{t.researchStats}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.scannedArticles}</span>
                      <span className="font-mono font-bold">{researchStats.articles.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.expertOpinions}</span>
                      <span className="font-mono font-bold">{researchStats.experts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.injuryReports}</span>
                      <span className="font-mono font-bold">{researchStats.injuries}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {language === 'cz' ? 'Porovnání týmů' : 'Team Comparison'}
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                {/* Mock stats comparison */}
                {[
                  { label: language === 'cz' ? 'Domácí bilance' : 'Home Record', home: '8-2', away: '6-4' },
                  { label: language === 'cz' ? 'Venkovní bilance' : 'Away Record', home: '5-5', away: '7-3' },
                  { label: language === 'cz' ? 'Posledních 5' : 'Last 5', home: '4-1', away: '3-2' },
                  { label: language === 'cz' ? 'Vzájemná bilance' : 'H2H', home: '3-2', away: '2-3' },
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <span className="font-medium">{prediction.homeTeam}</span>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="font-mono text-sm">{stat.home} vs {stat.away}</p>
                    </div>
                    <span className="font-medium">{prediction.awayTeam}</span>
                  </div>
                ))}
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
                    {(prediction.keyFactors?.injuries || ['No significant injuries reported']).slice(0, 3).map((injury, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm">{injury}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Away Team Injuries */}
                <div>
                  <h4 className="font-medium mb-3">{prediction.awayTeam}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3">
                      <span className="text-sm text-success">
                        {language === 'cz' ? 'Žádná významná zranění' : 'No significant injuries'}
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
                  <OddsComparison bookmakerOdds={bookmakerOdds} />
                </div>
              </div>

              <div>
                <BankrollCalculator bookmakerOdds={bookmakerOdds} />
              </div>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                {t.timeline}
              </h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-8 bottom-8 w-px bg-border" />
                
                <div className="space-y-6">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 relative">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 z-10">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 rounded-lg bg-muted/50 p-4">
                        <p className="font-medium">{item.event}</p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Update */}
              {!live && (
                <div className="mt-6 rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
                  <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'cz' 
                      ? 'Další aktualizace analýzy za 15 minut'
                      : 'Analysis updates in 15 minutes'
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

// Helper components
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

// Helper functions
function adjustOdds(odds: string, adjustment: number): string {
  const numOdds = parseInt(odds.replace('+', ''));
  if (isNaN(numOdds)) return odds;
  const adjusted = numOdds + adjustment;
  return adjusted > 0 ? `+${adjusted}` : String(adjusted);
}

function parseOddsValue(odds: string): number {
  const num = parseInt(odds.replace('+', ''));
  if (isNaN(num)) return 0;
  return num > 0 ? 100 + num : 100 + (100 / Math.abs(num)) * 100;
}
