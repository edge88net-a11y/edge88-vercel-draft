import { useUserTier } from '@/hooks/useUserTier';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { LiveBadge } from '@/components/ui/LiveBadge';

interface SlimWelcomeBarProps {
  picksToday?: number;
  currentStreak?: number;
  winsToday?: number;
  totalToday?: number;
  isLoading?: boolean;
}

export function SlimWelcomeBar({ 
  picksToday = 0, 
  currentStreak = 0, 
  winsToday = 0,
  totalToday = 0,
  isLoading = false 
}: SlimWelcomeBarProps) {
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

  const showWinIndicator = winsToday > 0 && totalToday > 0;
  const isHotStreak = currentStreak >= 5;

  return (
    <div className="h-12 animate-welcome-gradient backdrop-blur-sm border border-cyan-500/10 flex items-center justify-between px-4 sm:px-6 rounded-lg mb-4 relative overflow-hidden">
      {/* Subtle overlay glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
      
      <div className="flex items-center gap-3 relative z-10">
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
      
      <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground relative z-10">
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
            
            {/* Streak with live indicator and glow */}
            <span className={cn(
              "hidden sm:flex items-center gap-1.5",
              isHotStreak && "animate-fire-glow text-orange-400"
            )}>
              {/* Pulsing green dot for live status */}
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className={cn(isHotStreak && "animate-fire-bounce")}>🔥</span>
              {language === 'cz' ? 'Série' : 'Streak'}: {currentStreak}
            </span>
            
            {/* Win indicator with flash animation */}
            {showWinIndicator && (
              <>
                <span className="w-px h-4 bg-border hidden sm:block" />
                <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-bold animate-win-flash">
                  ⚡ {winsToday} z {totalToday} {language === 'cz' ? 'dnes!' : 'today!'}
                </span>
              </>
            )}
            
            <span className="w-px h-4 bg-border hidden sm:block" />
            <span className="hidden sm:inline">⏰ {currentTime}</span>
          </>
        )}
      </div>
    </div>
  );
}
