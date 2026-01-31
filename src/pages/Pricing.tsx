import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Zap, Shield } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { pricingPlans } from '@/lib/mockData';
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

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const getPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 0;
    return isAnnual ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Choose Your <span className="gradient-text">Edge</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, upgrade when you're ready for unlimited predictions
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
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
            <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
              Save 20%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'glass-card relative overflow-hidden p-6 transition-all duration-300',
                plan.popular
                  ? 'border-primary ring-2 ring-primary lg:scale-105'
                  : 'hover:border-primary/30'
              )}
            >
              {plan.popular && (
                <div className="absolute -right-12 top-6 rotate-45 bg-primary px-12 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
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

              <Link to="/signup">
                <Button
                  className={cn('w-full', plan.popular && 'btn-gradient')}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-5 w-5 text-success" />
          <span>14-day money-back guarantee on all paid plans</span>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold">Frequently Asked Questions</h2>

          <div className="mx-auto mt-8 max-w-3xl divide-y divide-border">
            {faqs.map((faq, index) => (
              <div key={index} className="py-4">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="font-medium">{faq.question}</span>
                  <Zap
                    className={cn(
                      'h-5 w-5 text-primary transition-transform',
                      expandedFaq === index && 'rotate-45'
                    )}
                  />
                </button>
                {expandedFaq === index && (
                  <p className="mt-3 animate-fade-in text-muted-foreground">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
