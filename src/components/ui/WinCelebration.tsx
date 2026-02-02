import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface WinCelebrationProps {
  show: boolean;
  amount: number;
  currency?: string;
  onComplete?: () => void;
}

export function WinCelebration({ show, amount, currency = 'Kč', onComplete }: WinCelebrationProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });

        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-8 rounded-3xl shadow-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.8 }}
            style={{
              boxShadow: '0 0 60px rgba(16, 185, 129, 0.6)',
            }}
          >
            <motion.div
              className="text-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: 3,
              }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-4xl font-bold mb-2">WINNER!</div>
              <div className="text-5xl font-bold">
                +{amount.toLocaleString()} {currency}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
