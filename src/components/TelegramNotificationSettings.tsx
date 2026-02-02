import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, Bell, ExternalLink, Lock, Check, 
  Zap, Crown, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserTier } from '@/hooks/useUserTier';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NotificationPreferences {
  telegram_new_predictions: boolean;
  telegram_results: boolean;
  telegram_daily_summary: boolean;
  telegram_high_confidence: boolean;
  telegram_sports: string[];
  email_daily_picks: boolean;
  email_weekly_digest: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  telegram_new_predictions: true,
  telegram_results: true,
  telegram_daily_summary: false,
  telegram_high_confidence: true,
  telegram_sports: ['nhl', 'nba', 'soccer'],
  email_daily_picks: true,
  email_weekly_digest: true,
};

const SPORTS = [
  { key: 'nhl', label: 'NHL', emoji: '🏒' },
  { key: 'nba', label: 'NBA', emoji: '🏀' },
  { key: 'soccer', label: 'Fotbal', labelEn: 'Soccer', emoji: '⚽' },
  { key: 'ufc', label: 'UFC', emoji: '🥊' },
  { key: 'nfl', label: 'NFL', emoji: '🏈' },
  { key: 'mlb', label: 'MLB', emoji: '⚾' },
];

export function TelegramNotificationSettings() {
  const { language } = useLanguage();
  const { tier, isAdmin, icon: tierIcon, label: tierLabel, labelCz: tierLabelCz } = useUserTier();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Check if user can access Telegram features
  const canAccessTelegram = tier === 'pro' || tier === 'elite' || isAdmin;
  const canAccessDiscord = tier === 'elite' || isAdmin;

  // Load preferences from localStorage (since user_profiles doesn't have these columns)
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedSports = localStorage.getItem('favorite_sports');
        const sports = savedSports ? JSON.parse(savedSports) : DEFAULT_PREFERENCES.telegram_sports;
        
        setPreferences({
          ...DEFAULT_PREFERENCES,
          telegram_sports: sports,
        });
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to localStorage
  const savePreferences = async () => {
    setSaving(true);
    try {
      localStorage.setItem('favorite_sports', JSON.stringify(preferences.telegram_sports));
      localStorage.setItem('notifications_enabled', String(preferences.telegram_new_predictions || preferences.telegram_results));

      toast({
        title: language === 'cz' ? 'Uloženo' : 'Saved',
        description: language === 'cz' 
          ? 'Nastavení notifikací bylo uloženo' 
          : 'Notification settings saved',
      });
    } catch (error) {
      toast({
        title: language === 'cz' ? 'Chyba' : 'Error',
        description: language === 'cz' 
          ? 'Nepodařilo se uložit nastavení' 
          : 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle toggle with tier check
  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!canAccessTelegram) {
      setUpgradeModalOpen(true);
      return;
    }
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle sport toggle
  const handleSportToggle = (sport: string) => {
    if (!canAccessTelegram) {
      setUpgradeModalOpen(true);
      return;
    }
    setPreferences(prev => ({
      ...prev,
      telegram_sports: prev.telegram_sports.includes(sport)
        ? prev.telegram_sports.filter(s => s !== sport)
        : [...prev.telegram_sports, sport],
    }));
  };

  const telegramChannelUrl = 'https://t.me/edge88picks';

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-[#0088cc]" />
            <h2 className="font-semibold">
              {language === 'cz' ? 'Telegram notifikace' : 'Telegram Notifications'}
            </h2>
          </div>
          {canAccessTelegram ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
              <Check className="h-3 w-3" />
              {language === 'cz' ? 'Aktivní' : 'Active'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              <Lock className="h-3 w-3" />
              {language === 'cz' ? 'Pro+' : 'Pro+'}
            </span>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Channel Link */}
          <div className="flex items-center justify-between p-3 bg-[#0088cc]/10 rounded-lg border border-[#0088cc]/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#0088cc] flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">@edge88picks</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Oficiální Telegram kanál' : 'Official Telegram Channel'}
                </p>
              </div>
            </div>
            <a href={telegramChannelUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                {language === 'cz' ? 'Připojit se' : 'Join'}
              </Button>
            </a>
          </div>

          {/* Notification Toggles */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              ⚙️ {language === 'cz' ? 'Nastavení notifikací' : 'Notification Settings'}
            </p>
            
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-colors",
              !canAccessTelegram && "opacity-50"
            )}>
              <div>
                <p className="font-medium">
                  {language === 'cz' ? 'Nové predikce' : 'New Predictions'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Každých 6 hodin' : 'Every 6 hours'}
                </p>
              </div>
              <Switch 
                checked={preferences.telegram_new_predictions} 
                onCheckedChange={() => handleToggle('telegram_new_predictions')}
                disabled={!canAccessTelegram}
              />
            </div>

            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-colors",
              !canAccessTelegram && "opacity-50"
            )}>
              <div>
                <p className="font-medium">
                  {language === 'cz' ? 'Výsledky zápasů' : 'Game Results'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Po skončení zápasu' : 'After game ends'}
                </p>
              </div>
              <Switch 
                checked={preferences.telegram_results} 
                onCheckedChange={() => handleToggle('telegram_results')}
                disabled={!canAccessTelegram}
              />
            </div>

            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-colors",
              !canAccessTelegram && "opacity-50"
            )}>
              <div>
                <p className="font-medium">
                  {language === 'cz' ? 'Denní souhrn' : 'Daily Summary'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? '9:00 ráno' : '9:00 AM'}
                </p>
              </div>
              <Switch 
                checked={preferences.telegram_daily_summary} 
                onCheckedChange={() => handleToggle('telegram_daily_summary')}
                disabled={!canAccessTelegram}
              />
            </div>

            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-colors",
              !canAccessTelegram && "opacity-50"
            )}>
              <div>
                <p className="font-medium">
                  {language === 'cz' ? 'Vysoká jistota (>75%)' : 'High Confidence (>75%)'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Pouze nejlepší tipy' : 'Only top picks'}
                </p>
              </div>
              <Switch 
                checked={preferences.telegram_high_confidence} 
                onCheckedChange={() => handleToggle('telegram_high_confidence')}
                disabled={!canAccessTelegram}
              />
            </div>
          </div>

          {/* Sports Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              🏆 {language === 'cz' ? 'Sporty' : 'Sports'}
            </p>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((sport) => (
                <button
                  key={sport.key}
                  onClick={() => handleSportToggle(sport.key)}
                  disabled={!canAccessTelegram}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    preferences.telegram_sports.includes(sport.key)
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted/50 text-muted-foreground border border-transparent hover:border-border",
                    !canAccessTelegram && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span>{sport.emoji}</span>
                  <span>{language === 'cz' ? sport.label : (sport.labelEn || sport.label)}</span>
                  {preferences.telegram_sports.includes(sport.key) && (
                    <Check className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tier Status */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            canAccessTelegram ? "bg-success/10 border border-success/20" : "bg-muted/50 border border-border"
          )}>
            <div className="flex items-center gap-2">
              <span>{tierIcon}</span>
              <span className="font-medium">
                {language === 'cz' ? 'Plán:' : 'Plan:'} {language === 'cz' ? tierLabelCz : tierLabel}
              </span>
            </div>
            {canAccessTelegram ? (
              <span className="text-sm text-success">
                {language === 'cz' ? 'Telegram notifikace aktivní' : 'Telegram notifications active'}
              </span>
            ) : (
              <Link to="/pricing">
                <Button size="sm" className="btn-gradient gap-1">
                  <Zap className="h-3 w-3" />
                  {language === 'cz' ? 'Upgrade na Pro' : 'Upgrade to Pro'}
                </Button>
              </Link>
            )}
          </div>

          {/* Discord Section (Elite only) */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            canAccessDiscord 
              ? "bg-[#5865F2]/10 border-[#5865F2]/20" 
              : "bg-muted/30 border-border"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                canAccessDiscord ? "bg-[#5865F2]" : "bg-muted"
              )}>
                <Crown className={cn("h-5 w-5", canAccessDiscord ? "text-white" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  {language === 'cz' ? 'Elite Discord' : 'Elite Discord'}
                  {!canAccessDiscord && <Lock className="h-3 w-3 text-muted-foreground" />}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'cz' ? 'Prioritní přístup + exkluzivní tipy' : 'Priority access + exclusive picks'}
                </p>
              </div>
            </div>
            {canAccessDiscord ? (
              <a href="https://discord.gg/edge88" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {language === 'cz' ? 'Připojit' : 'Join'}
                </Button>
              </a>
            ) : (
              <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                Elite
              </span>
            )}
          </div>

          {/* Save Button */}
          {canAccessTelegram && (
            <Button 
              onClick={savePreferences} 
              className="w-full btn-gradient"
              disabled={saving}
            >
              {saving 
                ? (language === 'cz' ? 'Ukládání...' : 'Saving...') 
                : (language === 'cz' ? 'Uložit nastavení' : 'Save Settings')}
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              {language === 'cz' ? 'Telegram notifikace' : 'Telegram Notifications'}
            </DialogTitle>
            <DialogDescription>
              {language === 'cz' 
                ? 'Telegram notifikace jsou dostupné od plánu Pro. Získejte okamžitá upozornění přímo do telefonu!'
                : 'Telegram notifications are available from the Pro plan. Get instant alerts directly to your phone!'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-[#0088cc]" />
              <span>{language === 'cz' ? 'Okamžité notifikace nových tipů' : 'Instant new pick notifications'}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
              <span>{language === 'cz' ? 'Upozornění na výsledky zápasů' : 'Game result alerts'}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span>{language === 'cz' ? 'Vysoká jistota tipy prioritně' : 'High confidence picks priority'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setUpgradeModalOpen(false)} className="flex-1">
              {language === 'cz' ? 'Zavřít' : 'Close'}
            </Button>
            <Link to="/pricing" className="flex-1">
              <Button className="w-full btn-gradient gap-2">
                {language === 'cz' ? 'Upgrade na Pro' : 'Upgrade to Pro'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
