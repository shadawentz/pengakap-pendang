import React from 'react';
import { ScoutMember, TroopSettings } from '../types';
import { MalaysiaScoutCard } from './MalaysiaScoutCard';
import { MalaysiaScoutCardBack } from './MalaysiaScoutCardBack';
import { CR80_WIDTH_MM, CR80_HEIGHT_MM } from '../utils/cardPdfGenerator';

interface PrintAreaProps {
  member: ScoutMember | null;
  settings: TroopSettings;
}

export const PrintArea: React.FC<PrintAreaProps> = ({ member, settings }) => {
  if (!member) return null;

  return (
    <div id="print-area" className="hidden print:block print:w-full print:bg-white text-black p-4">
      <div className="max-w-[210mm] mx-auto">
        {/* Printable Header Info */}
        <div className="border-b border-gray-400 pb-2 mb-4 text-center">
          <h1 className="text-lg font-bold tracking-tight text-gray-900 uppercase">
            PERSEKUTUAN PENGAKAP MALAYSIA DAERAH PENDANG — KAD DIGITAL KEAHLIAN
          </h1>
          <p className="text-xs text-gray-600">
            Standard ISO/IEC 7810 ID-1 (CR80) Saiz: {CR80_WIDTH_MM}mm × {CR80_HEIGHT_MM}mm.
            Cetak pada <strong>Skala 100% (Actual Size)</strong> tanpa scaling.
          </p>
          <div className="text-[11px] text-gray-700 mt-1">
            Nama: <strong>{member.fullName}</strong> | No Ahli: <strong>{member.id}</strong> | K/P: <strong>{member.icPassport || '-'}</strong>
          </div>
        </div>

        {/* Section 1: Side by Side (Horizontal Fold or Pouch) */}
        <div className="mb-6">
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-2">
            <span>Susunan Cetakan: Depan & Belakang Kad Saiz Sebenar</span>
          </div>

          <div className="relative inline-flex items-center gap-3 p-3 bg-gray-50 border border-dashed border-gray-400 rounded-sm">
            {/* Front Card */}
            <div className="relative">
              <div
                style={{
                  width: `${CR80_WIDTH_MM}mm`,
                  height: `${CR80_HEIGHT_MM}mm`,
                  boxSizing: 'border-box',
                }}
              >
                <MalaysiaScoutCard
                  member={member}
                  elementId="print-card-front-a"
                  isPrintPreview={true}
                />
              </div>
              <div className="text-[9px] text-center text-gray-500 mt-1 font-mono">
                ▲ BAHAGIAN DEPAN (85.6 × 54 mm)
              </div>
            </div>

            {/* Folding Guide */}
            <div className="h-full border-r-2 border-dotted border-red-400 flex flex-col justify-center px-1 text-[8px] text-red-500 font-mono">
              LIPAT
            </div>

            {/* Back Card */}
            <div className="relative">
              <div
                style={{
                  width: `${CR80_WIDTH_MM}mm`,
                  height: `${CR80_HEIGHT_MM}mm`,
                  boxSizing: 'border-box',
                }}
              >
                <MalaysiaScoutCardBack
                  member={member}
                  elementId="print-card-back-a"
                  isPrintPreview={true}
                />
              </div>
              <div className="text-[9px] text-center text-gray-500 mt-1 font-mono">
                ▲ BAHAGIAN BELAKANG (85.6 × 54 mm)
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-[11px] text-gray-600 border-t border-gray-300 pt-2 flex items-center justify-between">
          <span>Dicetak daripada Portal Kad Digital Pengakap Daerah Pendang</span>
          <span>Sah Sehingga: 31.12.2026</span>
        </div>
      </div>
    </div>
  );
};
