import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, X, Zap, Shield, Star, Award, Loader2, ChevronDown, TrendingUp, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricingPlans, PricingPlan } from '@/lib/mockData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/hooks/useCheckout';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { isAdminUser } from '@/lib/adminAccess';
import { SEOHead } from '@/components/SEOHead';

const faqs = {
  en: [
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
    {
      question: 'What\'s included in annual billing?',
      answer: 'Annual billing saves you up to 30% compared to monthly. You get the same features with significant savings.',
    },
  ],
  cz: [
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
    {
      question: 'Co zahrnuje roční platba?',
      answer: 'Roční platba šetří až 30% oproti měsíční. Získáte stejné funkce s výraznou úsporou.',
    },
  ],
};

// Feature comparison for the table
const getFeatureCategories = (lang: 'en' | 'cz') => [
  {
    name: lang === 'cz' ? 'Predikce' : 'Predictions',
    features: [
      { name: lang === 'cz' ? 'Tipů denně' : 'Picks per day', starter: '10', pro: lang === 'cz' ? 'Neomezeno' : 'Unlimited', elite: lang === 'cz' ? 'Neomezeno + Early' : 'Unlimited + Early' },
      { name: lang === 'cz' ? 'Plná analýza' : 'Full analysis', starter: true, pro: true, elite: true },
      { name: lang === 'cz' ? 'Živé predikce' : 'Live predictions', starter: true, pro: true, elite: true },
      { name: lang === 'cz' ? 'Všechny sporty' : 'All sports', starter: false, pro: true, elite: true },
    ],
  },
  {
    name: lang === 'cz' ? 'Komunita' : 'Community',
    features: [
      { name: lang === 'cz' ? 'Telegram skupina' : 'Telegram group', starter: 'Basic', pro: 'VIP', elite: 'Elite' },
      { name: lang === 'cz' ? 'Email upozornění' : 'Email alerts', starter: lang === 'cz' ? 'Denně' : 'Daily', pro: lang === 'cz' ? 'Realtime' : 'Real-time', elite: lang === 'cz' ? 'Realtime' : 'Real-time' },
      { name: 'Discord', starter: false, pro: false, elite: true },
    ],
  },
  {
    name: lang === 'cz' ? 'Nástroje' : 'Tools',
    features: [
      { name: lang === 'cz' ? 'Sázenkový lístek' : 'Betting slip', starter: true, pro: true, elite: true },
      { name: lang === 'cz' ? 'Export dat' : 'Export data', starter: false, pro: true, elite: true },
      { name: lang === 'cz' ? 'Vlastní model' : 'Custom model', starter: false, pro: false, elite: true },
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
  const [upgradeCount] = useState(() => Math.floor(Math.random() * 20) + 35);

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

  const currentTier = profile?.subscription_tier || '';
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

  const formatPrice = (plan: PricingPlan) => {
    if (language === 'cz') {
      const price = isAnnual ? plan.annualPriceCzk : plan.priceCzk;
      return `${price.toLocaleString('cs-CZ')} Kč`;
    }
    const price = isAnnual ? plan.annualPriceUsd : plan.priceUsd;
    return `$${price}`;
  };

  const formatAnnualTotal = (plan: PricingPlan) => {
    if (language === 'cz') {
      const total = plan.annualPriceCzk * 12;
      return `${total.toLocaleString('cs-CZ')} Kč`;
    }
    const total = plan.annualPriceUsd * 12;
    return `$${total}`;
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
      {/* SEO Meta Tags */}
      <SEOHead 
        title={language === 'cz' ? 'Ceník' : 'Pricing'}
        description={language === 'cz' 
          ? 'Vyberte plán Edge88 odpovídající vašemu stylu sázení. Starter, Pro a Elite plány s AI predikcemi.'
          : 'Choose an Edge88 plan that matches your betting style. Starter, Pro and Elite plans with AI predictions.'}
        url="/pricing"
      />
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
            ? 'Vyberte plán odpovídající vašemu stylu sázení'
            : 'Pick a plan that matches your betting style'}
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
            {language === 'cz' ? 'Ušetřete 30%' : 'Save 30%'}
          </span>
        )}
      </div>

      {/* Pricing Cards - 3 tiers */}
      <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
        {pricingPlans.map((plan) => {
          const isPro = plan.name === 'Pro';
          const isElite = plan.name === 'Elite';
          const lang = language as 'en' | 'cz';

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
                  {isElite && <Award className="h-5 w-5 text-yellow-400" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description[lang]}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold">{formatPrice(plan)}</span>
                  <span className="text-muted-foreground">/{language === 'cz' ? 'měsíc' : 'month'}</span>
                </div>
                {isAnnual && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {language === 'cz' 
                      ? `Účtováno ročně (${formatAnnualTotal(plan)}/rok)`
                      : `Billed annually (${formatAnnualTotal(plan)}/year)`}
                  </p>
                )}
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features[lang].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.notIncluded[lang].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isAdmin ? (
                <Button className="w-full" variant="outline" size="lg" disabled>
                  <Check className="h-4 w-4 mr-2" />
                  {language === 'cz' ? 'Aktivní' : 'Active'}
                </Button>
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
                    plan.cta[lang]
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
        
        <div className="glass-card overflow-hidden overflow-x-auto max-w-4xl mx-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium">{language === 'cz' ? 'Funkce' : 'Features'}</th>
                <th className="p-4 text-center font-medium">Starter</th>
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
                    <td colSpan={4} className="p-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {category.name}
                    </td>
                  </tr>
                  {category.features.map((feature) => (
                    <tr key={feature.name} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-4 text-sm">{feature.name}</td>
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
                className="flex w-full items-center justify-between text-left"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-muted-foreground transition-transform',
                    expandedFaq === index && 'rotate-180'
                  )}
                />
              </button>
              {expandedFaq === index && (
                <p className="mt-3 text-muted-foreground">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold mb-4">
          {language === 'cz' ? 'Připraveni vyhrát?' : 'Ready to Win?'}
        </h3>
        <p className="text-muted-foreground mb-6">
          {language === 'cz' 
            ? 'Připojte se k tisícům úspěšných sázkařů' 
            : 'Join thousands of winning bettors'}
        </p>
        <Link to="/signup">
          <Button size="lg" className="btn-gradient">
            {language === 'cz' ? 'Začít nyní' : 'Get Started'}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Pricing;
