import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, X, Zap, Shield, Star, Award, Loader2, ChevronDown, TrendingUp, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricingPlans } from '@/lib/mockData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/hooks/useCheckout';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { isAdminUser } from '@/lib/adminAccess';

const faqs = {
  en: [
    {
      question: 'How does the free plan work?',
      answer: 'The free plan gives you access to 3 predictions per day across basic sports. You\'ll see all picks after games end, and can track your performance over time.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! All paid plans can be cancelled anytime with no questions asked. You\'ll keep access until the end of your billing period.',
    },
    {
      question: 'How accurate are the predictions?',
      answer: 'Our overall accuracy is 73% across all sports, with Lock picks (75%+ confidence) hitting at 81%. All results are publicly tracked and verifiable.',
    },
    {
      question: 'What sports do you cover?',
      answer: 'We cover NFL, NBA, NHL, MLB, Soccer (EPL, La Liga, Champions League), UFC, and prediction markets like Polymarket and Kalshi.',
    },
    {
      question: 'Is there a money-back guarantee?',
      answer: 'Yes! If you\'re not satisfied within the first 7 days, we\'ll give you a full refund. No questions asked.',
    },
  ],
  cz: [
    {
      question: 'Jak funguje bezplatný plán?',
      answer: 'Bezplatný plán vám dává přístup ke 3 tipům denně. Po skončení zápasů uvidíte všechny tipy a můžete sledovat svou výkonnost.',
    },
    {
      question: 'Mohu kdykoliv zrušit?',
      answer: 'Ano! Všechny placené plány lze kdykoliv zrušit bez otázek. Přístup budete mít do konce fakturačního období.',
    },
    {
      question: 'Jak přesné jsou predikce?',
      answer: 'Naše celková přesnost je 73% napříč všemi sporty, tipy s 75%+ jistotou mají úspěšnost 81%. Všechny výsledky jsou veřejně sledovatelné.',
    },
    {
      question: 'Jaké sporty pokrýváte?',
      answer: 'Pokrýváme NFL, NBA, NHL, MLB, fotbal (EPL, La Liga, Liga mistrů), UFC a predikční trhy jako Polymarket a Kalshi.',
    },
    {
      question: 'Je zde garance vrácení peněz?',
      answer: 'Ano! Pokud nebudete spokojeni během prvních 7 dní, vrátíme vám peníze. Bez otázek.',
    },
  ],
};

