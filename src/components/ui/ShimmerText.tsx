import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export function ShimmerText({ text, className, speed = 3 }: ShimmerTextProps) {
  return (
    <div className="relative inline-block">
      <span className={cn('relative z-10', className)}>{text}</span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -z-0"
        animate={{
          x: ['-200%', '200%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
