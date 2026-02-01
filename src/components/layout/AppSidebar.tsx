import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Crosshair, 
  BarChart3, 
  Users, 
  BookOpen,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { isAdminUser, getDisplayTier } from '@/lib/adminAccess';

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onMobileClose?: () => void;
}

// Slimmed down to 5 essential items only
const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', labelCz: 'Přehled', icon: LayoutDashboard },
  { href: '/predictions', label: 'Predictions', labelCz: 'Predikce', icon: Crosshair },
  { href: '/results', label: 'Results', labelCz: 'Výsledky', icon: BarChart3 },
  { href: '/community', label: 'Community', labelCz: 'Komunita', icon: Users },
  { href: '/blog', label: 'Blog', labelCz: 'Blog', icon: BookOpen },
];

export function AppSidebar({ collapsed, onCollapse, onMobileClose }: AppSidebarProps) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { winStreak } = useWinStreak();
  const { language } = useLanguage();

  // Check if user is admin for display purposes
  const isUserAdmin = isAdminUser(user?.email);
  const displayTier = getDisplayTier(user?.email, profile?.subscription_tier);

  const handleNavClick = () => {
    onMobileClose?.();
  };

  const handleSignOut = async () => {
    await signOut();
    onMobileClose?.();
  };

  const tierColors: Record<string, string> = {
    free: 'text-muted-foreground',
    basic: 'text-blue-400',
    pro: 'text-purple-400',
    elite: 'text-yellow-400',
    admin: 'text-yellow-300',
  };

  const NavItem = ({ href, label, labelCz, icon: Icon, badge }: {
    href: string;
    label: string;
    labelCz: string;
    icon: typeof LayoutDashboard;
    badge?: React.ReactNode;
  }) => {
    const isActive = location.pathname === href || location.pathname.startsWith(href + '/');
    const displayLabel = language === 'cz' ? labelCz : label;

    const content = (
      <Link
        to={href}
        onClick={handleNavClick}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 group relative',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
        )}
        <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{displayLabel}</span>
            {badge}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {displayLabel}
            {badge}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-3 border-b border-sidebar-border shrink-0',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <Link to="/dashboard" onClick={handleNavClick} className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-primary-foreground text-sm shrink-0">
            E8
          </div>
          {!collapsed && (
            <span className="font-bold text-lg">Edge88</span>
          )}
        </Link>
      </div>

      {/* Main Navigation - Clean icon list */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {mainNavItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            badge={item.href === '/dashboard' && winStreak?.currentStreak >= 3 ? (
              <span className={cn(
                'flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded',
                winStreak.currentStreak >= 5 
                  ? 'text-orange-400 bg-orange-500/20' 
                  : 'text-success bg-success/20'
              )}>
                <Flame className={cn('h-3 w-3', winStreak.currentStreak >= 5 && 'animate-pulse')} />
                {winStreak.currentStreak}
              </span>
            ) : undefined}
          />
        ))}
      </nav>

      {/* Bottom Section: Settings + Admin + User */}
      <div className="shrink-0 border-t border-sidebar-border p-2 space-y-1">
        {/* Settings */}
        <NavItem
          href="/settings"
          label="Settings"
          labelCz="Nastavení"
          icon={Settings}
        />

        {/* Admin Panel - only for admins */}
        {isAdmin && (
          <NavItem
            href="/admin"
            label="Admin"
            labelCz="Admin"
            icon={Shield}
          />
        )}

        {/* User Info - Compact */}
        <div className={cn(
          'flex items-center gap-2 rounded-lg p-2 mt-2 bg-muted/30',
          collapsed && 'justify-center p-1.5'
        )}>
          <Avatar className="h-8 w-8 border-2 border-primary/30">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {profile?.display_name || user?.email?.split('@')[0]}
              </p>
              <span className={cn(
                'text-[10px] font-bold uppercase flex items-center gap-0.5',
                tierColors[displayTier]
              )}>
                {isUserAdmin && <Crown className="h-2.5 w-2.5" />}
                {isUserAdmin ? '👑 ADMIN' : displayTier.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Logout */}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {language === 'cz' ? 'Odhlásit' : 'Logout'}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
          >
            <LogOut className="h-4 w-4" />
            {language === 'cz' ? 'Odhlásit' : 'Logout'}
          </Button>
        )}

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapse(!collapsed)}
          className={cn(
            'w-full text-muted-foreground hover:text-foreground text-xs',
            collapsed ? 'justify-center p-2' : 'justify-start'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {language === 'cz' ? 'Sbalit' : 'Collapse'}
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
