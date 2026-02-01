import { Users, TrendingUp, Flame } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UrgencyBadgeProps {
  type: 'upgrades' | 'spots' | 'viewers';
  value: number;
}

export function UrgencyBadge({ type, value }: UrgencyBadgeProps) {
  const { language } = useLanguage();

  const config = {
    upgrades: {
      icon: TrendingUp,
      text: language === 'cz' 
        ? `🔥 ${value} lidí upgradovalo tento týden`
        : `🔥 ${value} people upgraded this week`,
    },
    spots: {
      icon: Flame,
      text: language === 'cz'
        ? `⚡ Zbývá pouze ${value} míst tento měsíc`
        : `⚡ Only ${value} spots left this month`,
    },
    viewers: {
      icon: Users,
      text: language === 'cz'
        ? `👀 ${value} lidí si právě prohlíží tuto stránku`
        : `👀 ${value} people viewing this page`,
    },
  };

  const { icon: Icon, text } = config[type];

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-sm font-medium text-destructive animate-pulse">
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </div>
  );
}
