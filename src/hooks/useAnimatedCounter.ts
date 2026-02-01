import { useState, useEffect, useRef } from 'react';

interface UseAnimatedCounterOptions {
  duration?: number;
  decimals?: number;
  delay?: number;
}

export function useAnimatedCounter(
  targetValue: number,
  options: UseAnimatedCounterOptions = {}
) {
  const { duration = 1500, decimals = 0, delay = 0 } = options;
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }

    const startAnimation = () => {
      hasStarted.current = true;
      startTimeRef.current = null;

      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function: ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = eased * targetValue;
        setDisplayValue(Number(currentValue.toFixed(decimals)));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    // Apply delay if specified
    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, decimals, delay]);

  return displayValue;
}

// Hook for multiple counters with staggered animations
export function useStaggeredCounters(
  values: number[],
  options: UseAnimatedCounterOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100, ...counterOptions } = options;
  
  return values.map((value, index) => {
    const [displayValue, setDisplayValue] = useState(0);
    
    useEffect(() => {
      const timeout = setTimeout(() => {
        let startTime: number | null = null;
        const duration = counterOptions.duration || 1500;
        
        const animate = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(Number((eased * value).toFixed(counterOptions.decimals || 0)));
          if (progress < 1) requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
      }, index * staggerDelay);
      
      return () => clearTimeout(timeout);
    }, [value]);
    
    return displayValue;
  });
}
