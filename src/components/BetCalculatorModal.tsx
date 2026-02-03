import { useState } from 'react';
import { Calculator, X, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatOdds, toDecimalOdds, calculateProfit } from '@/lib/oddsUtils';

interface BetCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  odds: string;
  pick: string;
  confidence?: number;
}

export function BetCalculatorModal({
  isOpen,
  onClose,
  odds,
  pick,
  confidence = 0
}: BetCalculatorModalProps) {
  const { language } = useLanguage();
  const [stake, setStake] = useState('100');
  const [betType, setBetType] = useState<'flat' | 'kelly'>('flat');

  if (!isOpen) return null;

  const decimalOdds = toDecimalOdds(odds);
  const stakeNum = parseFloat(stake) || 0;
  const profit = calculateProfit(stakeNum, odds);
  const totalReturn = stakeNum + profit;
  const roi = stakeNum > 0 ? (profit / stakeNum) * 100 : 0;

  // Kelly Criterion calculation
  const winProb = confidence / 100;
  const kellyFraction = winProb > 0 && decimalOdds > 1 
    ? ((decimalOdds * winProb - 1) / (decimalOdds - 1)) * 100 
    : 0;
  const kellyStake = (kellyFraction / 100) * 1000; // Assuming bankroll of 1000

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <h3 className="font-bold">
                {language === 'cz' ? 'Kalkulačka sázek' : 'Bet Calculator'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Pick Info */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">
                {language === 'cz' ? 'Tip' : 'Pick'}
              </div>
              <div className="font-bold text-lg">{pick}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Kurz:' : 'Odds:'}
                </span>
                <span className="font-mono font-bold">{formatOdds(odds)}</span>
                {confidence > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm">
                      {confidence}% {language === 'cz' ? 'jistota' : 'confidence'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Bet Type Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBetType('flat')}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  betType === 'flat'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                )}
              >
                <div className="font-semibold text-sm">
                  {language === 'cz' ? 'Pevná sázka' : 'Flat Bet'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {language === 'cz' ? 'Stejná částka' : 'Same amount'}
                </div>
              </button>
              <button
                onClick={() => setBetType('kelly')}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  betType === 'kelly'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                )}
              >
                <div className="font-semibold text-sm">
                  {language === 'cz' ? 'Kelly Criterion' : 'Kelly Criterion'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {language === 'cz' ? 'Optimální' : 'Optimal'}
                </div>
              </button>
            </div>

            {/* Stake Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === 'cz' ? 'Výše sázky' : 'Stake Amount'}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="pl-10"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Kelly Suggestion */}
            {betType === 'kelly' && kellyFraction > 0 && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-blue-400 mb-1">
                    {language === 'cz' ? 'Doporučená Kelly sázka' : 'Suggested Kelly Bet'}
                  </div>
                  <div className="text-muted-foreground">
                    {kellyStake.toFixed(0)} {language === 'cz' ? 'Kč' : '$'} ({kellyFraction.toFixed(1)}% {language === 'cz' ? 'bankrollu' : 'of bankroll'})
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
              {/* Profit */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Potenciální zisk' : 'Potential Profit'}
                </span>
                <span className={cn(
                  'text-lg font-bold font-mono',
                  profit > 0 ? 'text-success' : 'text-muted-foreground'
                )}>
                  +{profit.toFixed(0)} {language === 'cz' ? 'Kč' : '$'}
                </span>
              </div>

              {/* Total Return */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Celková návratnost' : 'Total Return'}
                </span>
                <span className="text-lg font-bold font-mono">
                  {totalReturn.toFixed(0)} {language === 'cz' ? 'Kč' : '$'}
                </span>
              </div>

              {/* ROI */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  ROI
                </span>
                <span className={cn(
                  'text-xl font-bold font-mono',
                  roi > 0 ? 'text-success' : 'text-muted-foreground'
                )}>
                  +{roi.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="text-xs text-muted-foreground text-center p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
              {language === 'cz' 
                ? '⚠️ Sázejte odpovědně. Nikdy nesázejte více, než si můžete dovolit ztratit.'
                : '⚠️ Bet responsibly. Never bet more than you can afford to lose.'}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              onClick={onClose}
              className="w-full"
            >
              {language === 'cz' ? 'Zavřít' : 'Close'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
