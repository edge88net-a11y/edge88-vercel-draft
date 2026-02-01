import { forwardRef, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaintenanceStateProps {
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
  autoRetrySeconds?: number;
}

export const MaintenanceState = forwardRef<HTMLDivElement, MaintenanceStateProps>(function MaintenanceState({ 
  onRetry, 
  title = "Crunching the Latest Data",
  subtitle = "Our AI is analyzing real-time odds, injury reports, and sharp money movements. Predictions will be available shortly.",
  autoRetrySeconds = 30 
}, ref) {
  const [countdown, setCountdown] = useState(autoRetrySeconds);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-retry
          if (onRetry) {
            setIsRetrying(true);
            onRetry();
            setTimeout(() => setIsRetrying(false), 2000);
          }
          return autoRetrySeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRetry, autoRetrySeconds]);

  const handleManualRetry = () => {
    setIsRetrying(true);
    setCountdown(autoRetrySeconds);
    if (onRetry) {
      onRetry();
    }
    setTimeout(() => setIsRetrying(false), 2000);
  };

  return (
    <div ref={ref} className="glass-card p-8 md:p-12 text-center max-w-2xl mx-auto">
      {/* Animated Logo/Icon */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        {/* Outer ring - pulsing */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
        
        {/* Middle ring - rotating */}
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-accent/50 animate-spin" 
             style={{ animationDuration: '8s' }} />
        
        {/* Inner circle with icon */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm flex items-center justify-center">
          <Zap className="w-8 h-8 text-primary animate-pulse" />
        </div>
        
        {/* Floating data points */}
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center animate-bounce" style={{ animationDelay: '0s' }}>
          <BarChart3 className="w-3 h-3 text-accent" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
          <span className="text-xs text-primary font-bold">%</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        {title}
      </h2>

      {/* Subtitle */}
      <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
        {subtitle}
      </p>

      {/* Progress indicators */}
      <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Analyzing odds</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.3s' }} />
          <span>Processing data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.6s' }} />
          <span>Building picks</span>
        </div>
      </div>

      {/* Countdown */}
      <div className="text-sm text-muted-foreground mb-6">
        {isRetrying ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting to prediction engine...</span>
          </div>
        ) : (
          <span>Auto-retry in <span className="text-primary font-medium">{countdown}s</span></span>
        )}
      </div>

      {/* Manual retry button */}
      <Button 
        onClick={handleManualRetry} 
        variant="outline" 
        className="gap-2"
        disabled={isRetrying}
      >
        {isRetrying ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {isRetrying ? 'Connecting...' : 'Retry Now'}
      </Button>

      {/* Status message */}
      <p className="mt-8 text-xs text-muted-foreground/70">
        Real data only. No mock predictions. Your trust is our priority.
      </p>
    </div>
  );
});

MaintenanceState.displayName = 'MaintenanceState';
