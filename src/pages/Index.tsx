import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, Target, Users, Mail, Star, Activity, Trophy, Flame, Shield, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveTicker } from '@/components/LiveTicker';
import { PredictionCard } from '@/components/PredictionCard';
import { MoneyCalculator } from '@/components/MoneyCalculator';
import { AffiliateCasinos } from '@/components/AffiliateCasinos';
import { WinStreakBadge } from '@/components/WinStreakBadge';
import { ProveItSection } from '@/components/ProveItSection';
import { useActivePredictions, useStats } from '@/hooks/usePredictions';
import { useNewsletter } from '@/hooks/useNewsletter';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useLanguage } from '@/contexts/LanguageContext';
import { HeroMeshBackground } from '@/components/HeroMeshBackground';
import { FloatingPredictionCards } from '@/components/FloatingPredictionCards';

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

const TESTIMONIALS_EN = [
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

const TESTIMONIALS_CZ = [
  {
    name: 'Michal R.',
    role: 'Profesionální sázkaři',
    quote: 'Edge88 úplně změnil můj přístup. AI tipy jsou neuvěřitelně přesné.',
    stats: '+290 000 Kč',
    winRate: '71%',
  },
  {
    name: 'Sára K.',
    role: 'Sportovní analytička',
    quote: 'Překvapuje mě hloubka dat, které Edge88 používá. Zachytí vzory, které bych přehlédla.',
    stats: '+192 000 Kč',
    winRate: '68%',
  },
  {
    name: 'David L.',
    role: 'Běžný fanoušek',
    quote: 'Začal jsem na free plánu a rychle upgradoval. Návratnost mluví sama za sebe.',
    stats: '+75 000 Kč',
    winRate: '65%',
  },
  {
    name: 'Jakub T.',
    role: 'Day Trader',
    quote: 'Na sportovní sázky používám stejný analytický přístup. Edge88 mi dává výhodu.',
    stats: '+370 000 Kč',
    winRate: '73%',
  },
];

const Index = () => {
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats } = useStats();
  const { t, language } = useLanguage();
  const { subscribe, isLoading: isSubscribing } = useNewsletter();
  const { winStreak } = useWinStreak();
  const [email, setEmail] = useState('');
  const [wantNotifications, setWantNotifications] = useState(true);

  // Animated counters
  const accuracyCounter = useAnimatedCounter(73, 2000);
  const predictionsCounter = useAnimatedCounter(142, 2500);
  const usersCounter = useAnimatedCounter(10000, 3000);

  // Scroll reveal refs
  const howItWorksReveal = useScrollReveal();
  const testimonialsReveal = useScrollReveal();
  const predictionsReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  const TESTIMONIALS = language === 'cz' ? TESTIMONIALS_CZ : TESTIMONIALS_EN;

  const HOW_IT_WORKS = [
    {
      step: 1,
      title: t.step1Title,
      description: t.step1Desc,
      icon: Users,
      color: 'primary',
    },
    {
      step: 2,
      title: t.step2Title,
      description: t.step2Desc,
      icon: Target,
      color: 'accent',
    },
    {
      step: 3,
      title: t.step3Title,
      description: t.step3Desc,
      icon: Trophy,
      color: 'success',
    },
  ];

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
        {/* Animated mesh grid background */}
        <HeroMeshBackground />
        
        {/* Floating prediction cards in background */}
        <FloatingPredictionCards />
        
        {/* Subtle radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(217,91%,60%,0.06)_0%,_transparent_70%)]" />
        
        {/* Glow orbs - reduced opacity */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-[100px]" />

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
                {t.trustedBy} <span className="font-bold text-foreground">10,000+</span> {t.winningBettors}
              </span>
            </div>

            {/* Bold headline */}
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              {t.heroTitleLine1}
              <br />
              <span className="gradient-text-animated">{t.heroTitleLine2}</span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {t.heroDescription}
            </p>

            {/* Live stats row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                <Activity className="h-4 w-4 text-success" />
                <span className="font-mono font-bold text-foreground">{predictionsMadeToday}</span>
                <span className="text-muted-foreground">{t.picksToday}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/30">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-mono font-bold text-success">73%</span>
                <span className="text-muted-foreground">{t.accuracy}</span>
              </div>
              <WinStreakBadge />
            </div>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="btn-cta-premium h-14 px-10 text-lg animate-pulse-glow">
                  {t.startWinningNow}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/predictions">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-primary/50 hover:bg-primary/10 hover:border-primary">
                  {t.viewTodaysPicks}
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span>{t.bankLevelSecurity}</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" />
                <span>{t.noCreditCard}</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary" />
                <span>{t.cancelAnytime}</span>
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
              <div className="mt-1 text-sm text-muted-foreground">{t.weeklyAccuracy}</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                <TrendingUp className="h-3 w-3" />
                <span>+5% {t.vsLastWeek}</span>
              </div>
            </div>
            
            <div className="stat-card" ref={predictionsCounter.ref}>
              <div className="text-3xl md:text-4xl font-mono font-black text-foreground">{predictionsCounter.count}</div>
              <div className="mt-1 text-sm text-muted-foreground">{t.picksThisWeek}</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary">
                <Zap className="h-3 w-3" />
                <span>{t.updatedLive}</span>
              </div>
            </div>
            
            <div className="stat-card" ref={usersCounter.ref}>
              <div className="text-3xl md:text-4xl font-mono font-black text-foreground">{usersCounter.count.toLocaleString()}+</div>
              <div className="mt-1 text-sm text-muted-foreground">{t.activeAnalysts}</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                <Users className="h-3 w-3" />
                <span>{t.growingDaily}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="text-3xl md:text-4xl font-mono font-black text-success">+$2.4M</div>
              <div className="mt-1 text-sm text-muted-foreground">{t.userWinnings}</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                <Trophy className="h-3 w-3" />
                <span>{t.thisMonth}</span>
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
              <span>{t.howItWorks}</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t.startWinningIn3Steps.split(' ').slice(0, -2).join(' ')} <span className="gradient-text">{t.startWinningIn3Steps.split(' ').slice(-2).join(' ')}</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.fromSignupToWinning}
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
        className={`py-12 md:py-16 bg-card/30 border-y border-border transition-all duration-700 ${testimonialsReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-sm font-medium text-success mb-4">
              <Trophy className="h-4 w-4" />
              <span>{t.successStories}</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t.winnersTrustUs.split(' ')[0]} <span className="gradient-text">{t.winnersTrustUs.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.joinCommunity}
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
        className={`py-12 md:py-16 transition-all duration-700 ${predictionsReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-4">
              <Target className="h-4 w-4" />
              <span>LIVE</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t.todaysTopPicks}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.highestConfidence}
            </p>
          </div>

          {/* Predictions grid */}
          {predictionsLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card h-64 animate-pulse" />
              ))}
            </div>
          ) : featuredPredictions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {featuredPredictions.map((prediction, index) => (
                <PredictionCard 
                  key={prediction.id} 
                  prediction={prediction}
                  gameNumber={index + 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t.noPredictions}
            </div>
          )}

          {/* View all button */}
          <div className="mt-12 text-center">
            <Link to="/predictions">
              <Button size="lg" variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary">
                {t.viewAll} {t.predictions}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-10 border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-4">
              <Mail className="h-4 w-4" />
              <span>{t.getDailyPicks}</span>
            </div>
            <h2 className="text-2xl font-bold">{t.getDailyPicks}</h2>
            <p className="mt-2 text-muted-foreground">{t.enterEmail}</p>
            
            <form onSubmit={handleNewsletterSubmit} className="mt-6 flex gap-3">
              <Input
                type="email"
                placeholder={t.enterEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" className="btn-gradient" disabled={isSubscribing}>
                {isSubscribing ? '...' : t.subscribeToNewsletter}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Prove It Section - Verified Results */}
      <ProveItSection />

      {/* Final CTA Section */}
      <section 
        ref={ctaReveal.ref}
        className={`py-20 md:py-28 transition-all duration-700 ${ctaReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card-premium p-12 text-center bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t.readyToWin}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              {t.joinWinningTeam}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="btn-cta-premium h-14 px-10 text-lg">
                  {t.createFreeAccount}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/predictions">
                <Button variant="outline" size="lg" className="h-14 px-8">
                  {t.viewPredictions}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Casinos */}
      <AffiliateCasinos />

      <Footer />
    </div>
  );
};

export default Index;
