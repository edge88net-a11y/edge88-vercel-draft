import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';

// Animated counter for profit display
function useAnimatedValue(target: number, duration: number = 500) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    const startValue = prevTarget.current;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(startValue + (target - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    prevTarget.current = target;
  }, [target, duration]);

  return value;
}

export function MoneyCalculator() {
  const { language } = useLanguage();
  const [bankroll, setBankroll] = useState(10000);
  const [betsPerDay, setBetsPerDay] = useState(3);
  const [avgOdds, setAvgOdds] = useState(1.85);

  // Calculate profits based on 73% accuracy
  const accuracy = 0.73;
  const betSize = bankroll * 0.02; // 2% of bankroll per bet
  const expectedProfit = betSize * ((accuracy * avgOdds) - 1);
  const dailyProfit = Math.round(expectedProfit * betsPerDay);
  const weeklyProfit = dailyProfit * 7;
  const monthlyProfit = dailyProfit * 30;

  // Animated values
  const animatedDaily = useAnimatedValue(dailyProfit);
  const animatedWeekly = useAnimatedValue(weeklyProfit);
  const animatedMonthly = useAnimatedValue(monthlyProfit);

  const formatCurrency = (amount: number) => {
    if (language === 'cz') {
      return `${amount.toLocaleString('cs-CZ')} Kč`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  return (
    <section className="py-16 border-y border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-sm font-medium text-success mb-4">
            <Calculator className="h-4 w-4" />
            <span>{language === 'cz' ? 'Kalkulačka zisku' : 'Profit Calculator'}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            💰 {language === 'cz' ? 'Kolik můžete vydělat?' : 'How Much Could You Earn?'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {language === 'cz' 
              ? 'Naše 73% přesnost znamená konzistentní zisky'
              : 'Our 73% accuracy means consistent profits'}
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Sliders */}
            <div className="space-y-8">
              {/* Bankroll Slider */}
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-medium">
                    {language === 'cz' ? 'Počáteční bankroll' : 'Starting Bankroll'}
                  </label>
                  <span className="font-mono font-bold text-primary text-lg">
                    {formatCurrency(bankroll)}
                  </span>
                </div>
                <Slider
                  value={[bankroll]}
                  onValueChange={(v) => setBankroll(v[0])}
                  min={1000}
                  max={100000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatCurrency(1000)}</span>
                  <span>{formatCurrency(100000)}</span>
                </div>
              </div>

              {/* Bets Per Day Slider */}
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-medium">
                    {language === 'cz' ? 'Sázek denně' : 'Bets Per Day'}
                  </label>
                  <span className="font-mono font-bold text-primary text-lg">{betsPerDay}</span>
                </div>
                <Slider
                  value={[betsPerDay]}
                  onValueChange={(v) => setBetsPerDay(v[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              {/* Average Odds Slider */}
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-medium">
                    {language === 'cz' ? 'Průměrný kurz' : 'Average Odds'}
                  </label>
                  <span className="font-mono font-bold text-primary text-lg">{avgOdds.toFixed(2)}</span>
                </div>
                <Slider
                  value={[avgOdds * 100]}
                  onValueChange={(v) => setAvgOdds(v[0] / 100)}
                  min={150}
                  max={300}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1.50</span>
                  <span>3.00</span>
                </div>
              </div>

              {/* Accuracy display */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/30">
                <span className="text-sm font-medium">
                  {language === 'cz' ? 'Naše přesnost' : 'Our Accuracy'}
                </span>
                <span className="font-mono text-2xl font-black text-success">73%</span>
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col justify-center space-y-4">
              {/* Daily */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                <span className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Denní zisk' : 'Daily Profit'}
                </span>
                <span className="font-mono text-xl font-bold text-success">
                  +{formatCurrency(animatedDaily)}
                </span>
              </div>

              {/* Weekly */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                <span className="text-sm text-muted-foreground">
                  {language === 'cz' ? 'Týdenní zisk' : 'Weekly Profit'}
                </span>
                <span className="font-mono text-2xl font-bold text-success">
                  +{formatCurrency(animatedWeekly)}
                </span>
              </div>

              {/* Monthly - Featured */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 border-2 border-success/40 text-center">
                <TrendingUp className="h-10 w-10 text-success mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  {language === 'cz' ? 'Potenciální měsíční zisk' : 'Potential Monthly Profit'}
                </p>
                <div className="font-mono text-4xl sm:text-5xl font-black text-success animate-pulse">
                  +{formatCurrency(animatedMonthly)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {language === 'cz' 
                    ? `S ${formatCurrency(bankroll)} a ${betsPerDay} sázkami denně při kurzu ${avgOdds.toFixed(2)}`
                    : `With ${formatCurrency(bankroll)} and ${betsPerDay} bets/day at ${avgOdds.toFixed(2)} odds`}
                </p>
              </div>

              {/* CTA */}
              <Link to="/signup" className="mt-4">
                <Button size="lg" className="btn-cta-premium w-full gap-2 h-14 text-lg">
                  <Zap className="h-5 w-5" />
                  {language === 'cz' ? 'Začněte vydělávat →' : 'Start Earning →'}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {language === 'cz' 
            ? '* Kalkulace je orientační. Minulé výsledky nezaručují budoucí výnosy. Sázejte zodpovědně.'
            : '* Based on historical accuracy. Past results don\'t guarantee future performance. Gamble responsibly.'}
        </p>
      </div>
    </section>
  );
}