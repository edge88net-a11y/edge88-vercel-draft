import { useState } from 'react';
import { 
  Trophy, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Cloud,
  AlertOctagon,
  ChevronDown,
  Loader2,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeyFactors, usePredictionDetail } from '@/hooks/usePredictions';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalysisSectionProps {
  predictionId: string;
  reasoning: string;
  reasoning_cs?: string;
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
  isLoading?: boolean;
}

function CollapsibleSection({ icon: Icon, title, color, children, defaultOpen = false, isLoading = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', color)} />
          <span className="font-semibold text-sm md:text-base">{title}</span>
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 text-muted-foreground transition-transform duration-300',
          isOpen && 'rotate-180'
        )} />
      </button>
      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="p-4 pt-0 text-sm">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

// Placeholder when analysis is not available
function AnalysisComingSoon() {
  const { language } = useLanguage();
  
  return (
    <div className="text-center py-6 text-muted-foreground">
      <p className="text-sm">
        {language === 'cz' ? 'Analýza bude brzy dostupná.' : 'Analysis coming soon.'}
      </p>
    </div>
  );
}

// Check if reasoning is empty or generic
function isGenericReasoning(reasoning: string): boolean {
  if (!reasoning || reasoning.length < 30) return true;
  
  const genericPhrases = [
    'even matchup',
    'betting markets',
    'no significant',
    'standard',
    'analysis based on'
  ];
  
  const lowerReasoning = reasoning.toLowerCase();
  return genericPhrases.some(phrase => lowerReasoning.includes(phrase));
}

