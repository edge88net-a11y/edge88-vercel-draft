import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { APIPrediction } from './usePredictions';

interface SavedPick {
  id: string;
  predictionId: string;
  prediction: APIPrediction;
  savedAt: string;
}

// Local storage key
const SAVED_PICKS_KEY = 'edge88_saved_picks';

export function useSavedPicks() {
  const { user } = useAuth();
  const [savedPicks, setSavedPicks] = useState<SavedPick[]>([]);

  // Load saved picks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SAVED_PICKS_KEY);
    if (stored) {
      try {
        setSavedPicks(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved picks:', e);
        setSavedPicks([]);
      }
    }
  }, []);

  // Save to localStorage whenever picks change
  useEffect(() => {
    localStorage.setItem(SAVED_PICKS_KEY, JSON.stringify(savedPicks));
  }, [savedPicks]);

  const savePick = useCallback((prediction: APIPrediction) => {
    setSavedPicks((prev) => {
      // Check if already saved
      if (prev.some((p) => p.predictionId === prediction.id)) {
        return prev;
      }
      
      const newPick: SavedPick = {
        id: `${prediction.id}-${Date.now()}`,
        predictionId: prediction.id,
        prediction,
        savedAt: new Date().toISOString(),
      };
      
      return [...prev, newPick];
    });
  }, []);

  const removePick = useCallback((predictionId: string) => {
    setSavedPicks((prev) => prev.filter((p) => p.predictionId !== predictionId));
  }, []);

  const isPicked = useCallback(
    (predictionId: string) => savedPicks.some((p) => p.predictionId === predictionId),
    [savedPicks]
  );

  const togglePick = useCallback(
    (prediction: APIPrediction) => {
      if (isPicked(prediction.id)) {
        removePick(prediction.id);
      } else {
        savePick(prediction);
      }
    },
    [isPicked, savePick, removePick]
  );

  // Calculate stats from saved picks
  const stats = {
    total: savedPicks.length,
    wins: savedPicks.filter((p) => p.prediction.result === 'win').length,
    losses: savedPicks.filter((p) => p.prediction.result === 'loss').length,
    pending: savedPicks.filter((p) => p.prediction.result === 'pending').length,
    accuracy: savedPicks.length > 0
      ? (savedPicks.filter((p) => p.prediction.result === 'win').length /
          savedPicks.filter((p) => p.prediction.result !== 'pending').length) *
          100 || 0
      : 0,
  };

  return {
    savedPicks,
    savePick,
    removePick,
    isPicked,
    togglePick,
    stats,
  };
}
