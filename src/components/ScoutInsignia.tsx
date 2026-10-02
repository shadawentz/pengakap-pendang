import React from 'react';
import { MalaysiaScoutEmblem } from './MalaysiaScoutEmblem';

export { MalaysiaScoutEmblem };

export const FleurDeLisIcon: React.FC<{ className?: string; color?: string }> = ({
  className = "w-6 h-6",
}) => (
  <MalaysiaScoutEmblem className={className} />
);

export const GuillochePattern: React.FC<{ className?: string; opacity?: number }> = ({
  className = "absolute inset-0 pointer-events-none",
  opacity = 0.08
}) => (
  <svg
    className={className}
    style={{ opacity }}
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
  >
    <defs>
      <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,2" />
        <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="0.4" />
        <path d="M0,20 Q10,0 20,20 T40,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M20,0 Q0,10 20,20 T20,40" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
      <pattern id="microtext" width="120" height="12" patternUnits="userSpaceOnUse">
        <text
          x="0"
          y="9"
          fontSize="4"
          fill="currentColor"
          fontFamily="monospace"
          letterSpacing="1"
        >
          SCOUTPASS OFFICIAL VERIFIED MEMBERSHIP • BE PREPARED • SEDIAMENGABDI • 
        </text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#guilloche)" />
    <rect width="100%" height="100%" fill="url(#microtext)" opacity="0.35" />
  </svg>
);

export const HologramBadge: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-md border border-amber-300/40 p-1 flex items-center justify-center bg-gradient-to-tr from-amber-500/20 via-sky-400/25 to-emerald-400/20 shadow-inner ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-0.5">
        <FleurDeLisIcon className="w-3.5 h-3.5" color="#FACC15" />
        <span className="text-[7px] font-black tracking-widest text-amber-300 uppercase">OFFICIAL</span>
      </div>
      <span className="text-[6px] font-mono tracking-tighter text-amber-200/90 leading-none">VERIFIED ID</span>
    </div>
  </div>
);

export const BarcodeStrip: React.FC<{ value: string; className?: string }> = ({ value, className = "" }) => {
  // Generate faux Code128 bar pattern deterministically based on string characters
  const bars: { width: number; isBar: boolean }[] = [];
  let isBar = true;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    bars.push({ width: (code % 3) + 1, isBar });
    bars.push({ width: ((code >> 1) % 2) + 1, isBar: !isBar });
    bars.push({ width: ((code >> 2) % 3) + 1, isBar });
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-stretch h-7 w-full px-2 bg-white rounded-xs overflow-hidden">
        {bars.slice(0, 45).map((bar, idx) => (
          <div
            key={idx}
            className={`h-full ${bar.isBar ? 'bg-black' : 'bg-transparent'}`}
            style={{ width: `${bar.width * 2}%` }}
          />
        ))}
      </div>
      <span className="text-[8px] font-mono tracking-widest text-slate-400 mt-0.5 uppercase">
        *{value}*
      </span>
    </div>
  );
};
