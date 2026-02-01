import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, Search, Filter, Trophy, BookOpen, ChevronRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogArticles, useBlogStats } from '@/hooks/useBlogArticles';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji } from '@/lib/sportEmoji';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SPORTS_FILTER = [
  { value: 'all', label: 'All Sports', labelCz: 'Všechny sporty' },
  { value: 'NFL', label: 'NFL', labelCz: 'NFL' },
  { value: 'NBA', label: 'NBA', labelCz: 'NBA' },
  { value: 'NHL', label: 'NHL', labelCz: 'NHL' },
  { value: 'MLB', label: 'MLB', labelCz: 'MLB' },
  { value: 'Soccer', label: 'Soccer', labelCz: 'Fotbal' },
  { value: 'UFC', label: 'UFC', labelCz: 'UFC' },
];

export default function Blog() {
  const [sportFilter, setSportFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'accuracy'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();

  const { data: articles, isLoading } = useBlogArticles({
    sport: sportFilter,
    sortBy,
    limit: 50,
  });

  const { data: stats } = useBlogStats();

  // Filter by search
  const filteredArticles = articles?.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAccuracyColor = (accuracy: number | null) => {
    if (!accuracy) return 'text-muted-foreground';
    if (accuracy >= 70) return 'text-success';
    if (accuracy >= 55) return 'text-yellow-400';
    return 'text-destructive';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black">
              {language === 'cz' ? 'Archiv Predikcí' : 'Predictions Archive'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'cz' 
                ? 'Ověřte naše výsledky - všechny predikce s plnou analýzou'
                : 'Verify our track record - all predictions with full analysis'
              }
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-mono font-black text-foreground">
              {stats?.totalArticles || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'cz' ? 'Článků' : 'Articles'}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-mono font-black text-foreground">
              {stats?.totalPicks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'cz' ? 'Tipů celkem' : 'Total Picks'}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-mono font-black text-success">
              {stats?.totalWins || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'cz' ? 'Výher' : 'Wins'}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className={cn(
              'text-2xl font-mono font-black',
              getAccuracyColor(stats?.avgAccuracy || 0)
            )}>
              {(stats?.avgAccuracy || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'cz' ? 'Průměrná přesnost' : 'Avg. Accuracy'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'cz' ? 'Hledat články...' : 'Search articles...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sportFilter} onValueChange={setSportFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPORTS_FILTER.map(sport => (
              <SelectItem key={sport.value} value={sport.value}>
                {sport.value !== 'all' && getSportEmoji(sport.value)} {language === 'cz' ? sport.labelCz : sport.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'accuracy')}>
          <SelectTrigger className="w-full sm:w-48">
            <BarChart3 className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">
              {language === 'cz' ? 'Nejnovější' : 'Newest First'}
            </SelectItem>
            <SelectItem value="accuracy">
              {language === 'cz' ? 'Nejvyšší přesnost' : 'Highest Accuracy'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredArticles && filteredArticles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <Link
              key={article.id}
              to={`/blog/${article.slug}`}
              className="glass-card p-6 hover:border-primary/50 transition-all duration-200 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {article.sport ? getSportEmoji(article.sport) : '📊'}
                  </span>
                  {article.sport && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {article.sport}
                    </span>
                  )}
                </div>
                {article.featured && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>

              {/* Summary */}
              {article.summary && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {article.summary}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(article.article_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono">
                    {article.wins}/{article.total_picks}
                  </span>
                </div>
                <div className={cn(
                  'flex items-center gap-1 font-mono font-bold',
                  getAccuracyColor(article.accuracy_pct)
                )}>
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{article.accuracy_pct?.toFixed(0) || 0}%</span>
                </div>
              </div>

              {/* Read More */}
              <div className="flex items-center gap-1 mt-4 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                {language === 'cz' ? 'Číst více' : 'Read More'}
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold mb-2">
            {language === 'cz' ? 'Žádné články' : 'No Articles Found'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'cz' 
              ? 'Zkuste změnit filtry nebo hledaný výraz'
              : 'Try changing filters or search term'
            }
          </p>
        </div>
      )}

      {/* CTA Section */}
      <div className="glass-card p-8 text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30">
        <h3 className="text-2xl font-bold mb-2">
          {language === 'cz' 
            ? 'Chcete tyto tipy PŘED zápasy?'
            : 'Want picks like these BEFORE the games?'
          }
        </h3>
        <p className="text-muted-foreground mb-6">
          {language === 'cz'
            ? 'Přihlaste se a získejte přístup k našim AI predikcím v reálném čase'
            : 'Sign up and get access to our AI predictions in real-time'
          }
        </p>
        <Link to="/signup">
          <Button size="lg" className="btn-gradient">
            {language === 'cz' ? 'Začít zdarma →' : 'Start Free →'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
