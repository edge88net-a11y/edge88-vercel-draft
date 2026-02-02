import { cn } from '@/lib/utils';

export function PredictionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border bg-card p-4 space-y-4 min-h-[420px]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 bg-muted rounded animate-pulse" />
          <div className="h-6 w-6 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 w-20 bg-muted rounded-full animate-pulse" />
      </div>

      {/* Teams */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Confidence & Odds */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-16 w-16 bg-muted rounded-full animate-pulse" />
      </div>

      {/* Analysis preview */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export function PredictionSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <PredictionSkeleton key={i} />
      ))}
    </div>
  );
}
