import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Referral {
  id: string;
  referrer_user_id: string;
  referred_user_id: string | null;
  referral_code: string;
  tips_earned: number;
  status: string;
  created_at: string;
  converted_at: string | null;
}

export interface ReferralStats {
  referralCode: string;
  totalReferred: number;
  tipsEarned: number;
  pendingReferrals: number;
}

export function useReferrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's referral code and stats
  const { data: referralStats, isLoading } = useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async (): Promise<ReferralStats> => {
      if (!user?.id) {
        return { referralCode: '', totalReferred: 0, tipsEarned: 0, pendingReferrals: 0 };
      }

      // Get user's own referral code
      const { data: ownReferral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      // Get all referrals where this user is the referrer
      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', user.id)
        .neq('status', 'active');

      const totalReferred = referrals?.filter(r => r.referred_user_id)?.length || 0;
      const tipsEarned = referrals?.reduce((sum, r) => sum + (r.tips_earned || 0), 0) || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending')?.length || 0;

      return {
        referralCode: ownReferral?.referral_code || '',
        totalReferred,
        tipsEarned,
        pendingReferrals,
      };
    },
    enabled: !!user?.id,
  });

  // Get top referrers leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ['referral-leaderboard'],
    queryFn: async () => {
      // For now, return mock data - in production this would be a proper query
      return [
        { rank: 1, name: 'David K.', referrals: 47, tips: 94 },
        { rank: 2, name: 'Michal R.', referrals: 35, tips: 70 },
        { rank: 3, name: 'Sarah T.', referrals: 28, tips: 56 },
        { rank: 4, name: 'Jan P.', referrals: 22, tips: 44 },
        { rank: 5, name: 'You', referrals: referralStats?.totalReferred || 0, tips: referralStats?.tipsEarned || 0 },
      ];
    },
    enabled: !!referralStats,
  });

  // Apply referral code during signup
  const applyReferralCode = useMutation({
    mutationFn: async ({ code, userId }: { code: string; userId: string }) => {
      // Find the referral code
      const { data: referral, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referral_code', code.toUpperCase())
        .eq('status', 'active')
        .maybeSingle();

      if (error || !referral) {
        throw new Error('Invalid referral code');
      }

      // Create a new referral record for this conversion
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: referral.referrer_user_id,
          referred_user_id: userId,
          referral_code: code.toUpperCase() + '_' + Date.now(),
          status: 'converted',
          tips_earned: 2,
          converted_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
      toast({
        title: '🎉 Referral Applied!',
        description: 'Your friend will receive 2 free premium tips!',
      });
    },
    onError: () => {
      toast({
        title: 'Invalid Code',
        description: 'This referral code is not valid.',
        variant: 'destructive',
      });
    },
  });

  return {
    referralStats,
    leaderboard,
    isLoading,
    applyReferralCode: applyReferralCode.mutate,
  };
}
