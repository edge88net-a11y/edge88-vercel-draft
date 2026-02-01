import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from './AppLayout';
import { PublicLayout } from './PublicLayout';

/**
 * ConditionalLayout renders AppLayout (with sidebar) for logged-in users,
 * and PublicLayout (with navbar/footer) for public visitors.
 * 
 * Used for pages that are accessible both publicly and when logged in,
 * like /blog and /pricing.
 */
export function ConditionalLayout() {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If logged in, use AppLayout with sidebar
  if (user) {
    return <AppLayout />;
  }

  // If not logged in, use PublicLayout with navbar/footer
  return <PublicLayout />;
}
