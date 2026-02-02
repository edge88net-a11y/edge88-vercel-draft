import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  type?: 'text' | 'card' | 'stat' | 'prediction';
}

export function SkeletonLoader({ className, count = 1, type = 'text' }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-4">
            <div className="h-4 w-1/3 bg-gray-800 rounded animate-pulse" />
            <div className="h-8 w-2/3 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-full bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-4/5 bg-gray-800 rounded animate-pulse" />
          </div>
        );
      
      case 'stat':
        return (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-800 rounded-lg animate-pulse" />
            </div>
            <div className="h-10 w-24 bg-gray-800 rounded animate-pulse" />
          </div>
        );
      
      case 'prediction':
        return (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-800 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-20 w-20 bg-gray-800 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-full bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <motion.div
            className={cn('h-4 bg-gray-800 rounded', className)}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
}
