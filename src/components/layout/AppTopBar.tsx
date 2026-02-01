import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronRight, X, User, CreditCard, LogOut, Crown, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TierBadge } from '@/components/TierBadge';
import { isAdminUser } from '@/lib/adminAccess';
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
  '/community': { en: 'Community', cz: 'Komunita' },
};

export function AppTopBar({ onMenuClick, showMenuButton }: AppTopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const isAdmin = isAdminUser(user?.email);
  const tier = isAdmin ? 'admin' : (profile?.subscription_tier || 'FREE');

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current page title
  const getPageTitle = () => {
    const basePath = '/' + location.pathname.split('/')[1];
    const titleObj = pageTitles[basePath];
    if (titleObj) {
      return language === 'cz' ? titleObj.cz : titleObj.en;
    }
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Mock notifications with links
  const notifications = [
    { id: 1, text: language === 'cz' ? 'Lakers vs Celtics - 82% jistota' : 'Lakers vs Celtics - 82% confidence', time: '5m', unread: true, link: '/predictions', type: 'prediction' },
    { id: 2, text: language === 'cz' ? 'Nová predikce pro NHL' : 'New NHL prediction available', time: '1h', unread: true, link: '/predictions', type: 'new_picks' },
    { id: 3, text: language === 'cz' ? 'Vaše predikce vyhrála! 🎉' : 'Your prediction won! 🎉', time: '2h', unread: false, link: '/results', type: 'win' },
    { id: 4, text: language === 'cz' ? 'Nový článek v blogu' : 'New blog article', time: '3h', unread: false, link: '/blog', type: 'article' },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (link: string) => {
    setShowNotifications(false);
    navigate(link);
  };

  return (
    <header className={cn(
      "relative z-30 h-14 flex items-center justify-between px-4 md:px-6",
      "bg-transparent"
    )}>
      {/* Left: Menu button (mobile) + Breadcrumb */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden text-[#e6edf3]/70 hover:text-[#e6edf3] hover:bg-white/5"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center text-sm">
          <Link 
            to="/dashboard" 
            className="text-[#e6edf3]/50 hover:text-cyan-400 transition-colors"
          >
            Edge88
          </Link>
          <ChevronRight className="h-4 w-4 mx-1.5 text-[#e6edf3]/30" />
          <span className="text-[#e6edf3]/70">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Expandable Search */}
        <div className="relative hidden md:block">
          {isSearchExpanded ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-200">
              <Input
                ref={searchInputRef}
                placeholder={language === 'cz' ? 'Hledat predikce, články...' : 'Search predictions, articles...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-9 bg-white/5 border-white/10 text-[#e6edf3] placeholder:text-[#e6edf3]/40 focus:border-cyan-500/50"
                onBlur={() => {
                  if (!searchQuery) setIsSearchExpanded(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                    setIsSearchExpanded(false);
                  }
                }}
              />
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchExpanded(false);
                }}
                className="text-[#e6edf3]/50 hover:text-[#e6edf3]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="p-2 text-[#e6edf3]/50 hover:text-[#e6edf3] hover:bg-white/5 rounded-lg transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#e6edf3]/50 hover:text-[#e6edf3] hover:bg-white/5 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown - Desktop */}
          {showNotifications && (
            <>
              {/* Mobile: Bottom sheet style */}
              <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowNotifications(false)} />
              <div className={cn(
                "z-50 bg-[hsl(230,20%,10%)] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in duration-200",
                // Mobile: full-width bottom sheet
                "fixed md:absolute",
                "bottom-0 left-0 right-0 md:bottom-auto md:left-auto",
                "md:right-0 md:top-full md:mt-2",
                "rounded-t-2xl md:rounded-xl",
                "w-full md:w-80 md:max-w-[90vw]",
                "slide-in-from-bottom-4 md:slide-in-from-top-2"
              )}>
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-[#e6edf3]">
                    {language === 'cz' ? 'Notifikace' : 'Notifications'}
                  </h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="md:hidden text-[#e6edf3]/50 hover:text-[#e6edf3] p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="max-h-80 md:max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <button 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.link)}
                      className={cn(
                        "w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/10 active:bg-white/15 transition-colors",
                        notif.unread && "bg-cyan-500/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-[#e6edf3]/80">{notif.text}</p>
                        {notif.unread && (
                          <span className="h-2 w-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-[#e6edf3]/40 mt-1 block">{notif.time}</span>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-white/10">
                  <button 
                    onClick={() => handleNotificationClick('/predictions')}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {language === 'cz' ? 'Zobrazit vše' : 'View all'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Language Toggle */}
        <div className="hidden sm:flex items-center gap-1 text-xs px-2">
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              "transition-colors duration-200",
              language === 'en' ? "text-cyan-400 font-medium" : "text-[#e6edf3]/40 hover:text-[#e6edf3]/60"
            )}
          >
            EN
          </button>
          <span className="text-[#e6edf3]/20">|</span>
          <button
            onClick={() => setLanguage('cz')}
            className={cn(
              "transition-colors duration-200",
              language === 'cz' ? "text-cyan-400 font-medium" : "text-[#e6edf3]/40 hover:text-[#e6edf3]/60"
            )}
          >
            CZ
          </button>
        </div>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors">
              <Avatar className="h-8 w-8 ring-2 ring-cyan-500/50">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 text-sm font-bold">
                  {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-[hsl(230,20%,10%)] border-white/10">
            <DropdownMenuLabel className="py-3">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-[#e6edf3]">
                  {profile?.display_name || user?.email?.split('@')[0]}
                </span>
                <span className="text-xs text-[#e6edf3]/50 font-normal">{user?.email}</span>
                <div className="mt-2">
                  <TierBadge tier={tier as any} />
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild className="py-2.5 cursor-pointer hover:bg-white/5">
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#e6edf3]/50" />
                <span>{language === 'cz' ? 'Profil' : 'Profile'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="py-2.5 cursor-pointer hover:bg-white/5">
              <Link to="/pricing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#e6edf3]/50" />
                <span>{language === 'cz' ? 'Můj plán' : 'My Plan'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="py-2.5 cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {language === 'cz' ? 'Odhlásit se' : 'Sign Out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
