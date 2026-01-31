import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, BarChart3, DollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/predictions', icon: Zap, label: 'Picks' },
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/results', icon: BarChart3, label: 'Results' },
  { href: '/pricing', icon: DollarSign, label: 'Pro' },
];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-all',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                  isActive && 'bg-primary/10'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Link
          to={user ? '/dashboard' : '/login'}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-all',
            (location.pathname === '/login' || location.pathname === '/signup')
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
              (location.pathname === '/login' || location.pathname === '/signup') && 'bg-primary/10'
            )}
          >
            <User className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium">{user ? 'Account' : 'Login'}</span>
        </Link>
      </div>
    </nav>
  );
}
