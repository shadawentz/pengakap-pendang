import React from 'react';
import { ScoutMember } from '../types';
import { MalaysiaScoutEmblem } from './MalaysiaScoutEmblem';

interface MalaysiaScoutCardBackProps {
  member: ScoutMember;
  elementId?: string;
  isPrintPreview?: boolean;
}

export const MalaysiaScoutCardBack: React.FC<MalaysiaScoutCardBackProps> = ({
  member,
  elementId = 'malaysia-scout-card-back',
  isPrintPreview = false,
}) => {
  return (
    <div
      id={elementId}
      className="relative select-none text-slate-900 overflow-hidden shadow-2xl rounded-2xl flex flex-col justify-between font-sans border border-slate-700/50"
      style={{
        aspectRatio: '1554 / 1012',
        width: isPrintPreview ? '85.6mm' : '100%',
        maxWidth: isPrintPreview ? '85.6mm' : '460px',
        backgroundColor: '#e1e3e8',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Top Header (Logo + Association Name only, no yellow wording) */}
      <div
        className="w-full px-3.5 sm:px-4 py-2 flex items-center text-white"
        style={{
          backgroundColor: '#271f55',
          height: '28%',
        }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <MalaysiaScoutEmblem className="w-10 h-10 sm:w-12 sm:h-12" />
          <div className="flex flex-col">
            <div className="text-[9.5px] sm:text-[11px] font-extrabold uppercase tracking-wide text-white leading-tight font-sans">
              PERSEKUTUAN PENGAKAP MALAYSIA
            </div>
            <div className="w-full h-[1px] bg-white/70 my-0.5" />
            <div className="text-[7.5px] sm:text-[8.5px] font-medium uppercase tracking-wider text-slate-200 leading-tight font-sans">
              THE SCOUTS ASSOCIATION OF MALAYSIA
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Content (No QR code, no Persetiaan text) */}
      <div className="flex-1 px-5 sm:px-6 py-2 flex flex-col justify-center gap-1.5 sm:gap-2 text-slate-900">
        <div className="text-[10.5px] sm:text-[12.5px] leading-tight">
          <span className="text-slate-600 font-semibold">Jawatan:</span>{' '}
          <strong className="text-slate-950 font-black">{member.rank || 'AHLI'}</strong>
        </div>
        {member.troop && (
          <div className="text-[10.5px] sm:text-[12.5px] leading-tight truncate">
            <span className="text-slate-600 font-semibold">Sekolah / Unit:</span>{' '}
            <strong className="text-slate-950 font-black">{member.troop}</strong>
          </div>
        )}
        {member.icPassport && (
          <div className="text-[10.5px] sm:text-[12.5px] leading-tight">
            <span className="text-slate-600 font-semibold">No. K/P:</span>{' '}
            <span className="font-mono font-black text-slate-900">{member.icPassport}</span>
          </div>
        )}
      </div>

      {/* 3. Bottom Bar (No Barcode, clean solid banner) */}
      <div
        className="w-full px-4 flex items-center justify-between"
        style={{
          backgroundColor: '#271f55',
          height: '16%',
        }}
      >
        <span className="text-[8px] sm:text-[9.5px] text-slate-200 font-sans tracking-wide">
          Kad Rasmi Pengakap Malaysia
        </span>
        <span className="text-[8px] sm:text-[9.5px] text-slate-200 font-sans tracking-wide">
          Sah Sehingga : 31.12.2026
        </span>
      </div>
    </div>
  );
};
