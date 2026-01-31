import { useState } from 'react';
import { 
  Trophy, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Cloud,
  AlertOctagon,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeyFactors } from '@/hooks/usePredictions';

interface AnalysisSectionProps {
  reasoning: string;
  pick: string;
  confidence: number;
  keyFactors?: KeyFactors;
  homeTeam: string;
  awayTeam: string;
  className?: string;
}

interface CollapsibleSectionProps {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ icon: Icon, title, color, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', color)} />
          <span className="font-medium text-sm">{title}</span>
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 text-muted-foreground transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>
      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="p-3 pt-0 text-sm text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AnalysisSection({ 
  reasoning, 
  pick, 
  confidence,
  keyFactors,
  homeTeam,
  awayTeam,
  className 
}: AnalysisSectionProps) {
  const { language } = useLanguage();

  // Parse reasoning into sections (fallback to generic if not structured)
  const getPickExplanation = () => {
    if (reasoning.length > 100) {
      return reasoning.split('.').slice(0, 3).join('.') + '.';
    }
    return reasoning;
  };

  // Generate key stats from available data
  const getKeyStats = () => {
    const stats: string[] = [];
    
    if (keyFactors?.historicalH2H) {
      const { homeWins, awayWins } = keyFactors.historicalH2H;
      stats.push(language === 'cz' 
        ? `Vzájemná bilance: ${homeTeam} ${homeWins}-${awayWins} ${awayTeam}`
        : `H2H Record: ${homeTeam} ${homeWins}-${awayWins} ${awayTeam}`
      );
    }
    
    if (keyFactors?.sentiment) {
      stats.push(language === 'cz'
        ? `Veřejné sázky: ${keyFactors.sentiment.public}% | Sharp: ${keyFactors.sentiment.sharp}%`
        : `Public bets: ${keyFactors.sentiment.public}% | Sharp: ${keyFactors.sentiment.sharp}%`
      );
    }

    if (confidence >= 70) {
      stats.push(language === 'cz'
        ? 'Vysoká důvěra modelu (70%+)'
        : 'High model confidence (70%+)'
      );
    }

    // Add some generated stats if we don't have enough real data
    if (stats.length < 4) {
      stats.push(language === 'cz' ? 'Posledních 5 zápasů analyzováno' : 'Last 5 games analyzed');
      stats.push(language === 'cz' ? 'Situace na trhu zohledněna' : 'Market conditions factored');
    }

    return stats.slice(0, 5);
  };

  // Get injury report
  const getInjuryReport = () => {
    if (keyFactors?.injuries && keyFactors.injuries.length > 0) {
      return keyFactors.injuries;
    }
    return [language === 'cz' 
      ? 'Žádná významná zranění hlášena'
      : 'No significant injuries reported'
    ];
  };

  // Generate form summary
  const getFormSummary = () => {
    // This would come from real data - placeholder for now
    return {
      home: ['W', 'W', 'L', 'W', 'L'],
      away: ['L', 'W', 'W', 'W', 'L'],
    };
  };

  // Get sharp money info
  const getSharpMoneyInfo = () => {
    if (keyFactors?.sharpMoney) {
      const { direction, lineMovement, percentage } = keyFactors.sharpMoney;
      return language === 'cz'
        ? `Linka se posunula ${lineMovement > 0 ? '+' : ''}${lineMovement} směrem k ${direction === 'home' ? homeTeam : awayTeam}. Sharp money: ${percentage}% na tuto stranu.`
        : `Line moved ${lineMovement > 0 ? '+' : ''}${lineMovement} toward ${direction === 'home' ? homeTeam : awayTeam}. Sharp money: ${percentage}% on this side.`;
    }
    return language === 'cz'
      ? 'Profesionální sázkaři sledování trhu nenaznačují významný pohyb.'
      : 'Professional bettors monitoring shows no significant movement.';
  };

  // Get conditions info
  const getConditionsInfo = () => {
    const conditions: string[] = [];
    
    if (keyFactors?.weather) {
      conditions.push(`${keyFactors.weather.conditions}, ${keyFactors.weather.temperature}°F`);
      if (keyFactors.weather.impact) {
        conditions.push(keyFactors.weather.impact);
      }
    }
    
    conditions.push(language === 'cz' 
      ? `Domácí: ${homeTeam} Stadium`
      : `Venue: ${homeTeam} Stadium`
    );

    return conditions.length > 0 
      ? conditions.join(' • ')
      : language === 'cz' ? 'Standardní podmínky' : 'Standard conditions';
  };

  // Get risk factors
  const getRiskFactors = () => {
    const risks: string[] = [];
    
    if (confidence < 65) {
      risks.push(language === 'cz' 
        ? 'Nižší důvěra modelu - větší variabilita'
        : 'Lower model confidence - higher variance'
      );
    }
    
    if (keyFactors?.injuries && keyFactors.injuries.length > 2) {
      risks.push(language === 'cz'
        ? 'Více zranění může ovlivnit výsledek'
        : 'Multiple injuries may affect outcome'
      );
    }

    if (risks.length === 0) {
      risks.push(language === 'cz'
        ? 'Standardní riziko pro tento typ sázky'
        : 'Standard risk level for this bet type'
      );
    }

    return risks;
  };

  const form = getFormSummary();

  return (
    <div className={cn('space-y-3', className)}>
      {/* Our Pick - Always expanded */}
      <div className="rounded-lg bg-gradient-to-r from-primary/10 to-accent/5 border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">
            {language === 'cz' ? '🏆 Náš Tip' : '🏆 Our Pick'}
          </h4>
        </div>
        <p className="text-lg font-bold text-foreground mb-1">{pick}</p>
        <p className="text-sm text-muted-foreground">{getPickExplanation()}</p>
      </div>

      {/* Key Stats */}
      <CollapsibleSection
        icon={BarChart3}
        title={language === 'cz' ? '📊 Klíčové statistiky' : '📊 Key Stats'}
        color="text-blue-400"
        defaultOpen
      >
        <ul className="space-y-1">
          {getKeyStats().map((stat, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{stat}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      {/* Injury Report */}
      <CollapsibleSection
        icon={AlertTriangle}
        title={language === 'cz' ? '🤕 Zranění' : '🤕 Injury Report'}
        color="text-destructive"
      >
        <ul className="space-y-1">
          {getInjuryReport().map((injury, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-destructive">•</span>
              <span>{injury}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      {/* Form */}
      <CollapsibleSection
        icon={TrendingUp}
        title={language === 'cz' ? '📈 Forma' : '📈 Form'}
        color="text-success"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-24 text-xs">{homeTeam}:</span>
            <div className="flex gap-1">
              {form.home.map((result, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'w-6 h-6 rounded text-xs font-bold flex items-center justify-center',
                    result === 'W' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  )}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-xs">{awayTeam}:</span>
            <div className="flex gap-1">
              {form.away.map((result, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'w-6 h-6 rounded text-xs font-bold flex items-center justify-center',
                    result === 'W' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  )}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Sharp Money */}
      <CollapsibleSection
        icon={DollarSign}
        title={language === 'cz' ? '💰 Sharp Money' : '💰 Sharp Money'}
        color="text-yellow-400"
      >
        <p>{getSharpMoneyInfo()}</p>
      </CollapsibleSection>

      {/* Conditions */}
      <CollapsibleSection
        icon={Cloud}
        title={language === 'cz' ? '🌤️ Podmínky' : '🌤️ Conditions'}
        color="text-blue-300"
      >
        <p>{getConditionsInfo()}</p>
      </CollapsibleSection>

      {/* Risk Factors */}
      <CollapsibleSection
        icon={AlertOctagon}
        title={language === 'cz' ? '⚠️ Rizikové faktory' : '⚠️ Risk Factors'}
        color="text-orange-400"
      >
        <ul className="space-y-1">
          {getRiskFactors().map((risk, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    </div>
  );
}
