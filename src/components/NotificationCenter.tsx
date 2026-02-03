import { useState, useEffect } from 'react';
import { Bell, X, TrendingUp, Trophy, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'prediction';
  title: string;
  message: string;
  timestamp: number;
  read?: boolean;
  actionLabel?: string;
  actionHref?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onClearAll,
  className
}: NotificationCenterProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Trophy className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'prediction':
        return <TrendingUp className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === 'cz' ? 'Právě teď' : 'Just now';
    if (minutes < 60) return language === 'cz' ? `Před ${minutes}m` : `${minutes}m ago`;
    if (hours < 24) return language === 'cz' ? `Před ${hours}h` : `${hours}h ago`;
    return language === 'cz' ? `Před ${days}d` : `${days}d ago`;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg',
          'hover:bg-muted transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className={cn(
            'absolute -top-1 -right-1',
            'w-5 h-5 rounded-full',
            'bg-destructive text-destructive-foreground',
            'text-[10px] font-bold',
            'flex items-center justify-center',
            'border-2 border-background',
            'animate-pulse'
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'w-80 max-h-96 overflow-y-auto',
            'bg-card border border-border rounded-lg shadow-2xl',
            'animate-in slide-in-from-top-2 duration-200'
          )}>
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-semibold">
                {language === 'cz' ? 'Oznámení' : 'Notifications'}
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({unreadCount})
                  </span>
                )}
              </h3>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="text-xs"
                >
                  {language === 'cz' ? 'Vymazat' : 'Clear all'}
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    {language === 'cz' 
                      ? 'Žádná nová oznámení' 
                      : 'No new notifications'}
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                      !notification.read && 'bg-primary/5'
                    )}
                    onClick={() => {
                      onMarkAsRead(notification.id);
                      if (notification.actionHref) {
                        window.location.href = notification.actionHref;
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            className="shrink-0 p-1 hover:bg-muted rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </span>
                          {notification.actionLabel && (
                            <span className="text-xs text-primary font-medium">
                              {notification.actionLabel} →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
