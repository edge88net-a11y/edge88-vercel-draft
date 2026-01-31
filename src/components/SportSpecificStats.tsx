import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Target, Zap, Clock, Award, Crosshair, Shield, TrendingUp, Users } from 'lucide-react';

interface SportSpecificStatsProps {
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
    <div className={cn('rounded-xl border p-4', bgColor)}>
      <div className="flex items-start justify-between mb-2">
        {Icon && <Icon className={cn('h-5 w-5', textColor)} />}
        {confidence !== undefined && (
          <span className="text-xs text-muted-foreground">{confidence}% conf</span>
        )}
      </div>
      <p className={cn('text-2xl font-mono font-bold', textColor)}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {subLabel && <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>}
    </div>
  );
}

// Generate sport-specific predicted stats
function generatePredictedStats(sport: string, homeTeam: string, awayTeam: string, confidence: number) {
  const hash = (homeTeam + awayTeam + sport).split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const baseConfidence = Math.round(confidence * 0.9);

  const sportLower = sport.toLowerCase();

  if (sportLower.includes('hockey') || sportLower.includes('nhl') || sportLower.includes('ice')) {
    return {
      type: 'hockey',
      stats: {
        totalGoals: { value: 5 + (hash % 3), confidence: baseConfidence + 5 },
        homeGoals: { value: 2 + (hash % 3), confidence: baseConfidence },
        awayGoals: { value: 2 + ((hash >> 1) % 3), confidence: baseConfidence },
        shotsOnGoal: { value: 58 + (hash % 12), confidence: baseConfidence - 5 },
        period1Goals: { value: 1 + (hash % 2), confidence: baseConfidence - 10 },
        period2Goals: { value: 2 + ((hash >> 2) % 2), confidence: baseConfidence - 10 },
        period3Goals: { value: 1 + ((hash >> 3) % 2), confidence: baseConfidence - 10 },
        powerPlayGoals: { value: 1 + (hash % 2), confidence: baseConfidence - 15 },
      }
    };
  }

  if (sportLower.includes('soccer') || sportLower.includes('football') || sportLower.includes('premier')) {
    return {
      type: 'soccer',
      stats: {
        totalGoals: { value: 2 + (hash % 2), confidence: baseConfidence + 5 },
        homeGoals: { value: 1 + (hash % 2), confidence: baseConfidence },
        awayGoals: { value: (hash >> 1) % 2, confidence: baseConfidence },
        xG: { value: (2.1 + (hash % 10) / 10).toFixed(2), confidence: baseConfidence - 5 },
        corners: { value: 9 + (hash % 5), confidence: baseConfidence - 10 },
        cards: { value: 3 + (hash % 3), confidence: baseConfidence - 15 },
        possession: { value: 52 + (hash % 10), confidence: baseConfidence - 8 },
        shotsOnTarget: { value: 8 + (hash % 6), confidence: baseConfidence - 10 },
      }
    };
  }

  if (sportLower.includes('basket') || sportLower.includes('nba')) {
    return {
      type: 'basketball',
      stats: {
        totalPoints: { value: 210 + (hash % 30), confidence: baseConfidence + 5 },
        homePoints: { value: 105 + (hash % 15), confidence: baseConfidence },
        awayPoints: { value: 102 + ((hash >> 2) % 15), confidence: baseConfidence },
        q1Points: { value: 52 + (hash % 10), confidence: baseConfidence - 10 },
        q2Points: { value: 54 + ((hash >> 1) % 10), confidence: baseConfidence - 10 },
        q3Points: { value: 53 + ((hash >> 2) % 10), confidence: baseConfidence - 10 },
        q4Points: { value: 55 + ((hash >> 3) % 10), confidence: baseConfidence - 10 },
        threePointers: { value: 22 + (hash % 8), confidence: baseConfidence - 15 },
      }
    };
  }

  if (sportLower.includes('ufc') || sportLower.includes('mma') || sportLower.includes('fight')) {
    const methods = ['KO/TKO', 'Submission', 'Decision', 'Split Decision'];
    const rounds = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Goes to Decision'];
    
    return {
      type: 'ufc',
      stats: {
        method: { value: methods[hash % methods.length], confidence: baseConfidence },
        round: { value: rounds[(hash >> 1) % rounds.length], confidence: baseConfidence - 10 },
        significantStrikes: { value: 85 + (hash % 60), confidence: baseConfidence - 15 },
        takedownAttempts: { value: 3 + (hash % 5), confidence: baseConfidence - 12 },
        takedownSuccess: { value: 40 + (hash % 40), confidence: baseConfidence - 15 },
        controlTime: { value: `${2 + (hash % 6)}:${String((hash % 60)).padStart(2, '0')}`, confidence: baseConfidence - 18 },
      }
    };
  }

  // Default for other sports
  return {
    type: 'default',
    stats: {
      homeScore: { value: 3 + (hash % 3), confidence: baseConfidence },
      awayScore: { value: 2 + ((hash >> 1) % 3), confidence: baseConfidence },
      totalScore: { value: 5 + (hash % 4), confidence: baseConfidence + 5 },
    }
  };
}

