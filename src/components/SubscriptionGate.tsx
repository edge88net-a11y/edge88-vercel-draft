import { Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

interface SubscriptionGateProps {
  children: React.ReactNode;
  /** Whether this content should be locked */
  isLocked?: boolean;
  /** The tier required to view this content */
  requiredTier?: 'starter' | 'pro' | 'elite';
  /** Custom blur amount (default: sm) */
  blurAmount?: 'sm' | 'md' | 'lg';
  /** Show the matchup/header even when locked */
  showPreview?: boolean;
  /** Preview content to show when locked (above the blurred content) */
  previewContent?: React.ReactNode;
}

const tierLabels = {
  starter: { en: 'Starter', cz: 'Starter' },
  pro: { en: 'Pro', cz: 'Pro' },
  elite: { en: 'Elite', cz: 'Elite' },
};

export function SubscriptionGate({ 
  children, 
  isLocked = false,
  requiredTier = 'starter',
  blurAmount = 'sm',
  showPreview = false,
  previewContent,
}: SubscriptionGateProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { canViewPrediction, isAdmin } = useSubscriptionAccess();

  // Admin users NEVER see locked content
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check if user can view this tier
  const canView = canViewPrediction(requiredTier);

  if (!isLocked && canView) {
    return <>{children}</>;
  }

  const blurClass = {
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg',
  }[blurAmount];

  const tierLabel = tierLabels[requiredTier]?.[language as 'en' | 'cz'] || requiredTier;

  return (
    <div className="relative">
      {/* Preview content if provided */}
      {showPreview && previewContent && (
        <div className="mb-2">
          {previewContent}
        </div>
      )}
      
      {/* Blurred content */}
      <div className={`pointer-events-none select-none ${blurClass}`}>
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
        <div className="text-center p-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">
            {language === 'cz' 
              ? `🔒 Odemkněte s plánem ${tierLabel}` 
              : `🔒 Unlock with ${tierLabel} plan`}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            {user 
              ? (language === 'cz' 
                  ? 'Upgradujte pro přístup k této predikci a dalším prémivoým funkcím.' 
                  : 'Upgrade to access this prediction and more premium features.')
              : (language === 'cz'
                  ? 'Přihlaste se a vyberte plán pro plný přístup.'
                  : 'Sign in and choose a plan for full access.')
            }
          </p>
          <div className="flex flex-col gap-2">
            {!user && (
              <Link to="/signup">
                <Button variant="outline" className="w-full">
                  {language === 'cz' ? 'Vytvořit účet' : 'Create Account'}
                </Button>
              </Link>
            )}
            <Link to="/pricing">
              <Button className="btn-gradient gap-2 w-full">
                <Zap className="h-4 w-4" />
                {language === 'cz' ? 'Zobrazit plány' : 'View Plans'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
