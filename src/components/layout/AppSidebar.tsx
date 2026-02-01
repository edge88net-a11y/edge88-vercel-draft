import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  BarChart3, 
  BookOpen, 
  User, 
  Star, 
  Users, 
  MessageCircle,
  Receipt,
  Bell,
  Mail,
  Settings as SettingsIcon,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onMobileClose?: () => void;
}

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', labelCz: 'Přehled', icon: LayoutDashboard },
  { href: '/predictions', label: 'Predictions', labelCz: 'Predikce', icon: Zap },
  { href: '/results', label: 'Results', labelCz: 'Výsledky', icon: BarChart3 },
  { href: '/blog', label: 'Blog / Archive', labelCz: 'Blog / Archiv', icon: BookOpen },
];

const accountNavItems = [
  { href: '/settings', label: 'Profile', labelCz: 'Profil', icon: User },
  { href: '/pricing', label: 'My Plan', labelCz: 'Můj plán', icon: Star },
  { href: '/referral', label: 'Referrals', labelCz: 'Doporučení', icon: Users },
  { href: '/saved-picks', label: 'Saved Picks', labelCz: 'Uložené tipy', icon: Receipt },
];

const toolsNavItems = [
  { href: '/settings#notifications', label: 'Notifications', labelCz: 'Oznámení', icon: Bell },
  { href: '/settings#emails', label: 'Email Preferences', labelCz: 'Emailové preference', icon: Mail },
];

export function AppSidebar({ collapsed, onCollapse, onMobileClose }: AppSidebarProps) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { winStreak } = useWinStreak();
  const { language } = useLanguage();

  const handleNavClick = () => {
    onMobileClose?.();
  };

  const handleSignOut = async () => {
    await signOut();
    onMobileClose?.();
  };

  const tierColors: Record<string, string> = {
    free: 'bg-muted text-muted-foreground',
    basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    elite: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30',
  };

  const currentTier = profile?.subscription_tier || 'free';

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
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          isActive && 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:rounded-r-full before:bg-primary'
        )}
      >
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
        collapsed ? 'w-[60px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-sidebar-border shrink-0',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <Link to="/dashboard" onClick={handleNavClick} className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-primary-foreground text-sm">
            E8
          </div>
          {!collapsed && (
            <span className="font-bold text-lg">Edge88</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
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
                  🔥 {winStreak.currentStreak}
                </span>
              ) : undefined}
            />
          ))}
        </div>

        {/* Account Section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {language === 'cz' ? 'Účet' : 'Account'}
            </p>
          )}
          <div className="space-y-1">
            {accountNavItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* Tools Section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {language === 'cz' ? 'Nástroje' : 'Tools'}
            </p>
          )}
          <div className="space-y-1">
            {toolsNavItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Admin
              </p>
            )}
            <NavItem
              href="/admin"
              label="Admin Panel"
              labelCz="Admin Panel"
              icon={Shield}
            />
          </div>
        )}
      </nav>

      {/* User Section */}
      <div className="shrink-0 border-t border-sidebar-border p-3 space-y-3">
        {/* User Info */}
        <div className={cn(
          'flex items-center gap-3 rounded-lg p-2 bg-muted/50',
          collapsed && 'justify-center p-1'
        )}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.display_name || user?.email?.split('@')[0]}
              </p>
              <span className={cn(
                'inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border',
                tierColors[currentTier]
              )}>
                {currentTier}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={cn('flex gap-2', collapsed ? 'flex-col items-center' : '')}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={cn(
              'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
              collapsed ? 'w-8 h-8 p-0' : 'flex-1 justify-start gap-2'
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && (language === 'cz' ? 'Odhlásit' : 'Logout')}
          </Button>
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapse(!collapsed)}
          className={cn(
            'w-full text-muted-foreground hover:text-foreground',
            collapsed && 'justify-center'
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
