import { AlertTriangle, Phone, ExternalLink, Heart, Shield, Clock, DollarSign } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ResponsibleGambling() {
  const { language } = useLanguage();

  const helplines = [
    { name: 'Gamblers Anonymous', phone: '1-855-222-5542', url: 'https://www.gamblersanonymous.org' },
    { name: 'National Problem Gambling Helpline', phone: '1-800-522-4700', url: 'https://www.ncpgambling.org' },
    { name: 'GamCare (UK)', phone: '0808 8020 133', url: 'https://www.gamcare.org.uk' },
    { name: 'Gambling Therapy', phone: '', url: 'https://www.gamblingtherapy.org' },
  ];

  const czHelplines = [
    { name: 'Linka pomoci', phone: '800 350 000', url: 'https://www.gambling-help.cz' },
    { name: 'A-klub (Anonymní gambleři)', phone: '', url: 'https://www.aklub.cz' },
  ];

  const displayHelplines = language === 'cz' ? czHelplines : helplines;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Warning Banner */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-8 w-8 text-amber-400 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-amber-400">
                {language === 'cz' ? 'Důležité upozornění' : 'Important Notice'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {language === 'cz'
                  ? 'Sázení může být návykové. Pokud máte problém s hazardem, vyhledejte pomoc.'
                  : 'Gambling can be addictive. If you have a gambling problem, please seek help.'}
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-8">
          {language === 'cz' ? 'Zodpovědné hraní' : 'Responsible Gambling'}
        </h1>

        <div className="prose prose-invert max-w-none space-y-6">
          {/* Key Principles */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">
                  {language === 'cz' ? 'Stanovte si rozpočet' : 'Set a Budget'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'cz'
                  ? 'Nikdy nesázejte více, než si můžete dovolit ztratit. Stanovte si denní, týdenní nebo měsíční limit.'
                  : 'Never bet more than you can afford to lose. Set daily, weekly, or monthly limits.'}
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">
                  {language === 'cz' ? 'Hlídejte si čas' : 'Watch the Time'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'cz'
                  ? 'Stanovte si časové limity pro sázení. Dělejte pravidelné přestávky.'
                  : 'Set time limits for betting. Take regular breaks.'}
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">
                  {language === 'cz' ? 'Sázejte pro zábavu' : 'Bet for Fun'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'cz'
                  ? 'Sázení by mělo být zábava, ne způsob výdělku. Pokud to není zábava, přestaňte.'
                  : 'Betting should be entertainment, not income. If it stops being fun, stop.'}
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">
                  {language === 'cz' ? 'Nehánějte ztráty' : "Don't Chase Losses"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'cz'
                  ? 'Nikdy nezvyšujte sázky, abyste vyrovnali ztráty. Přijměte ztráty jako součást hry.'
                  : 'Never increase bets to recover losses. Accept losses as part of the game.'}
              </p>
            </div>
          </div>

          {/* Warning Signs */}
          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? 'Varovné signály' : 'Warning Signs'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'cz'
                ? 'Pokud rozpoznáte některý z těchto signálů, možná potřebujete pomoc:'
                : 'If you recognize any of these signs, you may need help:'}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{language === 'cz' ? 'Sázíte více, než si můžete dovolit' : "Betting more than you can afford"}</li>
              <li>{language === 'cz' ? 'Sázení narušuje vaše vztahy nebo práci' : 'Betting is affecting relationships or work'}</li>
              <li>{language === 'cz' ? 'Lžete o svých sázkovýchch návycích' : 'Lying about betting habits'}</li>
              <li>{language === 'cz' ? 'Půjčujete si peníze na sázení' : 'Borrowing money to bet'}</li>
              <li>{language === 'cz' ? 'Cítíte úzkost, když nesázíte' : 'Feeling anxious when not betting'}</li>
              <li>{language === 'cz' ? 'Nedokážete přestat, i když chcete' : "Can't stop even when you want to"}</li>
            </ul>
          </section>

          {/* Get Help */}
          <section className="glass-card p-6 border-2 border-success/30 bg-success/5">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-success" />
              {language === 'cz' ? 'Kde získat pomoc' : 'Where to Get Help'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'cz'
                ? 'Pokud vy nebo někdo blízký potřebujete pomoc s problémovým hraním, kontaktujte:'
                : 'If you or someone you know needs help with problem gambling, contact:'}
            </p>
            <div className="space-y-4">
              {displayHelplines.map((helpline) => (
                <div key={helpline.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{helpline.name}</p>
                    {helpline.phone && (
                      <p className="text-sm text-success font-mono">{helpline.phone}</p>
                    )}
                  </div>
                  <a href={helpline.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      {language === 'cz' ? 'Navštívit' : 'Visit'}
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Self-Exclusion */}
          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? 'Sebeomezení' : 'Self-Exclusion'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'cz'
                ? 'Pokud potřebujete přestávku, můžete požádat o dočasné nebo trvalé zablokování účtu. Kontaktujte nás na support@edge88.net.'
                : 'If you need a break, you can request a temporary or permanent account suspension. Contact us at support@edge88.net.'}
            </p>
            <Button variant="outline" className="gap-2">
              {language === 'cz' ? 'Požádat o sebeomezení' : 'Request Self-Exclusion'}
            </Button>
          </section>

          {/* Our Commitment */}
          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? 'Náš závazek' : 'Our Commitment'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Edge88 se zavazuje podporovat zodpovědné hraní. Poskytujeme pouze analýzy a predikce. Neprovozujeme sázkovou kancelář a neusnadňujeme sázení. Doporučujeme všem uživatelům sázet zodpovědně a pouze u licencovaných operátorů.'
                : 'Edge88 is committed to promoting responsible gambling. We provide analysis and predictions only. We do not operate a sportsbook or facilitate betting. We encourage all users to bet responsibly and only with licensed operators.'}
            </p>
          </section>

          <p className="text-sm text-muted-foreground text-center mt-8">
            {language === 'cz' ? '18+ | Sázení může být návykové | Sázejte zodpovědně' : '18+ | Gambling can be addictive | Bet responsibly'}
          </p>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
