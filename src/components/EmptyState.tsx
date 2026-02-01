import { ReactNode } from 'react';
import { LucideIcon, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn('glass-card py-12 sm:py-16 text-center', className)}>
      {emoji ? (
        <div className="text-5xl mb-4">{emoji}</div>
      ) : Icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-muted">
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
        </div>
      ) : null}
      
      <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 px-4">
          {description}
        </p>
      )}

      {children}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 px-4">
          {secondaryAction && (
            secondaryAction.href ? (
              <Link to={secondaryAction.href}>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick} className="gap-2">
                {secondaryAction.label}
              </Button>
            )
          )}
          {action && (
            action.href ? (
              <Link to={action.href}>
                <Button className="btn-gradient gap-2 w-full sm:w-auto">
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button onClick={action.onClick} className="btn-gradient gap-2">
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// API Error State
interface ApiErrorStateProps {
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function ApiErrorState({ 
  onRetry, 
  title = 'Nepodařilo se načíst data',
  description = 'Zkuste to prosím znovu nebo se vraťte později.'
}: ApiErrorStateProps) {
  return (
    <EmptyState
      emoji="⚠️"
      title={title}
      description={description}
      action={onRetry ? {
        label: 'Zkusit znovu',
        onClick: onRetry,
      } : undefined}
    />
  );
}

// No Data State
interface NoDataStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function NoDataState({
  title = 'Zatím žádná data',
  description = 'Zde se zobrazí vaše data, jakmile budou k dispozici.',
  actionLabel,
  actionHref,
}: NoDataStateProps) {
  return (
    <EmptyState
      emoji="📭"
      title={title}
      description={description}
      action={actionLabel && actionHref ? {
        label: actionLabel,
        href: actionHref,
      } : undefined}
    />
  );
}

// Offline State
export function OfflineState() {
  return (
    <EmptyState
      emoji="📡"
      title="Jste offline"
      description="Data budou dostupná po připojení k internetu."
      action={{
        label: 'Zkusit znovu',
        onClick: () => window.location.reload(),
      }}
    />
  );
}

// Loading Empty State for skeleton shimmer effect
export function LoadingEmptyState({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card p-8 animate-pulse', className)}>
      <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted" />
      <div className="h-6 bg-muted rounded w-48 mx-auto mb-2" />
      <div className="h-4 bg-muted rounded w-64 mx-auto" />
    </div>
  );
}
