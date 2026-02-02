import { useState } from 'react';
import { X, Trash2, ChevronUp, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBettingSlip } from '@/hooks/useBettingSlip';
import { formatCurrency, formatOdds } from '@/lib/oddsUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function BettingSlipFloating() {
  const { language } = useLanguage();
  const { slipItems, removeFromSlip, clearSlip, slipCount, getCombinedOdds, getPotentialPayout } = useBettingSlip();
  const [isOpen, setIsOpen] = useState(false);
  const [stake, setStake] = useState(language === 'cz' ? 1000 : 100);

  if (slipCount === 0) return null;

  const combinedOdds = getCombinedOdds();
  const potentialPayout = getPotentialPayout(stake);
  const profit = potentialPayout - stake;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full',
          'bg-gradient-to-r from-primary to-accent text-white shadow-xl',
          'hover:scale-105 transition-transform duration-200',
          'animate-pulse'
        )}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-bold">{slipCount}</span>
      </button>

      {/* Slide-up Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-50 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="font-bold">
                  {language === 'cz' ? 'Můj tiket' : 'My Slip'} ({slipCount})
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[50vh] p-4 space-y-2">
              {slipItems.map((item) => (
                <div
                  key={item.prediction.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {item.prediction.homeTeam} vs {item.prediction.awayTeam}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.prediction.prediction.pick} · {formatOdds(item.prediction.prediction.odds, language)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromSlip(item.prediction.id)}
                    className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Sázka' : 'Stake'}
                </span>
                <Input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="flex-1 text-right font-mono"
                  min={10}
                  step={language === 'cz' ? 100 : 10}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'cz' ? 'Celkový kurz' : 'Total Odds'}
                </span>
                <span className="font-mono font-bold">{combinedOdds.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {language === 'cz' ? 'Potenciální výhra' : 'Potential Payout'}
                </span>
                <div className="text-right">
                  <div className="font-mono text-lg font-black text-success">
                    {formatCurrency(potentialPayout, language)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'cz' ? 'Čistý zisk' : 'Profit'}: {formatCurrency(profit, language, { showSign: true })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSlip}
                  className="flex-1 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {language === 'cz' ? 'Vymazat' : 'Clear'}
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-primary to-accent"
                  onClick={() => {
                    // TODO: Submit bet
                    alert(language === 'cz' ? 'Funkce brzy dostupná!' : 'Coming soon!');
                  }}
                >
                  {language === 'cz' ? 'Vsadit' : 'Place Bet'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
