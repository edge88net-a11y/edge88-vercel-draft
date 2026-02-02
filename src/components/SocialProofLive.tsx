import { useState, useEffect } from 'react';
import { TrendingUp, Users, Flame, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SocialProofMessage {
  id: string;
  type: 'win' | 'pick' | 'trending' | 'users';
  message: string;
  messageCz: string;
  icon: React.ElementType;
  color: string;
}

const messages: SocialProofMessage[] = [
  {
    id: '1',
    type: 'win',
    message: 'John won $420 on NHL pick!',
    messageCz: 'Jan vyhrál 9,800 Kč na NHL tipu!',
    icon: CheckCircle,
    color: 'text-success',
  },
  {
    id: '2',
    type: 'trending',
    message: 'Flames vs Oilers is trending 🔥',
    messageCz: 'Flames vs Oilers je trendy 🔥',
    icon: Flame,
    color: 'text-orange-500',
  },
  {
    id: '3',
    type: 'users',
    message: '47 users viewing this pick',
    messageCz: '47 uživatelů sleduje tento tip',
    icon: Users,
    color: 'text-primary',
  },
  {
    id: '4',
    type: 'win',
    message: 'Sarah won $280 on NBA pick!',
    messageCz: 'Tereza vyhrála 6,500 Kč na NBA tipu!',
    icon: CheckCircle,
    color: 'text-success',
  },
  {
    id: '5',
    type: 'pick',
    message: 'New lock pick just dropped!',
    messageCz: 'Nový lock tip právě přidal!',
    icon: TrendingUp,
    color: 'text-amber-400',
  },
];

export function SocialProofLive() {
  const { language } = useLanguage();
  const [currentMessage, setCurrentMessage] = useState<SocialProofMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showRandomMessage = () => {
      // Pick random message
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(randomMsg);
      setIsVisible(true);

      // Hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    // Show first message after 3 seconds
    const initialTimeout = setTimeout(showRandomMessage, 3000);

    // Then show messages every 15-25 seconds
    const interval = setInterval(() => {
      const randomDelay = 15000 + Math.random() * 10000;
      setTimeout(showRandomMessage, randomDelay);
    }, 25000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!currentMessage || !isVisible) return null;

  const Icon = currentMessage.icon;
  const message = language === 'cz' ? currentMessage.messageCz : currentMessage.message;

  return (
    <div
      className={cn(
        'fixed top-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50',
        'animate-slide-in-top'
      )}
    >
      <div className="glass-card border-primary/30 shadow-xl shadow-primary/10 p-3 flex items-center gap-3">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          currentMessage.type === 'win' && 'bg-success/20',
          currentMessage.type === 'trending' && 'bg-orange-500/20',
          currentMessage.type === 'users' && 'bg-primary/20',
          currentMessage.type === 'pick' && 'bg-amber-500/20',
          'animate-pulse'
        )}>
          <Icon className={cn('h-5 w-5', currentMessage.color)} />
        </div>

        <p className="flex-1 text-sm font-medium text-foreground">
          {message}
        </p>

        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
      </div>
    </div>
  );
}
