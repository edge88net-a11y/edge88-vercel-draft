import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Calendar, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserTier } from '@/hooks/useUserTier';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const tierConfig = {
  none: { label: 'No Plan', labelCz: 'Žádný plán', icon: '→', color: 'text-muted-foreground' },
  starter: { label: 'Starter', labelCz: 'Starter', icon: '🎯', color: 'text-blue-400' },
  pro: { label: 'Pro', labelCz: 'Pro', icon: '⚡', color: 'text-cyan-400' },
  elite: { label: 'Elite', labelCz: 'Elite', icon: '💎', color: 'text-purple-400' },
  admin: { label: 'Admin', labelCz: 'Admin', icon: '👑', color: 'text-yellow-400' },
};

export function BillingSection() {
  const { language } = useLanguage();
  const { tier, isAdmin, subscriptionEnd } = useUserTier();
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.none;

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {});
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: language === 'cz' ? 'Chyba' : 'Error',
        description: language === 'cz' 
          ? 'Nepodařilo se otevřít správu předplatného' 
          : 'Failed to open subscription management',
        variant: 'destructive',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {});
      
      if (error) throw error;
      
      toast({
        title: language === 'cz' ? 'Předplatné zrušeno' : 'Subscription Cancelled',
        description: language === 'cz' 
          ? 'Vaše předplatné bylo zrušeno. Máte přístup do konce období.' 
          : 'Your subscription has been cancelled. Access continues until period end.',
      });
    } catch (error) {
      toast({
        title: language === 'cz' ? 'Chyba' : 'Error',
        description: language === 'cz' 
          ? 'Nepodařilo se zrušit předplatné' 
          : 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  // Admin users don't see billing
  if (isAdmin) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4 flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">{language === 'cz' ? 'Fakturace' : 'Billing'}</h2>
        </div>
        <div className="p-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4">
            <span className="text-xl">👑</span>
            <span className="font-bold text-yellow-400">ADMIN</span>
          </div>
          <p className="text-muted-foreground">
            {language === 'cz' 
              ? 'Máte plný neomezený přístup. Žádné předplatné není potřeba.' 
              : 'You have full unlimited access. No subscription needed.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-border p-4 flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">{language === 'cz' ? 'Fakturace' : 'Billing'}</h2>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {language === 'cz' ? 'Aktuální plán' : 'Current Plan'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <span className={`font-bold ${config.color}`}>
                {language === 'cz' ? config.labelCz : config.label}
              </span>
            </div>
          </div>
          {tier === 'none' ? (
            <Link to="/pricing">
              <Button className="btn-gradient">
                {language === 'cz' ? 'Vybrat plán' : 'Choose Plan'}
              </Button>
            </Link>
          ) : (
            <Link to="/pricing">
              <Button variant="outline">
                {language === 'cz' ? 'Změnit plán' : 'Change Plan'}
              </Button>
            </Link>
          )}
        </div>

        {/* Subscription End Date */}
        {tier !== 'none' && subscriptionEnd && (
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'cz' ? 'Další platba' : 'Next billing date'}
              </p>
              <p className="font-medium">
                {new Date(subscriptionEnd).toLocaleDateString(language === 'cz' ? 'cs-CZ' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        {/* Manage Subscription */}
        {tier !== 'none' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {language === 'cz' ? 'Spravovat platební údaje' : 'Manage Payment Details'}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 text-destructive hover:text-destructive gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {language === 'cz' ? 'Zrušit předplatné' : 'Cancel Subscription'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {language === 'cz' ? 'Zrušit předplatné?' : 'Cancel Subscription?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === 'cz'
                      ? 'Opravdu chcete zrušit předplatné? Budete mít přístup do konce aktuálního období.'
                      : 'Are you sure you want to cancel? You will keep access until the end of your current period.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {language === 'cz' ? 'Zpět' : 'Go Back'}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      language === 'cz' ? 'Ano, zrušit' : 'Yes, Cancel'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}
