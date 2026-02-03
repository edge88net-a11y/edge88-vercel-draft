import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollToTopButtonProps {
  threshold?: number;
}

export function ScrollToTopButton({ threshold = 400 }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-24 right-6 z-40',
        'w-12 h-12 rounded-full',
        'bg-primary text-primary-foreground',
        'shadow-2xl hover:shadow-primary/50',
        'flex items-center justify-center',
        'transition-all duration-300',
        'hover:scale-110 hover:-translate-y-1',
        'border-2 border-primary-foreground/10',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
