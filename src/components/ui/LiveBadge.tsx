import { cn } from '@/lib/utils';

interface LiveBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function LiveBadge({ className, size = 'md', label = 'LIVE' }: LiveBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full',
        'bg-red-500/20 border border-red-500/30',
        'font-bold text-red-400',
        'animate-pulse',
        sizeClasses[size],
        className
      )}
    >
      <span className="relative flex">
        <span className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75',
          dotSizes[size]
        )} />
        <span className={cn(
          'relative inline-flex rounded-full bg-red-500',
          dotSizes[size]
        )} />
      </span>
      <span className="live-pulse-ring">{label}</span>
    </div>
  );
}

export function HotBadge({ className }: { className?: string }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full',
      'bg-orange-500/20 border border-orange-500/30',
      'text-xs font-bold text-orange-400',
      className
    )}>
      <span className="animate-fire-flicker">🔥</span>
      <span>HOT</span>
    </div>
  );
}

export function LockBadge({ className }: { className?: string }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full',
      'bg-amber-500/20 border border-amber-500/30',
      'text-xs font-bold text-amber-400',
      'golden-glow',
      className
    )}>
      <span>🔒</span>
      <span>LOCK</span>
    </div>
  );
}

export function NewBadge({ className }: { className?: string }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full',
      'bg-primary/20 border border-primary/30',
      'text-xs font-bold text-primary',
      'animate-bounce-attention',
      className
    )}>
      <span>✨</span>
      <span>NEW</span>
    </div>
  );
}