export function SportSpecificStats({ sport, homeTeam, awayTeam, confidence, className }: SportSpecificStatsProps) {
  const { language } = useLanguage();
  const predicted = generatePredictedStats(sport, homeTeam, awayTeam, confidence);

  if (predicted.type === 'hockey') {
    const { stats } = predicted;
    return (
      <div className={cn('space-y-6', className)}>
        <h3 className="text-lg font-bold flex items-center gap-2">
          🏒 {language === 'cz' ? 'Hokejové predikce' : 'Hockey Predictions'}
        </h3>

        {/* Goals Prediction */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'cz' ? 'Predikce gólů' : 'Goals Prediction'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              label={language === 'cz' ? 'Celkem gólů' : 'Total Goals'}
              value={stats.totalGoals.value}
              confidence={stats.totalGoals.confidence}
              variant="primary"
            />
            <StatCard
              icon={Award}
              label={`${homeTeam}`}
              value={stats.homeGoals.value}
              confidence={stats.homeGoals.confidence}
            />
            <StatCard
              icon={Award}
              label={`${awayTeam}`}
              value={stats.awayGoals.value}
              confidence={stats.awayGoals.confidence}
            />
            <StatCard
              icon={Crosshair}
              label={language === 'cz' ? 'Střely na branku' : 'Shots on Goal'}
              value={stats.shotsOnGoal.value}
              confidence={stats.shotsOnGoal.confidence}
            />
          </div>
        </div>

        {/* Period Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'cz' ? 'Rozložení po třetinách' : 'Period Breakdown'}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={Clock}
              label={language === 'cz' ? '1. třetina' : '1st Period'}
              value={stats.period1Goals.value}
              subLabel={language === 'cz' ? 'predikované góly' : 'predicted goals'}
              confidence={stats.period1Goals.confidence}
            />
            <StatCard
              icon={Clock}
              label={language === 'cz' ? '2. třetina' : '2nd Period'}
              value={stats.period2Goals.value}
              subLabel={language === 'cz' ? 'predikované góly' : 'predicted goals'}
              confidence={stats.period2Goals.confidence}
            />
            <StatCard
              icon={Clock}
              label={language === 'cz' ? '3. třetina' : '3rd Period'}
              value={stats.period3Goals.value}
              subLabel={language === 'cz' ? 'predikované góly' : 'predicted goals'}
              confidence={stats.period3Goals.confidence}
            />
          </div>
        </div>

        {/* Special Teams */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'cz' ? 'Speciální formace' : 'Special Teams'}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={Zap}
              label={language === 'cz' ? 'Góly v přesilovce' : 'Power Play Goals'}
              value={stats.powerPlayGoals.value}
              confidence={stats.powerPlayGoals.confidence}
              variant="warning"
            />
          </div>
        </div>
      </div>
    );
  }

  if (predicted.type === 'soccer') {
    const { stats } = predicted;
    return (
      <div className={cn('space-y-6', className)}>
        <h3 className="text-lg font-bold flex items-center gap-2">
          ⚽ {language === 'cz' ? 'Fotbalové predikce' : 'Soccer Predictions'}
        </h3>

        {/* Goals & xG */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'cz' ? 'Góly & xG' : 'Goals & xG'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              label={language === 'cz' ? 'Celkem gólů' : 'Total Goals'}
              value={stats.totalGoals.value}
              confidence={stats.totalGoals.confidence}
              variant="primary"
            />
            <StatCard
              icon={TrendingUp}
              label="xG"
              value={stats.xG.value}
              subLabel="Expected Goals"
              confidence={stats.xG.confidence}
              variant="success"
            />
            <StatCard
              icon={Award}
              label={`${homeTeam}`}
              value={stats.homeGoals.value}
              confidence={stats.homeGoals.confidence}
            />
            <StatCard
              icon={Award}
              label={`${awayTeam}`}
              value={stats.awayGoals.value}
              confidence={stats.awayGoals.confidence}
            />
          </div>
        </div>

        {/* Match Stats */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'cz' ? 'Statistiky zápasu' : 'Match Stats'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Shield}
              label={language === 'cz' ? 'Rohy' : 'Corners'}
              value={stats.corners.value}
              confidence={stats.corners.confidence}
            />
            <StatCard
              icon={Users}
              label={language === 'cz' ? 'Karty' : 'Cards'}
              value={stats.cards.value}
              confidence={stats.cards.confidence}
              variant="warning"
            />
            <StatCard
              label={language === 'cz' ? 'Držení míče' : 'Possession'}
              value={`${stats.possession.value}%`}
              subLabel={homeTeam}
              confidence={stats.possession.confidence}
            />
            <StatCard
              icon={Crosshair}
              label={language === 'cz' ? 'Střely na branku' : 'Shots on Target'}
              value={stats.shotsOnTarget.value}
              confidence={stats.shotsOnTarget.confidence}
            />
          </div>
        </div>
      </div>
    );
  }

  if (predicted.type === 'basketball') {
    const { stats } = predicted;
    return (
      <div className={cn('space-y-6', className)}>
        <h3 className="text-lg font-bold flex items-center gap-2">
          🏀 {language === 'cz' ? 'Basketbalové predikce' : 'Basketball Predictions'}
        </h3>

        {/* Points Prediction */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'cz' ? 'Predikce bodů' : 'Points Prediction'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              label={language === 'cz' ? 'Celkem bodů' : 'Total Points'}
              value={stats.totalPoints.value}
              confidence={stats.totalPoints.confidence}
              variant="primary"
            />
            <StatCard
              icon={Award}
              label={`${homeTeam}`}
              value={stats.homePoints.value}
              confidence={stats.homePoints.confidence}
            />
            <StatCard
              icon={Award}
              label={`${awayTeam}`}
              value={stats.awayPoints.value}
              confidence={stats.awayPoints.confidence}
            />
            <StatCard
              icon={Crosshair}
              label={language === 'cz' ? 'Trojky celkem' : 'Total 3-Pointers'}
              value={stats.threePointers.value}
              confidence={stats.threePointers.confidence}
              variant="success"
            />
          </div>
        </div>

        {/* Quarter Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'cz' ? 'Rozložení po čtvrtinách' : 'Quarter Breakdown'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Clock}
              label="Q1"
              value={stats.q1Points.value}
              subLabel={language === 'cz' ? 'celkem bodů' : 'total points'}
              confidence={stats.q1Points.confidence}
            />
            <StatCard
              icon={Clock}
              label="Q2"
              value={stats.q2Points.value}
              subLabel={language === 'cz' ? 'celkem bodů' : 'total points'}
              confidence={stats.q2Points.confidence}
            />
            <StatCard
              icon={Clock}
              label="Q3"
              value={stats.q3Points.value}
              subLabel={language === 'cz' ? 'celkem bodů' : 'total points'}
              confidence={stats.q3Points.confidence}
            />
            <StatCard
              icon={Clock}
              label="Q4"
              value={stats.q4Points.value}
              subLabel={language === 'cz' ? 'celkem bodů' : 'total points'}
              confidence={stats.q4Points.confidence}
            />
          </div>
        </div>
      </div>
    );
  }

  if (predicted.type === 'ufc') {
    const { stats } = predicted;
    return (
      <div className={cn('space-y-6', className)}>
        <h3 className="text-lg font-bold flex items-center gap-2">
          🥊 {language === 'cz' ? 'UFC predikce' : 'UFC Predictions'}
        </h3>

        {/* Fight Outcome */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'cz' ? 'Výsledek zápasu' : 'Fight Outcome'}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={Target}
              label={language === 'cz' ? 'Způsob výhry' : 'Method of Victory'}
              value={stats.method.value}
              confidence={stats.method.confidence}
              variant="primary"
            />
            <StatCard
              icon={Clock}
              label={language === 'cz' ? 'Predikce kola' : 'Round Prediction'}
              value={stats.round.value}
              confidence={stats.round.confidence}
              variant="success"
            />
          </div>
        </div>

        {/* Fight Stats */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'cz' ? 'Statistiky zápasu' : 'Fight Stats'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Zap}
              label={language === 'cz' ? 'Významné údery' : 'Significant Strikes'}
              value={stats.significantStrikes.value}
              subLabel={language === 'cz' ? 'celkem' : 'total'}
              confidence={stats.significantStrikes.confidence}
            />
            <StatCard
              icon={Users}
              label={language === 'cz' ? 'Pokusy o stržení' : 'Takedown Attempts'}
              value={stats.takedownAttempts.value}
              confidence={stats.takedownAttempts.confidence}
            />
            <StatCard
              label={language === 'cz' ? 'Úspěšnost stržení' : 'Takedown Success'}
              value={`${stats.takedownSuccess.value}%`}
              confidence={stats.takedownSuccess.confidence}
              variant="warning"
            />
            <StatCard
              icon={Clock}
              label={language === 'cz' ? 'Čas kontroly' : 'Control Time'}
              value={stats.controlTime.value}
              subLabel={language === 'cz' ? 'minuty' : 'minutes'}
              confidence={stats.controlTime.confidence}
            />
          </div>
        </div>
      </div>
    );
  }

  // Default stats for other sports
  const { stats } = predicted;
  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-lg font-bold flex items-center gap-2">
        📊 {language === 'cz' ? 'Predikce statistik' : 'Stats Predictions'}
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Award}
          label={`${homeTeam}`}
          value={stats.homeScore.value}
          confidence={stats.homeScore.confidence}
        />
        <StatCard
          icon={Target}
          label={language === 'cz' ? 'Celkem' : 'Total'}
          value={stats.totalScore.value}
          confidence={stats.totalScore.confidence}
          variant="primary"
        />
        <StatCard
          icon={Award}
          label={`${awayTeam}`}
          value={stats.awayScore.value}
          confidence={stats.awayScore.confidence}
        />
      </div>
    </div>
  );
}
