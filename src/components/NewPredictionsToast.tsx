import { useEffect, useState } from 'react';
import { Bell, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewPredictionsToastProps {
  show: boolean;
  count: number;
  onDismiss?: () => void;
  onClick?: () => void;
}

export function NewPredictionsToast({ show, count, onDismiss, onClick }: NewPredictionsToastProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-dismiss after 10 seconds
      const timeout = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 10000);
      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [show, onDismiss]);

  const handleClick = () => {
    setIsVisible(false);
    onClick?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl',
          'bg-gradient-to-r from-primary via-primary/90 to-accent',
          'text-primary-foreground font-semibold',
          'hover:scale-105 transition-all duration-200',
          'border-2 border-primary-foreground/20',
          'backdrop-blur-md'
        )}
      >
        <div className="relative">
          <Bell className="h-5 w-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
        </div>
        <span className="text-sm">
          {language === 'cz' 
            ? `${count} ${count === 1 ? 'nová predikce' : count < 5 ? 'nové predikce' : 'nových predikcí'} dostupné`
            : `${count} new ${count === 1 ? 'prediction' : 'predictions'} available`
          }
        </span>
        <TrendingUp className="h-4 w-4" />
      </button>
    </div>
  );
}
