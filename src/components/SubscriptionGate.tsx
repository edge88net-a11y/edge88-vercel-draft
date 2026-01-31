import { Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface SubscriptionGateProps {
  children: React.ReactNode;
  isLocked: boolean;
}

export function SubscriptionGate({ children, isLocked }: SubscriptionGateProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
        <div className="text-center p-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Unlock Premium Picks</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Free users get 3 picks. Upgrade to Pro for unlimited access to all predictions.
          </p>
          <Link to="/pricing">
            <Button className="btn-gradient gap-2">
              <Zap className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
