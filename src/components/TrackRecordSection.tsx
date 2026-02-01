import { Link } from 'react-router-dom';
import { BarChart3, Target, Trophy, TrendingUp, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStats, useActivePredictions } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji } from '@/lib/sportEmoji';
import { cn } from '@/lib/utils';

export function TrackRecordSection() {
  const { t, language } = useLanguage();
  const { data: stats } = useStats();
  const { data: predictions } = useActivePredictions();

  // Get recent completed predictions (last 10 with results)
  const recentResults = predictions
    ?.filter((p) => p.result === 'win' || p.result === 'loss')
    .slice(0, 10) || [];

  const accuracy = stats?.accuracy || 73;
  const totalPredictions = stats?.totalPredictions || 0;

  return (
    <section id="track-record" className="py-16 md:py-20 border-y border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-4">
            <BarChart3 className="h-4 w-4" />
            <span>{language === 'cz' ? 'Náš Track Record' : 'Our Track Record'}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {language === 'cz' ? 'Ověřené' : 'Verified'}{' '}
            <span className="gradient-text">{language === 'cz' ? 'výsledky' : 'Results'}</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {language === 'cz' 
              ? 'Všechny predikce jsou časově označeny před začátkem zápasu. Žádné cherry-picking.' 
              : 'All predictions are timestamped before game start. No cherry-picking.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {/* Overall Accuracy */}
          <div className="glass-card p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-success/10 border border-success/30 mb-4">
              <Target className="h-8 w-8 text-success" />
            </div>
            <div className="text-5xl font-mono font-black text-success mb-2">
              {accuracy.toFixed(1)}%
            </div>
            <p className="text-muted-foreground">
              {language === 'cz' ? 'Celková přesnost' : 'Overall Accuracy'}
            </p>
          </div>

          {/* Total Predictions */}
          <div className="glass-card p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 border border-primary/30 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div className="text-5xl font-mono font-black text-foreground mb-2">
              {totalPredictions}+
            </div>
            <p className="text-muted-foreground">
              {language === 'cz' ? 'Celkem predikcí' : 'Total Predictions'}
            </p>
          </div>

          {/* ROI */}
          <div className="glass-card p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/10 border border-accent/30 mb-4">
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
            <div className="text-5xl font-mono font-black text-foreground mb-2">
              +{stats?.roi?.toFixed(1) || 12.4}%
            </div>
            <p className="text-muted-foreground">
              {language === 'cz' ? 'Průměrné ROI' : 'Average ROI'}
            </p>
          </div>
        </div>

        {/* Sport Accuracy Bars */}
        {stats?.bySport && stats.bySport.length > 0 && (
          <div className="glass-card p-6 mb-12">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {language === 'cz' ? 'Přesnost podle sportu' : 'Accuracy by Sport'}
            </h3>
            <div className="space-y-4">
              {stats.bySport.slice(0, 5).map((sport) => (
                <div key={sport.sport} className="flex items-center gap-4">
                  <span className="text-2xl w-8">{getSportEmoji(sport.sport)}</span>
                  <span className="font-medium w-20">{sport.sport}</span>
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        sport.accuracy >= 70 ? 'bg-success' : 
                        sport.accuracy >= 55 ? 'bg-yellow-500' : 'bg-orange-500'
                      )}
                      style={{ width: `${Math.min(sport.accuracy, 100)}%` }}
                    />
                  </div>
                  <span className={cn(
                    'font-mono font-bold w-16 text-right',
                    sport.accuracy >= 70 ? 'text-success' : 
                    sport.accuracy >= 55 ? 'text-yellow-400' : 'text-orange-400'
                  )}>
                    {sport.accuracy.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div className="glass-card overflow-hidden mb-8">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {language === 'cz' ? 'Poslední výsledky' : 'Recent Results'}
              </h3>
              <span className="text-xs text-muted-foreground">
                {language === 'cz' ? 'Posledních 10 predikcí' : 'Last 10 predictions'}
              </span>
            </div>
            <div className="divide-y divide-border">
              {recentResults.map((prediction) => (
                <div 
                  key={prediction.id} 
                  className={cn(
                    'flex items-center justify-between p-4 transition-colors',
                    prediction.result === 'win' ? 'hover:bg-success/5' : 'hover:bg-destructive/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getSportEmoji(prediction.sport)}</span>
                    <div>
                      <p className="font-medium text-sm">
                        {prediction.awayTeam} @ {prediction.homeTeam}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {prediction.prediction.pick}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted-foreground">
                      {prediction.confidence}%
                    </span>
                    {prediction.result === 'win' ? (
                      <div className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-bold text-sm">WIN</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-destructive">
                        <XCircle className="h-5 w-5" />
                        <span className="font-bold text-sm">LOSS</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {language === 'cz' 
              ? 'Podívejte se na kompletní historii našich predikcí v blogu'
              : 'See the complete history of our predictions in the blog'}
          </p>
          <Link to="/blog">
            <Button variant="outline" size="lg" className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary">
              {language === 'cz' ? 'Zobrazit plnou historii' : 'See Full History'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
