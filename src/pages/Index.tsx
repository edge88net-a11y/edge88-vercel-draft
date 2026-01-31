import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Globe, TrendingUp, BarChart3, Target, Users, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveTicker } from '@/components/LiveTicker';
import { PredictionCard } from '@/components/PredictionCard';
import { StatCard } from '@/components/StatCard';
import { useActivePredictions, useStats } from '@/hooks/usePredictions';
import { pricingPlans } from '@/lib/mockData';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered',
    description: 'Our models analyze millions of data points per prediction, including player stats, weather, injuries, and market sentiment.',
  },
  {
    icon: Shield,
    title: 'Transparent',
    description: 'Every prediction is timestamped before game start. Track our historical accuracy and verify every pick.',
  },
  {
    icon: Globe,
    title: 'Multi-Market',
    description: 'Coverage across NFL, NBA, NHL, MLB, Soccer, UFC, and prediction markets like Polymarket and Kalshi.',
  },
];

const Index = () => {
  const { data: predictions, isLoading: predictionsLoading } = useActivePredictions();
  const { data: stats, isLoading: statsLoading } = useStats();

  const featuredPredictions = predictions
    ?.filter((p) => p.result === 'pending')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3) || [];

  const displayStats = [
    { label: 'Overall Accuracy', value: stats?.accuracy ?? 64.8, suffix: '%', icon: Target },
    { label: 'Total Predictions', value: stats?.totalPredictions ?? 12847, icon: BarChart3 },
    { label: 'Average ROI', value: stats?.roi ?? 8.7, suffix: '%', prefix: '+', icon: TrendingUp },
    { label: 'Active Analysts', value: 10432, icon: Users },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Trust Badge */}
            <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-2 backdrop-blur-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Trusted by <span className="font-semibold text-foreground">10,000+</span> analysts
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="animate-slide-up text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              The Future of{' '}
              <span className="gradient-text-animated">Predictions</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-lg text-muted-foreground sm:text-xl" style={{ animationDelay: '0.1s' }}>
              AI-powered predictions across sports, crypto, and world events. 
              Built for analysts who demand transparency and accuracy.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex animate-slide-up flex-col items-center gap-4 sm:flex-row sm:justify-center" style={{ animationDelay: '0.2s' }}>
              <Link to="/signup">
                <Button size="xl" className="btn-gradient group w-full sm:w-auto">
                  <span className="flex items-center gap-2">
                    Start Predicting
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link to="/predictions">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  View Predictions
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
              Why Edge88?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Cutting-edge technology meets transparent tracking
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
                Today's Top Picks
              </h2>
              <p className="mt-2 text-muted-foreground">
                Highest confidence predictions for today
              </p>
            </div>
            <Link to="/predictions">
              <Button variant="ghost" className="gap-2">
                View All
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
              {featuredPredictions.map((prediction) => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          ) : (
            <div className="glass-card py-16 text-center">
              <Zap className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No active predictions</h3>
              <p className="mt-2 text-muted-foreground">Check back soon for new picks</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Proven Results
            </h2>
            <p className="mt-2 text-muted-foreground">
              Real-time stats from our verified predictions
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
              Simple Pricing
            </h2>
            <p className="mt-2 text-muted-foreground">
              Start free, upgrade when you're ready
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
                    Most Popular
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
                Start Predicting Today
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Join thousands of analysts using AI to gain an edge.
                Start free, no credit card required.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/signup">
                  <Button size="xl" className="btn-gradient group">
                    <span className="flex items-center gap-2">
                      Create Free Account
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
    </div>
  );
};

export default Index;
