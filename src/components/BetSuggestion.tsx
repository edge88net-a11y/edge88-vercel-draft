import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface BetSuggestionProps {
  odds: string;
  confidence: number;
  className?: string;
}

export function BetSuggestion({ odds, confidence, className }: BetSuggestionProps) {
  const { language } = useLanguage();

  // Calculate suggested bet based on confidence
  const baseBet = 500;
  const suggestedBet = confidence >= 75 ? baseBet * 2 : confidence >= 65 ? baseBet : baseBet * 0.5;

  // Calculate potential profit
  const numOdds = parseInt(odds.replace('+', ''));
  const decimalOdds = numOdds > 0 ? (numOdds / 100) + 1 : (100 / Math.abs(numOdds)) + 1;
  const potentialProfit = Math.round(suggestedBet * (decimalOdds - 1));

  const formatCurrency = (amount: number) => {
    if (language === 'cz') {
      return `${amount.toLocaleString('cs-CZ')} Kč`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  return (
    <div className={cn(
      'flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border text-xs',
      className
    )}>
      <span className="text-muted-foreground">
        💡 {language === 'cz' ? 'Doporučená sázka:' : 'Suggested bet:'}
      </span>
      <span className="font-mono font-bold">
        {formatCurrency(suggestedBet)}{' '}
        <span className="text-success">→ +{formatCurrency(potentialProfit)}</span>
      </span>
    </div>
  );
}
