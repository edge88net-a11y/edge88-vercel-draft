import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Czech city names for realism
const CZECH_CITIES = ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'České Budějovice', 'Hradec Králové', 'Pardubice', 'Zlín'];
const ENGLISH_CITIES = ['Prague', 'Brno', 'Ostrava', 'Pilsen', 'Liberec', 'Olomouc', 'Ceske Budejovice', 'Hradec Kralove', 'Pardubice', 'Zlin'];

// Czech first names
const CZECH_NAMES = ['Tomáš', 'Petr', 'Jan', 'Martin', 'Lukáš', 'Jakub', 'Pavel', 'David', 'Michal', 'Ondřej', 'Marek', 'Filip', 'Adam', 'Vojtěch', 'Jiří'];
const ENGLISH_NAMES = ['John', 'Mike', 'David', 'James', 'Chris', 'Alex', 'Dan', 'Tom', 'Matt', 'Nick', 'Ryan', 'Jake', 'Sam', 'Ben', 'Eric'];

// Last name initials
const LAST_INITIALS = ['K.', 'M.', 'N.', 'P.', 'R.', 'S.', 'T.', 'V.', 'H.', 'J.', 'L.', 'B.', 'D.', 'F.', 'Z.'];

// Amount ranges for realistic wins
const WIN_AMOUNTS = [1200, 1800, 2400, 3200, 4500, 5800, 7200, 8500, 9800, 12500, 15000, 18000];
const WEEKLY_AMOUNTS = [15000, 18500, 23000, 28000, 35000, 42000, 55000];

// Teams for predictions
const TEAMS = {
  NHL: ['Detroit', 'Colorado', 'Vegas', 'Toronto', 'Boston', 'Tampa Bay', 'Edmonton', 'Carolina'],
  NBA: ['Lakers', 'Celtics', 'Warriors', 'Bucks', 'Heat', 'Nuggets', 'Suns', 'Nets'],
  NFL: ['Chiefs', 'Eagles', 'Bills', '49ers', 'Cowboys', 'Ravens', 'Dolphins', 'Lions'],
};

// Sport colors for accent
const SPORT_COLORS: Record<string, string> = {
  NHL: 'border-l-blue-500',
  NBA: 'border-l-orange-500',
  NFL: 'border-l-green-500',
  soccer: 'border-l-emerald-500',
  UFC: 'border-l-red-500',
  default: 'border-l-primary',
};

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatCzechAmount(amount: number): string {
  return amount.toLocaleString('cs-CZ').replace(/\s/g, ' ');
}

type MessageData = { 
  emoji: string; 
  text: string; 
  sport?: string;
  link?: string;
};

type MessageGenerator = (language: 'en' | 'cz') => MessageData;

