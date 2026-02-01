import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, BarChart3, Target, Users, Loader2, Mail, Sparkles, Star, Quote, Play, ChevronRight } from 'lucide-react';
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

// Floating particle component
const FloatingParticle = ({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) => (
  <div
    className="absolute rounded-full bg-primary/30"
    style={{
      width: size,
      height: size,
      left,
      top,
      animation: `particle-float ${8 + Math.random() * 4}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  />
);

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

  // Animated counters for social proof
  const analystsCounter = useAnimatedCounter(10000);
  const picksCounter = useAnimatedCounter(142);
  const accuracyCounter = useAnimatedCounter(73);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    const success = await subscribe(email);
    if (success) {
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Premium Redesign */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32">
        {/* Animated gradient background */}
        <div className="absolute inset-0 hero-bg-animated" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-40" />
        
        {/* Animated glow orbs */}
        <div 
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]"
          style={{ animation: 'glow-pulse 8s ease-in-out infinite' }}
        />
        <div 
          className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[100px]"
          style={{ animation: 'glow-pulse 8s ease-in-out infinite 2s' }}
        />
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[150px]"
          style={{ animation: 'glow-pulse 10s ease-in-out infinite 1s' }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <FloatingParticle
              key={i}
              delay={i * 0.3}
              size={2 + Math.random() * 4}
              left={`${Math.random() * 100}%`}
              top={`${Math.random() * 100}%`}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            {/* Trust badge */}
            <div className="mb-10 inline-flex animate-fade-in items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 backdrop-blur-xl">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium uppercase tracking-wider text-success">Live</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t.trustedBy} <span className="font-bold text-foreground">10,000+</span> {t.analysts}
              </span>
            </div>

            {/* Main headline - Much bigger */}
            <h1 className="animate-slide-up text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9]">
              <span className="block text-foreground">The Future of</span>
              <span className="block mt-2 gradient-text-animated">Sports Prediction</span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-8 max-w-2xl animate-slide-up text-lg text-muted-foreground sm:text-xl md:text-2xl leading-relaxed" style={{ animationDelay: '0.1s' }}>
              AI-powered edge meets real results. Get winning picks backed by{' '}
              <span className="text-foreground font-medium">deep analytics</span> and{' '}
              <span className="text-foreground font-medium">machine learning</span>.
            </p>

            {/* Live stats badge */}
            <div className="mt-8 animate-slide-up inline-flex items-center gap-3 rounded-2xl bg-success/10 border border-success/20 px-6 py-3 backdrop-blur-sm" style={{ animationDelay: '0.15s' }}>
              <Sparkles className="h-5 w-5 text-success animate-pulse" />
              <span className="font-mono text-2xl font-bold text-success">{predictionsMadeToday}</span>
              <span className="text-muted-foreground">{t.predictionsMadeToday}</span>
            </div>

            {/* CTA buttons */}
            <div className="mt-12 flex animate-slide-up flex-col items-center gap-5 sm:flex-row sm:justify-center" style={{ animationDelay: '0.2s' }}>
              <Link to="/signup">
                <Button className="btn-cta-premium h-16 px-10 text-lg group w-full sm:w-auto">
                  <span className="flex items-center gap-3 relative z-10">
                    {t.startPredicting}
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>
                </Button>
              </Link>
              <Link to="/predictions">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 w-full sm:w-auto">
                  <span className="flex items-center gap-2">
                    {t.viewPredictions}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <LiveTicker />

      {/* How It Works Section - Premium */}
      <section 
        ref={howItWorksReveal.ref}
        className={`py-24 md:py-36 transition-all duration-1000 ${howItWorksReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-3xl text-center mb-20">
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary mb-4">How It Works</span>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Start Winning in{' '}
              <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              From signup to your first winning pick in under 5 minutes
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
            {HOW_IT_WORKS.map((item, index) => (
              <div
                key={item.step}
                className="relative glass-card-premium p-10 text-center group"
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  opacity: howItWorksReveal.isRevealed ? 1 : 0,
                  transform: howItWorksReveal.isRevealed ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Step Number */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white font-bold shadow-lg shadow-primary/30">
                  {item.step}
                </div>
                
                {/* Connector Line */}
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 lg:-right-5 w-6 lg:w-10 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}

                {/* Icon container */}
                <div className="mx-auto mb-8 mt-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 border border-primary/10 group-hover:border-primary/30 transition-all duration-500 group-hover:scale-110">
                  <item.icon className="h-12 w-12 text-primary" />
                </div>
                
                <h3 className="mb-4 text-2xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link to="/signup">
              <Button size="lg" className="btn-gradient gap-3 h-14 px-10 text-base">
                <Play className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Accuracy Banner - Premium */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-primary/5 to-success/5" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div ref={analystsCounter.ref} className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 border border-success/20">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div className="text-left">
                <div className="font-mono text-2xl font-bold text-success">{accuracyCounter.count}%</div>
                <div className="text-sm text-muted-foreground">Weekly Accuracy</div>
              </div>
            </div>
            
            <div className="hidden md:block h-12 w-px bg-border/50" />
            
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-mono text-2xl font-bold text-primary">{picksCounter.count}</div>
                <div className="text-sm text-muted-foreground">Picks This Week</div>
              </div>
            </div>
            
            <div className="hidden md:block h-12 w-px bg-border/50" />
            
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-mono text-2xl font-bold text-foreground">{analystsCounter.count.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">Active Analysts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Premium */}
      <section 
        ref={testimonialsReveal.ref}
        className={`py-24 md:py-36 transition-all duration-1000 ${testimonialsReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-3xl text-center mb-20">
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary mb-4">Testimonials</span>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Trusted by{' '}
              <span className="gradient-text">Thousands</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Join the winning community already profiting with Edge88
            </p>
          </div>

          {/* Testimonials grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="glass-card-premium p-7 relative overflow-hidden group"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: testimonialsReveal.isRevealed ? 1 : 0,
                  transform: testimonialsReveal.isRevealed ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Quote decoration */}
                <div className="absolute top-4 right-4 text-6xl font-serif text-primary/10 leading-none">"</div>
                
                {/* User info */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-3xl border border-primary/10 group-hover:border-primary/30 transition-colors">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-4">
                  {testimonial.quote}
                </p>

                {/* Stats footer */}
                <div className="flex items-center justify-between pt-5 border-t border-border/50">
                  <span className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                    {testimonial.tier} Member
                  </span>
                  <span className="font-mono text-base font-bold text-success">
                    {testimonial.stats}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Predictions + Newsletter Signup - Premium */}
      <section 
        ref={predictionsReveal.ref}
        className={`py-24 md:py-36 transition-all duration-1000 ${predictionsReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary mb-4">Featured</span>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {t.todaysTopPicks}
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                {t.highestConfidence}
              </p>
            </div>
            <Link to="/predictions">
              <Button variant="ghost" className="gap-2 text-base hover:bg-primary/10 hover:text-primary transition-all group">
                {t.viewAll}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Predictions grid */}
          {predictionsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading predictions...</p>
              </div>
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
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <PredictionCard prediction={prediction} gameNumber={index + 1} />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card-premium py-20 text-center">
              <Zap className="mx-auto h-14 w-14 text-muted-foreground/50" />
              <h3 className="mt-5 text-xl font-bold">{t.noActivePredictions}</h3>
              <p className="mt-2 text-muted-foreground">{t.checkBackSoon}</p>
            </div>
          )}

          {/* Newsletter Signup - Premium */}
          <div className="mt-16 glass-card-premium p-8 md:p-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 overflow-hidden relative">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{t.getDailyPicks}</h3>
                  <p className="text-muted-foreground mt-1">Free daily predictions delivered at 9 AM</p>
                </div>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full lg:w-auto gap-3">
                <Input
                  type="email"
                  placeholder={t.enterEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full lg:w-80 h-12 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
                  required
                />
                <Button type="submit" className="btn-gradient whitespace-nowrap h-12 px-8" disabled={isSubscribing}>
                  {isSubscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section 
        ref={ctaReveal.ref}
        className={`py-24 md:py-36 transition-all duration-1000 ${ctaReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card-premium relative overflow-hidden p-12 md:p-20 text-center">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[200px] pointer-events-none" />
            
            <div className="relative">
              <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary mb-6">Get Started Today</span>
              
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Ready to{' '}
                <span className="gradient-text-animated">Win More?</span>
              </h2>
              
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                {t.joinThousands}
              </p>
              
              <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
                <Link to="/signup">
                  <Button className="btn-cta-premium h-16 px-12 text-lg group">
                    <span className="flex items-center gap-3 relative z-10">
                      {t.createFreeAccount}
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                    </span>
                  </Button>
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-success" />
                  <span>73% average accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
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
