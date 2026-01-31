import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Zap, TrendingUp, BarChart3, DollarSign, LogIn, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { UserDropdownMenu } from '@/components/UserDropdownMenu';
import { useLanguage } from '@/contexts/LanguageContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { t } = useLanguage();

  // Define nav links based on auth state
  const getNavLinks = () => {
    const baseLinks = [
      { href: '/predictions', labelKey: 'predictions' as const, icon: Zap },
      { href: '/pricing', labelKey: 'pricing' as const, icon: DollarSign },
    ];

    if (user) {
      return [
        { href: '/dashboard', labelKey: 'dashboard' as const, icon: TrendingUp },
        ...baseLinks,
        { href: '/results', labelKey: 'results' as const, icon: BarChart3 },
      ];
    }

    return [
      { href: '/dashboard', labelKey: 'dashboard' as const, icon: TrendingUp },
      ...baseLinks,
      { href: '/results', labelKey: 'results' as const, icon: BarChart3 },
    ];
  };

  const navLinks = getNavLinks();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Zap className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-0 blur-lg transition-opacity group-hover:opacity-50" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Edge<span className="gradient-text">88</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {t[link.labelKey]}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth & Settings */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {/* Language Switcher - Only show when logged out */}
            {!user && <LanguageSwitcher />}
            
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <>
                <Link 
                  to="/saved-picks"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  title={t.savedPicks}
                >
                  <Bookmark className="h-4 w-4" />
                </Link>
                <UserDropdownMenu />
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    {t.login}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="btn-gradient">
                    <span>{t.signUp}</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="animate-slide-up border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {t[link.labelKey]}
                </Link>
              );
            })}
            
            {/* Saved Picks link for mobile */}
            {user && (
              <Link
                to="/saved-picks"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Bookmark className="h-5 w-5" />
                {t.savedPicks}
              </Link>
            )}
            
            {/* Language switcher for mobile */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">{t.language}</span>
              <LanguageSwitcher />
            </div>
            
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm">
                    <span>{profile?.display_name || user.email}</span>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    {t.logout}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t.login}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="btn-gradient w-full">
                      <span>{t.signUp}</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
