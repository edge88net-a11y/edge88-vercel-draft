import { useEffect } from 'react';
import { Trophy, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface WinCelebrationProps {
  profit: number;
  currency: 'cz' | 'en';
  trigger?: boolean;
}

export function WinCelebration({ profit, currency, trigger = true }: WinCelebrationProps) {
  useEffect(() => {
    if (!trigger || profit <= 0) return;

    // Determine celebration intensity based on profit
    const intensity = profit > 10000 ? 'massive' : profit > 5000 ? 'large' : 'normal';

    if (intensity === 'massive') {
      // Money rain effect
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#22c55e', '#10b981', '#34d399', '#ffd700'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#22c55e', '#10b981', '#34d399', '#ffd700'],
        });
      }, 250);

      return () => clearInterval(interval);
    } else if (intensity === 'large') {
      // Big confetti burst
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#34d399'],
      });
    } else {
      // Normal confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#34d399'],
      });
    }
  }, [trigger, profit]);

  if (profit <= 0) return null;

  const formattedProfit = new Intl.NumberFormat(currency === 'cz' ? 'cs-CZ' : 'en-US', {
    style: 'currency',
    currency: currency === 'cz' ? 'CZK' : 'USD',
    minimumFractionDigits: 0,
  }).format(profit);

  return (
    <div className="relative inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-success/20 to-success/10 border border-success/30 win-pulse">
      <Trophy className="h-6 w-6 text-success animate-bounce-attention" />
      
      <div>
        <div className="text-xs font-medium text-success/80">WIN!</div>
        <div className="font-mono text-xl font-black text-success stat-glow-green">
          +{formattedProfit}
        </div>
      </div>

      <Coins className="h-5 w-5 text-success/60 animate-pulse" />

      {/* Money symbols falling */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {profit > 5000 && [...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl text-success/30 money-rain"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            💰
          </div>
        ))}
      </div>
    </div>
  );
}

export function LossFade() {
  return (
    <div className="loss-fade">
      <div className="text-xs text-destructive/80 font-medium">Loss</div>
    </div>
  );
}
