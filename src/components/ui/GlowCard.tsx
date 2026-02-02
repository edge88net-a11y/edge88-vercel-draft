import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'emerald' | 'red' | 'gold';
  onClick?: () => void;
}

export function GlowCard({ children, className, glowColor = 'cyan', onClick }: GlowCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const glowColors = {
    cyan: 'shadow-cyan-500/50',
    emerald: 'shadow-emerald-500/50',
    red: 'shadow-red-500/50',
    gold: 'shadow-amber-500/50',
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-xl bg-gray-900/50 backdrop-blur border border-gray-800',
        'hover:border-gray-700 transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        glowColors[glowColor],
        className
      )}
      onClick={onClick}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.1), transparent 40%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
