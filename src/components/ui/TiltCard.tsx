import { ReactNode, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glowColor?: string;
}

export function TiltCard({ children, className, intensity = 10, glowColor = 'rgba(6,182,212,0.3)' }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((y - centerY) / centerY) * -intensity;
    const tiltY = ((x - centerX) / centerX) * intensity;
    
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={cn('relative transition-all duration-300 ease-out', className)}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'scale(1.02)' : 'scale(1)'}`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow effect */}
      {isHovered && (
        <div
          className="absolute -inset-1 rounded-2xl opacity-50 blur-xl transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 + tilt.x * 2}%, ${glowColor}, transparent 70%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>

      {/* Light reflection */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            background: `linear-gradient(${90 + tilt.y * 10}deg, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            opacity: 0.4,
          }}
        />
      )}
    </div>
  );
}
