import { useState } from 'react';
import { Calculator, DollarSign, Coins } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookmakerOdds } from '@/hooks/usePredictions';
import { toDecimalOdds, formatOdds, formatCurrency, calculateProfit, calculatePayout } from '@/lib/oddsUtils';

interface BankrollCalculatorProps {
  bookmakerOdds: BookmakerOdds[];
  className?: string;
}

export function BankrollCalculator({ bookmakerOdds, className }: BankrollCalculatorProps) {
  const [betAmount, setBetAmount] = useState<number>(1000);
  const { language } = useLanguage();

  // Find best odds (highest decimal value)
  const bestOdds = bookmakerOdds.reduce((best, curr) => {
    const currValue = toDecimalOdds(curr.odds);
    const bestValue = toDecimalOdds(best.odds);
    return currValue > bestValue ? curr : best;
  }, bookmakerOdds[0]);

  const bestPayout = calculatePayout(bestOdds?.odds || '1.85', betAmount);
  const bestProfit = calculateProfit(bestOdds?.odds || '1.85', betAmount);

  return (
    <div className={cn('glass-card p-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">
          {language === 'cz' ? 'Kalkulačka sázek' : 'Bankroll Calculator'}
        </h4>
      </div>

      {/* Bet Amount Input */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground mb-1.5 block">
          {language === 'cz' ? 'Výše sázky (Kč)' : 'Bet Amount ($)'}
        </label>
        <div className="relative">
          {language === 'cz' ? (
            <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          ) : (
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
            className="pl-9 font-mono"
            placeholder={language === 'cz' ? '1000' : '100'}
          />
        </div>
      </div>

      {/* Payout Grid */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground mb-2">
          {language === 'cz' ? 'Potenciální výplaty:' : 'Potential Payouts:'}
        </div>
        
        <div className="grid gap-2">
          {bookmakerOdds.slice(0, 4).map((bk, idx) => {
            const payout = calculatePayout(bk.odds, betAmount);
            const profit = calculateProfit(bk.odds, betAmount);
            const isBest = bk.bookmaker === bestOdds?.bookmaker;

            return (
              <div 
                key={`${bk.bookmaker}-${idx}`}
                className={cn(
                  'flex items-center justify-between rounded-lg p-2',
                  isBest ? 'bg-success/10 ring-1 ring-success/30' : 'bg-muted/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-medium capitalize',
                    isBest && 'text-success'
                  )}>
                    {bk.bookmaker}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ({formatOdds(bk.odds, language)})
                  </span>
                </div>
                <div className="text-right">
                  <div className={cn(
                    'font-mono text-sm font-bold',
                    isBest && 'text-success'
                  )}>
                    {formatCurrency(payout, language)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(profit, language, { showSign: true })} {language === 'cz' ? 'zisk' : 'profit'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best Value Highlight */}
      {bestOdds && (
        <div className="mt-4 rounded-lg bg-gradient-to-r from-success/10 to-success/5 border border-success/20 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">
                {language === 'cz' ? 'Nejlepší hodnota' : 'Best Value'}
              </div>
              <div className="font-medium capitalize">
                {bestOdds.bookmaker} <span className="text-xs text-muted-foreground">({formatOdds(bestOdds.odds, language)})</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-success">
                {formatCurrency(bestPayout, language)}
              </div>
              <div className="text-xs text-success">
                {formatCurrency(bestProfit, language, { showSign: true })} {language === 'cz' ? 'zisk' : 'profit'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
