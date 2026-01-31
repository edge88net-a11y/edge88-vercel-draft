import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePredictionStats, SportSpecificStatsData } from '@/hooks/usePredictions';
import { Target, Zap, Clock, Award, Crosshair, Shield, TrendingUp, Users, Loader2, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SportSpecificStatsProps {
  predictionId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  confidence: number;
  className?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  confidence?: number;
  icon?: React.ElementType;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

function StatCard({ label, value, subLabel, confidence, icon: Icon, variant = 'default' }: StatCardProps) {
  const bgColor = {
    default: 'bg-muted/50',
    primary: 'bg-primary/10 border-primary/20',
    success: 'bg-success/10 border-success/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20',
  }[variant];

  const textColor = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-yellow-400',
  }[variant];

  return (
    <div className={cn('rounded-xl border p-3 md:p-4', bgColor)}>
      <div className="flex items-start justify-between mb-2">
        {Icon && <Icon className={cn('h-4 w-4 md:h-5 md:w-5', textColor)} />}
        {confidence !== undefined && (
          <span className="text-xs text-muted-foreground">{confidence}%</span>
        )}
      </div>
      <p className={cn('text-lg md:text-2xl font-mono font-bold', textColor)}>{value}</p>
      <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
      {subLabel && <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>}
    </div>
  );
}

// Skeleton loader for stats
function StatsSkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-3 md:p-4 space-y-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-3 md:p-4 space-y-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Coming soon placeholder
function ComingSoonPlaceholder({ sport }: { sport: string }) {
  const { language } = useLanguage();
  
  const sportIcon = sport.toLowerCase().includes('hockey') ? '🏒' :
    sport.toLowerCase().includes('soccer') || sport.toLowerCase().includes('football') ? '⚽' :
    sport.toLowerCase().includes('basket') || sport.toLowerCase().includes('nba') ? '🏀' :
    sport.toLowerCase().includes('ufc') || sport.toLowerCase().includes('mma') ? '🥊' : '📊';

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16">
      <div className="relative mb-6">
        <div className="text-6xl md:text-7xl">{sportIcon}</div>
        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-2 text-center">
        {language === 'cz' ? 'Statistiky se připravují' : 'Stats Coming Soon'}
      </h3>
      <p className="text-sm md:text-base text-muted-foreground text-center max-w-md">
        {language === 'cz' 
          ? 'Naše AI analyzuje data pro tento zápas. Podrobné statistiky budou brzy k dispozici.'
          : 'Our AI is analyzing data for this match. Detailed stats will be available shortly.'}
      </p>
      <div className="mt-6 flex items-center gap-2 text-primary">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">{language === 'cz' ? 'Načítání...' : 'Loading...'}</span>
      </div>
    </div>
  );
}

