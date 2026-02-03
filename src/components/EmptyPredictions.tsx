import { Search, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface EmptyPredictionsProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function EmptyPredictions({ 
  hasFilters, 
  onClearFilters, 
  onRefresh,
  isLoading = false 
}: EmptyPredictionsProps) {
  const { language } = useLanguage();

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-6">
          <Search className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">
          {language === 'cz' ? 'Žádné výsledky' : 'No results found'}
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {language === 'cz' 
            ? 'Zkuste upravit filtry nebo vyhledávací dotaz pro zobrazení více predikcí.'
            : 'Try adjusting your filters or search query to see more predictions.'}
        </p>
        <div className="flex gap-3">
          {onClearFilters && (
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {language === 'cz' ? 'Vymazat filtry' : 'Clear filters'}
            </Button>
          )}
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="default"
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              {language === 'cz' ? 'Obnovit' : 'Refresh'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-6 mb-6">
        <TrendingUp className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">
        {language === 'cz' ? 'Žádné aktivní predikce' : 'No active predictions'}
      </h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {language === 'cz' 
          ? 'Naše AI právě analyzuje nejnovější kurzy a statistiky. Nové predikce budou brzy k dispozici.'
          : 'Our AI is analyzing the latest odds and stats. New predictions will be available soon.'}
      </p>
      {onRefresh && (
        <Button
          onClick={onRefresh}
          variant="default"
          className="gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          {language === 'cz' ? 'Zkusit znovu' : 'Try again'}
        </Button>
      )}
    </div>
  );
}
