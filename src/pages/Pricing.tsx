import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, X, Zap, Shield, Star, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricingPlans } from '@/lib/mockData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/hooks/useCheckout';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
const faqs = [
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
    answer: 'Our overall accuracy is 64.8% across all sports, with Lock picks (75%+ confidence) hitting at 81%. All results are publicly tracked and verifiable.',
  },
  {
    question: 'What sports do you cover?',
    answer: 'We cover NFL, NBA, NHL, MLB, Soccer (EPL, La Liga, Champions League), UFC, and prediction markets like Polymarket and Kalshi.',
  },
  {
    question: 'Is there a money-back guarantee?',
    answer: 'Yes! If you\'re not satisfied within the first 14 days, we\'ll give you a full refund. No questions asked.',
  },
];

// Feature comparison for the table
const featureCategories = [
  {
    name: 'Predictions',
    features: [
      { name: 'Daily picks', free: '3', starter: 'Unlimited', pro: 'Unlimited', elite: 'Unlimited' },
      { name: 'Sports coverage', free: 'Basic', starter: 'All sports', pro: 'All sports', elite: 'All + Markets' },
      { name: 'Confidence levels', free: 'High only', starter: 'All levels', pro: 'All levels', elite: 'All levels' },
      { name: 'Live predictions', free: false, starter: true, pro: true, elite: true },
    ],
  },
  {
    name: 'Analysis',
    features: [
      { name: 'Basic reasoning', free: true, starter: true, pro: true, elite: true },
      { name: 'Detailed analysis', free: false, starter: false, pro: true, elite: true },
      { name: 'Odds comparison', free: false, starter: true, pro: true, elite: true },
      { name: 'Sharp money alerts', free: false, starter: false, pro: true, elite: true },
      { name: 'Weather impact', free: false, starter: false, pro: true, elite: true },
    ],
  },
  {
    name: 'Alerts & Support',
    features: [
      { name: 'Email notifications', free: 'Daily digest', starter: 'Per pick', pro: 'Instant', elite: 'Instant' },
      { name: 'Telegram alerts', free: false, starter: false, pro: true, elite: true },
      { name: 'Priority support', free: false, starter: true, pro: true, elite: true },
      { name: '1-on-1 calls', free: false, starter: false, pro: false, elite: true },
    ],
  },
  {
    name: 'Data & API',
    features: [
      { name: 'Pick history', free: '7 days', starter: '90 days', pro: 'Unlimited', elite: 'Unlimited' },
      { name: 'Export data', free: false, starter: false, pro: true, elite: true },
      { name: 'API access', free: false, starter: false, pro: true, elite: true },
      { name: 'Custom models', free: false, starter: false, pro: false, elite: true },
    ],
  },
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const { checkout, isLoading } = useCheckout();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Handle checkout result from URL
  useEffect(() => {
    const checkoutResult = searchParams.get('checkout');
    if (checkoutResult === 'cancelled') {
      toast({
        title: 'Checkout Cancelled',
        description: 'Your subscription was not processed.',
      });
    }
  }, [searchParams, toast]);

  const currentTier = profile?.subscription_tier || 'free';

  const handleSubscribe = (planName: string) => {
    const tier = planName.toLowerCase();
    if (tier === currentTier) {
      toast({
        title: 'Current Plan',
        description: `You're already on the ${planName} plan.`,
      });
      return;
    }
    checkout(tier);
  };
  const getPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 0;
    return isAnnual ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
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

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Choose Your <span className="gradient-text">Edge</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t.startFreeUpgrade || 'Start free, upgrade when you\'re ready for unlimited predictions'}
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn('text-sm font-medium', !isAnnual && 'text-foreground', isAnnual && 'text-muted-foreground')}>
          Monthly
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
          Annual
        </span>
        {isAnnual && (
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Save 20%
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 lg:grid-cols-4">
        {pricingPlans.map((plan, index) => (
          <div
            key={plan.name}
            className={cn(
              'glass-card relative overflow-hidden p-6 transition-all duration-300',
              plan.popular
                ? 'border-primary ring-2 ring-primary lg:scale-105 z-10'
                : 'hover:border-primary/30'
            )}
          >
            {/* Most Popular Badge */}
            {plan.popular && (
              <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-primary to-accent px-12 py-1.5 text-xs font-bold text-white shadow-lg">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Most Popular
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
                <span className="font-mono text-4xl font-bold">${getPrice(plan.price)}</span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/{plan.period}</span>
                )}
              </div>
              {isAnnual && plan.price > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Billed annually (${getPrice(plan.price) * 12}/year)
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
                  {user ? 'Current Plan' : plan.cta}
                </Button>
              </Link>
            ) : (
              <Button
                className={cn('w-full', plan.popular && 'btn-gradient')}
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
                onClick={() => handleSubscribe(plan.name)}
                disabled={isLoading === plan.name.toLowerCase() || currentTier === plan.name.toLowerCase()}
              >
                {isLoading === plan.name.toLowerCase() ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : currentTier === plan.name.toLowerCase() ? (
                  'Current Plan'
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Money-back guarantee */}
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <div className="flex items-center gap-2 rounded-full bg-success/10 border border-success/20 px-4 py-2">
          <Shield className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-success">14-day money-back guarantee</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Cancel anytime</span>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div>
        <h2 className="text-center text-2xl font-bold mb-8">Feature Comparison</h2>
        
        <div className="glass-card overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium">Features</th>
                <th className="p-4 text-center font-medium">Free</th>
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
                <>
                  <tr key={category.name} className="bg-muted/30">
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
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-center text-2xl font-bold">Frequently Asked Questions</h2>

        <div className="mx-auto mt-8 max-w-3xl divide-y divide-border glass-card overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="font-medium">{faq.question}</span>
                <Zap
                  className={cn(
                    'h-5 w-5 text-primary transition-transform flex-shrink-0 ml-4',
                    expandedFaq === index && 'rotate-45'
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
        <h2 className="text-2xl font-bold">Ready to Get Your Edge?</h2>
        <p className="mt-2 text-muted-foreground">Join 10,000+ analysts winning with AI-powered predictions</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button size="xl" className="btn-gradient gap-2">
              <Zap className="h-5 w-5" />
              Start Free Trial
            </Button>
          </Link>
          <Link to="/predictions">
            <Button size="xl" variant="outline">
              View Live Picks
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;