import React from 'react';
import { SCOUT_LOGO_DATA_URL, SCOUT_LOGO_URL } from './scoutLogoBase64';

interface MalaysiaScoutEmblemProps {
  className?: string;
  size?: number | string;
  alt?: string;
}

export const MalaysiaScoutEmblem: React.FC<MalaysiaScoutEmblemProps> = ({
  className = "w-14 h-14",
  size,
  alt = "Logo Pengakap Malaysia"
}) => {
  return (
    <img
      src={SCOUT_LOGO_DATA_URL || SCOUT_LOGO_URL}
      alt={alt}
      className={`object-contain pointer-events-none select-none rounded-full ${className}`}
      style={size ? { width: size, height: size } : undefined}
      onError={(e) => {
        // Fallback to direct URL if data URL has any issue
        const target = e.currentTarget;
        if (target.src !== SCOUT_LOGO_URL) {
          target.src = SCOUT_LOGO_URL;
        } else {
          target.src = "https://imgh.in/host/v9tg61";
        }
      }}
    />
  );
};
