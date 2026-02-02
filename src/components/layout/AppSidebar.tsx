import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Gift,
  Send,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useWinStreak } from '@/hooks/useWinStreak';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserTier } from '@/hooks/useUserTier';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useActivePredictions } from '@/hooks/usePredictions';
import { useMemo } from 'react';

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onMobileClose?: () => void;
}

// Section accent colors
const sectionColors = {
  dashboard: { accent: 'bg-cyan-500', hover: 'hover:bg-cyan-500/10', active: 'from-cyan-500/15' },
  predictions: { accent: 'bg-emerald-500', hover: 'hover:bg-emerald-500/10', active: 'from-emerald-500/15' },
  results: { accent: 'bg-amber-500', hover: 'hover:bg-amber-500/10', active: 'from-amber-500/15' },
  community: { accent: 'bg-violet-500', hover: 'hover:bg-violet-500/10', active: 'from-violet-500/15' },
  blog: { accent: 'bg-blue-500', hover: 'hover:bg-blue-500/10', active: 'from-blue-500/15' },
  affiliate: { accent: 'bg-amber-400', hover: 'hover:bg-amber-400/10', active: 'from-amber-400/15' },
  settings: { accent: 'bg-gray-500', hover: 'hover:bg-gray-500/10', active: 'from-gray-500/15' },
  admin: { accent: 'bg-yellow-500', hover: 'hover:bg-yellow-500/10', active: 'from-yellow-500/15' },
};

// Main navigation - 5 essential items + affiliate
const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', labelCz: 'Přehled', icon: LayoutDashboard, colorKey: 'dashboard' as const },
  { href: '/predictions', label: 'Predictions', labelCz: 'Predikce', icon: Crosshair, colorKey: 'predictions' as const },
  { href: '/results', label: 'Results', labelCz: 'Výsledky', icon: BarChart3, colorKey: 'results' as const },
  { href: '/community', label: 'Community', labelCz: 'Komunita', icon: Users, colorKey: 'community' as const },
  { href: '/blog', label: 'Blog', labelCz: 'Blog', icon: BookOpen, colorKey: 'blog' as const },
  { href: '/referral', label: 'Affiliate', labelCz: 'Affiliate', icon: Gift, colorKey: 'affiliate' as const },
];

