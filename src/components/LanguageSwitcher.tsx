import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5 text-sm">
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'rounded-md px-2 py-1 font-medium transition-all',
          language === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('cz')}
        className={cn(
          'rounded-md px-2 py-1 font-medium transition-all',
          language === 'cz'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        CZ
      </button>
    </div>
  );
}
