import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface StreakFireProps {
  streak: number;
  className?: string;
}

export function StreakFire({ streak, className }: StreakFireProps) {
  if (streak < 3) return null;

  const intensity = streak >= 10 ? 'massive' : streak >= 5 ? 'large' : 'small';

  return (
    <div className={cn('relative inline-flex items-center gap-1', className)}>
      <div className={cn(
        'relative flex items-center justify-center',
        intensity === 'massive' && 'animate-bounce-attention',
        intensity === 'large' && 'animate-pulse'
      )}>
        <Flame className={cn(
          'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]',
          intensity === 'massive' && 'h-8 w-8',
          intensity === 'large' && 'h-6 w-6',
          intensity === 'small' && 'h-5 w-5',
          'animate-fire-flicker'
        )} />
        
        {/* Glow effect */}
        <div className={cn(
          'absolute inset-0 blur-xl opacity-50',
          intensity === 'massive' && 'bg-orange-500/80',
          intensity === 'large' && 'bg-orange-500/60',
          intensity === 'small' && 'bg-orange-500/40',
          'animate-pulse'
        )} />
      </div>

      <span className={cn(
        'font-mono font-black',
        intensity === 'massive' && 'text-2xl text-orange-400 animate-fire-text',
        intensity === 'large' && 'text-xl text-orange-400',
        intensity === 'small' && 'text-lg text-orange-500',
        'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
      )}>
        {streak}
      </span>

      {intensity === 'massive' && (
        <div className="absolute -inset-4 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <Flame
              key={i}
              className="absolute text-orange-400/30"
              style={{
                left: `${20 + i * 30}%`,
                top: `${-10 + i * 5}%`,
                animation: `float-spark ${1.5 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
