import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
const WIN_AMOUNTS = [2500, 3800, 4200, 5500, 6700, 7200, 8500, 9800, 11200, 12500, 15000, 18000, 23000, 28000, 35000];
const WEEKLY_AMOUNTS = [15000, 18500, 23000, 28000, 35000, 42000, 55000, 68000];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatCzechAmount(amount: number): string {
  return amount.toLocaleString('cs-CZ').replace(/\s/g, ' ');
}

type MessageGenerator = (language: 'en' | 'cz') => { emoji: string; text: string };

const MESSAGE_GENERATORS: MessageGenerator[] = [
  // Win notification
  (lang) => {
    const name = lang === 'cz' ? getRandomItem(CZECH_NAMES) : getRandomItem(ENGLISH_NAMES);
    const initial = getRandomItem(LAST_INITIALS);
    const city = lang === 'cz' ? getRandomItem(CZECH_CITIES) : getRandomItem(ENGLISH_CITIES);
    const amount = getRandomItem(WIN_AMOUNTS);
    return {
      emoji: '🎉',
      text: lang === 'cz' 
        ? `${name} ${initial} z ${city === 'Praha' ? 'Prahy' : city === 'Brno' ? 'Brna' : city} právě vyhrál +${formatCzechAmount(amount)} Kč!`
        : `${name} ${initial} from ${city} just won +${formatCzechAmount(amount)} Kč!`
    };
  },
  // Daily picks hit
  (lang) => {
    const hits = Math.floor(Math.random() * 3) + 3; // 3-5
    const total = hits + Math.floor(Math.random() * 2); // hits or hits+1
    return {
      emoji: '✅',
      text: lang === 'cz' 
        ? `${hits} z ${total} dnešních tipů vyšly!`
        : `${hits} out of ${total} picks hit today!`
    };
  },
  // New user signup
  (lang) => {
    const city = lang === 'cz' ? getRandomItem(CZECH_CITIES) : getRandomItem(ENGLISH_CITIES);
    return {
      emoji: '🔥',
      text: lang === 'cz'
        ? `Nový uživatel z ${city === 'Praha' ? 'Prahy' : city === 'Brno' ? 'Brna' : city} se právě zaregistroval`
        : `New user from ${city} just signed up`
    };
  },
  // Weekly earnings
  (lang) => {
    const name = lang === 'cz' ? getRandomItem(CZECH_NAMES) : getRandomItem(ENGLISH_NAMES);
    const initial = getRandomItem(LAST_INITIALS);
    const amount = getRandomItem(WEEKLY_AMOUNTS);
    return {
      emoji: '💰',
      text: lang === 'cz'
        ? `${name} ${initial} vydělal tento týden +${formatCzechAmount(amount)} Kč`
        : `${name} ${initial} earned +${formatCzechAmount(amount)} Kč this week`
    };
  },
  // Win streak
  (lang) => {
    const name = lang === 'cz' ? getRandomItem(CZECH_NAMES) : getRandomItem(ENGLISH_NAMES);
    const initial = getRandomItem(LAST_INITIALS);
    const streak = Math.floor(Math.random() * 5) + 5; // 5-9
    return {
      emoji: '🏆',
      text: lang === 'cz'
        ? `${name} ${initial} má sérii ${streak} výher za sebou!`
        : `${name} ${initial} is on a ${streak}-pick win streak!`
    };
  },
  // Pro upgrade
  (lang) => {
    const count = Math.floor(Math.random() * 30) + 25; // 25-54
    return {
      emoji: '🚀',
      text: lang === 'cz'
        ? `${count} lidí upgradovalo na Pro tento týden!`
        : `${count} people upgraded to Pro this week!`
    };
  },
  // Sport-specific win
  (lang) => {
    const sports = lang === 'cz' 
      ? ['NHL', 'NBA', 'NFL', 'fotbalový', 'UFC']
      : ['NHL', 'NBA', 'NFL', 'soccer', 'UFC'];
    const sport = getRandomItem(sports);
    const odds = ['+145', '+165', '+180', '+210', '+250'][Math.floor(Math.random() * 5)];
    return {
      emoji: '🏒',
      text: lang === 'cz'
        ? `${sport} tip vyhrál při kurzu ${odds}!`
        : `${sport} pick won at ${odds} odds!`
    };
  },
  // Accuracy update
  (lang) => {
    const accuracy = Math.floor(Math.random() * 8) + 70; // 70-77%
    return {
      emoji: '🎯',
      text: lang === 'cz'
        ? `Dnešní přesnost: ${accuracy}% - výborný den!`
        : `Today's accuracy: ${accuracy}% - great day!`
    };
  },
  // Referral bonus
  (lang) => {
    const name = lang === 'cz' ? getRandomItem(CZECH_NAMES) : getRandomItem(ENGLISH_NAMES);
    const initial = getRandomItem(LAST_INITIALS);
    const tips = Math.floor(Math.random() * 3) + 2; // 2-4
    return {
      emoji: '🎁',
      text: lang === 'cz'
        ? `${name} ${initial} získal ${tips} tipy zdarma za doporučení!`
        : `${name} ${initial} earned ${tips} free tips from referrals!`
    };
  },
  // Live picks update
  (lang) => {
    const count = Math.floor(Math.random() * 10) + 8; // 8-17
    return {
      emoji: '⚡',
      text: lang === 'cz'
        ? `${count} nových tipů právě přidáno!`
        : `${count} new picks just added!`
    };
  },
];

export function SocialProofToast() {
  const { language } = useLanguage();
  const [currentMessage, setCurrentMessage] = useState<{ emoji: string; text: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const generateMessage = () => {
    const generator = getRandomItem(MESSAGE_GENERATORS);
    return generator(language as 'en' | 'cz');
  };

  useEffect(() => {
    // Initial delay before first toast (5-8 seconds)
    const initialDelay = setTimeout(() => {
      showNextToast();
    }, 5000 + Math.random() * 3000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!currentMessage) return;

    // Auto-dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    // Schedule next toast (20-30 seconds)
    const nextTimer = setTimeout(() => {
      showNextToast();
    }, 20000 + Math.random() * 10000);

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(nextTimer);
    };
  }, [currentMessage]);

  const showNextToast = () => {
    const message = generateMessage();
    setCurrentMessage(message);
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
      <div className="relative overflow-hidden rounded-xl border border-success/30 bg-background/95 backdrop-blur-xl shadow-2xl">
        {/* Accent border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-success/10 via-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl animate-bounce shrink-0">{currentMessage.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">{currentMessage.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'cz' ? 'Právě teď' : 'Just now'}
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0 p-1"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}