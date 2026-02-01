import { useState, useEffect } from 'react';

import { Settings as SettingsIcon, Bell, Mail, Globe, Palette, Link2, Trash2, Loader2, Check, DollarSign } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { OddsFormat } from '@/components/OddsComparison';
import { AdminDebugPanel } from '@/components/AdminDebugPanel';

const ADMIN_EMAIL = 'edge88.net@gmail.com';

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  
  // Notification states
  const [dailyPicks, setDailyPicks] = useState(true);
  const [resultsUpdates, setResultsUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [newPredictions, setNewPredictions] = useState(true);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Odds format state
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('oddsFormat') as OddsFormat) || 'american';
    }
    return 'american';
  });
  
  // Save odds format to localStorage
  useEffect(() => {
    localStorage.setItem('oddsFormat', oddsFormat);
  }, [oddsFormat]);
  
  // Save states
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Note: Auth protection is handled by ProtectedRoute wrapper in App.tsx

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{t.settings}</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            {language === 'cz' ? 'Spravujte své preference a nastavení účtu' : 'Manage your preferences and account settings'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Language Section */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{t.language}</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{language === 'cz' ? 'Jazyk aplikace' : 'Application Language'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Vyberte preferovaný jazyk' : 'Choose your preferred language'}
                  </p>
                </div>
                <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
                  <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                      'rounded-md px-4 py-2 font-medium transition-all',
                      language === 'en'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => setLanguage('cz')}
                    className={cn(
                      'rounded-md px-4 py-2 font-medium transition-all',
                      language === 'cz'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    🇨🇿 Čeština
                  </button>
          </div>

          {/* Odds Format Section */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{language === 'cz' ? 'Formát kurzů' : 'Odds Format'}</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{language === 'cz' ? 'Zobrazení kurzů' : 'Odds Display'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Vyberte preferovaný formát kurzů' : 'Choose your preferred odds format'}
                  </p>
                </div>
                <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
                  <button
                    onClick={() => setOddsFormat('american')}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-all',
                      oddsFormat === 'american'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    🇺🇸 -110
                  </button>
                  <button
                    onClick={() => setOddsFormat('decimal')}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-all',
                      oddsFormat === 'decimal'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    🇪🇺 1.91
                  </button>
                  <button
                    onClick={() => setOddsFormat('fractional')}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-all',
                      oddsFormat === 'fractional'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    🇬🇧 10/11
                  </button>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <strong>{language === 'cz' ? 'Příklad:' : 'Example:'}</strong>{' '}
                {oddsFormat === 'american' && (language === 'cz' 
                  ? 'Americký formát (-110 = sázka $110 pro výhru $100)'
                  : 'American format (-110 = bet $110 to win $100)'
                )}
                {oddsFormat === 'decimal' && (language === 'cz'
                  ? 'Desetinný formát (1.91 = celková výplata $191 za sázku $100)'
                  : 'Decimal format (1.91 = total return $191 on $100 bet)'
                )}
                {oddsFormat === 'fractional' && (language === 'cz'
                  ? 'Zlomkový formát (10/11 = výhra $10 za každých $11 sázky)'
                  : 'Fractional format (10/11 = win $10 for every $11 staked)'
                )}
              </div>
            </div>
          </div>
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{t.emailNotifications}</h2>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.dailyPicksEmail}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Každý den ráno dostávejte naše nejlepší tipy' : 'Receive our top picks every morning'}
                  </p>
                </div>
                <Switch checked={dailyPicks} onCheckedChange={setDailyPicks} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.resultsUpdates}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Dostávejte upozornění po skončení zápasů' : 'Get notified when games end'}
                  </p>
                </div>
                <Switch checked={resultsUpdates} onCheckedChange={setResultsUpdates} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.weeklyDigest}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Týdenní souhrn výkonu a statistik' : 'Weekly summary of performance and stats'}
                  </p>
                </div>
                <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{t.pushNotifications}</h2>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{language === 'cz' ? 'Povolit push oznámení' : 'Enable Push Notifications'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Dostávejte okamžitá upozornění v prohlížeči' : 'Receive instant notifications in your browser'}
                  </p>
                </div>
                <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
              </div>
              {pushEnabled && (
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.newPredictions}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'cz' ? 'Upozornění na nové predikce s vysokou jistotou' : 'Alert when new high-confidence predictions drop'}
                    </p>
                  </div>
                  <Switch checked={newPredictions} onCheckedChange={setNewPredictions} />
                </div>
              )}
            </div>
          </div>

          {/* Theme */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{t.theme}</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.darkMode}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Přepnout mezi tmavým a světlým režimem' : 'Toggle between dark and light mode'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">☀️</span>
                  <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                  <span className="text-sm">🌙</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center gap-3">
              <Link2 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{language === 'cz' ? 'Propojené účty' : 'Connected Accounts'}</h2>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Google</p>
                    <p className="text-sm text-muted-foreground">{user?.email || 'Not connected'}</p>
                  </div>
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  {language === 'cz' ? 'Propojeno' : 'Connected'}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg">📱</span>
                  </div>
                  <div>
                    <p className="font-medium">Telegram</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'cz' ? 'Dostávejte tipy přímo do Telegramu' : 'Get picks directly in Telegram'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {language === 'cz' ? 'Propojit' : 'Connect'}
                </Button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card overflow-hidden border-destructive/30">
            <div className="border-b border-destructive/30 p-4 flex items-center gap-3 bg-destructive/5">
              <Trash2 className="h-5 w-5 text-destructive" />
              <h2 className="font-semibold text-destructive">{language === 'cz' ? 'Nebezpečná zóna' : 'Danger Zone'}</h2>
            </div>
            <div className="p-4">
              {!showDeleteConfirm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{language === 'cz' ? 'Smazat účet' : 'Delete Account'}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'cz' 
                        ? 'Trvale smazat váš účet a všechna data' 
                        : 'Permanently delete your account and all data'}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                    {language === 'cz' ? 'Smazat účet' : 'Delete Account'}
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="font-medium text-destructive mb-2">
                    {language === 'cz' ? 'Opravdu chcete smazat svůj účet?' : 'Are you sure you want to delete your account?'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'cz' 
                      ? 'Tato akce je nevratná. Všechna vaše data budou trvale odstraněna.' 
                      : 'This action cannot be undone. All your data will be permanently deleted.'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                      {language === 'cz' ? 'Zrušit' : 'Cancel'}
                    </Button>
                    <Button variant="destructive" size="sm">
                      {language === 'cz' ? 'Ano, smazat účet' : 'Yes, delete account'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Debug Panel - Only visible for admin user */}
          {user?.email === ADMIN_EMAIL && (
            <AdminDebugPanel />
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              className="btn-gradient gap-2 min-w-[140px]"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === 'cz' ? 'Ukládání...' : 'Saving...'}
                </>
              ) : saved ? (
                <>
                  <Check className="h-4 w-4" />
                  {language === 'cz' ? 'Uloženo!' : 'Saved!'}
                </>
              ) : (
                <>
                  {language === 'cz' ? 'Uložit změny' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Settings;
