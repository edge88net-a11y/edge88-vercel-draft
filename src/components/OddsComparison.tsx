import { useState } from 'react';
import { DollarSign, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookmakerOdds } from '@/hooks/usePredictions';

export type OddsFormat = 'american' | 'decimal' | 'fractional';
export type CountryFilter = 'all' | 'cz' | 'us';

interface OddsComparisonProps {
  bookmakerOdds: BookmakerOdds[];
  oddsFormat?: OddsFormat;
  onFormatChange?: (format: OddsFormat) => void;
  betAmount?: number;
  className?: string;
}

// Bookmaker configurations with logos and country
const BOOKMAKER_CONFIG: Record<string, { logo: string; country: 'cz' | 'us' | 'global'; url: string }> = {
  // Czech bookmakers
  tipsport: { logo: '🎰', country: 'cz', url: 'https://tipsport.cz' },
  fortuna: { logo: '🍀', country: 'cz', url: 'https://fortuna.cz' },
  betano: { logo: '⚡', country: 'cz', url: 'https://betano.cz' },
  chance: { logo: '🎲', country: 'cz', url: 'https://chance.cz' },
  // US bookmakers
  draftkings: { logo: '👑', country: 'us', url: 'https://draftkings.com' },
  fanduel: { logo: '🏈', country: 'us', url: 'https://fanduel.com' },
  betmgm: { logo: '🦁', country: 'us', url: 'https://betmgm.com' },
  bet365: { logo: '🌐', country: 'global', url: 'https://bet365.com' },
  prizepicks: { logo: '🏆', country: 'us', url: 'https://prizepicks.com' },
  polymarket: { logo: '📊', country: 'us', url: 'https://polymarket.com' },
  kalshi: { logo: '📈', country: 'us', url: 'https://kalshi.com' },
  // Fallback
  betrivers: { logo: '🌊', country: 'us', url: 'https://betrivers.com' },
  caesars: { logo: '🏛️', country: 'us', url: 'https://caesars.com' },
};

// Convert American odds to other formats
function convertOdds(americanOdds: string, format: OddsFormat): string {
  const num = parseInt(americanOdds.replace('+', ''));
  if (isNaN(num)) return americanOdds;
  
  switch (format) {
    case 'american':
      return num > 0 ? `+${num}` : String(num);
    case 'decimal': {
      const decimal = num > 0 
        ? (num / 100) + 1 
        : (100 / Math.abs(num)) + 1;
      return decimal.toFixed(2);
    }
    case 'fractional': {
      const dec = num > 0 
        ? num / 100 
        : 100 / Math.abs(num);
      // Simplify to common fractions
      const numerator = Math.round(dec * 100);
      const denominator = 100;
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(numerator, denominator);
      return `${numerator / divisor}/${denominator / divisor}`;
    }
    default:
      return americanOdds;
  }
}

// Calculate potential payout
function calculatePayout(americanOdds: string, betAmount: number): number {
  const num = parseInt(americanOdds.replace('+', ''));
  if (isNaN(num) || betAmount <= 0) return 0;
  
  if (num > 0) {
    return betAmount * (num / 100) + betAmount;
  } else {
    return betAmount * (100 / Math.abs(num)) + betAmount;
  }
}

// Parse odds value for comparison
function parseOddsValue(odds: string): number {
  const num = parseInt(odds.replace('+', ''));
  if (isNaN(num)) return 0;
  return num > 0 ? 100 + num : 100 + (100 / Math.abs(num)) * 100;
}

