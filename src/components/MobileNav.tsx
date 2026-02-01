import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { path: '/dashboard', icon: Home, labelKey: 'home' as const },
  { path: '/predictions', icon: Zap, labelKey: 'picks' as const },
  { path: '/results', icon: BarChart3, labelKey: 'results' as const },
  { path: '/settings', icon: User, labelKey: 'profile' as const },
];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();

  const labels: Record<string, string> = {
    home: language === 'cz' ? 'Domů' : 'Home',
    picks: language === 'cz' ? 'Tipy' : 'Picks',
    results: language === 'cz' ? 'Výsledky' : 'Results',
    profile: language === 'cz' ? 'Profil' : 'Profile',
  };

  // Only show mobile nav when logged in
  if (!user) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/predictions' && location.pathname.startsWith('/predictions'));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[60px] transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] font-medium">{labels[item.labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
