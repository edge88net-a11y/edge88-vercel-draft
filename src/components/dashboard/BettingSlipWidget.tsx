import { useNavigate } from 'react-router-dom';
import { useSavedPicks } from '@/hooks/useSavedPicks';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSportEmoji } from '@/lib/sportEmoji';
import { toDecimalOdds } from '@/lib/oddsUtils';
import { normalizeConfidence } from '@/lib/confidenceUtils';
import { X, Ticket, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

export function BettingSlipWidget() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { savedPicks, removePick } = useSavedPicks();
  const locale = language === 'cz' ? 'cz' : 'en';

  const activePicks = savedPicks.filter(p => p.prediction.result === 'pending');

  const combinedOdds = activePicks.reduce((acc, pick) => {
    const decimal = toDecimalOdds(pick.prediction.prediction?.odds || '1.00');
    return acc * decimal;
  }, 1);

  const potentialPayout = Math.round(combinedOdds * 1000);
  const animatedPayout = useAnimatedCounter(potentialPayout, { duration: 800 });

  // Sport accent colors for hover
  const getSportAccent = (sport: string) => {
    const s = sport?.toLowerCase() || '';
    if (s.includes('hockey') || s.includes('nhl')) return 'hover:bg-blue-500/10 hover:border-l-blue-500';
    if (s.includes('basket') || s.includes('nba')) return 'hover:bg-orange-500/10 hover:border-l-orange-500';
    if (s.includes('football') || s.includes('nfl')) return 'hover:bg-emerald-500/10 hover:border-l-emerald-500';
    if (s.includes('soccer')) return 'hover:bg-green-500/10 hover:border-l-green-500';
    if (s.includes('baseball') || s.includes('mlb')) return 'hover:bg-red-500/10 hover:border-l-red-500';
    return 'hover:bg-primary/10 hover:border-l-primary';
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 p-5 h-full">
      <h3 className="text-base font-bold mb-4 flex items-center gap-2">
        🎯 {language === 'cz' ? 'Váš tiket' : 'Your Slip'}
        {activePicks.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
            {activePicks.length}
          </span>
        )}
      </h3>
      
      {activePicks.length === 0 ? (
        <div className="text-center py-8">
          {/* Animated bouncing ticket */}
          <div className="animate-ticket-bounce inline-block mb-3">
            <Ticket className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <div className="text-muted-foreground text-sm font-medium">
            {language === 'cz' ? 'Váš tiket je prázdný' : 'Your slip is empty'}
          </div>
          <div className="text-muted-foreground/70 text-xs mt-1 mb-4">
            {language === 'cz' ? 'Tip: Přidejte 3-5 tipů pro optimální výnos' : 'Tip: Add 3-5 picks for optimal returns'}
          </div>
          <Button 
            onClick={() => navigate('/predictions')} 
            className="animate-cta-pulse bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            variant="outline"
          >
            <Target className="h-4 w-4 mr-2" />
            {language === 'cz' ? 'Sestavte svůj první tiket!' : 'Build your first slip!'}
          </Button>
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
                  className={cn(
                    "flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 transition-all group border-l-2 border-l-transparent",
                    getSportAccent(pred.sport)
                  )}
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
                      <span className="text-xs font-mono text-foreground block font-bold">{odds.toFixed(2)}</span>
                      <span className={cn(
                        "text-[10px] font-medium",
                        confidence >= 70 ? "text-success" :
                        confidence >= 55 ? "text-warning" :
                        "text-orange-400"
                      )}>
                        {confidence}%
                      </span>
                    </div>
                    <button 
                      onClick={() => removePick(item.predictionId)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 rounded-full transition-all"
                    >
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {language === 'cz' ? 'Celkový kurz:' : 'Combined odds:'}
              </span>
              <span className="font-bold font-mono text-lg stat-glow-cyan">{combinedOdds.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-muted-foreground">
                {language === 'cz' ? 'Potenciální výnos:' : 'Potential payout:'}
              </span>
              <span className="text-success font-bold text-lg stat-glow-green">
                {language === 'cz' 
                  ? `${Math.round(animatedPayout).toLocaleString('cs-CZ')} Kč`
                  : `$${Math.round(animatedPayout).toLocaleString('en-US')}`
                }
              </span>
            </div>
            
            {/* Confirm CTA */}
            <Button 
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20"
              size="lg"
            >
              🎰 {language === 'cz' ? 'Potvrdit tiket' : 'Confirm Slip'}
            </Button>
            
            <div className="text-[10px] text-muted-foreground/70 mt-2 text-center">
              {language === 'cz' ? 'Při sázce 1 000 Kč' : 'Based on $1,000 stake'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
