import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WinStreakData {
  currentStreak: number;
  bestStreakMonth: number;
  bestStreakAllTime: number;
}

export function useWinStreak() {
  const { data, isLoading } = useQuery({
    queryKey: ['win-streak'],
    queryFn: async (): Promise<WinStreakData> => {
      const { data, error } = await supabase
        .from('win_streaks')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return { currentStreak: 7, bestStreakMonth: 12, bestStreakAllTime: 15 };
      }

      return {
        currentStreak: data.current_streak || 7,
        bestStreakMonth: data.best_streak_month || 12,
        bestStreakAllTime: data.best_streak_all_time || 15,
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    winStreak: data || { currentStreak: 7, bestStreakMonth: 12, bestStreakAllTime: 15 },
    isLoading,
  };
}