export function AppSidebar({ collapsed, onCollapse, onMobileClose }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { winStreak } = useWinStreak();
  const { language } = useLanguage();
  const userTier = useUserTier();
  const { data: predictions } = useActivePredictions();

  // Calculate badge counts
  const badgeCounts = useMemo(() => {
    if (!predictions) return {};
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const activePredictions = predictions.filter(p => p.result === 'pending').length;
    const newTipsToday = predictions.filter(p => {
      const gameTime = new Date(p.gameTime);
      return gameTime >= todayStart && p.result === 'pending';
    }).length;
    const todayWins = predictions.filter(p => {
      const gameTime = new Date(p.gameTime);
      return gameTime >= todayStart && p.result === 'win';
    }).length;
    
    return {
      dashboard: newTipsToday > 0 ? newTipsToday : undefined,
      predictions: activePredictions > 0 ? activePredictions : undefined,
      results: todayWins > 0 ? todayWins : undefined,
    };
  }, [predictions]);

  // Calculate profit for profile display
  const totalProfit = useMemo(() => {
    if (!predictions) return 0;
    return predictions.reduce((acc, p) => {
      if (p.result === 'win') {
        const odds = parseFloat(p.prediction?.odds?.replace(',', '.') || '1');
        return acc + Math.round((odds - 1) * 1000);
      } else if (p.result === 'loss') {
        return acc - 1000;
      }
      return acc;
    }, 0);
  }, [predictions]);

  const handleNavClick = () => {
    onMobileClose?.();
  };

  const handleSignOut = async () => {
    await signOut();
    onMobileClose?.();
  };

  const handleProfileClick = () => {
    navigate('/settings');
    onMobileClose?.();
  };

  const handleTelegramClick = () => {
    window.open('https://t.me/edge88picks', '_blank');
  };

  // Get tier ring color
  const getTierRingColor = () => {
    if (userTier.isAdmin) return 'ring-yellow-500 shadow-yellow-500/30';
    if (userTier.tier === 'elite') return 'ring-purple-500 shadow-purple-500/30';
    if (userTier.tier === 'pro') return 'ring-emerald-500 shadow-emerald-500/30';
    if (userTier.tier === 'starter') return 'ring-amber-500 shadow-amber-500/30';
    return 'ring-cyan-500/50 shadow-cyan-500/20';
  };

  const NavItem = ({ href, label, labelCz, icon: Icon, colorKey, badge }: {
    href: string;
    label: string;
    labelCz: string;
    icon: typeof LayoutDashboard;
    colorKey: keyof typeof sectionColors;
    badge?: React.ReactNode;
  }) => {
    const isActive = location.pathname === href || location.pathname.startsWith(href + '/');
    const displayLabel = language === 'cz' ? labelCz : label;
    const colors = sectionColors[colorKey];

    const content = (
      <Link
        to={href}
        onClick={handleNavClick}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 group relative overflow-hidden',
          isActive
            ? `bg-gradient-to-r ${colors.active} to-transparent text-white`
            : `text-gray-400 ${colors.hover} hover:text-white`,
          collapsed && 'justify-center px-2'
        )}
      >
        {/* Left accent bar */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200',
          isActive ? colors.accent : 'bg-transparent group-hover:bg-gray-600'
        )} />
        
        <Icon className={cn(
          'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
          isActive && 'text-white'
        )} />
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
          <TooltipContent side="right" className="flex items-center gap-2 bg-gray-800 border-gray-700">
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
        'relative flex flex-col h-full transition-all duration-300 overflow-visible',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{
        background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1525 40%, #0a1628 100%)',
      }}
    >
      {/* Animated border glow on the right */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-px bg-cyan-500 animate-sidebar-pulse"
        style={{ boxShadow: '0 0 8px hsl(180 70% 45% / 0.3)' }}
      />
      
      {/* Circular collapse button */}
      <button
        onClick={() => onCollapse(!collapsed)}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-50 w-8 h-8 rounded-full bg-gray-800 border border-cyan-500/30 flex items-center justify-center hover:bg-gray-700 hover:border-cyan-500/50 transition-all shadow-lg shadow-cyan-500/10"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-cyan-400" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-cyan-400" />
        )}
      </button>

      {/* Premium Logo */}
      <div className={cn(
        'flex flex-col h-auto px-4 py-4 shrink-0 border-b border-cyan-500/10',
        collapsed && 'items-center px-2'
      )}>
        <Link to="/dashboard" onClick={handleNavClick} className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-sm shrink-0 shadow-lg shadow-cyan-500/20">
              E8
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span 
                  className="font-extrabold text-lg text-white"
                  style={{ letterSpacing: '0.15em' }}
                >
                  EDGE88
                </span>
                {/* Shimmer line */}
                <div className="relative h-px w-full overflow-hidden mt-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
                  <div 
                    className="absolute h-full w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-logo-shimmer"
                  />
                </div>
                <span className="text-[10px] text-cyan-500/60 uppercase mt-1" style={{ letterSpacing: '0.2em' }}>
                  AI PREDICTIONS
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Profile section - clickable to settings */}
      <div 
        onClick={handleProfileClick}
        className={cn(
          'px-3 py-3 border-b border-cyan-500/10 shrink-0 cursor-pointer hover:bg-white/5 transition-colors',
          collapsed && 'px-2 py-2'
        )}
      >
        <div className={cn(
          'flex items-center gap-3',
          collapsed && 'justify-center'
        )}>
          {/* Avatar with glowing ring */}
          <Avatar className={cn(
            'shrink-0 ring-2 shadow-lg',
            getTierRingColor(),
            collapsed ? 'h-9 w-9' : 'h-10 w-10'
          )}>
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gray-800 text-cyan-400 text-sm font-bold">
              {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              {/* Name with inline tier badge */}
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white truncate">
                  {profile?.display_name || user?.email?.split('@')[0]}
                </p>
                <span className={cn(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0',
                  userTier.bgColor,
                  userTier.color,
                  'border',
                  userTier.borderColor
                )}>
                  {userTier.icon} {language === 'cz' ? userTier.labelCz : userTier.label}
                </span>
              </div>
              {/* Live stats */}
              <p className="text-[11px] text-gray-400 mt-0.5">
                {winStreak?.currentStreak > 0 ? (
                  <>
                    <span className="text-orange-400">🔥 {winStreak.currentStreak} série</span>
                    <span className="mx-1.5 text-gray-600">|</span>
                  </>
                ) : null}
                <span className={totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  💰 {totalProfit >= 0 ? '+' : ''}{(totalProfit / 1000).toFixed(1)}K
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {mainNavItems.map((item) => {
          const badgeCount = badgeCounts[item.colorKey as keyof typeof badgeCounts];
          
          return (
            <NavItem
              key={item.href}
              {...item}
              badge={badgeCount ? (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                  item.colorKey === 'dashboard' && 'bg-cyan-500/20 text-cyan-400',
                  item.colorKey === 'predictions' && 'bg-emerald-500/20 text-emerald-400',
                  item.colorKey === 'results' && 'bg-amber-500/20 text-amber-400',
                )}>
                  {badgeCount}
                </span>
              ) : item.href === '/dashboard' && winStreak?.currentStreak >= 3 ? (
                <span className="flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded text-orange-400 bg-orange-500/20">
                  <Flame className={cn('h-3 w-3', winStreak.currentStreak >= 5 && 'animate-pulse')} />
                  {winStreak.currentStreak}
                </span>
              ) : undefined}
            />
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="shrink-0 p-2 space-y-1">
        {/* Gradient separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-2" />
        
        {/* Settings */}
        <NavItem
          href="/settings"
          label="Settings"
          labelCz="Nastavení"
          icon={Settings}
          colorKey="settings"
        />

        {/* Telegram Link */}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleTelegramClick}
                className="w-full flex items-center justify-center rounded-lg px-2 py-3 text-sm font-medium text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-blue-500 transition-all" />
                <Send className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-800 border-gray-700">
              📱 Telegram
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleTelegramClick}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all group relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-blue-500 transition-all" />
            <Send className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span>📱 Telegram</span>
          </button>
        )}

        {/* Admin Panel - only for admins */}
        {isAdmin && (
          <NavItem
            href="/admin"
            label="Admin"
            labelCz="Admin"
            icon={Shield}
            colorKey="admin"
          />
        )}

        {/* Another separator before logout */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2" />

        {/* Logout */}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-800 border-gray-700">
              {language === 'cz' ? 'Odhlásit' : 'Logout'}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start gap-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 text-xs transition-all"
          >
            <LogOut className="h-4 w-4" />
            {language === 'cz' ? 'Odhlásit' : 'Logout'}
          </Button>
        )}

        {/* Version number */}
        {!collapsed && (
          <div className="text-center pt-2">
            <span className="text-[9px] text-gray-700">v2.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
