// Admin access utilities - centralized admin/elite access checking
// IMPORTANT: This checks the admin email for DISPLAY purposes only.
// Actual security must always be enforced server-side via RLS and has_role()

const ADMIN_EMAIL = 'edge88.net@gmail.com';

/**
 * Check if the user is the admin account
 * Note: Use only for UI display purposes. Server-side security uses has_role() in RLS.
 */
export function isAdminUser(email: string | undefined | null): boolean {
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Check if user has full unrestricted access (admin or elite tier)
 * Admin users always have full access regardless of tier
 */
export function hasFullAccess(email: string | undefined | null, tier: string | undefined | null): boolean {
  if (isAdminUser(email)) return true;
  return tier?.toLowerCase() === 'elite';
}

/**
 * Check if user can access a specific tier level
 * Admin users can access all tiers
 */
export function canAccessTier(
  email: string | undefined | null,
  userTier: string | undefined | null,
  requiredTier: 'free' | 'basic' | 'pro' | 'elite'
): boolean {
  if (isAdminUser(email)) return true;
  
  const tierOrder = ['free', 'basic', 'pro', 'elite'];
  const userTierNormalized = (userTier?.toLowerCase() || 'free') as typeof requiredTier;
  const userTierIndex = tierOrder.indexOf(userTierNormalized);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
}

/**
 * Get display tier for user (shows "admin" for admin user)
 */
export function getDisplayTier(email: string | undefined | null, tier: string | undefined | null): string {
  if (isAdminUser(email)) return 'admin';
  return tier?.toLowerCase() || 'none';
}
