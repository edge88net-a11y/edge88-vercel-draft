import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MoneyRainProps {
  active: boolean;
  duration?: number;
  count?: number;
}

interface Coin {
  id: number;
  x: number;
  delay: number;
  emoji: string;
}

export function MoneyRain({ active, duration = 4000, count = 30 }: MoneyRainProps) {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    if (active) {
      const emojis = ['💰', '💵', '💴', '💶', '💷', '🪙'];
      const newCoins = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }));
      setCoins(newCoins);

      const timer = setTimeout(() => {
        setCoins([]);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setCoins([]);
    }
  }, [active, duration, count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            className="absolute text-4xl"
            style={{ left: `${coin.x}%`, top: '-10%' }}
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{
              y: '110vh',
              opacity: [1, 1, 0.5, 0],
              rotate: 360 * 3,
            }}
            transition={{
              duration: duration / 1000,
              delay: coin.delay,
              ease: 'linear',
            }}
            exit={{ opacity: 0 }}
          >
            {coin.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
