import { ReactNode, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  tilt?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export function PremiumCard({
  children,
  className,
  glow = true,
  tilt = true,
  interactive = true,
  onClick,
}: PremiumCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x: x / rect.width, y: y / rect.height });
  };

  const tiltX = tilt && isHovered ? (mousePosition.y - 0.5) * -10 : 0;
  const tiltY = tilt && isHovered ? (mousePosition.x - 0.5) * 10 : 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden',
        'transition-all duration-300 ease-out',
        interactive && 'cursor-pointer hover:border-primary/30 hover:bg-card/90',
        interactive && 'hover:scale-[1.02]',
        glow && 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
        className
      )}
      style={{
        transform: tilt
          ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
          : undefined,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Gradient shimmer on hover */}
      {interactive && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(6,182,212,0.1) 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Glow effect */}
      {glow && isHovered && (
        <div
          className="absolute -inset-1 rounded-2xl blur-xl opacity-30 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(6,182,212,0.5), transparent 70%)`,
          }}
        />
      )}

      {/* Light reflection */}
      {tilt && isHovered && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-40 transition-opacity duration-300"
          style={{
            background: `linear-gradient(${90 + tiltY * 10}deg, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>

      {/* Border glow on hover */}
      {interactive && isHovered && (
        <div className="absolute inset-0 rounded-2xl border border-primary/50 pointer-events-none animate-in fade-in duration-200" />
      )}
    </div>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <PremiumCard onClick={onClick} className={cn('p-6', className)}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shrink-0">
          <Icon className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground">{title}</h3>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </PremiumCard>
  );
}
