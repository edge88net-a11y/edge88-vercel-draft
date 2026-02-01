import { Flame } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  currentStreak: number;
  recentResults?: ('win' | 'loss')[];
}

export function StreakDisplay({ currentStreak, recentResults = [] }: StreakDisplayProps) {
  const { language } = useLanguage();
  
  // Generate fire emojis based on streak
  const getFireCount = () => {
    if (currentStreak >= 7) return 5;
    if (currentStreak >= 5) return 4;
    if (currentStreak >= 3) return 3;
    if (currentStreak >= 2) return 2;
    return 1;
  };

  const getStreakMessage = () => {
    if (currentStreak >= 7) return language === 'cz' ? '🔥 Jste v ohni!' : '🔥 On Fire!';
    if (currentStreak >= 5) return language === 'cz' ? '💪 Skvělá série!' : '💪 Great Run!';
    if (currentStreak >= 3) return language === 'cz' ? '👍 Pokračujte!' : '👍 Keep Going!';
    if (currentStreak >= 1) return language === 'cz' ? '✨ Dobrý start' : '✨ Good Start';
    return language === 'cz' ? '⏳ Čekáme na výhru' : '⏳ Waiting for a win';
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame className={cn(
          "h-5 w-5",
          currentStreak >= 3 ? "text-orange-400" : "text-muted-foreground"
        )} />
        <h3 className="font-bold text-sm">
          {language === 'cz' ? 'Aktuální série' : 'Current Streak'}
        </h3>
      </div>

      <div className="text-center py-4">
        {/* Fire emojis */}
        <div className={cn(
          "text-3xl mb-2 transition-all",
          currentStreak >= 5 && "animate-bounce"
        )}>
          {Array.from({ length: getFireCount() }).map((_, i) => (
            <span 
              key={i} 
              className={cn(
                currentStreak >= 3 ? "" : "grayscale opacity-50"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              🔥
            </span>
          ))}
        </div>
        
        {/* Streak number */}
        <div className={cn(
          "text-4xl font-mono font-black tabular-nums",
          currentStreak >= 5 ? "text-orange-400" :
          currentStreak >= 3 ? "text-success" :
          currentStreak >= 1 ? "text-primary" :
          "text-muted-foreground"
        )}>
          {currentStreak}
        </div>
        
        <p className="text-sm text-muted-foreground mt-1">
          {language === 'cz' ? 'výher v řadě' : 'wins in a row'}
        </p>
        
        <p className="text-xs font-medium mt-2 text-foreground">
          {getStreakMessage()}
        </p>
      </div>

      {/* Recent results */}
      {recentResults.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">
            {language === 'cz' ? 'Poslední' : 'Recent'}
          </p>
          <div className="flex items-center justify-center gap-1">
            {recentResults.slice(0, 10).map((result, i) => (
              <span 
                key={i}
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                  result === 'win' 
                    ? "bg-success/20 text-success" 
                    : "bg-destructive/20 text-destructive"
                )}
              >
                {result === 'win' ? '✓' : '✗'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
