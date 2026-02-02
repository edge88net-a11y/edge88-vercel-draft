import { useNavigate } from 'react-router-dom';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji } from '@/lib/sportEmoji';
import { toDecimalOdds } from '@/lib/oddsUtils';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BettingSlipWidget() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { savedPicks, removePick } = useSavedPicks();
  const locale = language === 'cz' ? 'cz' : 'en';

  // Filter to only active picks (pending results)
  const activePicks = savedPicks.filter(p => p.prediction.result === 'pending');

  // Calculate combined odds (parlay)
  const combinedOdds = activePicks.reduce((acc, pick) => {
    const decimal = toDecimalOdds(pick.prediction.prediction?.odds || '1.00');
    return acc * decimal;
  }, 1);

  const potentialPayout = Math.round(combinedOdds * 1000);

  return (
    <div className="rounded-xl border border-border bg-card/50 p-5 h-full">
      <h3 className="text-base font-bold mb-4 flex items-center gap-2">
        🎯 {language === 'cz' ? 'Váš tiket' : 'Your Slip'}
        {activePicks.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {activePicks.length}
          </span>
        )}
      </h3>
      
      {activePicks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🎫</div>
          <div className="text-muted-foreground text-sm">
            {language === 'cz' ? 'Váš tiket je prázdný' : 'Your slip is empty'}
          </div>
          <div className="text-muted-foreground/70 text-xs mt-1">
            {language === 'cz' ? 'Přidejte tipy z dnešních predikcí' : 'Add picks from today\'s predictions'}
          </div>
          <button 
            onClick={() => navigate('/predictions')} 
            className="mt-3 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {language === 'cz' ? 'Prohlédnout predikce →' : 'Browse predictions →'}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-hide">
            {activePicks.map(item => {
              const pred = item.prediction;
              const confidence = normalizeConfidence(pred.confidence);
              const odds = toDecimalOdds(pred.prediction?.odds || '1.00');
              
              return (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-base shrink-0">{getSportEmoji(pred.sport)}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {pred.prediction?.pick || pred.homeTeam}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {pred.awayTeam} @ {pred.homeTeam}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-mono text-foreground block">{odds.toFixed(2)}</span>
                      <span className={cn(
                        "text-[10px]",
                        confidence >= 70 ? "text-success" :
                        confidence >= 55 ? "text-warning" :
                        "text-orange-400"
                      )}>
                        {confidence}%
                      </span>
                    </div>
                    <button 
                      onClick={() => removePick(item.predictionId)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                    >
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                {language === 'cz' ? 'Celkový kurz:' : 'Combined odds:'}
              </span>
              <span className="font-bold font-mono">{combinedOdds.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'cz' ? 'Potenciální výnos:' : 'Potential payout:'}
              </span>
              <span className="text-success font-bold">
                {language === 'cz' 
                  ? `${potentialPayout.toLocaleString('cs-CZ')} Kč`
                  : `$${potentialPayout.toLocaleString('en-US')}`
                }
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground/70 mt-2 text-center">
              {language === 'cz' ? 'Při sázce 1 000 Kč' : 'Based on $1,000 stake'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
