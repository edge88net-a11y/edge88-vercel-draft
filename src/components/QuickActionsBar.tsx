import { Bookmark, TrendingUp, Trophy, Clock, Calendar, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface QuickAction {
  id: string;
  icon: React.ElementType;
  labelEn: string;
  labelCz: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
  color?: string;
}

interface QuickActionsBarProps {
  onRefresh?: () => void;
  savedCount?: number;
  className?: string;
}

export function QuickActionsBar({ onRefresh, savedCount = 0, className }: QuickActionsBarProps) {
  const { language } = useLanguage();

  const actions: QuickAction[] = [
    {
      id: 'saved',
      icon: Bookmark,
      labelEn: 'Saved',
      labelCz: 'Uložené',
      href: '/saved-picks',
      badge: savedCount,
      color: 'text-primary'
    },
    {
      id: 'results',
      icon: Trophy,
      labelEn: 'Results',
      labelCz: 'Výsledky',
      href: '/results',
      color: 'text-success'
    },
    {
      id: 'today',
      icon: Clock,
      labelEn: 'Today',
      labelCz: 'Dnes',
      href: '/predictions?time=today',
      color: 'text-blue-400'
    },
    {
      id: 'week',
      icon: Calendar,
      labelEn: 'This Week',
      labelCz: 'Týden',
      href: '/predictions?time=week',
      color: 'text-purple-400'
    }
  ];

  if (onRefresh) {
    actions.push({
      id: 'refresh',
      icon: RefreshCw,
      labelEn: 'Refresh',
      labelCz: 'Obnovit',
      onClick: onRefresh,
      color: 'text-muted-foreground'
    });
  }

  const ActionButton = ({ action }: { action: QuickAction }) => {
    const content = (
      <div className="flex flex-col items-center gap-1.5 relative group">
        <div className={cn(
          'relative p-2.5 rounded-lg',
          'bg-muted/50 border border-border',
          'group-hover:bg-muted transition-all duration-200',
          'group-hover:scale-105 group-hover:shadow-md'
        )}>
          <action.icon className={cn('h-5 w-5', action.color)} />
          {action.badge !== undefined && action.badge > 0 && (
            <span className={cn(
              'absolute -top-1 -right-1',
              'w-5 h-5 rounded-full',
              'bg-primary text-primary-foreground',
              'text-[10px] font-bold',
              'flex items-center justify-center',
              'border-2 border-background'
            )}>
              {action.badge > 99 ? '99+' : action.badge}
            </span>
          )}
        </div>
        <span className={cn(
          'text-[10px] font-medium text-center',
          'text-muted-foreground group-hover:text-foreground',
          'transition-colors duration-200'
        )}>
          {language === 'cz' ? action.labelCz : action.labelEn}
        </span>
      </div>
    );

    if (action.href) {
      return (
        <Link to={action.href} className="no-underline">
          {content}
        </Link>
      );
    }

    return (
      <button onClick={action.onClick} className="focus:outline-none">
        {content}
      </button>
    );
  };

  return (
    <div className={cn('flex items-center gap-4 overflow-x-auto scrollbar-hide', className)}>
      {actions.map((action) => (
        <ActionButton key={action.id} action={action} />
      ))}
    </div>
  );
}
