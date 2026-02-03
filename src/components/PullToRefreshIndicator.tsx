import { useEffect, useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface PullToRefreshIndicatorProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({ 
  onRefresh, 
  isRefreshing = false,
  threshold = 80 
}: PullToRefreshIndicatorProps) {
  const { language } = useLanguage();
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, threshold * 1.5));
        setCanRefresh(distance >= threshold);
      }
    };

    const handleTouchEnd = () => {
      if (canRefresh && !isRefreshing) {
        onRefresh();
      }
      setIsPulling(false);
      setPullDistance(0);
      setCanRefresh(false);
    };

    // Only enable on touch devices
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, canRefresh, isRefreshing, onRefresh, threshold]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const rotation = (pullDistance / threshold) * 360;

  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'flex items-center justify-center',
        'transition-all duration-200'
      )}
      style={{
        height: `${pullDistance}px`,
        opacity: pullDistance > 20 ? 1 : 0,
      }}
    >
      <div className="relative">
        {/* Progress circle */}
        <svg className="absolute inset-0" width="48" height="48">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary/20"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
            className="text-primary transition-all duration-100"
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>

        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-full bg-background',
            'flex items-center justify-center',
            'border-2 border-primary/30',
            canRefresh && 'bg-primary/10'
          )}
        >
          <RefreshCw
            className={cn(
              'h-5 w-5 text-primary transition-transform',
              isRefreshing && 'animate-spin'
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
            }}
          />
        </div>
      </div>

      {/* Label */}
      <div
        className={cn(
          'absolute top-full mt-2',
          'text-xs font-medium text-center',
          canRefresh ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {isRefreshing 
          ? (language === 'cz' ? 'Načítání...' : 'Refreshing...')
          : canRefresh
          ? (language === 'cz' ? 'Pusťte pro obnovení' : 'Release to refresh')
          : (language === 'cz' ? 'Táhněte dolů' : 'Pull down')
        }
      </div>
    </div>
  );
}
