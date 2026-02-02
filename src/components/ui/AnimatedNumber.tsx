import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  tickSound?: boolean;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  tickSound = false,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const diff = end - start;
    const startTime = Date.now();

    if (diff === 0) return;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatted = displayValue.toFixed(decimals);

  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

interface TickerNumberProps {
  value: number;
  className?: string;
}

export function TickerNumber({ value, className }: TickerNumberProps) {
  const digits = value.toString().split('');

  return (
    <div className={cn('inline-flex font-mono font-black overflow-hidden', className)}>
      {digits.map((digit, i) => (
        <div
          key={i}
          className="inline-flex flex-col animate-tick"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <span>{digit}</span>
        </div>
      ))}
    </div>
  );
}

export function PulsingNumber({ value, className, pulse = true }: { value: number; className?: string; pulse?: boolean }) {
  const [shouldPulse, setShouldPulse] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current && pulse) {
      setShouldPulse(true);
      prevValue.current = value;
      
      const timeout = setTimeout(() => {
        setShouldPulse(false);
      }, 600);

      return () => clearTimeout(timeout);
    }
  }, [value, pulse]);

  return (
    <span className={cn(
      'font-mono font-black transition-all duration-200',
      shouldPulse && 'scale-110 text-primary win-pulse',
      className
    )}>
      {value}
    </span>
  );
}
