import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface FilterChip {
  id: string;
  label: string;
  value: string;
  color?: 'default' | 'primary' | 'success' | 'warning';
}

interface FilterChipsProps {
  chips: FilterChip[];
  onRemove: (chipId: string) => void;
  onClearAll?: () => void;
}

export function FilterChips({ chips, onRemove, onClearAll }: FilterChipsProps) {
  const { language } = useLanguage();

  if (chips.length === 0) return null;

  const getColorClasses = (color: FilterChip['color']) => {
    switch (color) {
      case 'primary':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'success':
        return 'bg-success/20 text-success border-success/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">
        {language === 'cz' ? 'Aktivní filtry:' : 'Active filters:'}
      </span>
      
      {chips.map((chip) => (
        <div
          key={chip.id}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
            'border transition-all duration-200 hover:scale-105',
            getColorClasses(chip.color)
          )}
        >
          <span>{chip.label}</span>
          <button
            onClick={() => onRemove(chip.id)}
            className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {chips.length > 1 && onClearAll && (
        <button
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground underline ml-2 transition-colors"
        >
          {language === 'cz' ? 'Vymazat vše' : 'Clear all'}
        </button>
      )}
    </div>
  );
}
