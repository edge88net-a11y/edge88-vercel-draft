import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const PRICE_IDS: Record<string, string> = {
  free: 'price_1SvmvbCGtNnJEwcrwcshnv9J',
  starter: 'price_1SvmvcCGtNnJEwcr9yN8YilI',
  pro: 'price_1SvmvcCGtNnJEwcrj2oJn97l',
  elite: 'price_1SvmvcCGtNnJEwcr5gs9nGRa',
};

export function useCheckout() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const checkout = async (tier: string) => {
    // Free tier doesn't need checkout
    if (tier === 'free') {
      toast({
        title: 'Already on Free Plan',
        description: 'Upgrade to a paid plan for unlimited predictions.',
      });
      return;
    }

    // Require login for checkout
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to subscribe.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(tier);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          tier,
          priceId: PRICE_IDS[tier],
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { url } = response.data;
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return { checkout, isLoading };
}
