import { useState } from 'react';
import { Copy, Check, Users, Gift, Trophy, Share2, Flame } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Referral = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { referralStats, leaderboard, isLoading } = useReferrals();
  const [copied, setCopied] = useState(false);

  const referralUrl = `edge88.net/ref/${referralStats?.referralCode || 'LOADING'}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${referralUrl}`);
      setCopied(true);
      toast({
        title: language === 'cz' ? 'Zkopírováno!' : 'Copied!',
        description: language === 'cz' ? 'Odkaz byl zkopírován do schránky' : 'Link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Edge88 - AI Sports Predictions',
          text: language === 'cz' 
            ? 'Připoj se ke mně na Edge88 a získej AI tipy na sázky zdarma!'
            : 'Join me on Edge88 and get free AI betting tips!',
          url: `https://${referralUrl}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
          <div className="glass-card p-12 text-center">
            <Gift className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {language === 'cz' ? 'Pozvi přátele, získej tipy zdarma' : 'Invite Friends, Earn Free Tips'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'cz' 
                ? 'Přihlas se pro získání svého referral kódu'
                : 'Sign in to get your referral code'}
            </p>
            <Link to="/signup">
              <Button className="btn-gradient">
                {language === 'cz' ? 'Vytvořit účet zdarma' : 'Create Free Account'}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-4">
            <Gift className="h-4 w-4" />
            <span>{language === 'cz' ? 'Referral program' : 'Referral Program'}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {language === 'cz' ? 'Pozvi přátele, získej' : 'Invite Friends, Earn'}
            <span className="gradient-text"> {language === 'cz' ? 'ZDARMA tipy' : 'FREE Tips'}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            {language === 'cz' 
              ? 'Za každého přítele, který se zaregistruje s tvým kódem, získáš 2 ZDARMA premium tipy'
              : 'For every friend who signs up with your code, you get 2 FREE premium tips'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main referral card */}
          <div className="lg:col-span-2 glass-card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              {language === 'cz' ? 'Tvůj referral odkaz' : 'Your Referral Link'}
            </h2>

            <div className="flex gap-2 mb-8">
              <Input
                value={referralUrl}
                readOnly
                className="font-mono text-sm bg-muted"
              />
              <Button onClick={handleCopy} variant="outline" className="gap-2 shrink-0">
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                {copied 
                  ? (language === 'cz' ? 'Zkopírováno' : 'Copied')
                  : (language === 'cz' ? 'Kopírovat' : 'Copy')}
              </Button>
              <Button onClick={handleShare} className="btn-gradient gap-2 shrink-0">
                <Share2 className="h-4 w-4" />
                {language === 'cz' ? 'Sdílet' : 'Share'}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="font-mono text-3xl font-bold text-foreground">
                  {referralStats?.totalReferred || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Pozvaní přátelé' : 'Friends Invited'}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-center">
                <Gift className="h-8 w-8 mx-auto text-success mb-2" />
                <div className="font-mono text-3xl font-bold text-success">
                  {referralStats?.tipsEarned || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Tipů získáno' : 'Tips Earned'}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
                <Flame className="h-8 w-8 mx-auto text-orange-400 mb-2" />
                <div className="font-mono text-3xl font-bold text-foreground">
                  {referralStats?.pendingReferrals || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Čekající' : 'Pending'}
                </p>
              </div>
            </div>

            {/* How it works */}
            <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="font-bold mb-4">{language === 'cz' ? 'Jak to funguje' : 'How It Works'}</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                  <span>{language === 'cz' ? 'Sdílej svůj referral odkaz s přáteli' : 'Share your referral link with friends'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                  <span>{language === 'cz' ? 'Přítel se zaregistruje přes tvůj odkaz' : 'Friend signs up using your link'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                  <span>{language === 'cz' ? 'Oba získáte 2 premium tipy ZDARMA!' : 'You both get 2 premium tips FREE!'}</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              {language === 'cz' ? 'Top referreři' : 'Top Referrers'}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {language === 'cz' ? 'Tento měsíc' : 'This Month'}
            </p>

            <div className="space-y-3">
              {leaderboard?.map((user, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    user.name === 'You' 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'bg-muted/50'
                  }`}
                >
                  <span className={`text-lg font-bold ${
                    index === 0 ? 'text-warning' : 
                    index === 1 ? 'text-muted-foreground' : 
                    index === 2 ? 'text-orange-600' : 'text-muted-foreground'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${user.rank}`}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.referrals} {language === 'cz' ? 'pozvaných' : 'referrals'}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-success">
                    +{user.tips} {language === 'cz' ? 'tipů' : 'tips'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tier comparison */}
        <div className="mt-10 glass-card p-8 text-center">
          <h3 className="text-xl font-bold mb-4">
            {language === 'cz' ? 'Porovnání úrovní' : 'Tier Comparison'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {language === 'cz' 
              ? 'Free uživatelé vidí 3 tipy denně. Elite vidí VŠECH 20+ tipů s kompletní analýzou.'
              : 'Free users see 3 picks/day. Elite sees ALL 20+ picks with full analysis.'}
          </p>
          <Link to="/pricing">
            <Button className="btn-gradient">
              {language === 'cz' ? 'Zobrazit plány' : 'View Plans'}
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Referral;
