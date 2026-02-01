import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';

export function MoneyCalculator() {
  const { language } = useLanguage();
  const [bankroll, setBankroll] = useState(10000);
  const [betsPerDay, setBetsPerDay] = useState(3);

  // Calculate monthly profit based on 73% accuracy
  // Using simplified Kelly criterion and flat betting
  const accuracy = 0.73;
  const avgOdds = 1.91; // ~-110 American odds
  const betSize = bankroll * 0.02; // 2% of bankroll per bet
  const expectedProfit = betSize * ((accuracy * avgOdds) - 1);
  const dailyProfit = expectedProfit * betsPerDay;
  const monthlyProfit = Math.round(dailyProfit * 30);

  const formatCurrency = (amount: number) => {
    if (language === 'cz') {
      return `${amount.toLocaleString('cs-CZ')} Kč`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  return (
    <section className="py-16 border-y border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-sm font-medium text-success mb-4">
            <Calculator className="h-4 w-4" />
            <span>{language === 'cz' ? 'Kalkulačka zisku' : 'Profit Calculator'}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {language === 'cz' ? 'Kolik můžete vydělat?' : 'How Much Could You Earn?'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {language === 'cz' 
              ? 'Naše 73% přesnost znamená konzistentní zisky'
              : 'Our 73% accuracy means consistent profits'}
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Sliders */}
            <div className="space-y-8">
              {/* Bankroll Slider */}
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-medium">
                    {language === 'cz' ? 'Počáteční bankroll' : 'Starting Bankroll'}
                  </label>
                  <span className="font-mono font-bold text-primary">
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
                  <span className="font-mono font-bold text-primary">{betsPerDay}</span>
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

              {/* Accuracy display */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/30">
                <span className="text-sm font-medium">
                  {language === 'cz' ? 'Naše přesnost' : 'Our Accuracy'}
                </span>
                <span className="font-mono text-2xl font-black text-success">73%</span>
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col justify-center items-center text-center p-8 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 border border-success/30">
              <TrendingUp className="h-12 w-12 text-success mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'cz' ? 'Potenciální měsíční zisk' : 'Potential Monthly Profit'}
              </p>
              <div className="font-mono text-5xl md:text-6xl font-black text-success mb-2 animate-pulse">
                +{formatCurrency(monthlyProfit)}
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'cz' 
                  ? `S ${formatCurrency(bankroll)} a ${betsPerDay} sázkami denně`
                  : `With ${formatCurrency(bankroll)} and ${betsPerDay} bets/day`}
              </p>

              <Link to="/signup" className="mt-6 w-full">
                <Button size="lg" className="btn-cta-premium w-full gap-2">
                  {language === 'cz' ? 'Začít vyhrávat' : 'Start Winning Now'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {language === 'cz' 
            ? '* Kalkulace je orientační. Skutečné výsledky se mohou lišit. Sázejte zodpovědně.'
            : '* Calculations are estimates. Actual results may vary. Gamble responsibly.'}
        </p>
      </div>
    </section>
  );
}
