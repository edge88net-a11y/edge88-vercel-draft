import { TrendingUp, Trophy, Star, Flame, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedPicks } from '@/hooks/useSavedPicks';

export function DashboardStats() {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const { stats: savedStats } = useSavedPicks();

  // Calculate user rank (mock - in production would come from API)
  const userRank = 147;
  const totalAnalysts = 10547;

  // Determine badges
  const badges = [];
  
  // Check subscription tier
  if (profile?.subscription_tier === 'elite') {
    badges.push({ icon: '🐋', label: language === 'cz' ? 'Velryba' : 'Whale', color: 'text-yellow-400' });
  }
  
  // Check win streak
  if (savedStats.wins >= 5) {
    badges.push({ icon: '🔥', label: language === 'cz' ? 'Horká série' : 'Hot Streak', color: 'text-orange-400' });
  }
  
  // New user badge - based on a random check since we don't have created_at
  if (savedStats.total <= 5) {
    badges.push({ icon: '⭐', label: language === 'cz' ? 'Vycházející hvězda' : 'Rising Star', color: 'text-primary' });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Personal Win Rate */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <Target className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {language === 'cz' ? 'Moje úspěšnost' : 'My Win Rate'}
            </p>
            <p className="font-mono text-2xl font-bold text-success">
              {savedStats.accuracy.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Earnings Estimate */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {language === 'cz' ? 'Odhadovaný zisk' : 'Est. Earnings'}
            </p>
            <p className="font-mono text-2xl font-bold text-primary">
              {language === 'cz' 
                ? `+${(savedStats.wins * 2500).toLocaleString('cs-CZ')} Kč`
                : `+$${(savedStats.wins * 100).toLocaleString('en-US')}`}
            </p>
          </div>
        </div>
      </div>

      {/* User Rank */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <Trophy className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {language === 'cz' ? 'Tvé pořadí' : 'Your Rank'}
            </p>
            <p className="font-mono text-lg font-bold">
              #{userRank.toLocaleString()} <span className="text-xs text-muted-foreground">/ {totalAnalysts.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Flame className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {language === 'cz' ? 'Dnešní aktivita' : "Today's Activity"}
            </p>
            <p className="text-sm font-medium">
              {savedStats.total} {language === 'cz' ? 'tipů sledováno' : 'picks followed'}
              {savedStats.wins > 0 && (
                <span className="text-success"> • {savedStats.wins} ✅</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="sm:col-span-2 lg:col-span-4 glass-card p-4">
          <p className="text-xs text-muted-foreground mb-2">
            {language === 'cz' ? 'Tvé odznaky' : 'Your Badges'}
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-sm font-medium ${badge.color}`}
              >
                <span>{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
