import React from 'react';
import { ScoutMember, TroopSettings, ThemeColor } from '../types';
import { FleurDeLisIcon, GuillochePattern, BarcodeStrip } from './ScoutInsignia';
import { Phone, HeartPulse, ShieldAlert, Award } from 'lucide-react';

interface ScoutCardBackProps {
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
    stripColor: string;
  }
> = {
  navy: {
    bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950',
    border: 'border-amber-400/80',
    accent: 'text-amber-400',
    stripColor: 'bg-blue-900/60',
  },
  forest: {
    bg: 'bg-gradient-to-br from-slate-950 via-stone-900 to-emerald-950',
    border: 'border-yellow-400/80',
    accent: 'text-yellow-400',
    stripColor: 'bg-emerald-900/60',
  },
  purple: {
    bg: 'bg-gradient-to-br from-slate-950 via-zinc-900 to-purple-950',
    border: 'border-amber-300/80',
    accent: 'text-amber-300',
    stripColor: 'bg-purple-900/60',
  },
  maroon: {
    bg: 'bg-gradient-to-br from-slate-950 via-neutral-900 to-rose-950',
    border: 'border-amber-400/80',
    accent: 'text-amber-400',
    stripColor: 'bg-rose-900/60',
  },
  gold: {
    bg: 'bg-gradient-to-br from-black via-stone-950 to-neutral-900',
    border: 'border-yellow-400',
    accent: 'text-yellow-400',
    stripColor: 'bg-stone-800/80',
  },
};

export const ScoutCardBack: React.FC<ScoutCardBackProps> = ({
  member,
  settings,
  elementId = 'scout-card-back',
  isPrintPreview = false,
}) => {
  const currentTheme = themeStyles[settings.themeColor] || themeStyles.navy;

  return (
    <div
      id={elementId}
      className={`relative select-none text-white overflow-hidden shadow-2xl rounded-xl border-[2.5px] ${currentTheme.border} ${currentTheme.bg}`}
      style={{
        aspectRatio: '85.6 / 53.98',
        width: isPrintPreview ? '85.6mm' : '100%',
        maxWidth: isPrintPreview ? '85.6mm' : '440px',
        boxSizing: 'border-box',
      }}
    >
      {/* Guilloche Security Background Pattern */}
      <GuillochePattern className="text-amber-200" opacity={0.06} />

      {/* Decorative Outer Inset Foil Line */}
      <div className="absolute inset-[3px] rounded-lg border border-amber-400/25 pointer-events-none" />

      {/* Card Content Layout */}
      <div className="relative z-10 h-full flex flex-col justify-between p-2.5 sm:p-3">
        {/* Top Section: Scout Oath / Motto Banner */}
        <div className="flex items-start justify-between gap-2 border-b border-amber-400/25 pb-1">
          <div className="flex-1">
            <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-black text-amber-300 uppercase tracking-wider font-['Cinzel']">
              <FleurDeLisIcon className="w-3.5 h-3.5" color="#FACC15" />
              <span>THE SCOUT MOTTO & PROMISE</span>
            </div>
            <p className="text-[6px] sm:text-[6.8px] text-slate-300 leading-tight italic mt-0.5 line-clamp-2">
              "On my honour, I promise that I will do my best, to do my duty to God and my country, to help other people at all times, and to obey the Scout Law."
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[6px] font-mono text-amber-400 uppercase tracking-widest font-bold">
              {settings.motto || 'BE PREPARED'}
            </span>
          </div>
        </div>

        {/* Middle Section: Emergency & Medical Information Box */}
        <div className="grid grid-cols-2 gap-2 my-auto py-1">
          {/* Emergency & Medical Info */}
          <div className="bg-slate-950/80 border border-slate-700/80 rounded-sm p-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[6.5px] font-bold text-red-400 uppercase tracking-wide border-b border-slate-800 pb-0.5 mb-1">
              <ShieldAlert className="w-2.5 h-2.5 text-red-400 shrink-0" />
              <span>EMERGENCY & MEDICAL</span>
            </div>

            <div className="space-y-0.5 text-[6.5px] sm:text-[7.5px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Blood Type:</span>
                <span className="font-mono font-bold text-red-300">{member.bloodGroup || 'N/A'}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-400">Contact:</span>{' '}
                <span className="font-mono text-white">{member.emergencyContact || 'Troop HQ'}</span>
              </div>
              {member.icPassport && (
                <div className="truncate">
                  <span className="text-slate-400">IC / Passport:</span>{' '}
                  <span className="font-mono text-slate-200">{member.icPassport}</span>
                </div>
              )}
              {member.dateOfBirth && (
                <div className="truncate">
                  <span className="text-slate-400">DOB:</span>{' '}
                  <span className="font-mono text-slate-200">{member.dateOfBirth}</span>
                </div>
              )}
            </div>
          </div>

          {/* Authorized Signature Strip */}
          <div className="bg-slate-950/80 border border-slate-700/80 rounded-sm p-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[6.5px] font-bold text-amber-300 uppercase tracking-wide border-b border-slate-800 pb-0.5 mb-1">
              <Award className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span>AUTHORIZED SIGNATURE</span>
            </div>

            <div className="flex-1 flex flex-col justify-end">
              {/* White signature strip mimicking physical card */}
              <div className="bg-slate-100/90 h-6 rounded-xs flex items-center justify-center px-2 relative overflow-hidden shadow-inner">
                {/* Microprint security line */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <span className="text-[4px] font-mono text-slate-900 tracking-tighter">
                    OFFICIAL SCOUT AUTHORIZATION • VERIFIED SIGNATURE • 
                  </span>
                </div>
                {/* Script font faux signature */}
                <span className="font-serif italic font-bold text-[10px] text-blue-950 select-none transform -rotate-1 tracking-wider">
                  {settings.signatoryName || 'A. H. Vance'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[6px] text-slate-400 mt-0.5">
                <span className="truncate">{settings.signatoryTitle || 'District Scout Commissioner'}</span>
                <span className="font-mono text-amber-400 shrink-0">W.B.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Barcode + Property Notice */}
        <div className="border-t border-amber-400/25 pt-1 flex items-center justify-between gap-2">
          {/* Barcode Strip */}
          <div className="w-40 sm:w-48 shrink-0">
            <BarcodeStrip value={member.id} />
          </div>

          {/* Legal Notice */}
          <div className="flex-1 text-[5px] sm:text-[5.5px] text-slate-400 leading-tight text-right">
            Property of {settings.associationName || 'The Scout Association'}. If found, please return to your nearest Scout Headquarters or call emergency contact.
          </div>
        </div>
      </div>
    </div>
  );
};
