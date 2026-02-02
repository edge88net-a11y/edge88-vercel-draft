import { useState, useEffect } from 'react';
import { Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import confetti from 'canvas-confetti';

interface NewPicksNotificationProps {
  count: number;
  onDismiss: () => void;
  onRefresh: () => void;
}

export function NewPicksNotification({ count, onDismiss, onRefresh }: NewPicksNotificationProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setIsVisible(true);
      // Celebration confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#06b6d4', '#22c55e', '#f59e0b'],
      });
    }
  }, [count]);

  const handleRefresh = () => {
    onRefresh();
    setIsVisible(false);
    onDismiss();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!isVisible || count === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-in-top">
      <div className="glass-card border-primary/50 shadow-xl shadow-primary/20 p-4 flex items-center gap-3 min-w-[280px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 animate-pulse">
          <Zap className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1">
          <p className="font-semibold text-foreground">
            {language === 'cz' ? '🔥 Nové tipy!' : '🔥 New picks!'}
          </p>
          <p className="text-sm text-muted-foreground">
            {count} {language === 'cz' ? 'nových predikcí' : 'new predictions'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {language === 'cz' ? 'Zobrazit' : 'View'}
        </button>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

/* Add to index.css */
const slideInTopAnimation = `
@keyframes slide-in-top {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.animate-slide-in-top {
  animation: slide-in-top 0.3s ease-out;
}
`;