const MESSAGE_GENERATORS: MessageGenerator[] = [
  // Win notification - user just won
  (lang) => {
    const name = lang === 'cz' ? getRandomItem(CZECH_NAMES) : getRandomItem(ENGLISH_NAMES);
    const initial = getRandomItem(LAST_INITIALS);
    const amount = getRandomItem(WIN_AMOUNTS);
    return {
      emoji: '🎯',
      text: lang === 'cz' 
        ? `${name} ${initial} právě vyhrál +${formatCzechAmount(amount)} Kč!`
        : `${name} ${initial} just won +${formatCzechAmount(amount)} Kč!`,
      link: '/results',
    };
  },
  // Current win streak
  (lang) => {
    const streak = Math.floor(Math.random() * 10) + 15; // 15-24
    return {
      emoji: '🔥',
      text: lang === 'cz'
        ? `Aktuální série: ${streak} výher v řadě!`
        : `Current streak: ${streak} wins in a row!`,
      link: '/results',
    };
  },
  // Sport-specific accuracy this week
  (lang) => {
    const sport = getRandomItem(['NHL', 'NBA', 'NFL']);
    const accuracy = Math.floor(Math.random() * 10) + 72; // 72-81%
    return {
      emoji: sport === 'NHL' ? '🏒' : sport === 'NBA' ? '🏀' : '🏈',
      text: lang === 'cz'
        ? `${sport} přesnost tento týden: ${accuracy}%!`
        : `${sport} accuracy this week: ${accuracy}%!`,
      sport,
      link: '/results',
    };
  },
  // New prediction just added
  (lang) => {
    const sport = getRandomItem(['NHL', 'NBA', 'NFL']) as keyof typeof TEAMS;
    const teams = TEAMS[sport];
    const home = getRandomItem(teams);
    let away = getRandomItem(teams);
    while (away === home) away = getRandomItem(teams);
    const confidence = Math.floor(Math.random() * 10) + 70; // 70-79%
    return {
      emoji: '⚡',
      text: lang === 'cz'
        ? `Nový tip: ${away} @ ${home} — ${confidence}% jistota`
        : `New pick: ${away} @ ${home} — ${confidence}% confidence`,
      sport,
      link: '/predictions',
    };
  },
  // Top earners this month
  (lang) => {
    const amount = getRandomItem([25000, 32000, 45000, 58000, 72000]);
    return {
      emoji: '🏆',
      text: lang === 'cz'
        ? `Top sázkaři tento měsíc vydělali přes ${formatCzechAmount(amount)} Kč`
        : `Top bettors this month earned over ${formatCzechAmount(amount)} Kč`,
      link: '/community',
    };
  },
  // Users watching
  (lang) => {
    const count = Math.floor(Math.random() * 200) + 250; // 250-449
    return {
      emoji: '👀',
      text: lang === 'cz'
        ? `${count} uživatelů právě sleduje predikce`
        : `${count} users watching predictions right now`,
      link: '/predictions',
    };
  },
  // Daily picks hit rate
  (lang) => {
    const hits = Math.floor(Math.random() * 3) + 4; // 4-6
    const total = hits + Math.floor(Math.random() * 2); // hits or hits+1
    return {
      emoji: '✅',
      text: lang === 'cz' 
        ? `${hits} z ${total} dnešních tipů vyšly!`
        : `${hits} out of ${total} picks hit today!`,
      link: '/results',
    };
  },
  // Weekly earnings for random user
  (lang) => {
    const name = lang === 'cz' ? getRandomItem(CZECH_NAMES) : getRandomItem(ENGLISH_NAMES);
    const initial = getRandomItem(LAST_INITIALS);
    const amount = getRandomItem(WEEKLY_AMOUNTS);
    return {
      emoji: '💰',
      text: lang === 'cz'
        ? `${name} ${initial} vydělal tento týden +${formatCzechAmount(amount)} Kč`
        : `${name} ${initial} earned +${formatCzechAmount(amount)} Kč this week`,
      link: '/community',
    };
  },
  // New tips just added
  (lang) => {
    const count = Math.floor(Math.random() * 8) + 5; // 5-12
    return {
      emoji: '🚀',
      text: lang === 'cz'
        ? `${count} nových tipů právě přidáno!`
        : `${count} new picks just added!`,
      link: '/predictions',
    };
  },
  // High value pick
  (lang) => {
    const sport = getRandomItem(['NHL', 'NBA', 'NFL']) as keyof typeof TEAMS;
    const confidence = Math.floor(Math.random() * 8) + 78; // 78-85%
    return {
      emoji: '🔒',
      text: lang === 'cz'
        ? `🔥 LOCK TIP: ${sport} — ${confidence}% jistota právě zveřejněn!`
        : `🔥 LOCK PICK: ${sport} — ${confidence}% confidence just released!`,
      sport,
      link: '/predictions',
    };
  },
];

export function SocialProofToast() {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState<MessageData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const generateMessage = useCallback(() => {
    const generator = getRandomItem(MESSAGE_GENERATORS);
    return generator(language as 'en' | 'cz');
  }, [language]);

  const showNextToast = useCallback(() => {
    const message = generateMessage();
    setCurrentMessage(message);
    setIsVisible(true);
    setProgress(100);
  }, [generateMessage]);

  useEffect(() => {
    // Don't show toasts on mobile
    if (isMobile) return;

    // Initial delay before first toast (8-12 seconds)
    const initialDelay = setTimeout(() => {
      showNextToast();
    }, 8000 + Math.random() * 4000);

    return () => clearTimeout(initialDelay);
  }, [isMobile, showNextToast]);

  useEffect(() => {
    if (!currentMessage || isMobile) return;

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.max(0, prev - 2));
    }, 100);

    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // Schedule next toast (45-60 seconds)
    const nextTimer = setTimeout(() => {
      showNextToast();
    }, 45000 + Math.random() * 15000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(dismissTimer);
      clearTimeout(nextTimer);
    };
  }, [currentMessage, isMobile, showNextToast]);

  const handleClick = () => {
    if (currentMessage?.link) {
      navigate(currentMessage.link);
    }
    setIsVisible(false);
  };

  // Don't render on mobile
  if (isMobile || !currentMessage) return null;

  const accentColor = currentMessage.sport 
    ? SPORT_COLORS[currentMessage.sport] || SPORT_COLORS.default
    : SPORT_COLORS.default;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-4 z-50 max-w-sm transition-all duration-500 transform cursor-pointer',
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl",
        "border-l-4",
        accentColor
      )}>
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{currentMessage.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">{currentMessage.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'cz' ? 'Právě teď' : 'Just now'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0 p-1"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/30">
          <div 
            className="h-full bg-primary/70 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
