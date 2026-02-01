import { Link } from 'react-router-dom';
import { BookOpen, Trophy, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { useBlogArticles } from '@/hooks/useBlogArticles';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji } from '@/lib/sportEmoji';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BlogSidebarProps {
  currentArticleId?: string;
}

export function BlogSidebar({ currentArticleId }: BlogSidebarProps) {
  const { language } = useLanguage();

  const { data: recentArticles, isLoading: isLoadingRecent } = useBlogArticles({
    limit: 5,
    sortBy: 'date',
  });

  const { data: topArticles, isLoading: isLoadingTop } = useBlogArticles({
    limit: 5,
    sortBy: 'accuracy',
  });

  const filteredRecent = recentArticles?.filter(a => a.id !== currentArticleId).slice(0, 3);
  const filteredTop = topArticles?.filter(a => a.id !== currentArticleId).slice(0, 3);

  // Calculate accuracy color based on completed picks
  const getAccuracyDisplay = (article: { wins: number; losses: number; total_picks: number; accuracy_pct: number | null }) => {
    const completed = (article.wins || 0) + (article.losses || 0);
    if (completed === 0) return { text: '—', color: 'text-muted-foreground' };
    
    const accuracy = (article.wins / completed) * 100;
    const color = accuracy >= 60 ? 'text-success' : accuracy >= 45 ? 'text-yellow-400' : 'text-destructive';
    return { text: `${accuracy.toFixed(0)}%`, color };
  };

  return (
    <div className="space-y-6 sticky top-24">
      {/* Recent Articles */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm">
            {language === 'cz' ? 'Nejnovější články' : 'Recent Articles'}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {isLoadingRecent ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : filteredRecent && filteredRecent.length > 0 ? (
            filteredRecent.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="block p-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg shrink-0">
                    {article.sport ? getSportEmoji(article.sport) : '📊'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(article.article_date), 'MMM d')}</span>
                      {(() => {
                        const display = getAccuracyDisplay(article);
                        return <span className={cn('font-mono font-bold', display.color)}>{display.text}</span>;
                      })()}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {language === 'cz' ? 'Žádné články' : 'No articles'}
            </div>
          )}
        </div>
        <Link
          to="/blog"
          className="flex items-center justify-center gap-1 p-3 text-sm text-primary hover:bg-muted/50 transition-colors border-t border-border"
        >
          {language === 'cz' ? 'Zobrazit vše' : 'View All'}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Best Accuracy Days */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-400" />
          <h3 className="font-bold text-sm">
            {language === 'cz' ? 'Nejlepší dny' : 'Best Accuracy Days'}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {isLoadingTop ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : filteredTop && filteredTop.length > 0 ? (
            filteredTop.map((article, index) => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="block p-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className={cn(
                    'flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold shrink-0',
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                    'bg-orange-500/20 text-orange-400'
                  )}>
                    #{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-muted-foreground">
                        {article.wins}/{(article.wins || 0) + (article.losses || 0)}
                      </span>
                      {(() => {
                        const display = getAccuracyDisplay(article);
                        return <span className={cn('font-mono font-bold', display.color)}>{display.text}</span>;
                      })()}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {language === 'cz' ? 'Žádné články' : 'No articles'}
            </div>
          )}
        </div>
      </div>

      {/* CTA Card */}
      <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 text-center">
        <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-bold mb-2">
          {language === 'cz' ? 'Získejte tipy živě' : 'Get Live Picks'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {language === 'cz' 
            ? 'Přihlaste se pro přístup k predikcím před začátkem zápasů'
            : 'Sign up to access predictions before games start'
          }
        </p>
        <Link to="/signup" className="block">
          <button className="w-full btn-gradient px-4 py-2 rounded-lg text-sm font-bold">
            {language === 'cz' ? 'Začít zdarma' : 'Start Free'}
          </button>
        </Link>
      </div>
    </div>
  );
}
