import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface EnhancedStatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  isLive?: boolean;
  gradient?: 'blue' | 'green' | 'yellow' | 'red' | 'cyan' | 'amber' | 'dynamic';
  dynamicValue?: number;
  subText?: string;
  showSparkline?: boolean;
  sparklineData?: number[];
  showProgressRing?: boolean;
  isHero?: boolean;
  showWaiting?: boolean;
  nextGameIn?: string;
  todayCount?: number;
}

export function EnhancedStatCard({
  title,
  value,
  suffix = '',
  prefix = '',
  icon,
  isLive = false,
  gradient = 'blue',
  dynamicValue,
  subText,
  showSparkline = false,
  sparklineData = [],
  showProgressRing = false,
  isHero = false,
  showWaiting = false,
  nextGameIn,
  todayCount,
}: EnhancedStatCardProps) {
  const { language } = useLanguage();
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  const isNumeric = typeof value === 'number' && !isNaN(numericValue);

  // Animated counter
  useEffect(() => {
    if (!isNumeric || showWaiting) {
      setDisplayValue(numericValue || 0);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const stepValue = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue, isNumeric, showWaiting]);

  // Sparkline path
  const sparklinePath = useMemo(() => {
    if (!sparklineData.length) return '';
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    
    const points = sparklineData.map((val, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  }, [sparklineData]);

  const getGradientClasses = () => {
    if (gradient === 'dynamic' && dynamicValue !== undefined) {
      if (dynamicValue >= 65) return 'from-success/10 to-success/5';
      if (dynamicValue >= 50) return 'from-yellow-500/10 to-yellow-600/5';
      return 'from-destructive/10 to-destructive/5';
    }
    
    switch (gradient) {
      case 'blue': return 'from-blue-500/10 to-blue-600/5';
      case 'green': return 'from-success/10 to-success/5';
      case 'yellow': return 'from-yellow-500/10 to-yellow-600/5';
      case 'red': return 'from-destructive/10 to-destructive/5';
      case 'cyan': return 'from-cyan-500/10 to-cyan-600/5';
      case 'amber': return 'from-amber-500/10 to-amber-600/5';
      default: return 'from-primary/10 to-primary/5';
    }
  };

  const getGlowClass = () => {
    if (isHero && dynamicValue && dynamicValue >= 65) return 'stat-glow-green';
    switch (gradient) {
      case 'blue': return 'stat-glow-blue';
      case 'green': return 'stat-glow-green';
      case 'cyan': return 'stat-glow-cyan';
      case 'amber': case 'yellow': return 'stat-glow-gold';
      default: return '';
    }
  };

  const getAccuracyColor = () => {
    if (gradient === 'dynamic' && dynamicValue !== undefined) {
      if (dynamicValue >= 65) return 'text-success';
      if (dynamicValue >= 50) return 'text-yellow-400';
      return 'text-destructive';
    }
    return 'text-foreground';
  };

  return (
    <div
      className={cn(
        'glass-card relative overflow-hidden p-3 sm:p-6 transition-all duration-300',
        'hover:scale-[1.03] hover:shadow-lg hover:shadow-cyan-500/10 hover:border-primary/30',
        `bg-gradient-to-br ${getGradientClasses()}`
      )}
    >
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 h-24 sm:h-32 w-24 sm:w-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/5 blur-3xl" />

      <div className="relative">
        <div className="mb-2 sm:mb-4 flex items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</h3>
          {icon && (
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              {icon}
            </div>
          )}
        </div>

        {/* Main value display */}
        {showWaiting ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-hourglass">⏳</span>
            <div>
              <span className="text-sm text-muted-foreground animate-premium-shimmer bg-clip-text">
                {language === 'cz' ? 'Sbíráme data...' : 'Collecting data...'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Progress ring for accuracy */}
            {showProgressRing && dynamicValue !== undefined && (
              <div className="relative h-14 w-14 shrink-0">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted/30"
                  />
                  <circle
                    cx="18" cy="18" r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${dynamicValue} 100`}
                    strokeLinecap="round"
                    className={cn(
                      "animate-ring-fill",
                      dynamicValue >= 70 ? "text-success" :
                      dynamicValue >= 50 ? "text-warning" :
                      "text-destructive"
                    )}
                  />
                </svg>
              </div>
            )}
            
            <div className={cn("flex flex-col", isHero && "sparkle-container relative")}>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    'font-mono font-bold tracking-tight',
                    isHero ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-3xl',
                    gradient === 'dynamic' ? getAccuracyColor() : 'text-foreground',
                    getGlowClass()
                  )}
                >
                  {prefix}
                  {isNumeric ? Math.round(displayValue).toLocaleString() : value}
                  {suffix}
                </span>
                {isLive && (
                  <span className="relative ml-1.5 sm:ml-2 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  </span>
                )}
              </div>
              
              {/* Sub text */}
              {subText && (
                <span className="text-xs text-muted-foreground mt-1">{subText}</span>
              )}
              
              {/* Today count */}
              {todayCount !== undefined && todayCount > 0 && (
                <span className="text-xs text-primary font-medium mt-0.5">
                  +{todayCount} {language === 'cz' ? 'dnes' : 'today'}
                </span>
              )}
              
              {/* Next game countdown */}
              {nextGameIn && (
                <span className="text-xs text-cyan-400 mt-0.5 flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </span>
                  {nextGameIn} {language === 'cz' ? 'do dalšího' : 'until next'}
                </span>
              )}
              
              {/* Trophy for high accuracy */}
              {isHero && dynamicValue && dynamicValue >= 70 && (
                <span className="text-xs text-warning font-medium mt-1 flex items-center gap-1">
                  🏆 {language === 'cz' ? 'Nejlepší v historii!' : 'Best ever!'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sparkline chart */}
        {showSparkline && sparklineData.length > 0 && (
          <div className="mt-3 h-[30px] w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`sparkline-${gradient}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={sparklinePath}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
