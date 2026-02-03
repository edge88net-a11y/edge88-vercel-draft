import { useState, useEffect } from 'react';
import { APIPrediction } from '@/hooks/usePredictions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const BETTING_SLIP_KEY = 'edge88_betting_slip';

interface BettingSlipItem {
  prediction: APIPrediction;
  addedAt: number;
}

export function useBettingSlip() {
  const [slipItems, setSlipItems] = useState<BettingSlipItem[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);

  // Load from Supabase (if logged in) or localStorage
  useEffect(() => {
    const loadSlip = async () => {
      setIsLoading(true);
      
      // Try Supabase first if logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from('betting_slips')
            .select('*')
            .eq('user_id', user.id)
            .order('added_at', { ascending: false });

          if (error) {
            console.error('Error loading betting slip from Supabase:', error);
            // Fall back to localStorage
            loadFromLocalStorage();
          } else if (data && data.length > 0) {
            const items: BettingSlipItem[] = data.map((row) => ({
              prediction: row.prediction_data,
              addedAt: new Date(row.added_at).getTime(),
            }));
            setSlipItems(items);
            setLastSyncTime(Date.now());
            // Also save to localStorage as backup
            localStorage.setItem(BETTING_SLIP_KEY, JSON.stringify(items));
          } else {
            // No items in Supabase, check localStorage
            loadFromLocalStorage();
          }
        } catch (err) {
          console.error('Error in Supabase sync:', err);
          loadFromLocalStorage();
        }
      } else {
        // Not logged in, use localStorage
        loadFromLocalStorage();
      }
      
      setIsLoading(false);
    };

    loadSlip();
  }, [user]);

  // Helper: Load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(BETTING_SLIP_KEY);
      if (stored) {
        const items = JSON.parse(stored) as BettingSlipItem[];
        setSlipItems(items);
      }
    } catch (error) {
      console.error('Error loading betting slip from localStorage:', error);
    }
  };

  // Save to localStorage whenever slip changes
  useEffect(() => {
    try {
      localStorage.setItem(BETTING_SLIP_KEY, JSON.stringify(slipItems));
    } catch (error) {
      console.error('Error saving betting slip:', error);
    }
  }, [slipItems]);

  // Sync to Supabase when logged in (debounced)
  useEffect(() => {
    if (!user || isLoading) return;
    
    // Debounce: only sync if items changed and it's been >1 second since last sync
    const now = Date.now();
    if (now - lastSyncTime < 1000) return;

    const syncToSupabase = async () => {
      try {
        // Delete existing slips for this user
        await supabase
          .from('betting_slips')
          .delete()
          .eq('user_id', user.id);

        // Insert new slips
        if (slipItems.length > 0) {
          const rows = slipItems.map((item) => ({
            user_id: user.id,
            prediction_id: item.prediction.id,
            prediction_data: item.prediction,
            added_at: new Date(item.addedAt).toISOString(),
          }));

          const { error } = await supabase
            .from('betting_slips')
            .insert(rows);

          if (error) {
            console.error('Error syncing to Supabase:', error);
          } else {
            setLastSyncTime(Date.now());
          }
        }
      } catch (err) {
        console.error('Error in Supabase sync:', err);
      }
    };

    // Debounce: wait 1 second after last change
    const timeoutId = setTimeout(syncToSupabase, 1000);
    return () => clearTimeout(timeoutId);
  }, [slipItems, user, isLoading, lastSyncTime]);

  const addToSlip = (prediction: APIPrediction) => {
    setSlipItems((prev) => {
      // Check if already in slip
      if (prev.some((item) => item.prediction.id === prediction.id)) {
        return prev;
      }
      return [...prev, { prediction, addedAt: Date.now() }];
    });
  };

  const removeFromSlip = (predictionId: string) => {
    setSlipItems((prev) => prev.filter((item) => item.prediction.id !== predictionId));
  };

  const clearSlip = () => {
    setSlipItems([]);
  };

  const isInSlip = (predictionId: string) => {
    return slipItems.some((item) => item.prediction.id === predictionId);
  };

  // Calculate combined odds (multiply all odds)
  const getCombinedOdds = (): number => {
    if (slipItems.length === 0) return 0;
    
    return slipItems.reduce((acc, item) => {
      const odds = item.prediction.prediction.odds || '-110';
      // Convert to decimal odds
      let decimal = 2.0; // default
      if (odds.startsWith('+')) {
        decimal = 1 + parseInt(odds.slice(1)) / 100;
      } else if (odds.startsWith('-')) {
        decimal = 1 + 100 / Math.abs(parseInt(odds));
      }
      return acc * decimal;
    }, 1);
  };

  // Calculate potential payout
  const getPotentialPayout = (stake: number): number => {
    const combinedOdds = getCombinedOdds();
    return stake * combinedOdds;
  };

  return {
    slipItems,
    addToSlip,
    removeFromSlip,
    clearSlip,
    isInSlip,
    slipCount: slipItems.length,
    getCombinedOdds,
    getPotentialPayout,
    isLoading,
  };
}
