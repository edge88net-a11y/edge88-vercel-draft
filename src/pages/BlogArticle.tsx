import { Link, useParams } from 'react-router-dom';
import { 
  Calendar, User, ChevronLeft, ChevronRight, Share2, CheckCircle, XCircle, 
  Clock, Target, TrendingUp, Copy, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogArticle, useBlogArticles } from '@/hooks/useBlogArticles';
import { useActivePredictions } from '@/hooks/usePredictions';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSportEmoji, getSportFromTeams } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { marked } from 'marked';
import { useMemo, useState } from 'react';
import { toast } from '@/hooks/use-toast';

// Configure marked for clean output
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Clean unicode escape sequences and JSON artifacts
function cleanUnicodeAndJson(text: string): string {
  if (!text) return '';
  
  // Replace unicode escape sequences with actual characters
  let cleaned = text.replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Clean escaped characters
  cleaned = cleaned.replace(/\\n/g, '\n');
  cleaned = cleaned.replace(/\\"/g, '"');
  cleaned = cleaned.replace(/\\'/g, "'");
  cleaned = cleaned.replace(/\\\\/g, '\\');
  
  return cleaned;
}

// Extract content based on language - handles JSON in summary field for CZ
function extractArticleContent(article: any, language: string): string {
  let text = '';
  
  // For Czech: try to parse summary field (may contain JSON with Czech content)
  if (language === 'cz' || language === 'cs') {
    if (article.summary) {
      try {
        // Check if summary is a JSON string
        const parsed = typeof article.summary === 'string' && article.summary.trim().startsWith('{')
          ? JSON.parse(article.summary)
          : null;
        
        if (parsed && (parsed.content || parsed.text)) {
          text = parsed.content || parsed.text || '';
        } else {
          // Summary is not JSON, use content field
          text = article.content || '';
        }
      } catch {
        // JSON parse failed, use content field
        text = article.content || '';
      }
    } else {
      text = article.content || '';
    }
  } else {
    // For English: use content field directly
    text = article.content || '';
  }
  
  // Clean unicode and JSON artifacts
  text = cleanUnicodeAndJson(text);
  
  // Remove reference numbers like [1], [2], etc.
  text = text.replace(/\[\d+\]/g, '');
  
  // Remove multiple consecutive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text.trim();
}

// Clean markdown content - remove reference numbers [1], [2], etc.
function cleanMarkdownContent(content: string | null): string {
  if (!content) return '';
  
  // Clean unicode escape sequences first
  let cleaned = cleanUnicodeAndJson(content);
  
  // Remove reference numbers like [1], [2], etc.
  cleaned = cleaned.replace(/\[\d+\]/g, '');
  
  // Remove multiple consecutive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Clean up any leftover artifacts
  cleaned = cleaned.trim();
  
  return cleaned;
}

export default function BlogArticle() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { data: article, isLoading } = useBlogArticle(id || '');
  const { data: recentArticles } = useBlogArticles({ limit: 4, sortBy: 'date' });
  const { data: predictions } = useActivePredictions();
  const [copiedLink, setCopiedLink] = useState(false);

  // Parse markdown to HTML - use language-aware content extraction
  const renderedContent = useMemo(() => {
    if (!article) return '';
    const content = extractArticleContent(article, language);
    if (!content) return '';
    return marked(content);
  }, [article, language]);

  // Filter out current article from related
  const relatedArticles = recentArticles?.filter(a => a.id !== article?.id).slice(0, 3) || [];

  // Get predictions mentioned in article (by prediction_ids)
  const articlePredictions = useMemo(() => {
    if (!article?.prediction_ids || !predictions) return [];
    return predictions.filter(p => article.prediction_ids?.includes(p.id)).slice(0, 10);
  }, [article?.prediction_ids, predictions]);

  const handleShare = (platform: 'twitter' | 'telegram' | 'whatsapp' | 'copy') => {
    const url = window.location.href;
    const text = article?.title || 'Check out this prediction recap!';
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast({
        title: language === 'cz' ? 'Odkaz zkopírován!' : 'Link copied!',
        description: url,
      });
      setTimeout(() => setCopiedLink(false), 2000);
      return;
    }
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const getAccuracyColor = (accuracy: number | null) => {
    if (!accuracy) return 'text-muted-foreground';
    if (accuracy >= 65) return 'text-success';
    if (accuracy >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getAccuracyBgColor = (accuracy: number | null) => {
    if (!accuracy) return 'bg-muted/50 border-border';
    if (accuracy >= 65) return 'bg-success/10 border-success/30';
    if (accuracy >= 50) return 'bg-warning/10 border-warning/30';
    return 'bg-destructive/10 border-destructive/30';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="text-6xl mb-4">📄</div>
        <h1 className="text-2xl font-bold mb-4">
          {language === 'cz' ? 'Článek nenalezen' : 'Article Not Found'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {language === 'cz' 
            ? 'Tento článek neexistuje nebo byl odstraněn.'
            : 'This article does not exist or has been removed.'
          }
        </p>
        <Link to="/blog">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            {language === 'cz' ? 'Zpět na blog' : 'Back to Blog'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link 
        to="/blog" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        {language === 'cz' ? '← Zpět na blog' : '← Back to Blog'}
      </Link>

      {/* Article Header Card */}
      <header className="glass-card p-6 md:p-8">
        {/* Sport Badge */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-3xl">
              {article.sport ? getSportEmoji(article.sport) : '📊'}
            </span>
            <span className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-muted text-muted-foreground uppercase tracking-wide">
              {article.sport || 'Mixed'}
            </span>
          </div>
          {article.featured && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-black mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(article.article_date), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>{article.author || 'Edge88 AI'}</span>
          </div>
        </div>

        {/* Accuracy Badge - Large */}
        <div className={cn(
          'inline-flex items-center gap-2 text-lg font-bold px-4 py-2 rounded-xl border',
          getAccuracyBgColor(article.accuracy_pct)
        )}>
          {article.accuracy_pct && article.accuracy_pct >= 65 && <CheckCircle className="h-5 w-5 text-success" />}
          {article.accuracy_pct && article.accuracy_pct < 50 && <XCircle className="h-5 w-5 text-destructive" />}
          <span className={getAccuracyColor(article.accuracy_pct)}>
            {article.accuracy_pct?.toFixed(0) || 0}% {language === 'cz' ? 'přesnost' : 'accuracy'}
          </span>
        </div>
      </header>

      {/* Stats Row */}
      <div className={cn(
        'rounded-2xl border p-6 grid grid-cols-2 md:grid-cols-4 gap-4',
        getAccuracyBgColor(article.accuracy_pct)
      )}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl md:text-3xl font-mono font-black">
            {article.total_picks || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            {language === 'cz' ? 'Tipů celkem' : 'Total Picks'}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl md:text-3xl font-mono font-black text-success">
            {article.wins || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            {language === 'cz' ? 'Výher' : 'Wins'}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-2xl md:text-3xl font-mono font-black text-destructive">
            {article.losses || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            {language === 'cz' ? 'Proher' : 'Losses'}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className={cn(
            'text-2xl md:text-3xl font-mono font-black',
            getAccuracyColor(article.accuracy_pct)
          )}>
            {article.accuracy_pct?.toFixed(0) || 0}%
          </div>
          <div className="text-xs text-muted-foreground">
            {language === 'cz' ? 'Přesnost' : 'Accuracy'}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="glass-card p-6 md:p-8">

        {/* Rendered Markdown Content */}
        <div 
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-8
            prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
            prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:my-4 prose-ul:text-muted-foreground
            prose-ol:my-4 prose-ol:text-muted-foreground
            prose-li:mb-1
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4
            prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-hr:border-border prose-hr:my-8
          "
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </article>

      {/* Prediction Cards within Article */}
      {articlePredictions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {language === 'cz' ? 'Predikce v tomto článku' : 'Predictions in this article'}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {articlePredictions.map((prediction) => {
              const isWin = prediction.result === 'win';
              const isLoss = prediction.result === 'loss';
              const isPending = !prediction.result || prediction.result === 'pending';
              const sportName = prediction.sport?.includes('-') 
                ? getSportFromTeams(prediction.homeTeam, prediction.awayTeam)
                : prediction.sport;
              const confidencePercent = normalizeConfidence(prediction.confidence);
              
              return (
                <Link
                  key={prediction.id}
                  to={`/predictions/${prediction.id}`}
                  className={cn(
                    'glass-card p-4 border-l-4 hover:bg-muted/30 transition-colors',
                    isWin && 'border-l-success bg-success/5',
                    isLoss && 'border-l-destructive bg-destructive/5',
                    isPending && 'border-l-muted-foreground'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Sport + Teams */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getSportEmoji(sportName || 'Sports')}</span>
                        <span className="text-sm font-medium truncate">
                          {prediction.awayTeam} @ {prediction.homeTeam}
                        </span>
                      </div>
                      
                      {/* Our Pick */}
                      <p className="text-primary font-semibold text-sm mb-1">
                        {language === 'cz' ? 'Náš tip:' : 'Our pick:'} {prediction.prediction.pick}
                      </p>
                      
                      {/* Confidence */}
                      <p className="text-xs text-muted-foreground">
                        {language === 'cz' ? 'Jistota' : 'Confidence'}: {confidencePercent}%
                      </p>
                    </div>
                    
                    {/* Result */}
                    <div className="shrink-0">
                      {isWin && (
                        <div className="flex items-center gap-1 text-success">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-bold">✅</span>
                        </div>
                      )}
                      {isLoss && (
                        <div className="flex items-center gap-1 text-destructive">
                          <XCircle className="h-5 w-5" />
                          <span className="text-sm font-bold">❌</span>
                        </div>
                      )}
                      {isPending && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-5 w-5" />
                          <span className="text-sm font-bold">⏳</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Share Section */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Share2 className="h-4 w-4" />
            <span>{language === 'cz' ? 'Sdílet článek:' : 'Share article:'}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button size="sm" variant="outline" onClick={() => handleShare('whatsapp')} className="gap-1.5">
              💬 WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare('telegram')} className="gap-1.5">
              ✈️ Telegram
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare('twitter')} className="gap-1.5">
              𝕏 Twitter
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleShare('copy')} 
              className={cn('gap-1.5', copiedLink && 'text-success border-success')}
            >
              {copiedLink ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedLink 
                ? (language === 'cz' ? 'Zkopírováno!' : 'Copied!') 
                : (language === 'cz' ? 'Kopírovat' : 'Copy link')
              }
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section - only for non-logged users */}
      {!user && (
        <div className="glass-card p-8 md:p-10 text-center bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-primary/20">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-2xl md:text-3xl font-black mb-3">
            {language === 'cz' 
              ? 'Tyto predikce byly zveřejněny PŘEDEM. Chcete další?'
              : 'These predictions were published IN ADVANCE. Want more?'
            }
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            {language === 'cz'
              ? 'Registrujte se zdarma a získejte přístup k našim AI predikcím v reálném čase.'
              : 'Sign up free and get access to our AI predictions in real-time.'
            }
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-base px-8 gap-2">
              {language === 'cz' ? 'Registrujte se zdarma' : 'Sign up free'}
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">
            {language === 'cz' ? 'Další články' : 'More Articles'}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedArticles.map(related => (
              <Link
                key={related.id}
                to={`/blog/${related.slug}`}
                className="glass-card p-4 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {related.sport ? getSportEmoji(related.sport) : '📊'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(related.article_date), 'MMM d')}
                  </span>
                </div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {related.title}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    'font-mono font-bold',
                    getAccuracyColor(related.accuracy_pct)
                  )}>
                    {related.accuracy_pct?.toFixed(0) || 0}%
                  </span>
                  <span className="text-muted-foreground">
                    • {related.wins}/{related.total_picks} {language === 'cz' ? 'výher' : 'wins'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
