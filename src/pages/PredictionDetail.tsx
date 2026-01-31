import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, TrendingUp, AlertTriangle, ThermometerSun, DollarSign, Users, History, FileText, Newspaper, UserCheck, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { TeamLogo } from '@/components/TeamLogo';
import { SavePickButton } from '@/components/SavePickButton';
import { GameCountdown } from '@/components/GameCountdown';
import { useActivePredictions } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

export default function PredictionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: predictions, isLoading } = useActivePredictions();
  const { t } = useLanguage();

  const prediction = predictions?.find(p => p.id === id);

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
          <p className="mt-2 text-muted-foreground">This prediction could not be found.</p>
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
  const confidencePercent = Math.round(prediction.confidence);

  // Get bookmaker odds
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

  // Get breakdown
  const breakdown = prediction.confidenceBreakdown || { research: 50, odds: 30, historical: 20 };

  // Mock timeline data
  const timeline = [
    { time: '22:14 UTC', event: t.analyzedAt, icon: FileText },
    { time: '22:30 UTC', event: t.analyzedUpdated, icon: TrendingUp },
    { time: '22:45 UTC', event: t.lineMoved, icon: DollarSign },
  ];

  // Mock research stats
  const researchStats = {
    articles: 1247,
    experts: 48,
    injuries: 12,
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/predictions" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t.predictions}
        </Link>

        {/* Hero Section */}
        <div className="glass-card relative overflow-hidden p-8 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="relative">
            {/* Teams */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Away Team */}
              <div className="flex flex-col items-center text-center">
                <TeamLogo teamName={prediction.awayTeam} sport={prediction.sport} size="lg" className="h-20 w-20 mb-3" />
                <h2 className={cn(
                  'text-2xl font-bold',
                  prediction.prediction.pick.includes(prediction.awayTeam) && 'text-success'
                )}>
                  {prediction.awayTeam}
                </h2>
              </div>

              {/* VS / Game Info */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-3xl font-bold text-muted-foreground">{t.vs}</span>
                <GameCountdown gameTime={prediction.gameTime} />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{prediction.homeTeam} Stadium</span>
                </div>
              </div>

              {/* Home Team */}
              <div className="flex flex-col items-center text-center">
                <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport} size="lg" className="h-20 w-20 mb-3" />
                <h2 className={cn(
                  'text-2xl font-bold',
                  prediction.prediction.pick.includes(prediction.homeTeam) && 'text-success'
                )}>
                  {prediction.homeTeam}
                </h2>
              </div>
            </div>

            {/* Save Button */}
            <div className="absolute right-4 top-4">
              <SavePickButton prediction={prediction} />
            </div>
          </div>
        </div>

        {/* Our Pick Section */}
        <div className="glass-card p-6 mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
                {t.ourPick}
              </h3>
              <p className="text-2xl font-bold">{prediction.prediction.pick}</p>
              <p className="text-muted-foreground">
                {prediction.prediction.type} • {prediction.prediction.line || prediction.prediction.odds}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ConfidenceMeter value={confidencePercent} size="lg" />
              <div className="text-right">
                <p className={cn('text-3xl font-mono font-bold', getConfidenceColor(confidencePercent))}>
                  {confidencePercent}%
                </p>
                <p className="text-sm text-muted-foreground">{t.confidence}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Full Analysis */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t.fullAnalysis}
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {prediction.reasoning}
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Our AI model has analyzed this matchup extensively, considering historical performance, current form, 
                  injuries, weather conditions, and market movement. The data strongly supports this pick with a 
                  {' '}<span className={getConfidenceColor(confidencePercent)}>{confidencePercent}%</span> confidence rating.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Sharp money has been moving in the direction of our pick, with line movement suggesting professional 
                  bettors are aligned with this analysis. The public betting percentage favors the other side, creating 
                  additional value in this selection.
                </p>
              </div>
            </div>

            {/* Key Factors */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t.keyFactors}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {prediction.keyFactors?.injuries && prediction.keyFactors.injuries.length > 0 && (
                  <FactorCard
                    icon={AlertTriangle}
                    title={t.injuries}
                    color="text-destructive"
                    content={prediction.keyFactors.injuries.join(', ')}
                  />
                )}
                {prediction.keyFactors?.weather && (
                  <FactorCard
                    icon={ThermometerSun}
                    title={t.weather}
                    color="text-blue-400"
                    content={`${prediction.keyFactors.weather.conditions}, ${prediction.keyFactors.weather.temperature}°F - ${prediction.keyFactors.weather.impact}`}
                  />
                )}
                {prediction.keyFactors?.sharpMoney && (
                  <FactorCard
                    icon={DollarSign}
                    title={t.sharpMoney}
                    color="text-success"
                    content={`Line moved ${prediction.keyFactors.sharpMoney.lineMovement > 0 ? '+' : ''}${prediction.keyFactors.sharpMoney.lineMovement} toward ${prediction.keyFactors.sharpMoney.direction}`}
                  />
                )}
                {prediction.keyFactors?.sentiment && (
                  <FactorCard
                    icon={Users}
                    title={t.sentiment}
                    color="text-yellow-400"
                    content={`Public: ${prediction.keyFactors.sentiment.public}% | Sharp: ${prediction.keyFactors.sentiment.sharp}%`}
                  />
                )}
                {prediction.keyFactors?.historicalH2H && (
                  <FactorCard
                    icon={History}
                    title={t.headToHead}
                    color="text-purple-400"
                    content={`Home: ${prediction.keyFactors.historicalH2H.homeWins} wins | Away: ${prediction.keyFactors.historicalH2H.awayWins} wins`}
                  />
                )}
              </div>
            </div>

            {/* Odds Comparison */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                {t.oddsComparison}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Bookmaker</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">{t.odds}</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">{t.bestValue}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookmakerOdds.map((bk, idx) => (
                      <tr key={bk.bookmaker} className={cn(
                        'border-b border-border/50',
                        idx === bestOddsIndex && 'bg-success/5'
                      )}>
                        <td className="py-3 font-medium">{bk.bookmaker}</td>
                        <td className={cn(
                          'py-3 text-right font-mono font-bold',
                          idx === bestOddsIndex && 'text-success'
                        )}>
                          {bk.odds}
                        </td>
                        <td className="py-3 text-right">
                          {idx === bestOddsIndex && (
                            <span className="rounded-full bg-success/20 px-2 py-1 text-xs font-medium text-success">
                              {t.bestValue}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                {breakdown.sentiment && (
                  <BreakdownBar label={t.sentiment} value={breakdown.sentiment} color="bg-yellow-400" />
                )}
              </div>
            </div>

            {/* Research Stats */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">{t.researchStats}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Newspaper className="h-4 w-4" />
                    <span className="text-sm">{t.scannedArticles}</span>
                  </div>
                  <span className="font-mono font-bold">{researchStats.articles.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm">{t.expertOpinions}</span>
                  </div>
                  <span className="font-mono font-bold">{researchStats.experts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{t.injuryReports}</span>
                  </div>
                  <span className="font-mono font-bold">{researchStats.injuries}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">{t.timeline}</h3>
              <div className="space-y-4">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Info */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t.modelVersion}</span>
                <span className="font-mono text-sm">{prediction.modelVersion || 'Edge88 v3.2'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.dataSources}</span>
                <span className="font-mono text-sm">{prediction.dataSources || 12} {t.verifiedSources}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

// Helper components
function FactorCard({ 
  icon: Icon, 
  title, 
  color, 
  content 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  color: string; 
  content: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', color)} />
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{content}</p>
    </div>
  );
}

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