export function AnalysisSection({ 
  predictionId,
  reasoning, 
  reasoning_cs,
  pick, 
  confidence,
  keyFactors,
  homeTeam,
  awayTeam,
  className 
}: AnalysisSectionProps) {
  const { language } = useLanguage();
  
  // Fetch detailed analysis from API
  const { data: apiAnalysis, isLoading: analysisLoading } = usePredictionDetail(predictionId);

  // Use API data if available, otherwise use passed props
  const analysisData = apiAnalysis || null;
  const hasRealAnalysis = !isGenericReasoning(reasoning);
  
  // No loading spinner - if no data after fetch, show "coming soon"
  const isDataMissing = isGenericReasoning(reasoning) && !analysisLoading && !analysisData;

  // Get analysis text - use Czech version if available when language is CZ
  const getAnalysisText = () => {
    // Check API data first for Czech version
    if (language === 'cz') {
      if (analysisData?.reasoning_cs) {
        return analysisData.reasoning_cs;
      }
      if (reasoning_cs) {
        return reasoning_cs;
      }
    }
    
    // Fall back to English
    if (analysisData?.reasoning) {
      return analysisData.reasoning;
    }
    if (hasRealAnalysis) {
      return reasoning;
    }
    return null;
  };

  const analysisText = getAnalysisText();

  // Get key stats from API or show loading
  const getKeyStats = () => {
    if (analysisData?.keyStats) {
      return analysisData.keyStats;
    }
    // Return empty if no API data - don't generate fake stats
    return null;
  };

  // Get form guide from API
  const getFormGuide = () => {
    if (analysisData?.formGuide) {
      return analysisData.formGuide;
    }
    return null;
  };

  // Get H2H from API
  const getH2H = () => {
    if (analysisData?.h2h) {
      return analysisData.h2h;
    }
    return null;
  };

  // Get injuries from API or keyFactors
  const getInjuries = () => {
    if (analysisData?.injuries) {
      return analysisData.injuries;
    }
    // Use keyFactors if available
    if (keyFactors?.injuries && keyFactors.injuries.length > 0) {
      const halfPoint = Math.ceil(keyFactors.injuries.length / 2);
      return {
        home: keyFactors.injuries.slice(0, halfPoint).map(inj => ({
          player: inj.split(' - ')[0] || 'Player',
          status: inj.split(' - ')[1] || inj,
          impact: language === 'cz' ? 'Střední' : 'Medium'
        })),
        away: keyFactors.injuries.slice(halfPoint).map(inj => ({
          player: inj.split(' - ')[0] || 'Player',
          status: inj.split(' - ')[1] || inj,
          impact: language === 'cz' ? 'Střední' : 'Medium'
        }))
      };
    }
    return null;
  };

  // Get sharp money from API or keyFactors
  const getSharpMoney = () => {
    if (analysisData?.sharpMoney) {
      return analysisData.sharpMoney;
    }
    if (keyFactors?.sharpMoney) {
      const { direction, lineMovement, percentage } = keyFactors.sharpMoney;
      const targetTeam = direction === 'home' ? homeTeam : awayTeam;
      return {
        direction: targetTeam,
        lineMovement: lineMovement > 0 ? `+${lineMovement}` : String(lineMovement),
        percentage,
        analysis: language === 'cz'
          ? `Sharp money sledování ukazuje pohyb směrem k ${targetTeam}. ${percentage}% profesionálních peněz na této straně.`
          : `Sharp money tracking shows movement toward ${targetTeam}. ${percentage}% of professional money on this side.`
      };
    }
    return null;
  };

  // Get conditions from API or keyFactors
  const getConditions = () => {
    if (analysisData?.conditions) {
      return analysisData.conditions;
    }
    if (keyFactors?.weather) {
      return {
        venue: `${homeTeam} Stadium`,
        weather: `${keyFactors.weather.conditions}, ${keyFactors.weather.temperature}°F`,
        impact: keyFactors.weather.impact,
        restDays: { home: 2, away: 2 }
      };
    }
    return null;
  };

  // Get risk factors from API
  const getRiskFactors = () => {
    if (analysisData?.riskFactors) {
      return analysisData.riskFactors;
    }
    return null;
  };

  const keyStats = getKeyStats();
  const formGuide = getFormGuide();
  const h2h = getH2H();
  const injuries = getInjuries();
  const sharpMoney = getSharpMoney();
  const conditions = getConditions();
  const riskFactors = getRiskFactors();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Our Pick - Always show with real reasoning */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5 border border-primary/20 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <h4 className="text-lg md:text-xl font-bold">
            {language === 'cz' ? '🏆 Náš Tip' : '🏆 Our Pick'}
          </h4>
        </div>
        <p className="text-xl md:text-2xl font-bold text-foreground mb-4">{pick}</p>
        
        {analysisText ? (
          <div className="space-y-3">
            {analysisText.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-sm md:text-base text-muted-foreground leading-relaxed">{paragraph}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {language === 'cz' ? 'Detailní analýza bude brzy dostupná.' : 'Detailed analysis coming soon.'}
          </p>
        )}
      </div>

      {/* Key Stats */}
      <CollapsibleSection
        icon={BarChart3}
        title={language === 'cz' ? '📊 Klíčové statistiky' : '📊 Key Stats'}
        color="text-blue-400"
        defaultOpen
        isLoading={analysisLoading}
      >
        {keyStats ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pb-2 border-b border-border">
              <span className="w-20 md:w-24 truncate">{homeTeam}</span>
              <span className="flex-1 text-center">{language === 'cz' ? 'Statistika' : 'Stat'}</span>
              <span className="w-20 md:w-24 text-right truncate">{awayTeam}</span>
            </div>
            
            {keyStats.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 hover:bg-muted/30 rounded px-2 -mx-2">
                <span className="w-20 md:w-24 font-mono text-xs md:text-sm font-bold text-primary">{stat.homeValue}</span>
                <span className="flex-1 text-center text-xs text-muted-foreground">{stat.label}</span>
                <span className="w-20 md:w-24 text-right font-mono text-xs md:text-sm font-bold text-accent">{stat.awayValue}</span>
              </div>
            ))}
          </div>
        ) : !analysisLoading ? (
          <p className="text-sm text-muted-foreground py-4">
            {language === 'cz' ? 'Statistiky budou brzy dostupné.' : 'Stats coming soon.'}
          </p>
        ) : null}
      </CollapsibleSection>

      {/* Form Guide */}
      <CollapsibleSection
        icon={TrendingUp}
        title={language === 'cz' ? '📈 Forma' : '📈 Form Guide'}
        color="text-success"
        isLoading={analysisLoading}
      >
        {formGuide ? (
          <div className="space-y-6">
            {/* Home Team */}
            <div>
              <h5 className="font-medium mb-3 text-foreground">{homeTeam}</h5>
              <div className="space-y-2">
                {formGuide.home.slice(0, 5).map((game, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/30 p-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'w-6 h-6 rounded text-xs font-bold flex items-center justify-center',
                        game.result === 'W' ? 'bg-success/20 text-success' : 
                        game.result === 'L' ? 'bg-destructive/20 text-destructive' : 
                        'bg-muted text-muted-foreground'
                      )}>
                        {game.result}
                      </span>
                      <span className="text-xs md:text-sm">vs {game.opponent}</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className="font-mono text-xs md:text-sm">{game.score}</span>
                      <span className="text-xs text-muted-foreground hidden md:inline">{game.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Team */}
            <div>
              <h5 className="font-medium mb-3 text-foreground">{awayTeam}</h5>
              <div className="space-y-2">
                {formGuide.away.slice(0, 5).map((game, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/30 p-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'w-6 h-6 rounded text-xs font-bold flex items-center justify-center',
                        game.result === 'W' ? 'bg-success/20 text-success' : 
                        game.result === 'L' ? 'bg-destructive/20 text-destructive' : 
                        'bg-muted text-muted-foreground'
                      )}>
                        {game.result}
                      </span>
                      <span className="text-xs md:text-sm">vs {game.opponent}</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className="font-mono text-xs md:text-sm">{game.score}</span>
                      <span className="text-xs text-muted-foreground hidden md:inline">{game.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !analysisLoading ? (
          <p className="text-sm text-muted-foreground py-4">
            {language === 'cz' ? 'Údaje o formě budou brzy dostupné.' : 'Form data coming soon.'}
          </p>
        ) : null}
      </CollapsibleSection>

      {/* Head to Head */}
      <CollapsibleSection
        icon={Users}
        title={language === 'cz' ? '🤝 Vzájemné zápasy' : '🤝 Head to Head'}
        color="text-purple-400"
        isLoading={analysisLoading}
      >
        {h2h ? (
          <div className="space-y-2">
            {h2h.map((match, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/30 p-2 md:p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                    <span className={cn(
                      'font-medium text-xs md:text-sm',
                      match.homeScore > match.awayScore ? 'text-success' : 'text-muted-foreground'
                    )}>
                      {match.homeTeam}
                    </span>
                    <span className="font-mono font-bold text-sm md:text-lg">
                      {match.homeScore} - {match.awayScore}
                    </span>
                    <span className={cn(
                      'font-medium text-xs md:text-sm',
                      match.awayScore > match.homeScore ? 'text-success' : 'text-muted-foreground'
                    )}>
                      {match.awayTeam}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{match.date}</span>
              </div>
            ))}
          </div>
        ) : !analysisLoading ? (
          <p className="text-sm text-muted-foreground py-4">
            {language === 'cz' ? 'Vzájemné zápasy budou brzy dostupné.' : 'H2H data coming soon.'}
          </p>
        ) : null}
      </CollapsibleSection>

      {/* Injury Report */}
      <CollapsibleSection
        icon={AlertTriangle}
        title={language === 'cz' ? '🤕 Hlášení zranění' : '🤕 Injury Report'}
        color="text-destructive"
        isLoading={analysisLoading}
      >
        {injuries ? (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Home Team */}
            <div>
              <h5 className="font-medium mb-2 text-foreground text-sm">{homeTeam}</h5>
              {injuries.home.length > 0 ? (
                <div className="space-y-2">
                  {injuries.home.map((injury, idx) => (
                    <div key={idx} className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 md:p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs md:text-sm">{injury.player}</span>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          injury.impact?.includes('High') || injury.impact?.includes('Vysoký')
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-yellow-500/20 text-yellow-400'
                        )}>
                          {injury.impact}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{injury.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-success/10 border border-success/20 p-2 md:p-3">
                  <span className="text-xs md:text-sm text-success">
                    ✓ {language === 'cz' ? 'Žádná zranění' : 'No injuries'}
                  </span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div>
              <h5 className="font-medium mb-2 text-foreground text-sm">{awayTeam}</h5>
              {injuries.away.length > 0 ? (
                <div className="space-y-2">
                  {injuries.away.map((injury, idx) => (
                    <div key={idx} className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 md:p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs md:text-sm">{injury.player}</span>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          injury.impact?.includes('High') || injury.impact?.includes('Vysoký')
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-yellow-500/20 text-yellow-400'
                        )}>
                          {injury.impact}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{injury.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-success/10 border border-success/20 p-2 md:p-3">
                  <span className="text-xs md:text-sm text-success">
                    ✓ {language === 'cz' ? 'Žádná zranění' : 'No injuries'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{language === 'cz' ? 'Zranění se načítají...' : 'Injuries loading...'}</span>
          </div>
        )}
      </CollapsibleSection>

      {/* Sharp Money */}
      <CollapsibleSection
        icon={DollarSign}
        title={language === 'cz' ? '💰 Sharp Money' : '💰 Sharp Money'}
        color="text-yellow-400"
        isLoading={analysisLoading}
      >
        {sharpMoney ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 md:p-4">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-mono font-bold text-yellow-400">{sharpMoney.percentage}%</p>
                <p className="text-xs text-muted-foreground">Sharp</p>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm md:text-base">{sharpMoney.direction}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Pohyb:' : 'Move:'} {sharpMoney.lineMovement}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm">{sharpMoney.analysis}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{language === 'cz' ? 'Sharp money se načítá...' : 'Sharp money loading...'}</span>
          </div>
        )}
      </CollapsibleSection>

      {/* Conditions */}
      <CollapsibleSection
        icon={Cloud}
        title={language === 'cz' ? '🌤️ Podmínky' : '🌤️ Conditions'}
        color="text-blue-300"
        isLoading={analysisLoading}
      >
        {conditions ? (
          <>
            <div className="grid gap-3 grid-cols-2">
              <div className="rounded-lg bg-muted/30 p-2 md:p-3">
                <p className="text-xs text-muted-foreground mb-1">{language === 'cz' ? 'Místo' : 'Venue'}</p>
                <p className="font-medium text-xs md:text-sm">{conditions.venue}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2 md:p-3">
                <p className="text-xs text-muted-foreground mb-1">{language === 'cz' ? 'Počasí' : 'Weather'}</p>
                <p className="font-medium text-xs md:text-sm">{conditions.weather}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2 md:p-3">
                <p className="text-xs text-muted-foreground mb-1">{homeTeam}</p>
                <p className="font-medium text-xs md:text-sm">{conditions.restDays.home} {language === 'cz' ? 'dny' : 'days'} rest</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2 md:p-3">
                <p className="text-xs text-muted-foreground mb-1">{awayTeam}</p>
                <p className="font-medium text-xs md:text-sm">{conditions.restDays.away} {language === 'cz' ? 'dny' : 'days'} rest</p>
              </div>
            </div>
            {conditions.impact && (
              <p className="mt-3 text-xs md:text-sm text-muted-foreground">{conditions.impact}</p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{language === 'cz' ? 'Podmínky se načítají...' : 'Conditions loading...'}</span>
          </div>
        )}
      </CollapsibleSection>

      {/* Risk Factors */}
      <CollapsibleSection
        icon={AlertOctagon}
        title={language === 'cz' ? '⚠️ Rizikové faktory' : '⚠️ Risk Factors'}
        color="text-orange-400"
        isLoading={analysisLoading}
      >
        {riskFactors ? (
          <div className="space-y-2">
            {riskFactors.map((item, idx) => (
              <div key={idx} className={cn(
                'flex items-start gap-2 md:gap-3 rounded-lg p-2 md:p-3',
                item.severity === 'high' ? 'bg-destructive/10 border border-destructive/20' :
                item.severity === 'medium' ? 'bg-orange-500/10 border border-orange-500/20' :
                'bg-muted/30'
              )}>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded font-medium uppercase shrink-0',
                  item.severity === 'high' ? 'bg-destructive/20 text-destructive' :
                  item.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-muted text-muted-foreground'
                )}>
                  {item.severity}
                </span>
                <span className="text-xs md:text-sm">{item.risk}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{language === 'cz' ? 'Rizika se načítají...' : 'Risks loading...'}</span>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
