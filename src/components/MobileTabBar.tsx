import { Home, Target, TrendingUp, User, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export function MobileTabBar() {
  const location = useLocation();
  const { language } = useLanguage();

  const tabs = [
    {
      icon: Home,
      label: language === 'cz' ? 'Domů' : 'Home',
      path: '/',
    },
    {
      icon: Target,
      label: language === 'cz' ? 'Tipy' : 'Picks',
      path: '/predictions',
    },
    {
      icon: TrendingUp,
      label: language === 'cz' ? 'Dashboard' : 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: User,
      label: language === 'cz' ? 'Profil' : 'Profile',
      path: '/settings',
    },
    {
      icon: Menu,
      label: language === 'cz' ? 'Více' : 'More',
      path: '/menu',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Blur background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border" />

      {/* Tab buttons */}
      <div className="relative flex items-center justify-around px-2 py-3 safe-area-inset-bottom">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive && 'bg-primary/10'
              )}
            >
              <div className={cn(
                'relative transition-all duration-200',
                isActive && 'scale-110'
              )}>
                <Icon className={cn(
                  'h-5 w-5 transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )} />
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                )}
              </div>

              <span className={cn(
                'text-[10px] font-medium transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* iPhone notch spacer */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
