import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  glow?: 'primary' | 'success' | 'warning' | 'none';
  hover?: boolean;
}

export function GlassPanel({ children, className, glow = 'none', hover = true }: GlassPanelProps) {
  const glowClasses = {
    primary: 'shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.25)]',
    success: 'shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:shadow-[0_0_40px_rgba(34,197,94,0.25)]',
    warning: 'shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]',
    none: '',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl',
        'transition-all duration-300',
        hover && 'hover:border-primary/30 hover:bg-card/90',
        glowClasses[glow],
        className
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function GlassPanelHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('border-b border-border/50 px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function GlassPanelContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}
