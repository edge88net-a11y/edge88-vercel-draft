import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const NOTIFICATION_ASKED_KEY = 'edge88-notification-asked';

export function NotificationPermission() {
  const [showModal, setShowModal] = useState(false);
  const { language } = useLanguage();
  const { user, profile } = useAuth();

  useEffect(() => {
    // Only show for logged-in users
    if (!user) return;

    // Check if already asked in this session
    if (sessionStorage.getItem(NOTIFICATION_ASKED_KEY)) return;

    // Check if user already has notifications enabled
    if (profile?.notifications_enabled) return;

    // Check if browser supports notifications
    if (!('Notification' in window)) return;

    // Don't ask if already granted or denied
    if (Notification.permission !== 'default') return;

    // Show modal after a short delay
    const timer = setTimeout(() => setShowModal(true), 5000);
    return () => clearTimeout(timer);
  }, [user, profile]);

  const handleEnable = async () => {
    sessionStorage.setItem(NOTIFICATION_ASKED_KEY, 'true');
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted' && user) {
        // Save preference to profile
        await supabase
          .from('profiles')
          .update({ notifications_enabled: true })
          .eq('user_id', user.id);
      }
    } catch (err) {
      console.error('Notification permission error:', err);
    }
    
    setShowModal(false);
  };

  const handleLater = () => {
    sessionStorage.setItem(NOTIFICATION_ASKED_KEY, 'true');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={handleLater}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 text-center">
        {/* Icon */}
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-primary animate-bounce" />
        </div>

        <h3 className="text-xl font-bold mb-2">
          {language === 'cz' 
            ? '🔔 Nechte si posílat notifikace' 
            : '🔔 Enable Win Notifications'}
        </h3>

        <p className="text-sm text-muted-foreground mb-6">
          {language === 'cz'
            ? 'Dostávejte okamžitá upozornění, když naše predikce vyhrají!'
            : 'Get instant alerts when our predictions win!'}
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleLater}
            className="flex-1"
          >
            {language === 'cz' ? 'Později' : 'Later'}
          </Button>
          <Button
            onClick={handleEnable}
            className="flex-1 btn-gradient"
          >
            {language === 'cz' ? 'Povolit' : 'Enable'}
          </Button>
        </div>
      </div>
    </div>
  );
}
