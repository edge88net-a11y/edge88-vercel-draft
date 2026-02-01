import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const SOCIAL_PROOF_MESSAGES_EN = [
  { emoji: '🎉', text: 'Michal R. just won +12,500 Kč on our NHL pick!' },
  { emoji: '✅', text: 'David K. hit 4/4 picks today!' },
  { emoji: '🔥', text: 'New user from Praha just signed up!' },
  { emoji: '💰', text: 'Sarah T. earned 2 free tips from referrals!' },
  { emoji: '🏆', text: 'Jan P. is on a 7-pick win streak!' },
  { emoji: '💵', text: 'Tomáš M. cashed +8,200 Kč this week!' },
  { emoji: '🎯', text: 'Our NBA model hit 5/6 picks yesterday!' },
  { emoji: '⚡', text: 'Elite member unlocked all 20 picks!' },
  { emoji: '🚀', text: '47 people upgraded to Pro this week!' },
  { emoji: '🏒', text: 'NHL pick won at +185 odds!' },
];

const SOCIAL_PROOF_MESSAGES_CZ = [
  { emoji: '🎉', text: 'Michal R. právě vyhrál +12 500 Kč na našem NHL tipu!' },
  { emoji: '✅', text: 'David K. trefil 4/4 tipy dnes!' },
  { emoji: '🔥', text: 'Nový uživatel z Prahy se právě zaregistroval!' },
  { emoji: '💰', text: 'Sára T. získala 2 tipy zdarma za doporučení!' },
  { emoji: '🏆', text: 'Jan P. má sérii 7 výher!' },
  { emoji: '💵', text: 'Tomáš M. vybral +8 200 Kč tento týden!' },
  { emoji: '🎯', text: 'Náš NBA model trefil 5/6 tipů včera!' },
  { emoji: '⚡', text: 'Elite člen odemknul všech 20 tipů!' },
  { emoji: '🚀', text: '47 lidí upgradovalo na Pro tento týden!' },
  { emoji: '🏒', text: 'NHL tip vyhrál při kurzu +185!' },
];

export function SocialProofToast() {
  const { language } = useLanguage();
  const [currentMessage, setCurrentMessage] = useState<{ emoji: string; text: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = language === 'cz' ? SOCIAL_PROOF_MESSAGES_CZ : SOCIAL_PROOF_MESSAGES_EN;

  useEffect(() => {
    // Initial delay before first toast
    const initialDelay = setTimeout(() => {
      showNextToast();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!currentMessage) return;

    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // Schedule next toast
    const nextTimer = setTimeout(() => {
      showNextToast();
    }, 15000 + Math.random() * 15000); // 15-30 seconds

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(nextTimer);
    };
  }, [currentMessage]);

  const showNextToast = () => {
    const nextIndex = (messageIndex + Math.floor(Math.random() * 3) + 1) % messages.length;
    setMessageIndex(nextIndex);
    setCurrentMessage(messages[nextIndex]);
    setIsVisible(true);
  };

  if (!currentMessage) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 md:bottom-6 left-4 z-50 max-w-sm transition-all duration-500 transform',
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      )}
    >
      <div className="glass-card p-4 shadow-xl border-primary/20 bg-background/95 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl animate-bounce">{currentMessage.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{currentMessage.text}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'cz' ? 'Právě teď' : 'Just now'}
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
