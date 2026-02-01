import { Link } from 'react-router-dom';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { TierBadge } from '@/components/TierBadge';

export function ElitePickTeaser() {
  const { language } = useLanguage();

  return (
    <div className="betting-slip relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-yellow-500/10" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-yellow-500/20 blur-[50px]" />

      <div className="relative p-6 sm:p-8 text-center">
        {/* Badge */}
        <TierBadge tier="elite" className="mb-4" />

        {/* Lock icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border border-yellow-500/50 flex items-center justify-center mb-4 shadow-[0_0_30px_hsl(45,100%,50%,0.3)]">
          <Lock className="h-8 w-8 text-yellow-400" />
        </div>

        {/* Text */}
        <h3 className="text-lg font-bold text-foreground mb-2">
          🔒 {language === 'cz' ? 'Elite Tip k dispozici' : 'Elite Pick Available'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {language === 'cz' 
            ? 'Náš tip s nejvyšší důvěrou dne'
            : 'Our highest confidence pick of the day'}
        </p>

        {/* Spots left */}
        <p className="text-xs text-warning mb-4 font-medium">
          ⚡ {language === 'cz' ? 'Zbývají pouze 3 místa tento měsíc' : 'Only 3 spots left this month'}
        </p>

        {/* CTA */}
        <Link to="/pricing">
          <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold gap-2">
            <Zap className="h-4 w-4" />
            {language === 'cz' ? 'Odemknout Elite' : 'Unlock Elite'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
