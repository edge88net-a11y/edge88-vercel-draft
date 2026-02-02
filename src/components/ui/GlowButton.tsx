import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  glowIntensity?: 'low' | 'medium' | 'high';
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ variant = 'primary', size = 'md', glowIntensity = 'medium', className, children, ...props }, ref) => {
    const variants = {
      primary: {
        bg: 'bg-gradient-to-r from-cyan-500 to-blue-600',
        glow: 'rgba(6, 182, 212, 0.6)',
        hover: 'hover:from-cyan-400 hover:to-blue-500',
      },
      success: {
        bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
        glow: 'rgba(16, 185, 129, 0.6)',
        hover: 'hover:from-emerald-400 hover:to-green-500',
      },
      danger: {
        bg: 'bg-gradient-to-r from-red-500 to-rose-600',
        glow: 'rgba(239, 68, 68, 0.6)',
        hover: 'hover:from-red-400 hover:to-rose-500',
      },
      gold: {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
        glow: 'rgba(251, 191, 36, 0.6)',
        hover: 'hover:from-amber-400 hover:to-orange-500',
      },
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const glowSizes = {
      low: '10px',
      medium: '20px',
      high: '30px',
    };

    const config = variants[variant];

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative rounded-lg font-bold text-white transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          config.bg,
          config.hover,
          sizes[size],
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            `0 0 ${glowSizes[glowIntensity]} ${config.glow}`,
            `0 0 ${parseInt(glowSizes[glowIntensity]) * 2}px ${config.glow}`,
            `0 0 ${glowSizes[glowIntensity]} ${config.glow}`,
          ],
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

GlowButton.displayName = 'GlowButton';
