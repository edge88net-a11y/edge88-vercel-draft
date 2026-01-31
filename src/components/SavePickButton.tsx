import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { APIPrediction } from '@/hooks/usePredictions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface SavePickButtonProps {
  prediction: APIPrediction;
  variant?: 'icon' | 'full';
  className?: string;
}

export function SavePickButton({ prediction, variant = 'icon', className }: SavePickButtonProps) {
  const { isPicked, togglePick } = useSavedPicks();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isSaved = isPicked(prediction.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePick(prediction);
    
    toast({
      title: isSaved ? 'Removed from saved' : '✓ Pick saved!',
      description: isSaved
        ? `${prediction.prediction.pick} removed from your picks`
        : `${prediction.prediction.pick} added to your saved picks`,
    });
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'rounded-lg p-2 transition-all hover:bg-muted',
          isSaved && 'text-primary',
          className
        )}
        title={isSaved ? t.saved : t.save}
      >
        {isSaved ? (
          <BookmarkCheck className="h-5 w-5 fill-current" />
        ) : (
          <Bookmark className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={isSaved ? 'default' : 'outline'}
      size="sm"
      onClick={handleClick}
      className={cn('gap-2', className)}
    >
      {isSaved ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          {t.saved}
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          {t.save}
        </>
      )}
    </Button>
  );
}
