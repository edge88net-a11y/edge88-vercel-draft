import { Link, useParams } from 'react-router-dom';
import { Calendar, User, TrendingUp, Trophy, ChevronLeft, Share2, ExternalLink, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogSidebar } from '@/components/BlogSidebar';
import { useBlogArticle } from '@/hooks/useBlogArticles';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function BlogArticle() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { data: article, isLoading } = useBlogArticle(id || '');

  // Placeholder predictions - in a real implementation, fetch by prediction_ids
  const articlePredictions: any[] = [];

  const handleShare = (platform: 'twitter' | 'telegram' | 'whatsapp') => {
    const url = window.location.href;
    const text = article?.title || 'Check out this prediction recap!';
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const getAccuracyColor = (accuracy: number | null) => {
    if (!accuracy) return 'text-muted-foreground';
    if (accuracy >= 70) return 'text-success';
    if (accuracy >= 55) return 'text-yellow-400';
    return 'text-destructive';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-24 md:pb-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-24 md:pb-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {language === 'cz' ? 'Článek nenalezen' : 'Article Not Found'}
            </h1>
            <Link to="/blog">
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                {language === 'cz' ? 'Zpět na archiv' : 'Back to Archive'}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-24 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Back Link */}
              <Link 
                to="/blog" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {language === 'cz' ? 'Zpět na archiv' : 'Back to Archive'}
              </Link>

              {/* Article Header */}
              <div className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">
                    {article.sport ? getSportEmoji(article.sport) : '📊'}
                  </span>
                  {article.sport && (
                    <span className="text-sm font-medium px-3 py-1 rounded-lg bg-muted text-muted-foreground">
                      {article.sport}
                    </span>
                  )}
                  {article.featured && (
                    <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-black mb-4">
                  {article.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(article.article_date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-mono">{article.total_picks} picks</span>
                  </div>
                </div>

                {/* Accuracy Banner */}
                <div className={cn(
                  'rounded-xl p-4 flex items-center justify-between',
                  article.accuracy_pct && article.accuracy_pct >= 60 
                    ? 'bg-success/10 border border-success/30' 
                    : 'bg-muted/50 border border-border'
                )}>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'cz' ? 'Přesnost tohoto článku' : 'Article Accuracy'}
                    </p>
                    <p className={cn(
                      'text-3xl font-mono font-black',
                      getAccuracyColor(article.accuracy_pct)
                    )}>
                      {article.accuracy_pct?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-mono font-bold text-foreground">
                      {article.wins}/{article.total_picks}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'cz' ? 'výher' : 'wins'}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                {article.summary && (
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
                    <p className="text-foreground">{article.summary}</p>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    {language === 'cz' ? 'Sdílet:' : 'Share:'}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => handleShare('twitter')}>
                    𝕏 Twitter
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleShare('telegram')}>
                    ✈️ Telegram
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleShare('whatsapp')}>
                    💬 WhatsApp
                  </Button>
                </div>
              </div>

              {/* Predictions List */}
              <div className="glass-card overflow-hidden">
                <div className="border-b border-border p-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h2 className="font-bold">
                    {language === 'cz' ? 'Predikce v tomto článku' : 'Predictions in this Article'}
                  </h2>
                </div>

                <div className="divide-y divide-border">
                  {articlePredictions.length > 0 ? (
                    articlePredictions.map((prediction) => {
                      const confidence = normalizeConfidence(prediction.confidence);
                      const isWin = prediction.result === 'win';
                      const isLoss = prediction.result === 'loss';
                      const isPending = prediction.result === 'pending';

                      return (
                        <div key={prediction.id} className="p-4 md:p-6 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">
                                {getSportEmoji(prediction.sport, prediction.homeTeam, prediction.awayTeam)}
                              </span>
                              <div>
                                <p className="font-bold text-sm">
                                  {prediction.homeTeam} vs {prediction.awayTeam}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(prediction.gameTime), 'MMM d, yyyy • h:mm a')}
                                </p>
                              </div>
                            </div>

                            {/* Result Badge */}
                            {isWin && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded bg-success/20 text-success text-sm font-bold">
                                <CheckCircle className="h-4 w-4" />
                                WIN
                              </div>
                            )}
                            {isLoss && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/20 text-destructive text-sm font-bold">
                                <XCircle className="h-4 w-4" />
                                LOSS
                              </div>
                            )}
                            {isPending && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground text-sm font-medium">
                                ⏳ Pending
                              </div>
                            )}
                          </div>

                          {/* Our Pick */}
                          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 mb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  {language === 'cz' ? 'Náš tip' : 'Our Pick'}
                                </p>
                                <p className="font-bold">{prediction.prediction.pick}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">
                                  {language === 'cz' ? 'Jistota' : 'Confidence'}
                                </p>
                                <p className={cn(
                                  'font-mono font-bold',
                                  confidence >= 70 ? 'text-success' : confidence >= 55 ? 'text-yellow-400' : 'text-orange-400'
                                )}>
                                  {confidence}%
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">
                                  {language === 'cz' ? 'Kurz' : 'Odds'}
                                </p>
                                <p className="font-mono font-bold text-primary">
                                  {prediction.prediction.odds}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Key Factors */}
                          {prediction.keyFactors && (
                            <div className="mb-3">
                              <p className="text-xs text-muted-foreground mb-2">
                                {language === 'cz' ? 'Klíčové faktory' : 'Key Factors'}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {prediction.keyFactors.slice(0, 3).map((factor, i) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* View Full Analysis */}
                          <Link 
                            to={`/predictions/${prediction.id}`}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            {language === 'cz' ? 'Zobrazit plnou analýzu' : 'View Full Analysis'}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      {language === 'cz' 
                        ? 'Predikce pro tento článek nejsou k dispozici'
                        : 'Predictions for this article are not available'
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="glass-card p-6 md:p-8 text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30">
                <h3 className="text-xl font-bold mb-2">
                  {language === 'cz' 
                    ? 'Chcete tyto tipy PŘED zápasy?'
                    : 'Want picks like these BEFORE the games?'
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'cz'
                    ? 'Získejte přístup k našim AI predikcím v reálném čase'
                    : 'Get access to our AI predictions in real-time'
                  }
                </p>
                <Link to="/signup">
                  <Button className="btn-gradient">
                    {language === 'cz' ? 'Začít zdarma →' : 'Start Free →'}
                  </Button>
                </Link>
              </div>

              {/* Comments Section - Placeholder */}
              <div className="glass-card overflow-hidden">
                <div className="border-b border-border p-4">
                  <h2 className="font-bold">
                    {language === 'cz' ? 'Diskuze' : 'Discussion'}
                  </h2>
                </div>
                <div className="p-6 text-center text-muted-foreground">
                  {language === 'cz' 
                    ? 'Přihlaste se pro zapojení do diskuze'
                    : 'Sign in to join the discussion'
                  }
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <BlogSidebar currentArticleId={article.id} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
