import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Shimmer({ className, width = 'w-full', height = 'h-4' }: ShimmerProps) {
  return (
    <div className={cn('relative overflow-hidden rounded bg-muted', width, height, className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export function ShimmerCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Shimmer width="w-24" height="h-6" />
        <Shimmer width="w-16" height="h-8" className="rounded-full" />
      </div>
      
      <div className="space-y-3">
        <Shimmer width="w-3/4" height="h-5" />
        <Shimmer width="w-full" height="h-5" />
        <Shimmer width="w-1/2" height="h-5" />
      </div>
      
      <div className="flex gap-2">
        <Shimmer width="w-20" height="h-10" className="rounded-lg" />
        <Shimmer width="w-20" height="h-10" className="rounded-lg" />
      </div>
    </div>
  );
}

export function ShimmerStats() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="stat-card p-4 space-y-2">
          <Shimmer width="w-16" height="h-8" />
          <Shimmer width="w-20" height="h-4" />
        </div>
      ))}
    </div>
  );
}
