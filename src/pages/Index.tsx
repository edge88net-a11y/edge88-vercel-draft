import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, BarChart3, Target, Users, Loader2, Mail, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { LiveTicker } from '@/components/LiveTicker';
import { PredictionCard } from '@/components/PredictionCard';
import { useActivePredictions, useStats } from '@/hooks/usePredictions';
import { useNewsletter } from '@/hooks/useNewsletter';
import { useLanguage } from '@/contexts/LanguageContext';

// Scroll reveal hook - subtle fade only
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isRevealed };
}

const TESTIMONIALS = [
  {
    name: 'Michael R.',
    role: 'Pro Bettor',
    quote: 'Edge88 has completely transformed my approach. The AI picks are incredibly accurate.',
    stats: '+$12,400',
  },
  {
    name: 'Sarah K.',
    role: 'Sports Analyst',
    quote: 'Impressed by the depth of data Edge88 uses. It catches patterns I would have missed.',
    stats: '71% win rate',
  },
  {
    name: 'David L.',
    role: 'Casual Fan',
    quote: 'Started with the free plan and quickly upgraded. The ROI speaks for itself.',
    stats: '+$3,200',
  },
  {
    name: 'James T.',
    role: 'Day Trader',
    quote: 'I apply the same analytical rigor to sports betting. Edge88 delivers the edge I need.',
    stats: '68% accuracy',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Sign Up Free',
    description: 'Create your account in 30 seconds. No credit card required.',
    icon: Users,
  },
  {
    step: 2,
    title: 'Get AI Picks',
    description: 'Receive daily predictions with confidence scores and analysis.',
    icon: Target,
  },
  {
    step: 3,
    title: 'Win More',
    description: 'Follow the picks, track results, and grow your bankroll.',
    icon: TrendingUp,
  },
];

const Index = () => {
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats } = useStats();
  const { t } = useLanguage();
  const { subscribe, isLoading: isSubscribing } = useNewsletter();
  const [email, setEmail] = useState('');

  // Scroll reveal refs
  const howItWorksReveal = useScrollReveal();
  const testimonialsReveal = useScrollReveal();
  const predictionsReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  const featuredPredictions = predictions
    ?.filter((p) => p.result === 'pending')
    .sort((a, b) => {
      const confA = a.confidence <= 1 ? a.confidence * 100 : a.confidence;
      const confB = b.confidence <= 1 ? b.confidence * 100 : b.confidence;
      return confB - confA;
    })
    .slice(0, 3) || [];

  const predictionsMadeToday = stats?.activePredictions || predictions?.length || 127;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    const success = await subscribe(email);
    if (success) {
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      {/* Hero Section - Clean & Minimal */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Minimal trust badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="text-xs font-medium text-muted-foreground">LIVE</span>
              </div>
              <div className="h-3 w-px bg-border" />
              <span className="text-xs text-muted-foreground">
                Trusted by <span className="text-foreground">10,000+</span> analysts
              </span>
            </div>

            {/* Clean headline - white text, no gradients */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              AI-Powered Edge.
              <br />
              <span className="text-foreground">Real Results.</span>
            </h1>

            {/* Subtle gray subtitle */}
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Get winning sports predictions backed by machine learning and deep analytics.
            </p>

            {/* Minimal live stats */}
            <p className="mt-6 text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{predictionsMadeToday}</span> predictions made today
            </p>

            {/* Single clean CTA */}
            <div className="mt-10">
              <Link to="/signup">
                <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Predicting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <LiveTicker />

      {/* How It Works Section - Clean */}
      <section 
        ref={howItWorksReveal.ref}
        className={`py-24 md:py-32 transition-all duration-500 ${howItWorksReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3">How It Works</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Start Winning in 3 Steps
            </h2>
            <p className="mt-4 text-muted-foreground">
              From signup to your first winning pick in under 5 minutes
            </p>
          </div>

          {/* Steps grid - clean cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, index) => (
              <div
                key={item.step}
                className="relative rounded-xl border border-border bg-card p-8 transition-colors hover:border-muted-foreground/30"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: howItWorksReveal.isRevealed ? 1 : 0,
                  transform: howItWorksReveal.isRevealed ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.4s ease'
                }}
              >
                {/* Step Number */}
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium text-primary">
                  {item.step}
                </div>
                
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="h-6 w-6 text-foreground" />
                </div>
                
                <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner - Minimal */}
      <section className="py-12 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 text-center">
            <div>
              <div className="font-mono text-2xl font-semibold text-foreground">73%</div>
              <div className="mt-1 text-sm text-muted-foreground">Weekly Accuracy</div>
            </div>
            
            <div className="hidden md:block h-8 w-px bg-border" />
            
            <div>
              <div className="font-mono text-2xl font-semibold text-foreground">142</div>
              <div className="mt-1 text-sm text-muted-foreground">Picks This Week</div>
            </div>
            
            <div className="hidden md:block h-8 w-px bg-border" />
            
            <div>
              <div className="font-mono text-2xl font-semibold text-foreground">10,000+</div>
              <div className="mt-1 text-sm text-muted-foreground">Active Analysts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Clean */}
      <section 
        ref={testimonialsReveal.ref}
        className={`py-24 md:py-32 transition-all duration-500 ${testimonialsReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3">Testimonials</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by Thousands
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join the community already profiting with Edge88
            </p>
          </div>

          {/* Testimonials grid - simple cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30"
                style={{ 
                  transitionDelay: `${index * 75}ms`,
                  opacity: testimonialsReveal.isRevealed ? 1 : 0,
                  transform: testimonialsReveal.isRevealed ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.4s ease'
                }}
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>

                {/* User info */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <span className="font-mono text-sm font-medium text-success">
                    {testimonial.stats}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Predictions - Clean */}
      <section 
        ref={predictionsReveal.ref}
        className={`py-24 md:py-32 transition-all duration-500 ${predictionsReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary mb-3">Featured</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {t.todaysTopPicks}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t.highestConfidence}
              </p>
            </div>
            <Link to="/predictions">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                {t.viewAll}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Predictions grid */}
          {predictionsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : featuredPredictions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPredictions.map((prediction, index) => (
                <div
                  key={prediction.id}
                  style={{ 
                    transitionDelay: `${index * 75}ms`,
                    opacity: predictionsReveal.isRevealed ? 1 : 0,
                    transform: predictionsReveal.isRevealed ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.4s ease'
                  }}
                >
                  <PredictionCard prediction={prediction} gameNumber={index + 1} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card py-16 text-center">
              <Zap className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">{t.noActivePredictions}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.checkBackSoon}</p>
            </div>
          )}

          {/* Newsletter Signup - Clean */}
          <div className="mt-16 rounded-xl border border-border bg-card p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t.getDailyPicks}</h3>
                  <p className="text-sm text-muted-foreground">Free daily predictions at 9 AM</p>
                </div>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full lg:w-auto gap-3">
                <Input
                  type="email"
                  placeholder={t.enterEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full lg:w-72 h-10 bg-background border-border"
                  required
                />
                <Button type="submit" className="h-10 px-6 bg-primary hover:bg-primary/90" disabled={isSubscribing}>
                  {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Clean */}
      <section 
        ref={ctaReveal.ref}
        className={`py-24 md:py-32 transition-all duration-500 ${ctaReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-12 md:p-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Ready to Win More?
            </h2>
            
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              {t.joinThousands}
            </p>
            
            <div className="mt-8">
              <Link to="/signup">
                <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t.createFreeAccount}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                <span>73% average accuracy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>10,000+ analysts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Index;
