import { Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { isAdminUser } from '@/lib/adminAccess';

interface SubscriptionGateProps {
  children: React.ReactNode;
  isLocked: boolean;
}

export function SubscriptionGate({ children, isLocked }: SubscriptionGateProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Admin users NEVER see locked content
  if (isAdminUser(user?.email)) {
    return <>{children}</>;
  }

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
          <h3 className="text-lg font-bold mb-2">
            {user ? t.upgradeToSeeAll : t.signUpToSeeMore}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            {user 
              ? t.upgradeToSeeAll 
              : t.signUpToSeeMore
            }
          </p>
          <div className="flex flex-col gap-2">
            {!user && (
              <Link to="/signup">
                <Button variant="outline" className="w-full">
                  {t.signUpFree}
                </Button>
              </Link>
            )}
            <Link to="/pricing">
              <Button className="btn-gradient gap-2 w-full">
                <Zap className="h-4 w-4" />
                {t.upgradeToPro}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}