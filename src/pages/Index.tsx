import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, BarChart3, Target, Users, Loader2, Mail, Star, ChevronRight, Activity, Trophy, Flame, Shield } from 'lucide-react';
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

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [hasStarted, target, duration]);

  return { count, ref };
}

// Scroll reveal hook
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
    winRate: '71%',
  },
  {
    name: 'Sarah K.',
    role: 'Sports Analyst',
    quote: 'Impressed by the depth of data Edge88 uses. It catches patterns I would have missed.',
    stats: '+$8,200',
    winRate: '68%',
  },
  {
    name: 'David L.',
    role: 'Casual Fan',
    quote: 'Started with the free plan and quickly upgraded. The ROI speaks for itself.',
    stats: '+$3,200',
    winRate: '65%',
  },
  {
    name: 'James T.',
    role: 'Day Trader',
    quote: 'I apply the same analytical rigor to sports betting. Edge88 delivers the edge I need.',
    stats: '+$15,800',
    winRate: '73%',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Sign Up Free',
    description: 'Create your account in 30 seconds. No credit card required.',
    icon: Users,
    color: 'primary',
  },
  {
    step: 2,
    title: 'Get AI Picks',
    description: 'Receive daily predictions with confidence scores and deep analysis.',
    icon: Target,
    color: 'accent',
  },
  {
    step: 3,
    title: 'Win More',
    description: 'Follow the picks, track results, and grow your bankroll.',
    icon: Trophy,
    color: 'success',
  },
];

