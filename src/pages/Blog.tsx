import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, BookOpen, ChevronRight, ChevronLeft, Target, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogArticles, useBlogStats } from '@/hooks/useBlogArticles';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSportEmoji } from '@/lib/sportEmoji';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SPORTS_FILTER = [
  { value: 'all', label: 'All Sports', labelCz: 'Všechny sporty', emoji: '🏆' },
  { value: 'NHL', label: 'NHL', labelCz: 'NHL', emoji: '🏒' },
  { value: 'NBA', label: 'NBA', labelCz: 'NBA', emoji: '🏀' },
  { value: 'Soccer', label: 'Soccer', labelCz: 'Fotbal', emoji: '⚽' },
  { value: 'UFC', label: 'UFC', labelCz: 'UFC', emoji: '🥊' },
  { value: 'NFL', label: 'NFL', labelCz: 'NFL', emoji: '🏈' },
  { value: 'MLB', label: 'MLB', labelCz: 'MLB', emoji: '⚾' },
];

export default function Blog() {
  const [sportFilter, setSportFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { language } = useLanguage();
  const { user } = useAuth();
  const ITEMS_PER_PAGE = 12;

  const { data: articles, isLoading } = useBlogArticles({
    sport: sportFilter,
    sortBy: 'date',
    limit: 100,
  });

  const { data: stats } = useBlogStats();

  // Filter by search
  const filteredArticles = articles?.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getAccuracyBadge = (accuracy: number | null) => {
    if (!accuracy) return { text: '—', className: 'bg-muted text-muted-foreground' };
    if (accuracy >= 65) return { 
      text: `✅ ${accuracy.toFixed(0)}%`, 
      className: 'bg-success/20 text-success border-success/30' 
    };
    if (accuracy >= 50) return { 
      text: `${accuracy.toFixed(0)}%`, 
      className: 'bg-warning/20 text-warning border-warning/30' 
    };
    return { 
      text: `❌ ${accuracy.toFixed(0)}%`, 
      className: 'bg-destructive/20 text-destructive border-destructive/30' 
    };
  };

  // Extract preview text from content
  const getPreviewText = (content: string | null, maxLength = 100): string => {
    if (!content) return '';
    // Remove markdown formatting and references
    let text = content
      .replace(/\[\d+\]/g, '')
      .replace(/[#*_`]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    if (text.length > maxLength) {
      text = text.substring(0, maxLength).trim() + '...';
    }
    return text;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          📚 {language === 'cz' ? 'Blog & Archiv' : 'Blog & Archive'}
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {language === 'cz' 
            ? 'Ověřené predikce po zápasech. Kompletní transparentnost.'
            : 'Verified predictions after games. Full transparency.'
          }
        </p>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 max-w-3xl mx-auto">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl md:text-3xl font-mono font-black text-foreground">
                {stats.totalArticles}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'cz' ? 'Článků' : 'Articles'}
              </p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl md:text-3xl font-mono font-black text-foreground">
                {stats.totalPicks}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'cz' ? 'Tipů' : 'Total Picks'}
              </p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl md:text-3xl font-mono font-black text-success">
                {stats.totalWins}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'cz' ? 'Výher' : 'Wins'}
              </p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className={cn(
                'text-2xl md:text-3xl font-mono font-black',
                stats.avgAccuracy >= 65 ? 'text-success' : 
                stats.avgAccuracy >= 50 ? 'text-warning' : 'text-destructive'
              )}>
                {stats.avgAccuracy.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'cz' ? 'Přesnost' : 'Accuracy'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 space-y-4">
        {/* Sport Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {SPORTS_FILTER.map(sport => (
            <button
              key={sport.value}
              onClick={() => {
                setSportFilter(sport.value);
                setCurrentPage(1);
              }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                sportFilter === sport.value
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-muted/50 border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <span>{sport.emoji}</span>
              <span>{language === 'cz' ? sport.labelCz : sport.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'cz' ? 'Hledat článek...' : 'Search articles...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-11 h-12 bg-background"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedArticles.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedArticles.map((article) => {
              const accuracyBadge = getAccuracyBadge(article.accuracy_pct);
              const previewText = getPreviewText(article.content);
              
              return (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className="glass-card p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  {/* Header: Sport Badge + Date */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {article.sport ? getSportEmoji(article.sport) : '📊'}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-muted text-muted-foreground uppercase tracking-wide">
                        {article.sport || 'Mixed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(article.article_date), 'MMM d')}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Accuracy Badge */}
                  <div className="mb-3">
                    <span className={cn(
                      'text-xs font-bold px-2.5 py-1 rounded-lg border inline-flex items-center gap-1',
                      accuracyBadge.className
                    )}>
                      {accuracyBadge.text}
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="font-mono font-semibold text-foreground">{article.total_picks}</span>
                    <span>{language === 'cz' ? 'tipů' : 'picks'}</span>
                    <span>·</span>
                    <span className="font-mono font-semibold text-success">{article.wins}</span>
                    <span>{language === 'cz' ? 'výher' : 'wins'}</span>
                    <span>·</span>
                    <span className="font-mono font-semibold text-destructive">{article.losses}</span>
                    <span>{language === 'cz' ? 'proher' : 'losses'}</span>
                  </div>

                  {/* Preview Text */}
                  {previewText && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {previewText}
                    </p>
                  )}

                  {/* Read More Link */}
                  <div className="flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all mt-auto pt-3 border-t border-border">
                    {language === 'cz' ? 'Číst více' : 'Read more'}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {language === 'cz' ? 'Předchozí' : 'Previous'}
              </Button>
              
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        'h-9 w-9 rounded-lg text-sm font-medium transition-colors',
                        currentPage === pageNum
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                {language === 'cz' ? 'Další' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 glass-card">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold mb-2">
            {searchQuery 
              ? (language === 'cz' ? 'Žádné výsledky' : 'No Results')
              : (language === 'cz' ? 'Zatím žádné články' : 'No Articles Yet')
            }
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery 
              ? (language === 'cz' 
                  ? 'Zkuste jiný vyhledávací dotaz nebo změňte filtry.'
                  : 'Try a different search query or change the filters.'
                )
              : (language === 'cz'
                  ? 'Články se generují automaticky každý den po vyhodnocení zápasů.'
                  : 'Articles are generated automatically every day after games are evaluated.'
                )
            }
          </p>
        </div>
      )}

      {/* CTA Section - only for non-logged users */}
      {!user && (
        <div className="glass-card p-8 md:p-10 text-center bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-primary/20">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-2xl md:text-3xl font-black mb-3">
            {language === 'cz' 
              ? 'Chcete tipy PŘED zápasy?'
              : 'Want picks BEFORE the games?'
            }
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            {language === 'cz'
              ? 'Zaregistrujte se zdarma a získejte přístup k našim AI predikcím v reálném čase, ještě než zápasy začnou.'
              : 'Sign up for free and get access to our AI predictions in real-time, before games start.'
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
    </div>
  );
}
