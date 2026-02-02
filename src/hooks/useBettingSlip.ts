import { useState, useEffect } from 'react';
import { APIPrediction } from '@/hooks/usePredictions';

const BETTING_SLIP_KEY = 'edge88_betting_slip';

interface BettingSlipItem {
  prediction: APIPrediction;
  addedAt: number;
}

export function useBettingSlip() {
  const [slipItems, setSlipItems] = useState<BettingSlipItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BETTING_SLIP_KEY);
      if (stored) {
        const items = JSON.parse(stored) as BettingSlipItem[];
        setSlipItems(items);
      }
    } catch (error) {
      console.error('Error loading betting slip:', error);
    }
  }, []);

  // Save to localStorage whenever slip changes
  useEffect(() => {
    try {
      localStorage.setItem(BETTING_SLIP_KEY, JSON.stringify(slipItems));
    } catch (error) {
      console.error('Error saving betting slip:', error);
    }
  }, [slipItems]);

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
  };
}
