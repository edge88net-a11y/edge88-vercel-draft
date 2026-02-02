import { useUserTier } from '@/hooks/useUserTier';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SlimWelcomeBarProps {
  picksToday?: number;
  currentStreak?: number;
  isLoading?: boolean;
}

export function SlimWelcomeBar({ picksToday = 0, currentStreak = 0, isLoading = false }: SlimWelcomeBarProps) {
  const { language } = useLanguage();
  const userTier = useUserTier();
  const tierLabel = language === 'cz' ? userTier.labelCz : userTier.label;
  
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 
    ? (language === 'cz' ? 'Dobré ráno!' : 'Good morning!')
    : hour < 18 
      ? (language === 'cz' ? 'Dobrý den!' : 'Good afternoon!')
      : (language === 'cz' ? 'Dobrý večer!' : 'Good evening!');

  const currentTime = new Date().toLocaleTimeString(language === 'cz' ? 'cs-CZ' : 'en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="h-12 bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border border-border/50 flex items-center justify-between px-4 sm:px-6 rounded-lg mb-4">
      <div className="flex items-center gap-3">
        {userTier.isLoading ? (
          <Skeleton className="h-6 w-20 rounded-full" />
        ) : (
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-bold border",
            userTier.bgColor,
            userTier.color,
            userTier.borderColor
          )}>
            {userTier.icon} {tierLabel}
          </span>
        )}
        <span className="text-foreground font-medium text-sm hidden sm:inline">
          {greeting}
        </span>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-24" />
            <div className="w-px h-4 bg-border hidden sm:block" />
            <Skeleton className="h-4 w-16 hidden sm:block" />
          </>
        ) : (
          <>
            <span>📊 {picksToday} {language === 'cz' ? 'nových tipů' : 'new picks'}</span>
            <span className="w-px h-4 bg-border hidden sm:block" />
            <span className="hidden sm:inline">🔥 {language === 'cz' ? 'Série' : 'Streak'}: {currentStreak}</span>
            <span className="w-px h-4 bg-border hidden sm:block" />
            <span className="hidden sm:inline">⏰ {currentTime}</span>
          </>
        )}
      </div>
    </div>
  );
}
