import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Globe, TrendingUp, BarChart3, Target, Users, CheckCircle, Loader2, Mail, Sparkles, Star, Quote, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { LiveTicker } from '@/components/LiveTicker';
import { PredictionCard } from '@/components/PredictionCard';
import { StatCard } from '@/components/StatCard';
import { useActivePredictions, useStats } from '@/hooks/usePredictions';
import { useNewsletter } from '@/hooks/useNewsletter';
import { pricingPlans } from '@/lib/mockData';
import { useLanguage } from '@/contexts/LanguageContext';

// Animated Counter Hook
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          let startTime: number;
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasStarted]);

  return { count, ref };
}

const TESTIMONIALS = [
  {
    name: 'Michael R.',
    role: 'Pro Bettor',
    image: '👨‍💼',
    tier: 'Elite',
    quote: 'Edge88 has completely transformed my approach. The AI picks are incredibly accurate, and the detailed analysis helps me understand the reasoning.',
    stats: '+$12,400 this month',
  },
  {
    name: 'Sarah K.',
    role: 'Sports Analyst',
    image: '👩‍💻',
    tier: 'Pro',
    quote: 'As someone who analyzes sports professionally, I\'m impressed by the depth of data Edge88 uses. It catches patterns I would have missed.',
    stats: '71% win rate',
  },
  {
    name: 'David L.',
    role: 'Casual Fan',
    image: '🧑',
    tier: 'Starter',
    quote: 'Started with the free plan and quickly upgraded. The picks are easy to follow and the ROI speaks for itself. Best investment I\'ve made.',
    stats: '+$3,200 first month',
  },
  {
    name: 'James T.',
    role: 'Day Trader',
    image: '👨‍💼',
    tier: 'Elite',
    quote: 'I apply the same analytical rigor to sports betting as I do to trading. Edge88\'s AI gives me the edge I need in both markets.',
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
    description: 'Receive daily predictions with confidence scores and detailed analysis.',
    icon: Target,
  },
  {
    step: 3,
    title: 'Win More',
    description: 'Follow the picks, track your results, and grow your bankroll.',
    icon: TrendingUp,
  },
];

