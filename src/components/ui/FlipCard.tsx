import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  autoFlip?: boolean;
  flipDelay?: number;
}

export function FlipCard({ front, back, className, autoFlip = false, flipDelay = 3000 }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useState(() => {
    if (autoFlip) {
      const interval = setInterval(() => {
        setIsFlipped((prev) => !prev);
      }, flipDelay);

      return () => clearInterval(interval);
    }
  });

  return (
    <div 
      className={cn('relative w-full h-full cursor-pointer', className)}
      onClick={() => !autoFlip && setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-900 to-blue-800 border border-cyan-700 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