// Render stats based on sport type from API
function RenderStats({ data, homeTeam, awayTeam }: { data: SportSpecificStatsData; homeTeam: string; awayTeam: string }) {
  const { language } = useLanguage();
  const { type, stats } = data;

  if (type === 'hockey') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          🏒 {language === 'cz' ? 'Hokejové predikce' : 'Hockey Predictions'}
        </h3>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'cz' ? 'Predikce gólů' : 'Goals Prediction'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {stats.totalGoals && (
              <StatCard
                icon={Target}
                label={language === 'cz' ? 'Celkem gólů' : 'Total Goals'}
                value={stats.totalGoals.value}
                confidence={stats.totalGoals.confidence}
                variant="primary"
              />
            )}
            {stats.homeGoals && (
              <StatCard icon={Award} label={homeTeam} value={stats.homeGoals.value} confidence={stats.homeGoals.confidence} />
            )}
            {stats.awayGoals && (
              <StatCard icon={Award} label={awayTeam} value={stats.awayGoals.value} confidence={stats.awayGoals.confidence} />
            )}
            {stats.shotsOnGoal && (
              <StatCard icon={Crosshair} label={language === 'cz' ? 'Střely' : 'Shots'} value={stats.shotsOnGoal.value} confidence={stats.shotsOnGoal.confidence} />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'soccer') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          ⚽ {language === 'cz' ? 'Fotbalové predikce' : 'Soccer Predictions'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.totalGoals && (
            <StatCard icon={Target} label={language === 'cz' ? 'Celkem gólů' : 'Total Goals'} value={stats.totalGoals.value} confidence={stats.totalGoals.confidence} variant="primary" />
          )}
          {stats.xG && (
            <StatCard icon={TrendingUp} label="xG" value={stats.xG.value} subLabel="Expected Goals" confidence={stats.xG.confidence} variant="success" />
          )}
          {stats.corners && (
            <StatCard icon={Shield} label={language === 'cz' ? 'Rohy' : 'Corners'} value={stats.corners.value} confidence={stats.corners.confidence} />
          )}
          {stats.cards && (
            <StatCard icon={Users} label={language === 'cz' ? 'Karty' : 'Cards'} value={stats.cards.value} confidence={stats.cards.confidence} variant="warning" />
          )}
        </div>
      </div>
    );
  }

  if (type === 'basketball') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          🏀 {language === 'cz' ? 'Basketbalové predikce' : 'Basketball Predictions'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.totalPoints && (
            <StatCard icon={Target} label={language === 'cz' ? 'Celkem bodů' : 'Total Points'} value={stats.totalPoints.value} confidence={stats.totalPoints.confidence} variant="primary" />
          )}
          {stats.homePoints && (
            <StatCard icon={Award} label={homeTeam} value={stats.homePoints.value} confidence={stats.homePoints.confidence} />
          )}
          {stats.awayPoints && (
            <StatCard icon={Award} label={awayTeam} value={stats.awayPoints.value} confidence={stats.awayPoints.confidence} />
          )}
          {stats.threePointers && (
            <StatCard icon={Crosshair} label={language === 'cz' ? 'Trojky' : '3-Pointers'} value={stats.threePointers.value} confidence={stats.threePointers.confidence} variant="success" />
          )}
        </div>

        {(stats.q1Points || stats.q2Points || stats.q3Points || stats.q4Points) && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              {language === 'cz' ? 'Po čtvrtinách' : 'Quarter Breakdown'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {stats.q1Points && <StatCard icon={Clock} label="Q1" value={stats.q1Points.value} confidence={stats.q1Points.confidence} />}
              {stats.q2Points && <StatCard icon={Clock} label="Q2" value={stats.q2Points.value} confidence={stats.q2Points.confidence} />}
              {stats.q3Points && <StatCard icon={Clock} label="Q3" value={stats.q3Points.value} confidence={stats.q3Points.confidence} />}
              {stats.q4Points && <StatCard icon={Clock} label="Q4" value={stats.q4Points.value} confidence={stats.q4Points.confidence} />}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'ufc') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          🥊 {language === 'cz' ? 'UFC predikce' : 'UFC Predictions'}
        </h3>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {stats.method && (
            <StatCard icon={Target} label={language === 'cz' ? 'Způsob výhry' : 'Method of Victory'} value={stats.method.value} confidence={stats.method.confidence} variant="primary" />
          )}
          {stats.round && (
            <StatCard icon={Clock} label={language === 'cz' ? 'Kolo' : 'Round'} value={stats.round.value} confidence={stats.round.confidence} variant="success" />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.significantStrikes && (
            <StatCard icon={Zap} label={language === 'cz' ? 'Údery' : 'Strikes'} value={stats.significantStrikes.value} confidence={stats.significantStrikes.confidence} />
          )}
          {stats.takedownAttempts && (
            <StatCard icon={Users} label={language === 'cz' ? 'Stržení' : 'Takedowns'} value={stats.takedownAttempts.value} confidence={stats.takedownAttempts.confidence} />
          )}
          {stats.takedownSuccess && (
            <StatCard label={language === 'cz' ? 'Úspěšnost' : 'TD Success'} value={`${stats.takedownSuccess.value}%`} confidence={stats.takedownSuccess.confidence} variant="warning" />
          )}
          {stats.controlTime && (
            <StatCard icon={Clock} label={language === 'cz' ? 'Kontrola' : 'Control'} value={stats.controlTime.value} confidence={stats.controlTime.confidence} />
          )}
        </div>
      </div>
    );
  }

  // Default stats
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        📊 {language === 'cz' ? 'Predikce' : 'Predictions'}
      </h3>
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.homeScore && <StatCard icon={Award} label={homeTeam} value={stats.homeScore.value} confidence={stats.homeScore.confidence} />}
        {stats.totalScore && <StatCard icon={Target} label={language === 'cz' ? 'Celkem' : 'Total'} value={stats.totalScore.value} confidence={stats.totalScore.confidence} variant="primary" />}
        {stats.awayScore && <StatCard icon={Award} label={awayTeam} value={stats.awayScore.value} confidence={stats.awayScore.confidence} />}
      </div>
    </div>
  );
}

export function SportSpecificStats({ predictionId, sport, homeTeam, awayTeam, confidence, className }: SportSpecificStatsProps) {
  const { data: statsData, isLoading, error } = usePredictionStats(predictionId);

  if (isLoading) {
    return (
      <div className={className}>
        <StatsSkeletonLoader />
      </div>
    );
  }

  // Show coming soon if no data from API
  if (!statsData || error) {
    return (
      <div className={className}>
        <ComingSoonPlaceholder sport={sport} />
      </div>
    );
  }

  return (
    <div className={className}>
      <RenderStats data={statsData} homeTeam={homeTeam} awayTeam={awayTeam} />
    </div>
  );
}
