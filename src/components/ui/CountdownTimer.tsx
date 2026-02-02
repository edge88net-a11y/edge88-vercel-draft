import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
  onExpire?: () => void;
}

export function CountdownTimer({ targetDate, className, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        onExpire?.();
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 min-w-[3rem] text-center border border-gray-700"
          >
            <span className="text-2xl font-bold font-mono tabular-nums text-cyan-400">
              {value.toString().padStart(2, '0')}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className={cn('flex gap-2 items-center', className)}>
      <TimeUnit value={timeLeft.hours} label="h" />
      <span className="text-gray-600 text-xl">:</span>
      <TimeUnit value={timeLeft.minutes} label="m" />
      <span className="text-gray-600 text-xl">:</span>
      <TimeUnit value={timeLeft.seconds} label="s" />
    </div>
  );
}