const Index = () => {
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { t } = useLanguage();
  const { subscribe, isLoading: isSubscribing } = useNewsletter();
  const [email, setEmail] = useState('');

  const featuredPredictions = predictions
    ?.filter((p) => p.result === 'pending')
    .sort((a, b) => {
      const confA = a.confidence <= 1 ? a.confidence * 100 : a.confidence;
      const confB = b.confidence <= 1 ? b.confidence * 100 : b.confidence;
      return confB - confA;
    })
    .slice(0, 3) || [];

  const displayStats = [
    { label: t.overallAccuracy, value: stats?.accuracy ?? 64.8, suffix: '%', icon: Target },
    { label: t.totalPredictions, value: stats?.totalPredictions ?? 12847, icon: BarChart3 },
    { label: t.averageROI, value: stats?.roi ?? 8.7, suffix: '%', prefix: '+', icon: TrendingUp },
    { label: t.activeAnalysts, value: 10432, icon: Users },
  ];

  const predictionsMadeToday = stats?.activePredictions || predictions?.length || 127;

  // Animated counters for social proof
  const analystsCounter = useAnimatedCounter(10000);
  const picksCounter = useAnimatedCounter(142);
  const accuracyCounter = useAnimatedCounter(73);

  const features = [
    {
      icon: Zap,
      title: t.aiPowered,
      description: t.aiPoweredDesc,
    },
    {
      icon: Shield,
      title: t.transparent,
      description: t.transparentDesc,
    },
    {
      icon: Globe,
      title: t.multiMarket,
      description: t.multiMarketDesc,
    },
  ];

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

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />
        
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-2 backdrop-blur-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t.trustedBy} <span className="font-semibold text-foreground">10,000+</span> {t.analysts}
              </span>
            </div>

            <h1 className="animate-slide-up text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {t.heroTitle.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="gradient-text-animated">{t.heroTitle.split(' ').slice(-1)}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-lg text-muted-foreground sm:text-xl" style={{ animationDelay: '0.1s' }}>
              {t.heroSubtitle}
            </p>

            <div className="mt-6 animate-slide-up inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-success" style={{ animationDelay: '0.15s' }}>
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="font-mono font-bold">{predictionsMadeToday}</span>
              <span className="text-sm">{t.predictionsMadeToday}</span>
            </div>

            <div className="mt-10 flex animate-slide-up flex-col items-center gap-4 sm:flex-row sm:justify-center" style={{ animationDelay: '0.2s' }}>
              <Link to="/signup">
                <Button size="xl" className="btn-gradient group w-full sm:w-auto">
                  <span className="flex items-center gap-2">
                    {t.startPredicting}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link to="/predictions">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  {t.viewPredictions}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Accuracy Banner */}
      <section className="py-4 bg-gradient-to-r from-success/10 via-primary/5 to-success/10 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div ref={analystsCounter.ref} className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-center">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              <span className="text-sm md:text-base">
                This week: <span className="font-bold text-success">{accuracyCounter.count}% accuracy</span> across <span className="font-bold">{picksCounter.count} picks</span>
              </span>
            </div>
            <div className="hidden md:block h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm md:text-base">
                <span className="font-bold text-primary">{analystsCounter.count.toLocaleString()}+</span> analysts winning with AI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <LiveTicker />

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-transparent via-muted/30 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start winning in 3 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, index) => (
              <div
                key={item.step}
                className="relative glass-card-hover p-8 text-center"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-sm">
                  {item.step}
                </div>
                
                {/* Connector Line */}
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}

                <div className="mx-auto mb-6 mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/signup">
              <Button size="lg" className="btn-gradient gap-2">
                <Play className="h-4 w-4" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.whyEdge88}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.whyEdge88Subtitle}
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card-hover p-8 text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Predictions */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t.todaysTopPicks}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t.highestConfidence}
              </p>
            </div>
            <Link to="/predictions">
              <Button variant="ghost" className="gap-2">
                {t.viewAll}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {predictionsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredPredictions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPredictions.map((prediction, index) => (
                <PredictionCard key={prediction.id} prediction={prediction} gameNumber={index + 1} />
              ))}
            </div>
          ) : (
            <div className="glass-card py-16 text-center">
              <Zap className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">{t.noActivePredictions}</h3>
              <p className="mt-2 text-muted-foreground">{t.checkBackSoon}</p>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="mt-12 glass-card p-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{t.getDailyPicks}</h3>
                  <p className="text-sm text-muted-foreground">Free daily predictions in your inbox at 9 AM</p>
                </div>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto gap-2">
                <Input
                  type="email"
                  placeholder={t.enterEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full md:w-64"
                  required
                />
                <Button type="submit" className="btn-gradient whitespace-nowrap" disabled={isSubscribing}>
                  {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Free Picks'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-transparent via-muted/20 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of analysts already winning with Edge88
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="glass-card p-6 relative overflow-hidden hover:border-primary/30 transition-all"
              >
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {testimonial.tier} Member
                  </span>
                  <span className="text-sm font-bold text-success">
                    {testimonial.stats}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.provenResults}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t.realTimeStats}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayStats.map((stat) => (
              <StatCard
                key={stat.label}
                title={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                icon={<stat.icon className="h-5 w-5" />}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.simplePricing}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t.startFreeUpgrade}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card relative overflow-hidden p-6 transition-all duration-300 hover:border-primary/30 ${
                  plan.popular ? 'border-primary ring-1 ring-primary' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {t.popular}
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-6 space-y-2">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/pricing" className="mt-6 block">
                  <Button variant={plan.popular ? 'default' : 'outline'} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card relative overflow-hidden p-12 text-center md:p-16">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {t.startPredictingToday}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                {t.joinThousands}
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/signup">
                  <Button size="xl" className="btn-gradient group">
                    <span className="flex items-center gap-2">
                      {t.createFreeAccount}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
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
