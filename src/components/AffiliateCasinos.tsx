import { ExternalLink, Gift, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAffiliateClicks } from '@/hooks/useAffiliateClicks';

interface Casino {
  id: string;
  name: string;
  bonus: { en: string; cz: string };
  logo: string;
  affiliateUrl: string;
  badge?: string;
}

const CASINOS: Casino[] = [
  {
    id: 'tipsport',
    name: 'Tipsport',
    bonus: { en: 'Get 500 Kč free bet', cz: 'Získejte 500 Kč sázku zdarma' },
    logo: '🎰',
    affiliateUrl: '/affiliate/tipsport',
    badge: '🇨🇿',
  },
  {
    id: 'fortuna',
    name: 'Fortuna',
    bonus: { en: '150% first deposit bonus', cz: '150% bonus na první vklad' },
    logo: '🏆',
    affiliateUrl: '/affiliate/fortuna',
    badge: '🇨🇿',
  },
  {
    id: 'betano',
    name: 'Betano',
    bonus: { en: '100 Kč no deposit', cz: '100 Kč bez vkladu' },
    logo: '⚽',
    affiliateUrl: '/affiliate/betano',
  },
  {
    id: 'bet365',
    name: 'bet365',
    bonus: { en: 'Up to $30 in free bets', cz: 'Až $30 v sázkách zdarma' },
    logo: '🌍',
    affiliateUrl: '/affiliate/bet365',
    badge: '🌐',
  },
];

export function AffiliateCasinos() {
  const { language } = useLanguage();
  const { trackClick } = useAffiliateClicks();

  const handleClick = (casino: Casino) => {
    trackClick(casino.name);
    // In production, this would redirect to actual affiliate link
    window.open(casino.affiliateUrl, '_blank');
  };

  return (
    <section className="py-16 border-y border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-4">
            <Gift className="h-4 w-4" />
            <span>{language === 'cz' ? 'Kde sázet' : 'Where to Bet'}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {language === 'cz' ? 'Naši partneři' : 'Our Partners'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {language === 'cz' 
              ? 'Exkluzivní bonusy pro Edge88 uživatele'
              : 'Exclusive bonuses for Edge88 users'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CASINOS.map((casino) => (
            <button
              key={casino.id}
              onClick={() => handleClick(casino)}
              className="glass-card p-6 text-left transition-all duration-300 hover:scale-105 hover:border-primary/50 group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{casino.logo}</span>
                {casino.badge && (
                  <span className="text-lg">{casino.badge}</span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                {casino.name}
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </h3>
              
              <p className="text-sm text-success font-medium mb-3">
                {language === 'cz' ? casino.bonus.cz : casino.bonus.en}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>🤝 {language === 'cz' ? 'Oficiální partner' : 'Official Partner'}</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          18+ | {language === 'cz' 
            ? 'Hazardní hry jsou rizikové. Hrajte zodpovědně.'
            : 'Gambling involves risk. Play responsibly.'}
        </p>
      </div>
    </section>
  );
}
