import { useState } from 'react';
import { getTeamLogoUrl, SPORT_EMOJI } from '@/lib/teamLogos';
import { cn } from '@/lib/utils';

interface TeamLogoProps {
  teamName: string;
  sport: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-10 w-10',
};

export function TeamLogo({ teamName, sport, size = 'md', className }: TeamLogoProps) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getTeamLogoUrl(teamName, sport);
  const sportUpper = sport?.toUpperCase() || '';
  
  // If we have a valid logo URL and no error, show the image
  if (logoUrl && !imageError) {
    return (
      <img
        src={logoUrl}
        alt={`${teamName} logo`}
        className={cn(sizeClasses[size], 'object-contain', className)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  }
  
  // Fallback to emoji
  return (
    <span className={cn('flex items-center justify-center', className)}>
      {SPORT_EMOJI[sportUpper] || '🏆'}
    </span>
  );
}
