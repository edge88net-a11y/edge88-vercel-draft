import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAffiliateClicks() {
  const { user } = useAuth();

  const trackClick = useMutation({
    mutationFn: async (casinoName: string) => {
      const { error } = await supabase
        .from('affiliate_clicks')
        .insert({
          user_id: user?.id || null,
          casino_name: casinoName,
        });

      if (error) throw error;
      return { success: true };
    },
  });

  return {
    trackClick: trackClick.mutate,
  };
}