export function OddsComparison({ 
  bookmakerOdds, 
  oddsFormat = 'american',
  onFormatChange,
  betAmount = 100,
  className 
}: OddsComparisonProps) {
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('all');
  const [localFormat, setLocalFormat] = useState<OddsFormat>(oddsFormat);
  const { language } = useLanguage();

  const format = localFormat;
  const handleFormatChange = (f: OddsFormat) => {
    setLocalFormat(f);
    onFormatChange?.(f);
  };

  // Deduplicate and normalize bookmaker names
  const normalizedOdds = bookmakerOdds.reduce<BookmakerOdds[]>((acc, curr) => {
    const normalizedName = curr.bookmaker.toLowerCase().replace(/[^a-z0-9]/g, '');
    const exists = acc.find(o => 
      o.bookmaker.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedName
    );
    if (!exists) {
      acc.push(curr);
    }
    return acc;
  }, []);

  // Filter by country
  const filteredOdds = normalizedOdds.filter(bk => {
    if (countryFilter === 'all') return true;
    const normalizedName = bk.bookmaker.toLowerCase().replace(/[^a-z0-9]/g, '');
    const config = BOOKMAKER_CONFIG[normalizedName];
    if (!config) return countryFilter === 'us'; // Default to US if unknown
    if (countryFilter === 'cz') return config.country === 'cz';
    if (countryFilter === 'us') return config.country === 'us' || config.country === 'global';
    return true;
  });

  // Find best odds
  const bestOddsIndex = filteredOdds.reduce((best, curr, idx, arr) => {
    const currValue = parseOddsValue(curr.odds);
    const bestValue = parseOddsValue(arr[best].odds);
    return currValue > bestValue ? idx : best;
  }, 0);

  const formatLabels = {
    american: language === 'cz' ? 'US' : 'American',
    decimal: language === 'cz' ? 'Desetinné' : 'Decimal',
    fractional: language === 'cz' ? 'Zlomkové' : 'Fractional',
  };

  return (
    <div className={cn('space-y-3 sm:space-y-4', className)}>
      {/* Country Filter Tabs */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5 overflow-x-auto">
          <button
            onClick={() => setCountryFilter('all')}
            className={cn(
              'rounded-md px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[36px]',
              countryFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            🌍 {language === 'cz' ? 'Vše' : 'All'}
          </button>
          <button
            onClick={() => setCountryFilter('cz')}
            className={cn(
              'rounded-md px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[36px]',
              countryFilter === 'cz'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            🇨🇿 CZ
          </button>
          <button
            onClick={() => setCountryFilter('us')}
            className={cn(
              'rounded-md px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[36px]',
              countryFilter === 'us'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            🇺🇸 US
          </button>
        </div>

        {/* Odds Format Toggle */}
        <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs overflow-x-auto">
          {(['american', 'decimal', 'fractional'] as OddsFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFormatChange(f)}
              className={cn(
                'rounded px-1.5 sm:px-2 py-1 transition-all whitespace-nowrap min-h-[32px]',
                format === f
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {formatLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Odds Table */}
      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <table className="w-full min-w-[320px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 sm:pb-3 text-left text-[10px] sm:text-sm font-medium text-muted-foreground">
                {language === 'cz' ? 'Sázkovka' : 'Book'}
              </th>
              <th className="pb-2 sm:pb-3 text-right text-[10px] sm:text-sm font-medium text-muted-foreground">
                {language === 'cz' ? 'Kurz' : 'Odds'}
              </th>
              <th className="pb-2 sm:pb-3 text-right text-[10px] sm:text-sm font-medium text-muted-foreground">
                <span className="hidden sm:inline">{language === 'cz' ? 'Výplata' : 'Payout'}</span>
                <span className="sm:hidden">$</span>
              </th>
              <th className="pb-2 sm:pb-3 text-right text-[10px] sm:text-sm font-medium text-muted-foreground w-16 sm:w-auto">
                {language === 'cz' ? '' : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOdds.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground">
                  {language === 'cz' ? 'Žádné kurzy' : 'No odds available'}
                </td>
              </tr>
            ) : (
              filteredOdds.map((bk, idx) => {
                const normalizedName = bk.bookmaker.toLowerCase().replace(/[^a-z0-9]/g, '');
                const config = BOOKMAKER_CONFIG[normalizedName] || { logo: '📌', country: 'us', url: '#' };
                const isBest = idx === bestOddsIndex;
                const payout = calculatePayout(bk.odds, betAmount);

                return (
                  <tr 
                    key={`${bk.bookmaker}-${idx}`} 
                    className={cn(
                      'border-b border-border/50 transition-colors',
                      isBest && 'bg-success/5'
                    )}
                  >
                    <td className="py-2 sm:py-3">
                      <a 
                        href={config.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 sm:gap-2 hover:text-primary transition-colors min-h-[36px]"
                      >
                        <span className="text-base sm:text-lg">{config.logo}</span>
                        <span className="font-medium capitalize text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{bk.bookmaker}</span>
                        <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-50 shrink-0 hidden sm:block" />
                      </a>
                    </td>
                    <td className={cn(
                      'py-2 sm:py-3 text-right font-mono text-xs sm:text-sm font-bold',
                      isBest && 'text-success'
                    )}>
                      {convertOdds(bk.odds, format)}
                    </td>
                    <td className={cn(
                      'py-2 sm:py-3 text-right font-mono text-xs sm:text-sm',
                      isBest && 'text-success'
                    )}>
                      ${payout.toFixed(0)}
                    </td>
                    <td className="py-2 sm:py-3 text-right">
                      {isBest && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-success/20 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-success">
                          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span className="hidden sm:inline">{language === 'cz' ? 'Best' : 'Best'}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bankroll Calculator Note */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5 sm:p-3 text-[10px] sm:text-sm">
        <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
        <span className="text-muted-foreground">
          {language === 'cz' 
            ? `Výplaty pro $${betAmount}. Best = nejlepší.`
            : `Payouts for $${betAmount} bet. Best value highlighted.`
          }
        </span>
      </div>
    </div>
  );
}
