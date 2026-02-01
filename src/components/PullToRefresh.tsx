import { useState, useRef, useEffect, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isMobile = useIsMobile();

  const THRESHOLD = 80;
  const MAX_PULL = 120;

  useEffect(() => {
    if (!isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      
      if (diff > 0 && container.scrollTop === 0) {
        e.preventDefault();
        const distance = Math.min(diff * 0.5, MAX_PULL);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      if (pullDistance >= THRESHOLD) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setIsPulling(false);
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isPulling, pullDistance, isRefreshing, onRefresh]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-auto', className)}>
      {/* Pull indicator */}
      <div 
        className={cn(
          'absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-opacity z-10',
          (pullDistance > 0 || isRefreshing) ? 'opacity-100' : 'opacity-0'
        )}
        style={{ top: Math.max(pullDistance - 40, 8) }}
      >
        <div className={cn(
          'h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-lg',
          pullDistance >= THRESHOLD && 'bg-primary/20 border-primary'
        )}>
          <RefreshCw 
            className={cn(
              'h-5 w-5 text-muted-foreground transition-transform',
              isRefreshing && 'animate-spin text-primary',
              pullDistance >= THRESHOLD && 'text-primary'
            )}
            style={{ 
              transform: isRefreshing ? undefined : `rotate(${pullDistance * 2}deg)` 
            }}
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div 
        style={{ 
          transform: `translateY(${isRefreshing ? 40 : pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
