import React, { useState } from 'react';
import { TroopSettings } from '../types';
import { MalaysiaScoutEmblem } from './MalaysiaScoutEmblem';
import { Search, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface DiscreetLookupHeroProps {
  settings: TroopSettings;
  onVerify: (id: string, dob?: string) => Promise<boolean>;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  onSelectSampleId?: (id: string) => void;
}

export const DiscreetLookupHero: React.FC<DiscreetLookupHeroProps> = ({
  settings,
  onVerify,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [idInput, setIdInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idInput.trim()) return;
    onClearError();
    await onVerify(idInput.trim());
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center space-y-6">
      {/* Association & Troop Crest */}
      <div className="flex flex-col items-center">
        <div className="relative mb-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#151272] p-1 shadow-xl shadow-indigo-950/40 flex items-center justify-center border-2 border-white/20">
            <MalaysiaScoutEmblem className="w-full h-full" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-900">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <span className="text-[11px] sm:text-xs font-bold tracking-widest text-amber-400 uppercase font-sans mb-1">
          PERSEKUTUAN PENGAKAP MALAYSIA
        </span>
        <h1 className="font-black tracking-tight leading-tight font-sans text-center">
          <span className="block text-2xl sm:text-3xl text-white">
            Portal Kad Digital Pengakap
          </span>
          <span className="block text-2xl sm:text-3xl text-white mt-1">
            Daerah Pendang
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-2.5 font-sans leading-relaxed">
          Masukkan Nombor Kad Pengenalan anda (tanpa tanda tolak -) untuk melihat dan mencetak Kad Digital Pengakap rasmi.
        </p>
      </div>

      {/* ID Input Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl text-left space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>No. Kad Pengenalan (tanpa tanda -) :</span>
              <span className="text-[11px] text-amber-400 font-mono">Contoh: 760529026158</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={idInput}
                onChange={(e) => {
                  setIdInput(e.target.value);
                  if (errorMessage) onClearError();
                }}
                placeholder="Masukkan No. K/P tanpa - (Contoh: 760529026158)"
                className="w-full px-4 py-3 pl-10 bg-slate-950 border border-slate-600 rounded-xl text-white font-mono text-base sm:text-lg tracking-wider placeholder:font-sans placeholder:text-xs sm:placeholder:text-sm placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all uppercase"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              {idInput && (
                <button
                  type="button"
                  onClick={() => setIdInput('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
                >
                  Padam
                </button>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 pt-0.5 leading-normal">
              * Nota: Masukkan nombor tanpa sebarang tanda tolak/dash (-). Anda juga boleh memasukkan No. Ahli seperti <code className="text-amber-300 font-mono font-bold">KD15646</code>.
            </p>
          </div>

          {/* Error Message if not found */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-red-200 text-xs sm:text-sm">Rekod Tidak Ditemui</div>
                <div className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">{errorMessage}</div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !idInput.trim()}
            className="w-full py-3 px-4 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 transition-all shadow-lg shadow-amber-500/25 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Mengesahkan Rekod Ahli...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Papar Kad Keahlian Pengakap</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
