import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAIL = 'edge88.net@gmail.com';

export interface UserTier {
  tier: 'admin' | 'elite' | 'pro' | 'starter' | 'none';
  label: string;
  labelCz: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  isAdmin: boolean;
  subscriptionEnd: string | null;
}

const TIER_MAP: Record<string, Omit<UserTier, 'tier' | 'subscriptionEnd'>> = {
  admin: {
    label: 'ADMIN',
    labelCz: 'ADMIN',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    icon: '👑',
    isAdmin: true,
  },
  elite: {
    label: 'ELITE',
    labelCz: 'ELITE',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    icon: '💎',
    isAdmin: false,
  },
  pro: {
    label: 'PRO',
    labelCz: 'PRO',
    color: 'text-primary',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary/30',
    icon: '⚡',
    isAdmin: false,
  },
  starter: {
    label: 'STARTER',
    labelCz: 'STARTER',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    icon: '🎯',
    isAdmin: false,
  },
  none: {
    label: 'Choose Plan',
    labelCz: 'Vyberte plán',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
    icon: '→',
    isAdmin: false,
  },
};

export function useUserTier(): UserTier & { isLoading: boolean } {
  const { user } = useAuth();
  const [tierData, setTierData] = useState<UserTier>({
    tier: 'none',
    ...TIER_MAP.none,
    subscriptionEnd: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTier = async () => {
      if (!user) {
        setTierData({ tier: 'none', ...TIER_MAP.none, subscriptionEnd: null });
        setIsLoading(false);
        return;
      }

      // Admin check - hardcoded email
      if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setTierData({ tier: 'admin', ...TIER_MAP.admin, subscriptionEnd: null });
        setIsLoading(false);
        return;
      }

      try {
        // Check subscription from Supabase
        const { data: sub, error } = await supabase
          .from('subscriptions')
          .select('tier, status, current_period_end')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
        }

        const subscriptionEnd = sub?.current_period_end || null;

        if (sub?.tier) {
          const normalizedTier = sub.tier.toLowerCase();
          if (normalizedTier === 'elite') {
            setTierData({ tier: 'elite', ...TIER_MAP.elite, subscriptionEnd });
          } else if (normalizedTier === 'pro') {
            setTierData({ tier: 'pro', ...TIER_MAP.pro, subscriptionEnd });
          } else if (normalizedTier === 'starter' || normalizedTier === 'basic') {
            setTierData({ tier: 'starter', ...TIER_MAP.starter, subscriptionEnd });
          } else {
            setTierData({ tier: 'none', ...TIER_MAP.none, subscriptionEnd: null });
          }
        } else {
          setTierData({ tier: 'none', ...TIER_MAP.none, subscriptionEnd: null });
        }
      } catch (err) {
        console.error('Error in useUserTier:', err);
        setTierData({ tier: 'none', ...TIER_MAP.none, subscriptionEnd: null });
      }

      setIsLoading(false);
    };

    fetchTier();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchTier();
    });

    return () => subscription.unsubscribe();
  }, [user]);

  return { ...tierData, isLoading };
}
