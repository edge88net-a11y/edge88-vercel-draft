import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { MobileNav } from '@/components/MobileNav';
import { SocialProofToast } from '@/components/SocialProofToast';
import { SocialProofLive } from '@/components/SocialProofLive';
import { LiveStatsTicker } from '@/components/LiveStatsTicker';
import { MobileTabBar } from '@/components/MobileTabBar';
import { BettingSlipFloating } from '@/components/BettingSlipFloating';
import { AddToHomeScreen } from '@/components/AddToHomeScreen';
import { NotificationPermission } from '@/components/NotificationPermission';
import { PageTransition } from '@/components/PageTransition';

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

export function AppLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Sidebar state - default to collapsed on desktop for slim look
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      // Default to collapsed if not set
      return stored === null ? true : stored === 'true';
    }
    return true;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Handle tablet breakpoint (768-1024px) - auto-collapse
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width < 1024) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop/Tablet Sidebar */}
      <div className="hidden md:block shrink-0">
        <div className="sticky top-0 h-screen">
          <AppSidebar
            collapsed={collapsed}
            onCollapse={setCollapsed}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-[260px] animate-in slide-in-from-left duration-300">
            <AppSidebar
              collapsed={false}
              onCollapse={() => {}}
              onMobileClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <AppTopBar
          onMenuClick={() => setMobileOpen(true)}
          showMenuButton={true}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-8">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Mobile Tab Bar - NEW */}
      <MobileTabBar />

      {/* Betting Slip Floating Button - NEW */}
      <BettingSlipFloating />

      {/* Social Proof Toast */}
      <SocialProofToast />

      {/* Social Proof Live - NEW */}
      <SocialProofLive />

      {/* Live Stats Ticker - NEW */}
      <LiveStatsTicker />

      {/* PWA Install Banner */}
      <AddToHomeScreen />

      {/* Notification Permission Modal */}
      <NotificationPermission />
    </div>
  );
}