const Index = () => {
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats } = useStats();
  const { t } = useLanguage();
  const { subscribe, isLoading: isSubscribing } = useNewsletter();
  const [email, setEmail] = useState('');

  // Animated counters
  const accuracyCounter = useAnimatedCounter(73, 2000);
  const predictionsCounter = useAnimatedCounter(142, 2500);
  const usersCounter = useAnimatedCounter(10000, 3000);

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

      {/* Hero Section - Premium Sportsbook Style */}
      <section className="hero-bg-animated relative pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Live badge + Trust indicators */}
            <div className="mb-8 inline-flex flex-wrap items-center justify-center gap-3">
              <div className="live-badge">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span>LIVE</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                Trusted by <span className="font-bold text-foreground">10,000+</span> winning bettors
              </span>
            </div>

            {/* Bold headline */}
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              The AI Edge That
              <br />
              <span className="gradient-text-animated">Wins Games</span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Machine learning + deep analytics = <span className="text-foreground font-medium">73% accuracy</span>.
              <br className="hidden sm:block" />
              Get winning picks for NFL, NBA, NHL, MLB & more.
            </p>

            {/* Live stats row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                <Activity className="h-4 w-4 text-success" />
                <span className="font-mono font-bold text-foreground">{predictionsMadeToday}</span>
                <span className="text-muted-foreground">picks today</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/30">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-mono font-bold text-success">73%</span>
                <span className="text-muted-foreground">accuracy</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="font-mono font-bold text-foreground">12</span>
                <span className="text-muted-foreground">win streak</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="btn-cta-premium h-14 px-10 text-lg animate-pulse-glow">
                  Start Winning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/predictions">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-primary/50 hover:bg-primary/10 hover:border-primary">
                  View Today's Picks
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span>Bank-level security</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" />
                <span>No credit card needed</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <LiveTicker />

      {/* Stats Section - Data Rich */}
      <section className="py-12 border-y border-border bg-card/50" ref={accuracyCounter.ref}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="stat-card">
              <div className="text-3xl md:text-4xl font-mono font-black text-foreground">{accuracyCounter.count}%</div>
              <div className="mt-1 text-sm text-muted-foreground">Weekly Accuracy</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                <TrendingUp className="h-3 w-3" />
                <span>+5% vs last week</span>
              </div>
            </div>
            
            <div className="stat-card" ref={predictionsCounter.ref}>
              <div className="text-3xl md:text-4xl font-mono font-black text-foreground">{predictionsCounter.count}</div>
              <div className="mt-1 text-sm text-muted-foreground">Picks This Week</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary">
                <Zap className="h-3 w-3" />
                <span>Updated live</span>
              </div>
            </div>
            
            <div className="stat-card" ref={usersCounter.ref}>
              <div className="text-3xl md:text-4xl font-mono font-black text-foreground">{usersCounter.count.toLocaleString()}+</div>
              <div className="mt-1 text-sm text-muted-foreground">Active Analysts</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                <Users className="h-3 w-3" />
                <span>Growing daily</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="text-3xl md:text-4xl font-mono font-black text-success">+$2.4M</div>
              <div className="mt-1 text-sm text-muted-foreground">User Winnings</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                <Trophy className="h-3 w-3" />
                <span>This month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        ref={howItWorksReveal.ref}
        className={`py-20 md:py-28 transition-all duration-700 ${howItWorksReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-4">
              <Zap className="h-4 w-4" />
              <span>How It Works</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Start Winning in <span className="gradient-text">3 Steps</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From signup to your first winning pick in under 5 minutes
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, index) => (
              <div
                key={item.step}
                className="glass-card-premium p-8 group"
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  opacity: howItWorksReveal.isRevealed ? 1 : 0,
                  transform: howItWorksReveal.isRevealed ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.5s ease'
                }}
              >
                {/* Step Number */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-lg font-black text-primary-foreground">
                  {item.step}
                </div>
                
                {/* Icon */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                
                <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={testimonialsReveal.ref}
        className={`py-20 md:py-28 bg-card/30 border-y border-border transition-all duration-700 ${testimonialsReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-sm font-medium text-success mb-4">
              <Trophy className="h-4 w-4" />
              <span>Success Stories</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Winners <span className="gradient-text">Trust Us</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join the community already profiting with Edge88
            </p>
          </div>

          {/* Testimonials grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="betting-slip p-6"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: testimonialsReveal.isRevealed ? 1 : 0,
                  transform: testimonialsReveal.isRevealed ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.5s ease'
                }}
              >
                {/* Win rate badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <span className="badge-win">{testimonial.winRate} WIN</span>
                </div>

                {/* Quote */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>

                {/* User info */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <span className="font-mono text-lg font-black text-success">
                    {testimonial.stats}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Predictions */}
      <section 
        ref={predictionsReveal.ref}
        className={`py-20 md:py-28 transition-all duration-700 ${predictionsReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-4">
                <Flame className="h-4 w-4" />
                <span>Hot Picks</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t.todaysTopPicks}
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                {t.highestConfidence}
              </p>
            </div>
            <Link to="/predictions">
              <Button variant="outline" className="gap-2 border-primary/50 hover:bg-primary/10 hover:border-primary">
                {t.viewAll}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Predictions grid */}
          {predictionsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : featuredPredictions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPredictions.map((prediction, index) => (
                <div
                  key={prediction.id}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    opacity: predictionsReveal.isRevealed ? 1 : 0,
                    transform: predictionsReveal.isRevealed ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.5s ease'
                  }}
                >
                  <PredictionCard prediction={prediction} gameNumber={index + 1} />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card-premium py-20 text-center">
              <Zap className="mx-auto h-12 w-12 text-primary" />
              <h3 className="mt-4 text-xl font-bold text-foreground">{t.noActivePredictions}</h3>
              <p className="mt-2 text-muted-foreground">{t.checkBackSoon}</p>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="mt-16 glass-card-premium p-8 md:p-10 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Mail className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{t.getDailyPicks}</h3>
                  <p className="text-muted-foreground">Free daily predictions delivered at 9 AM</p>
                </div>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full lg:w-auto gap-3">
                <Input
                  type="email"
                  placeholder={t.enterEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full lg:w-80 h-12 bg-background border-border focus:border-primary"
                  required
                />
                <Button type="submit" className="btn-gradient h-12 px-8" disabled={isSubscribing}>
                  {isSubscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section 
        ref={ctaReveal.ref}
        className={`py-20 md:py-28 transition-all duration-700 ${ctaReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card-premium p-12 md:p-20 text-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
            
            <div className="relative">
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                Ready to <span className="gradient-text">Start Winning</span>?
              </h2>
              
              <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
                {t.joinThousands}
              </p>
              
              <div className="mt-10">
                <Link to="/signup">
                  <Button size="lg" className="btn-cta-premium h-14 px-12 text-lg animate-pulse-glow">
                    {t.createFreeAccount}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                    <Target className="h-4 w-4 text-success" />
                  </div>
                  <span>73% average accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span>10,000+ analysts</span>
                </div>
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
