import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppTopBarProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

// Page title mapping
const pageTitles: Record<string, { en: string; cz: string }> = {
  '/dashboard': { en: 'Dashboard', cz: 'Přehled' },
  '/predictions': { en: 'Predictions', cz: 'Predikce' },
  '/results': { en: 'Results', cz: 'Výsledky' },
  '/blog': { en: 'Blog / Archive', cz: 'Blog / Archiv' },
  '/settings': { en: 'Settings', cz: 'Nastavení' },
  '/pricing': { en: 'Pricing', cz: 'Ceník' },
  '/referral': { en: 'Referrals', cz: 'Doporučení' },
  '/saved-picks': { en: 'Saved Picks', cz: 'Uložené tipy' },
  '/admin': { en: 'Admin Panel', cz: 'Admin Panel' },
};

export function AppTopBar({ onMenuClick, showMenuButton }: AppTopBarProps) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Get current page title
  const getPageTitle = () => {
    const basePath = '/' + location.pathname.split('/')[1];
    const titleObj = pageTitles[basePath];
    if (titleObj) {
      return language === 'cz' ? titleObj.cz : titleObj.en;
    }
    // Handle dynamic routes
    if (location.pathname.startsWith('/predictions/')) {
      return language === 'cz' ? 'Detail predikce' : 'Prediction Detail';
    }
    if (location.pathname.startsWith('/blog/')) {
      return language === 'cz' ? 'Článek' : 'Article';
    }
    if (location.pathname.startsWith('/admin/')) {
      return 'Admin';
    }
    return 'Edge88';
  };

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return null;

    return parts.map((part, index) => {
      const path = '/' + parts.slice(0, index + 1).join('/');
      const isLast = index === parts.length - 1;
      const titleObj = pageTitles['/' + part];
      const label = titleObj
        ? (language === 'cz' ? titleObj.cz : titleObj.en)
        : part.charAt(0).toUpperCase() + part.slice(1);

      return (
        <span key={path} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          {isLast ? (
            <span className="text-foreground font-medium">{label}</span>
          ) : (
            <Link to={path} className="text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </Link>
          )}
        </span>
      );
    });
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">
      {/* Left: Menu button (mobile) + Title */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex items-center text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Edge88
          </Link>
          {getBreadcrumbs() || (
            <>
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              <span className="font-semibold">{getPageTitle()}</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Search (hidden on mobile) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'cz' ? 'Hledat predikce, články...' : 'Search predictions, articles...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-transparent focus:border-primary focus:bg-background"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{profile?.display_name || user?.email?.split('@')[0]}</span>
                <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">{language === 'cz' ? 'Nastavení' : 'Settings'}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pricing">{language === 'cz' ? 'Můj plán' : 'My Plan'}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              {language === 'cz' ? 'Odhlásit se' : 'Sign Out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
