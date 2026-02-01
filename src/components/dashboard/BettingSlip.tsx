import { Link } from 'react-router-dom';
import { Receipt, X, ArrowRight, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { formatCurrency, formatOdds, toDecimalOdds } from '@/lib/oddsUtils';
import { getSportEmoji } from '@/lib/sportEmoji';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function BettingSlip() {
  const { language } = useLanguage();
  const { savedPicks, removePick } = useSavedPicks();
  const locale = language === 'cz' ? 'cz' : 'en';
  
  const pendingPicks = savedPicks.filter(p => p.prediction.result === 'pending');
  const stake = 1000; // Base stake in Kč

  // Calculate combined odds
  const combinedOdds = pendingPicks.reduce((acc, pick) => {
    const odds = toDecimalOdds(pick.prediction.prediction.odds);
    return acc * odds;
  }, 1);

  const potentialPayout = stake * combinedOdds;

  if (pendingPicks.length === 0) {
    return (
      <div className="glass-card p-4 border-dashed border-2 border-muted-foreground/20">
        <div className="text-center py-6">
          <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto mb-3">
            <Receipt className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-sm mb-1">
            🎯 {language === 'cz' ? 'Váš sázkový tiket' : 'Your Betting Slip'}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {language === 'cz' 
              ? 'Přidejte tipy kliknutím na "Sledovat"' 
              : 'Add picks by clicking "Follow"'
            }
          </p>
          <Link to="/predictions">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {language === 'cz' ? 'Prohlédnout tipy' : 'Browse Picks'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-border p-3 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm">
            🎯 {language === 'cz' ? 'Váš tiket' : 'Your Slip'}
          </h3>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
            {pendingPicks.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
        {pendingPicks.map((pick) => (
          <div key={pick.id} className="p-3 hover:bg-muted/30 transition-colors group">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{getSportEmoji(pick.prediction.sport || 'Sports')}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {pick.prediction.awayTeam} @ {pick.prediction.homeTeam}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">
                    {pick.prediction.prediction.pick}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @ {formatOdds(pick.prediction.prediction.odds, locale)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removePick(pick.predictionId)}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-border p-3 space-y-2 bg-muted/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {language === 'cz' ? 'Celkový kurz' : 'Total Odds'}
          </span>
          <span className="font-mono font-bold text-primary">
            {formatOdds(combinedOdds, locale)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {language === 'cz' ? 'Sázka' : 'Stake'}
          </span>
          <span className="font-mono">
            {formatCurrency(stake, locale)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs font-medium">
            {language === 'cz' ? 'Potenciální výnos' : 'Potential Payout'}
          </span>
          <span className={cn(
            "font-mono font-bold",
            potentialPayout > stake * 3 ? "text-success" : "text-foreground"
          )}>
            {formatCurrency(potentialPayout, locale)}
          </span>
        </div>
      </div>

      <div className="p-3 pt-0">
        <Link to="/saved-picks" className="block">
          <Button size="sm" className="w-full gap-1.5">
            {language === 'cz' ? 'Zobrazit celý tiket' : 'View Full Slip'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
