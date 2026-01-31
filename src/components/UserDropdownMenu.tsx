import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Bookmark, 
  CreditCard, 
  Settings, 
  Moon, 
  Sun, 
  Mail, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronDown,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function UserDropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsOpen(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Theme toggle logic would go here
  };

  const toggleEmailAlerts = () => {
    setEmailAlerts(!emailAlerts);
    // Save preference logic would go here
  };

  const tier = profile?.subscription_tier || 'free';
  const isPro = tier === 'pro' || tier === 'elite';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
          <User className="h-4 w-4 text-primary" />
        </div>
        <span className="hidden sm:inline font-medium">
          {profile?.display_name || user?.email?.split('@')[0]}
        </span>
        {isPro && (
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-xs font-bold text-white">
            <Crown className="h-3 w-3" />
            {tier.toUpperCase()}
          </span>
        )}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-72 animate-fade-in rounded-xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
            {/* User Info Header */}
            <div className="mb-2 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {profile?.display_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              {!isPro && (
                <Link 
                  to="/pricing" 
                  onClick={() => setIsOpen(false)}
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Crown className="h-4 w-4" />
                  {t.upgradeToPro}
                </Link>
              )}
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              <MenuLink 
                to="/dashboard" 
                icon={User} 
                label={t.myProfile}
                onClick={() => setIsOpen(false)}
              />
              
              <MenuLink 
                to="/saved-picks" 
                icon={Bookmark} 
                label={t.mySavedPicks}
                onClick={() => setIsOpen(false)}
              />

              <MenuLink 
                to="/pricing" 
                icon={CreditCard} 
                label={t.billingSubscription}
                badge={tier.charAt(0).toUpperCase() + tier.slice(1)}
                onClick={() => setIsOpen(false)}
              />

              <div className="my-2 h-px bg-border" />

              {/* Settings */}
              <MenuLink 
                to="/settings" 
                icon={Settings} 
                label={t.settings}
                onClick={() => setIsOpen(false)}
              />

              {/* Language */}
              <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="text-lg">🌐</span>
                  <span>{t.language}</span>
                </div>
                <LanguageSwitcher />
              </div>

              {/* Dark/Light Mode */}
              <button
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3 text-muted-foreground">
                  {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span>{isDark ? t.darkMode : t.lightMode}</span>
                </div>
                <div className={cn(
                  'h-5 w-9 rounded-full transition-colors',
                  isDark ? 'bg-primary' : 'bg-muted'
                )}>
                  <div className={cn(
                    'h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform',
                    isDark ? 'translate-x-4' : 'translate-x-0.5'
                  )} />
                </div>
              </button>

              <div className="my-2 h-px bg-border" />

              {/* Email Alerts */}
              <button
                onClick={toggleEmailAlerts}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{t.emailAlerts}</span>
                </div>
                <div className={cn(
                  'h-5 w-9 rounded-full transition-colors',
                  emailAlerts ? 'bg-success' : 'bg-muted'
                )}>
                  <div className={cn(
                    'h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform',
                    emailAlerts ? 'translate-x-4' : 'translate-x-0.5'
                  )} />
                </div>
              </button>

              <MenuLink 
                to="/settings" 
                icon={Bell} 
                label={t.notificationPreferences}
                onClick={() => setIsOpen(false)}
              />

              <MenuLink 
                to="/pricing" 
                icon={HelpCircle} 
                label={t.helpFaq}
                onClick={() => setIsOpen(false)}
              />

              <div className="my-2 h-px bg-border" />

              {/* Logout */}
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuLink({ 
  to, 
  icon: Icon, 
  label, 
  badge,
  onClick 
}: { 
  to: string; 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
    >
      <div className="flex items-center gap-3 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
}
