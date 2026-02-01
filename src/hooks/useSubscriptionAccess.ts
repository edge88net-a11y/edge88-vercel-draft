import { useUserTier } from './useUserTier';

export type PredictionTier = 'basic' | 'pro' | 'elite';

interface SubscriptionAccess {
  // Can view a specific prediction based on its tier
  canViewPrediction: (predTier: PredictionTier | string) => boolean;
  // Can view mystical analysis (elite only)
  canViewMystical: boolean;
  // Can view detailed AI analysis (any paid tier)
  canViewDetailedAnalysis: boolean;
  // Can export data (pro and elite)
  canExportData: boolean;
  // Max daily picks (starter = 10, others = unlimited)
  maxDailyPicks: number;
  // Has any active subscription
  hasSubscription: boolean;
  // Current tier
  tier: string;
  // Is admin (full access)
  isAdmin: boolean;
}

export function useSubscriptionAccess(): SubscriptionAccess {
  const { tier, isAdmin } = useUserTier();

  const canViewPrediction = (predTier: PredictionTier | string): boolean => {
    // Admin has full access
    if (isAdmin) return true;
    
    // Elite users can view everything
    if (tier === 'elite') return true;
    
    // Pro users can view basic and pro
    if (tier === 'pro') {
      return ['basic', 'pro'].includes(predTier);
    }
    
    // Starter users can view only basic
    if (tier === 'starter') {
      return predTier === 'basic';
    }
    
    // No subscription - can't view any gated content
    return false;
  };

  const canViewMystical = isAdmin || tier === 'elite';
  const canViewDetailedAnalysis = isAdmin || tier !== 'none';
  const canExportData = isAdmin || tier === 'pro' || tier === 'elite';
  const maxDailyPicks = tier === 'starter' ? 10 : Infinity;
  const hasSubscription = tier !== 'none';

  return {
    canViewPrediction,
    canViewMystical,
    canViewDetailedAnalysis,
    canExportData,
    maxDailyPicks,
    hasSubscription,
    tier,
    isAdmin,
  };
}