// Feature comparison for the table
const getFeatureCategories = (lang: 'en' | 'cz') => [
  {
    name: lang === 'cz' ? 'Predikce' : 'Predictions',
    features: [
      { name: lang === 'cz' ? 'Tipů denně' : 'Picks per day', free: '3', starter: '10', pro: lang === 'cz' ? 'Vše' : 'All', elite: lang === 'cz' ? 'Vše + Early' : 'All + Early Access' },
      { name: lang === 'cz' ? 'Plná analýza' : 'Full analysis', free: false, starter: true, pro: true, elite: true },
      { name: lang === 'cz' ? 'Živé predikce' : 'Live predictions', free: false, starter: true, pro: true, elite: true },
    ],
  },
  {
    name: lang === 'cz' ? 'Komunita' : 'Community',
    features: [
      { name: lang === 'cz' ? 'Telegram skupina' : 'Telegram group', free: lang === 'cz' ? 'Pouze free' : 'Free only', starter: 'Basic', pro: 'VIP', elite: 'Elite' },
      { name: lang === 'cz' ? 'Email upozornění' : 'Email alerts', free: false, starter: lang === 'cz' ? 'Denně' : 'Daily', pro: lang === 'cz' ? 'Realtime' : 'Real-time', elite: lang === 'cz' ? 'Realtime' : 'Real-time' },
    ],
  },
  {
    name: lang === 'cz' ? 'Nástroje' : 'Tools',
    features: [
      { name: lang === 'cz' ? 'Sázenkový lístek' : 'Betting slip', free: false, starter: true, pro: true, elite: true },
      { name: lang === 'cz' ? 'Referral bonus' : 'Referral bonus', free: '1 tip', starter: '2 ' + (lang === 'cz' ? 'tipy' : 'tips'), pro: '3 ' + (lang === 'cz' ? 'tipy' : 'tips'), elite: '5 ' + (lang === 'cz' ? 'tipů' : 'tips') },
      { name: lang === 'cz' ? 'Osobní poradce' : 'Personal advisor', free: false, starter: false, pro: false, elite: true },
    ],
  },
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const { checkout, isLoading } = useCheckout();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Simulated upgrade counter
  const [upgradeCount] = useState(() => Math.floor(Math.random() * 20) + 35); // 35-54

  // Handle checkout result from URL
  useEffect(() => {
    const checkoutResult = searchParams.get('checkout');
    if (checkoutResult === 'cancelled') {
      toast({
        title: language === 'cz' ? 'Platba zrušena' : 'Checkout Cancelled',
        description: language === 'cz' ? 'Vaše předplatné nebylo zpracováno.' : 'Your subscription was not processed.',
      });
    }
  }, [searchParams, toast, language]);

  const currentTier = profile?.subscription_tier || 'free';
  const faqList = language === 'cz' ? faqs.cz : faqs.en;
  const featureCategories = getFeatureCategories(language as 'en' | 'cz');

  const handleSubscribe = (planName: string) => {
    const tier = planName.toLowerCase();
    if (tier === currentTier) {
      toast({
        title: language === 'cz' ? 'Aktuální plán' : 'Current Plan',
        description: language === 'cz' ? `Již máte plán ${planName}.` : `You're already on the ${planName} plan.`,
      });
      return;
    }
    checkout(tier);
  };

  const getPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 0;
    return isAnnual ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
  };

  const getPriceCz = (priceUsd: number) => {
    // Approximate conversion: 1 USD = ~23 CZK
    const czk = priceUsd * 23;
    return Math.round(czk / 100) * 100; // Round to nearest 100
  };

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-success mx-auto" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/50 mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  // Admin users see a special notice
  const isAdmin = isAdminUser(user?.email);

  return (
    <div className="pt-12 space-y-12">
      {/* Admin Full Access Notice */}
      {isAdmin && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-500/20 border-2 border-yellow-500/50 p-6 text-center shadow-[0_0_30px_hsl(45,100%,50%,0.2)]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-yellow-400">👑 {language === 'cz' ? 'Admin přístup' : 'Admin Access'}</h2>
              <Crown className="h-6 w-6 text-yellow-400" />
            </div>
            <p className="text-yellow-200/80">
              {language === 'cz' 
                ? 'Máte plný neomezený přístup ke všem funkcím. Žádné předplatné není potřeba.'
                : 'You have full unrestricted access to all features. No subscription needed.'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {language === 'cz' ? 'Vyberte svou ' : 'Choose Your '}<span className="gradient-text">Edge</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {language === 'cz' 
            ? 'Začněte zdarma, upgradujte až budete připraveni na neomezené predikce'
            : 'Start free, upgrade when you\'re ready for unlimited predictions'}
        </p>

        {/* Upgrade counter - hide for admin */}
        {!isAdmin && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary animate-pulse">
            <TrendingUp className="h-4 w-4" />
            <span>🔥 {upgradeCount} {language === 'cz' ? 'lidí upgradovalo tento týden' : 'people upgraded this week'}</span>
          </div>
        )}
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn('text-sm font-medium', !isAnnual && 'text-foreground', isAnnual && 'text-muted-foreground')}>
          {language === 'cz' ? 'Měsíčně' : 'Monthly'}
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={cn(
            'relative h-7 w-14 rounded-full transition-colors',
            isAnnual ? 'bg-primary' : 'bg-muted'
          )}
        >
          <div
            className={cn(
              'absolute top-1 h-5 w-5 rounded-full bg-white transition-all',
              isAnnual ? 'left-8' : 'left-1'
            )}
          />
        </button>
        <span className={cn('text-sm font-medium', isAnnual && 'text-foreground', !isAnnual && 'text-muted-foreground')}>
          {language === 'cz' ? 'Ročně' : 'Annual'}
        </span>
        {isAnnual && (
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {language === 'cz' ? 'Ušetřete 20%' : 'Save 20%'}
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 lg:grid-cols-4">
        {pricingPlans.map((plan, index) => {
          const isPro = plan.name === 'Pro';
          const priceDisplay = language === 'cz' 
            ? `${getPriceCz(getPrice(plan.price)).toLocaleString('cs-CZ')} Kč`
            : `$${getPrice(plan.price)}`;

          return (
            <div
              key={plan.name}
              className={cn(
                'glass-card relative overflow-hidden p-6 transition-all duration-300',
                isPro
                  ? 'border-primary ring-2 ring-primary lg:scale-105 z-10'
                  : 'hover:border-primary/30'
              )}
            >
              {/* Most Popular Badge */}
              {isPro && (
                <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-primary to-accent px-12 py-1.5 text-xs font-bold text-white shadow-lg">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {language === 'cz' ? 'Nejoblíbenější' : 'Most Popular'}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.name === 'Elite' && <Award className="h-5 w-5 text-yellow-400" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold">{priceDisplay}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/{language === 'cz' ? 'měsíc' : plan.period}</span>
                  )}
                </div>
                {isAnnual && plan.price > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {language === 'cz' 
                      ? `Účtováno ročně (${(getPriceCz(getPrice(plan.price)) * 12).toLocaleString('cs-CZ')} Kč/rok)`
                      : `Billed annually ($${getPrice(plan.price) * 12}/year)`}
                  </p>
                )}
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.price === 0 ? (
                <Link to="/signup">
                  <Button
                    className="w-full"
                    variant="outline"
                    size="lg"
                  >
                    {user ? (language === 'cz' ? 'Aktuální plán' : 'Current Plan') : plan.cta}
                  </Button>
                </Link>
              ) : (
                <Button
                  className={cn('w-full', isPro && 'btn-gradient')}
                  variant={isPro ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={isLoading === plan.name.toLowerCase() || currentTier === plan.name.toLowerCase()}
                >
                  {isLoading === plan.name.toLowerCase() ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : currentTier === plan.name.toLowerCase() ? (
                    language === 'cz' ? 'Aktuální plán' : 'Current Plan'
                  ) : (
                    language === 'cz' ? `Vybrat ${plan.name}` : `Subscribe to ${plan.name}`
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Guarantees */}
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <div className="flex items-center gap-2 rounded-full bg-success/10 border border-success/20 px-4 py-2">
          <Shield className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-success">
            {language === 'cz' ? '7denní garance vrácení peněz' : '7-day money-back guarantee'}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {language === 'cz' ? 'Zrušte kdykoliv' : 'Cancel anytime'}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2">
          <Users className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">
            10,000+ {language === 'cz' ? 'aktivních uživatelů' : 'active users'}
          </span>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div>
        <h2 className="text-center text-2xl font-bold mb-8">
          {language === 'cz' ? 'Porovnání funkcí' : 'Feature Comparison'}
        </h2>
        
        <div className="glass-card overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium">{language === 'cz' ? 'Funkce' : 'Features'}</th>
                <th className="p-4 text-center font-medium">Free</th>
                <th className="p-4 text-center font-medium">Basic</th>
                <th className="p-4 text-center font-medium bg-primary/5">
                  <div className="flex items-center justify-center gap-1">
                    Pro
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                </th>
                <th className="p-4 text-center font-medium">Elite</th>
              </tr>
            </thead>
            <tbody>
              {featureCategories.map((category) => (
                <React.Fragment key={category.name}>
                  <tr className="bg-muted/30">
                    <td colSpan={5} className="p-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {category.name}
                    </td>
                  </tr>
                  {category.features.map((feature) => (
                    <tr key={feature.name} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-4 text-sm">{feature.name}</td>
                      <td className="p-4 text-center">{renderFeatureValue(feature.free)}</td>
                      <td className="p-4 text-center">{renderFeatureValue(feature.starter)}</td>
                      <td className="p-4 text-center bg-primary/5">{renderFeatureValue(feature.pro)}</td>
                      <td className="p-4 text-center">{renderFeatureValue(feature.elite)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-center text-2xl font-bold">
          {language === 'cz' ? 'Časté dotazy' : 'Frequently Asked Questions'}
        </h2>

        <div className="mx-auto mt-8 max-w-3xl divide-y divide-border glass-card overflow-hidden">
          {faqList.map((faq, index) => (
            <div key={index} className="p-4">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-primary transition-transform flex-shrink-0 ml-4',
                    expandedFaq === index && 'rotate-180'
                  )}
                />
              </button>
              {expandedFaq === index && (
                <p className="mt-3 animate-fade-in text-muted-foreground pr-8">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="glass-card p-8 text-center bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
        <h2 className="text-2xl font-bold">
          {language === 'cz' ? 'Připraveni na výhry?' : 'Ready to Get Your Edge?'}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {language === 'cz' 
            ? 'Přidejte se k 10 000+ analytiků, kteří vyhrávají s AI predikcemi'
            : 'Join 10,000+ analysts winning with AI-powered predictions'}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button size="xl" className="btn-gradient gap-2">
              <Zap className="h-5 w-5" />
              {language === 'cz' ? 'Začít zdarma' : 'Start Free Trial'}
            </Button>
          </Link>
          <Link to="/predictions">
            <Button size="xl" variant="outline">
              {language === 'cz' ? 'Zobrazit živé tipy' : 'View Live Picks'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;