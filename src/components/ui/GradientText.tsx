import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  gradient?: 'primary' | 'success' | 'warning' | 'rainbow';
  animate?: boolean;
}

export function GradientText({ children, className, gradient = 'primary', animate = false }: GradientTextProps) {
  const gradients = {
    primary: 'from-primary via-accent to-primary',
    success: 'from-success via-emerald-400 to-success',
    warning: 'from-warning via-amber-400 to-warning',
    rainbow: 'from-pink-500 via-purple-500 to-cyan-500',
  };

  return (
    <span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent font-black',
        gradients[gradient],
        animate && 'animate-premium-shimmer bg-[length:200%_auto]',
        className
      )}
    >
      {children}
    </span>
  );
}

export function NeonText({ children, className, color = 'primary' }: { children: ReactNode; className?: string; color?: string }) {
  const colors = {
    primary: 'text-primary drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]',
    success: 'text-success drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]',
    warning: 'text-warning drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]',
  };

  return (
    <span className={cn('font-black', colors[color as keyof typeof colors], className)}>
      {children}
    </span>
  );
}

export function GlitchText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('relative inline-block', className)}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute top-0 left-0 text-primary/30 -translate-x-[2px] animate-glitch-1"
        aria-hidden="true"
      >
        {children}
      </span>
      <span
        className="absolute top-0 left-0 text-accent/30 translate-x-[2px] animate-glitch-2"
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}
