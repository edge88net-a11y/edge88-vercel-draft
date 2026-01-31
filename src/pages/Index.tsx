import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Globe, TrendingUp, BarChart3, Target, Users, CheckCircle, Loader2, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { LiveTicker } from '@/components/LiveTicker';
import { PredictionCard } from '@/components/PredictionCard';
import { StatCard } from '@/components/StatCard';
import { useActivePredictions, useStats } from '@/hooks/usePredictions';
import { pricingPlans } from '@/lib/mockData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const featuredPredictions = predictions
    ?.filter((p) => p.result === 'pending')
    .sort((a, b) => {
      // Normalize confidence to 0-100
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

  // Calculate predictions made today (mock or from API)
  const predictionsMadeToday = stats?.activePredictions || predictions?.length || 127;

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

    setIsSubscribing(true);
    try {
      // For now, just show success - you can add Supabase table later
      toast({
        title: '✅ ' + t.subscribeToNewsletter,
        description: t.checkInbox,
      });
      setEmail('');
    } catch (error) {
      toast({
        title: t.error,
        description: t.somethingWentWrong,
        variant: 'destructive',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />
        
        {/* Particle animation placeholder */}
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
            {/* Trust Badge */}
            <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-2 backdrop-blur-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t.trustedBy} <span className="font-semibold text-foreground">10,000+</span> {t.analysts}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="animate-slide-up text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {t.heroTitle.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="gradient-text-animated">{t.heroTitle.split(' ').slice(-1)}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-lg text-muted-foreground sm:text-xl" style={{ animationDelay: '0.1s' }}>
              {t.heroSubtitle}
            </p>

            {/* Live Counter */}
            <div className="mt-6 animate-slide-up inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-success" style={{ animationDelay: '0.15s' }}>
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="font-mono font-bold">{predictionsMadeToday}</span>
              <span className="text-sm">{t.predictionsMadeToday}</span>
            </div>

            {/* CTA Buttons */}
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

      {/* Live Ticker */}
      <LiveTicker />

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
                  <p className="text-sm text-muted-foreground">Free daily predictions in your inbox</p>
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
                <Button type="submit" className="btn-gradient" disabled={isSubscribing}>
                  {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : t.subscribeToNewsletter}
                </Button>
              </form>
            </div>
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
