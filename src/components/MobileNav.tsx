import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, LayoutDashboard, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { path: '/', icon: Home, labelKey: 'home' as const },
  { path: '/predictions', icon: Zap, labelKey: 'predictions' as const },
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { path: '/results', icon: Trophy, labelKey: 'results' as const },
];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const labels: Record<string, string> = {
    home: t.home || 'Home',
    predictions: t.predictions || 'Picks',
    dashboard: t.dashboard || 'Dashboard',
    results: t.results || 'Results',
  };

  // Only show mobile nav when logged in
  if (!user) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'relative',
                isActive && 'after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary'
              )}>
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              </div>
              <span className="text-[10px] font-medium">{labels[item.labelKey]}</span>
            </Link>
          );
        })}
        
        {/* Profile tab */}
        <Link
          to="/saved-picks"
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]',
            location.pathname === '/saved-picks'
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div className={cn(
            'relative',
            location.pathname === '/saved-picks' && 
            'after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary'
          )}>
            <User className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium">{t.profile || 'Profile'}</span>
        </Link>
      </div>
    </nav>
  );
}
