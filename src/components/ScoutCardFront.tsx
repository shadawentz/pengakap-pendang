import React from 'react';
import { ScoutMember, TroopSettings, ThemeColor } from '../types';
import { FleurDeLisIcon, GuillochePattern, HologramBadge } from './ScoutInsignia';
import { CardQrCode } from './CardQrCode';
import { ShieldCheck, User } from 'lucide-react';

interface ScoutCardFrontProps {
  member: ScoutMember;
  settings: TroopSettings;
  elementId?: string;
  isPrintPreview?: boolean;
}

const themeStyles: Record<
  ThemeColor,
  {
    bg: string;
    border: string;
    accent: string;
    headerBg: string;
    fleurColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  navy: {
    bg: 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950',
    border: 'border-amber-400/80',
    accent: 'text-amber-400',
    headerBg: 'bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-blue-900/90',
    fleurColor: '#FACC15',
    badgeBg: 'bg-amber-400 text-slate-950',
    badgeText: 'text-amber-300',
  },
  forest: {
    bg: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950',
    border: 'border-yellow-400/80',
    accent: 'text-yellow-400',
    headerBg: 'bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-emerald-900/90',
    fleurColor: '#FACC15',
    badgeBg: 'bg-yellow-400 text-emerald-950',
    badgeText: 'text-yellow-300',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950',
    border: 'border-amber-300/80',
    accent: 'text-amber-300',
    headerBg: 'bg-gradient-to-r from-purple-900/90 via-fuchsia-900/90 to-purple-900/90',
    fleurColor: '#FFFFFF',
    badgeBg: 'bg-white text-purple-950',
    badgeText: 'text-purple-200',
  },
  maroon: {
    bg: 'bg-gradient-to-br from-rose-950 via-red-950 to-slate-950',
    border: 'border-amber-400/80',
    accent: 'text-amber-400',
    headerBg: 'bg-gradient-to-r from-rose-900/90 via-red-900/90 to-rose-900/90',
    fleurColor: '#FACC15',
    badgeBg: 'bg-amber-400 text-red-950',
    badgeText: 'text-amber-300',
  },
  gold: {
    bg: 'bg-gradient-to-br from-stone-900 via-neutral-900 to-black',
    border: 'border-yellow-400',
    accent: 'text-yellow-400',
    headerBg: 'bg-gradient-to-r from-stone-800 via-yellow-950/80 to-stone-800',
    fleurColor: '#EAB308',
    badgeBg: 'bg-yellow-400 text-stone-950',
    badgeText: 'text-yellow-400',
  },
};

