import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Receipt, TrendingUp, Trash2, ChevronUp, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { TeamLogo } from '@/components/TeamLogo';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { cn } from '@/lib/utils';

interface BettingSlipSidebarProps {
  className?: string;
}

export function BettingSlipSidebar({ className }: BettingSlipSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [betAmount, setBetAmount] = useState(1000);
  const { savedPicks, removePick } = useSavedPicks();
  const { language } = useLanguage();
  const { user } = useAuth();

  const pendingPicks = savedPicks.filter(p => p.prediction.result === 'pending');

  // Calculate combined odds (simplified - multiply decimal odds)
  const calculateCombinedOdds = () => {
    if (pendingPicks.length === 0) return 1;
    
    return pendingPicks.reduce((acc, pick) => {
      const odds = pick.prediction.prediction.odds;
      const numOdds = parseInt(odds.replace('+', ''));
      // Convert American to decimal
      const decimal = numOdds > 0 ? (numOdds / 100) + 1 : (100 / Math.abs(numOdds)) + 1;
      return acc * decimal;
    }, 1);
  };

  const combinedOdds = calculateCombinedOdds();
  const potentialPayout = Math.round(betAmount * combinedOdds);
  const potentialProfit = potentialPayout - betAmount;

  if (!user) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        'hidden lg:flex flex-col w-80 glass-card overflow-hidden sticky top-24 h-fit max-h-[calc(100vh-8rem)]',
        className
      )}>
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h3 className="font-bold">
              {language === 'cz' ? 'Sázenkový lístek' : 'Betting Slip'}
            </h3>
          </div>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
            {pendingPicks.length}
          </span>
        </div>

        {/* Picks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {pendingPicks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {language === 'cz' 
                  ? 'Přidejte tipy kliknutím na záložku'
                  : 'Add picks by clicking the bookmark icon'
                }
              </p>
            </div>
          ) : (
            pendingPicks.map((pick) => {
              const confidence = normalizeConfidence(pick.prediction.confidence);
              return (
                <div
                  key={pick.id}
                  className="rounded-lg border border-border p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TeamLogo teamName={pick.prediction.homeTeam} sport={pick.prediction.sport} size="sm" />
                        <span className="text-xs text-muted-foreground">vs</span>
                        <TeamLogo teamName={pick.prediction.awayTeam} sport={pick.prediction.sport} size="sm" />
                      </div>
                      <p className="text-sm font-medium truncate">
                        {pick.prediction.prediction.pick}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-bold text-primary">
                          {pick.prediction.prediction.odds}
                        </span>
                        <span className={cn(
                          'text-xs',
                          confidence >= 70 ? 'text-success' : confidence >= 55 ? 'text-yellow-400' : 'text-orange-400'
                        )}>
                          {confidence}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removePick(pick.predictionId)}
                      className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        {pendingPicks.length > 0 && (
          <div className="border-t border-border p-4 space-y-4 bg-card/50">
            {/* Bet Amount Input */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'cz' ? 'Výše sázky' : 'Bet Amount'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 h-10 rounded-lg border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-none"
                />
                <span className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Kč' : '$'}
                </span>
              </div>
            </div>

            {/* Combined Odds */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'cz' ? 'Kombinované kurzy' : 'Combined Odds'}
              </span>
              <span className="font-mono font-bold text-primary">
                {combinedOdds.toFixed(2)}x
              </span>
            </div>

            {/* Potential Payout */}
            <div className="rounded-lg bg-success/10 border border-success/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Potenciální výhra' : 'Potential Payout'}
                </span>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-success">
                    {potentialPayout.toLocaleString()} {language === 'cz' ? 'Kč' : '$'}
                  </div>
                  <div className="text-xs text-success">
                    +{potentialProfit.toLocaleString()} {language === 'cz' ? 'zisk' : 'profit'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link to="/saved-picks" className="block">
                <Button className="w-full btn-gradient gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {language === 'cz' ? 'Sledovat tyto tipy' : 'Follow These Picks'}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pendingPicks.forEach(p => removePick(p.predictionId))}
                className="w-full gap-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                {language === 'cz' ? 'Vymazat vše' : 'Clear All'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      {pendingPicks.length > 0 && (
        <div className="lg:hidden fixed bottom-20 left-0 right-0 z-40">
          <div className={cn(
            'mx-4 glass-card overflow-hidden transition-all duration-300',
            isOpen ? 'max-h-96' : 'max-h-16'
          )}>
            {/* Toggle Header */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10"
            >
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span className="font-bold">
                  {language === 'cz' ? 'Sázenkový lístek' : 'Betting Slip'}
                </span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                  {pendingPicks.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-success">
                  +{potentialProfit.toLocaleString()} {language === 'cz' ? 'Kč' : '$'}
                </span>
                <ChevronUp className={cn(
                  'h-5 w-5 transition-transform',
                  isOpen && 'rotate-180'
                )} />
              </div>
            </button>

            {/* Content */}
            {isOpen && (
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {pendingPicks.slice(0, 3).map((pick) => (
                  <div
                    key={pick.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate flex-1">{pick.prediction.prediction.pick}</span>
                    <span className="font-mono text-primary ml-2">{pick.prediction.prediction.odds}</span>
                  </div>
                ))}
                {pendingPicks.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{pendingPicks.length - 3} {language === 'cz' ? 'dalších' : 'more'}
                  </p>
                )}
                <Link to="/saved-picks">
                  <Button size="sm" className="w-full btn-gradient">
                    {language === 'cz' ? 'Zobrazit vše' : 'View All'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
