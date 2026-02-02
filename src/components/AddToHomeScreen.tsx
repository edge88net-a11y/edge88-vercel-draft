import { useState, useEffect } from 'react';
import { X, Plus, Share, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const VISIT_COUNT_KEY = 'edge88-visit-count';
const BANNER_DISMISSED_KEY = 'edge88-pwa-dismissed';

export function AddToHomeScreen() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Check if banner was dismissed
    if (sessionStorage.getItem(BANNER_DISMISSED_KEY)) {
      return;
    }

    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Increment visit count
    const visitCount = parseInt(sessionStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
    const newCount = visitCount + 1;
    sessionStorage.setItem(VISIT_COUNT_KEY, String(newCount));

    // Show banner after 3+ visits
    if (newCount >= 3) {
      // Delay showing for better UX
      setTimeout(() => setShowBanner(true), 3000);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="max-w-md mx-auto rounded-2xl bg-card border border-primary/30 shadow-2xl shadow-primary/20 p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5 text-foreground" />
        </button>

        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm mb-1">
              {language === 'cz' 
                ? '📱 Přidejte Edge88 na plochu' 
                : '📱 Add Edge88 to Home Screen'}
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              {language === 'cz'
                ? 'Rychlý přístup k predikcím kdykoliv, jako nativní aplikace!'
                : 'Quick access to predictions anytime, like a native app!'}
            </p>

            {isIOS ? (
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1">
                  1. {language === 'cz' ? 'Klepněte na' : 'Tap'} <Share className="h-3 w-3" /> {language === 'cz' ? 'v Safari' : 'in Safari'}
                </p>
                <p className="flex items-center gap-1">
                  2. {language === 'cz' ? 'Vyberte' : 'Select'} "{language === 'cz' ? 'Přidat na plochu' : 'Add to Home Screen'}"
                </p>
              </div>
            ) : (
              <Button 
                size="sm" 
                className="btn-gradient gap-2"
                onClick={() => {
                  // For Android, trigger the browser's install prompt if available
                  // @ts-ignore
                  if (window.deferredPrompt) {
                    // @ts-ignore
                    window.deferredPrompt.prompt();
                  }
                  handleDismiss();
                }}
              >
                <Plus className="h-4 w-4" />
                {language === 'cz' ? 'Nainstalovat' : 'Install App'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
