import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  aspectRatio?: string;
  loading?: 'lazy' | 'eager';
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallback = '/placeholder-team.png',
  aspectRatio = '1/1',
  loading = 'lazy',
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Only load image when in viewport (intersection observer)
    if (loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '50px' }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    } else {
      loadImage();
    }
  }, [src]);

  const loadImage = () => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    img.onerror = () => {
      setImageSrc(fallback);
      setIsLoading(false);
      setHasError(true);
    };
  };

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ aspectRatio }}
    >
      {isLoading && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        loading={loading}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