export const ScoutCardFront: React.FC<ScoutCardFrontProps> = ({
  member,
  settings,
  elementId = 'scout-card-front',
  isPrintPreview = false,
}) => {
  const currentTheme = themeStyles[settings.themeColor] || themeStyles.navy;
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}?id=${encodeURIComponent(
    member.id
  )}`;

  return (
    <div
      id={elementId}
      className={`relative select-none text-white overflow-hidden shadow-2xl rounded-xl border-[2.5px] ${currentTheme.border} ${currentTheme.bg}`}
      style={{
        // Maintain standard CR80 aspect ratio (85.6mm / 53.98mm = 1.5857)
        aspectRatio: '85.6 / 53.98',
        width: isPrintPreview ? '85.6mm' : '100%',
        maxWidth: isPrintPreview ? '85.6mm' : '440px',
        boxSizing: 'border-box',
      }}
    >
      {/* Guilloche Anti-Counterfeit Background Pattern */}
      <GuillochePattern className="text-amber-200" opacity={0.07} />

      {/* Decorative Outer Inset Foil Line */}
      <div className="absolute inset-[3px] rounded-lg border border-amber-400/25 pointer-events-none" />

      {/* Card Content Layout */}
      <div className="relative z-10 h-full flex flex-col justify-between p-2.5 sm:p-3">
        {/* Top Header Row: Insignia + Troop Branding + Hologram */}
        <div className="flex items-center justify-between gap-1.5 border-b border-amber-400/30 pb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="p-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 shrink-0">
              <FleurDeLisIcon className="w-5 h-5 sm:w-6 sm:h-6" color={currentTheme.fleurColor} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider text-amber-300 leading-tight truncate font-['Cinzel']">
                {settings.associationName || 'WORLD SCOUT MOVEMENT'}
              </h2>
              <p className="text-[7px] sm:text-[8px] font-bold text-slate-300 tracking-wide leading-tight truncate">
                {settings.troopName || 'Daerah Pendang, Kedah'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1">
            <HologramBadge className="h-6 sm:h-7 px-1.5" />
          </div>
        </div>

        {/* Middle Body Row: Photo + Member Info + QR Code */}
        <div className="flex items-center gap-2.5 sm:gap-3 my-auto py-1">
          {/* Member Portrait with Gold Bezel */}
          <div className="relative shrink-0">
            <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-md overflow-hidden border-2 border-amber-400/90 shadow-md bg-slate-800 flex items-center justify-center">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.fullName}
                  className="w-full h-full object-cover object-top"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-700 to-slate-900 text-slate-400 p-1 text-center">
                  <User className="w-7 h-7 text-amber-300/80 mb-0.5" />
                  <span className="text-[6px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                    MEMBER
                  </span>
                </div>
              )}
            </div>
            {/* Status dot */}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 border border-slate-950 rounded-full px-1 py-0.2 flex items-center gap-0.5 shadow-sm">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              <span className="text-[6px] font-black text-white leading-none">ACTIVE</span>
            </div>
          </div>

          {/* Member Details */}
          <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
            <div className="inline-flex items-center gap-1">
              <span className="text-[6.5px] sm:text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-400/20 text-amber-300 border border-amber-400/40 leading-none">
                {member.section || 'Senior Scout'}
              </span>
              <span className="text-[6.5px] sm:text-[7px] font-mono text-slate-300">
                {member.rank || 'Member'}
              </span>
            </div>

            <h1 className="text-[10px] sm:text-[12.5px] font-extrabold uppercase text-white tracking-tight leading-tight line-clamp-2">
              {member.fullName}
            </h1>

            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="bg-slate-950/70 border border-amber-400/40 rounded px-1.5 py-0.5 flex items-center gap-1">
                <span className="text-[6px] text-amber-400/90 font-bold uppercase">ID</span>
                <span className="text-[8px] sm:text-[9.5px] font-mono font-bold tracking-wider text-white">
                  {member.id}
                </span>
              </div>

              {member.bloodGroup && (
                <div className="bg-red-950/80 border border-red-500/50 rounded px-1 py-0.5 flex items-center gap-0.5">
                  <span className="text-[6px] text-red-300 font-bold">BLOOD</span>
                  <span className="text-[7.5px] font-mono font-bold text-red-200">
                    {member.bloodGroup}
                  </span>
                </div>
              )}
            </div>

            <div className="text-[6.5px] sm:text-[7.5px] text-slate-300 truncate">
              <span className="text-slate-400">Unit:</span> {member.troop}
            </div>
          </div>

          {/* QR Code for instant field verification */}
          <div className="shrink-0 flex flex-col items-center">
            <CardQrCode data={verifyUrl} size={isPrintPreview ? 52 : 58} />
            <span className="text-[5.5px] sm:text-[6px] font-mono text-slate-400 uppercase tracking-tighter mt-0.5">
              SCAN TO VERIFY
            </span>
          </div>
        </div>

        {/* Bottom Footer Bar: Validity + Security seal */}
        <div className="flex items-center justify-between pt-1 border-t border-amber-400/30 text-[6.5px] sm:text-[7.5px] text-slate-300">
          <div className="flex items-center gap-2">
            <span>
              <strong className="text-slate-400 uppercase">ISSUED:</strong> {member.issueDate || '2026-01-01'}
            </span>
            <span>
              <strong className="text-amber-400 uppercase">EXPIRES:</strong>{' '}
              <span className="font-semibold text-white">{member.expiryDate || '2028-12-31'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[6px] text-amber-300/80">
            <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
            <span className="tracking-widest uppercase">SCOUT SECUREPASS ID</span>
          </div>
        </div>
      </div>
    </div>
  );
};
