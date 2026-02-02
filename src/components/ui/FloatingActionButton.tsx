import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FABProps {
  icon: LucideIcon;
  label?: string;
  onClick: () => void;
  badge?: number;
  position?: 'bottom-right' | 'bottom-left';
  color?: 'primary' | 'success' | 'warning';
  pulse?: boolean;
  className?: string;
}

export function FloatingActionButton({
  icon: Icon,
  label,
  onClick,
  badge,
  position = 'bottom-right',
  color = 'primary',
  pulse = false,
  className,
}: FABProps) {
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4 md:bottom-6 md:right-6',
    'bottom-left': 'bottom-20 left-4 md:bottom-6 md:left-6',
  };

  const colorClasses = {
    primary: 'bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90',
    success: 'bg-gradient-to-r from-success to-emerald-500 text-white hover:from-success/90 hover:to-emerald-500/90',
    warning: 'bg-gradient-to-r from-warning to-amber-500 text-white hover:from-warning/90 hover:to-amber-500/90',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl',
        'transition-all duration-300 hover:scale-105 active:scale-95',
        'backdrop-blur-sm',
        positionClasses[position],
        colorClasses[color],
        pulse && 'animate-pulse',
        className
      )}
    >
      <Icon className="h-5 w-5" />
      
      {label && (
        <span className="font-semibold text-sm hidden sm:inline">
          {label}
        </span>
      )}

      {badge !== undefined && badge > 0 && (
        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white text-xs font-bold flex items-center justify-center animate-bounce-attention">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </button>
  );
}

interface FABMenuProps {
  trigger: ReactNode;
  items: Array<{
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    color?: string;
  }>;
  position?: 'bottom-right' | 'bottom-left';
}

export function FloatingActionMenu({ trigger, items, position = 'bottom-right' }: FABMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4 md:bottom-6 md:right-6',
    'bottom-left': 'bottom-20 left-4 md:bottom-6 md:left-6',
  };

  return (
    <div className={cn('fixed z-40', positionClasses[position])}>
      {/* Menu Items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-2 animate-in slide-in-from-bottom-4">
          {items.map((item, index) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-full bg-card border border-border',
                  'shadow-xl hover:scale-105 transition-all duration-200',
                  'backdrop-blur-sm'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ItemIcon className={cn('h-5 w-5', item.color || 'text-primary')} />
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Trigger Button */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
    </div>
  );
}

import { useState } from 'react';
