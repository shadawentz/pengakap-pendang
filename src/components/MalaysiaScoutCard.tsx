import React from 'react';
import { ScoutMember } from '../types';
import { CARD_TEMPLATE_DATA_URL, CARD_TEMPLATE_URL } from './cardAssets';
import { MalaysiaScoutEmblem } from './MalaysiaScoutEmblem';

export { MalaysiaScoutEmblem };

interface MalaysiaScoutCardProps {
  member: ScoutMember;
  elementId?: string;
  isPrintPreview?: boolean;
}

export const MalaysiaScoutCard: React.FC<MalaysiaScoutCardProps> = ({
  member,
  elementId = 'malaysia-scout-card-front',
  isPrintPreview = false,
}) => {
  return (
    <div
      id={elementId}
      className="relative select-none text-slate-900 overflow-hidden shadow-2xl rounded-2xl font-sans border border-slate-700/50"
      style={{
        // Match the exact aspect ratio of the user's uploaded card image (1554 x 1012)
        aspectRatio: '1554 / 1012',
        width: isPrintPreview ? '85.6mm' : '100%',
        maxWidth: isPrintPreview ? '85.6mm' : '460px',
        boxSizing: 'border-box',
        backgroundColor: '#271f55',
      }}
    >
      {/* 1. High-Resolution Card Template Image */}
      <img
        src={CARD_TEMPLATE_DATA_URL || CARD_TEMPLATE_URL}
        alt="Kad Keahlian Pengakap Malaysia"
        className="w-full h-full object-fill absolute inset-0 pointer-events-none select-none"
        crossOrigin="anonymous"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== CARD_TEMPLATE_URL) {
            target.src = CARD_TEMPLATE_URL;
          } else {
            target.src = "https://imgh.in/host/nscfl2";
          }
        }}
      />

      {/* 2. Middle Content Area (Positioned precisely within the grey middle region) */}
      <div
        className="absolute flex flex-col justify-center z-10"
        style={{
          top: '44%',
          left: '8%',
          right: '8%',
          height: '38%',
        }}
      >
        {/* Name: Bold Uppercase */}
        <h1 className="text-[11px] sm:text-[13.5px] font-black uppercase text-slate-950 tracking-tight leading-snug truncate font-sans">
          {member.fullName}
        </h1>

        {/* Nombor Ahli */}
        <div className="text-[9.5px] sm:text-[12px] font-medium text-slate-900 tracking-normal mt-0.5 font-sans">
          {member.id}
        </div>

        {/* Space Below */}
        <div className="h-1.5 sm:h-2" />

        {/* Sah Sehingga : 31.12.2026 */}
        <div className="text-[9.5px] sm:text-[12px] font-medium text-slate-900 tracking-normal font-sans">
          Sah Sehingga : 31.12.2026
        </div>
      </div>
    </div>
  );
};
