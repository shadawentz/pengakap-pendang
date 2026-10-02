import React, { useState, useRef } from 'react';
import { ScoutMember, TroopSettings } from '../types';
import { MalaysiaScoutCard } from './MalaysiaScoutCard';
import { MalaysiaScoutCardBack } from './MalaysiaScoutCardBack';
import { ScoutCardFront } from './ScoutCardFront';
import { ScoutCardBack } from './ScoutCardBack';
import { downloadCardPdf, downloadCardImagePng, triggerDirectPrint, CR80_WIDTH_MM, CR80_HEIGHT_MM } from '../utils/cardPdfGenerator';
import { 
  Printer, 
  Download, 
  RotateCw, 
  FileText, 
  ShieldCheck, 
  Phone, 
  Heart, 
  CheckCircle, 
  Copy, 
  Sparkles,
  Info,
  Calendar,
  Layers,
  MapPin,
  Award,
  Camera
} from 'lucide-react';

interface CardViewerProps {
  member: ScoutMember;
  settings: TroopSettings;
  onSearchAnother?: () => void;
}

export const CardViewer: React.FC<CardViewerProps> = ({ member, settings, onSearchAnother }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardDesign, setCardDesign] = useState<'official-ppm' | 'deluxe'>('official-ppm');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const handleCopyId = () => {
    navigator.clipboard.writeText(member.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadPng = async () => {
    let frontEl = document.getElementById('interactive-card-front');
    if (!frontEl) {
      frontEl = document.getElementById('preview-card-front') || (document.querySelector('[id*="card-front"]') as HTMLElement);
    }

    if (!frontEl) {
      setPdfSuccessMessage('Sistem sedang memuatkan kad. Sila cuba sekali lagi.');
      return;
    }

    try {
      setIsGeneratingPng(true);
      setPdfSuccessMessage(null);
      await downloadCardImagePng(frontEl, member, 3.0);
      setPdfSuccessMessage('Gambar bahagian depan kad ("Save Photo") berjaya dimuat turun sebagai PNG!');
      setTimeout(() => setPdfSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to download PNG photo:', err);
      setPdfSuccessMessage('Muat turun gambar PNG menghadapi masalah. Sila cuba lagi.');
      setTimeout(() => setPdfSuccessMessage(null), 5000);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  const handleDownloadPdf = async (mode: 'exact-cr80' | 'a4-sheet-foldable') => {
    let frontEl = document.getElementById('interactive-card-front');
    let backEl = document.getElementById('interactive-card-back');

    if (!frontEl || !backEl) {
      frontEl = document.getElementById('preview-card-front') || document.querySelector('[id*="card-front"]') as HTMLElement;
      backEl = document.getElementById('preview-card-back') || document.querySelector('[id*="card-back"]') as HTMLElement;
    }

    if (!frontEl || !backEl) {
      setPdfSuccessMessage('Sistem sedang memuatkan kad. Sila cuba sekali lagi.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setPdfSuccessMessage(null);
      await downloadCardPdf(frontEl, backEl, member, { mode, qualityScale: 2.5 });
      setPdfSuccessMessage(
        mode === 'exact-cr80'
          ? 'Fail PDF ("Save as PDF") Berjaya Dimuat Turun!'
          : 'Fail PDF ("Print Kad Keahlian") Berjaya Dimuat Turun!'
      );
      setTimeout(() => setPdfSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setPdfSuccessMessage('Muat turun PDF menghadapi masalah. Sila gunakan butang Print Kad Keahlian atau benarkan muat turun fail.');
      setTimeout(() => setPdfSuccessMessage(null), 6000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintClick = () => {
    setPdfSuccessMessage('Membuka dialog "Print Kad Keahlian"... Sila pastikan pilihan Skala 100% (Actual Size) dipilih.');
    setTimeout(() => setPdfSuccessMessage(null), 4000);
    triggerDirectPrint();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner: Verification badge & Actions */}
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#261c52] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Kad Keahlian Pengakap Malaysia
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {member.status || 'AKTIF'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              {member.fullName}
            </h2>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>No Ahli: <strong className="font-mono text-slate-200">{member.id}</strong></span>
              {member.icPassport && (
                <span>K/P: <strong className="font-mono text-slate-300">{member.icPassport}</strong></span>
              )}
              <button
                onClick={handleCopyId}
                className="hover:text-white transition-colors flex items-center gap-1 text-[10px] text-slate-400 ml-1 cursor-pointer"
                title="Salin No Ahli"
              >
                {copiedId ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId ? 'Disalin' : 'Salin'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {onSearchAnother && (
            <button
              onClick={onSearchAnother}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all shadow-sm cursor-pointer"
            >
              Cari No Lain
            </button>
          )}

          {/* 1. Save Photo as PNG (Front Card Only) */}
          <button
            onClick={handleDownloadPng}
            disabled={isGeneratingPng}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            title="Muat turun bahagian depan kad sahaja sebagai gambar PNG terus ke peranti"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isGeneratingPng ? 'Menjana PNG...' : 'Save Photo'}</span>
          </button>

          {/* 2. Save as PDF */}
          <button
            onClick={() => handleDownloadPdf('exact-cr80')}
            disabled={isGeneratingPdf}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Menjana PDF...' : 'Save as PDF'}</span>
          </button>

          {/* 3. Print Kad Keahlian */}
          <button
            onClick={handlePrintClick}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Kad Keahlian</span>
          </button>
        </div>
      </div>

      {pdfSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-200 flex items-center gap-2.5 shadow-md">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{pdfSuccessMessage}</span>
        </div>
      )}

      {/* Main Interactive Card Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: The 3D Digital Card with Flip action */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Format Rasmi Kad Pengakap ({CR80_WIDTH_MM} × {CR80_HEIGHT_MM} mm)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-3.5 py-1.5 rounded-lg border border-amber-400/20 transition-all cursor-pointer"
              >
                <RotateCw className={`w-4 h-4 transition-transform ${isFlipped ? 'rotate-180' : ''}`} />
                <span>{isFlipped ? 'Lihat Depan' : 'Pusing Belakang'}</span>
              </button>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            className="w-full max-w-[460px] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
            title="Klik untuk pusing kad"
          >
            <div className="relative">
              <div className="transition-all duration-500 transform">
                {!isFlipped ? (
                  cardDesign === 'official-ppm' ? (
                    <MalaysiaScoutCard
                      member={member}
                      elementId="preview-card-front"
                    />
                  ) : (
                    <ScoutCardFront
                      member={member}
                      settings={settings}
                      elementId="preview-card-front"
                    />
                  )
                ) : (
                  cardDesign === 'official-ppm' ? (
                    <MalaysiaScoutCardBack
                      member={member}
                      elementId="preview-card-back"
                    />
                  ) : (
                    <ScoutCardBack
                      member={member}
                      settings={settings}
                      elementId="preview-card-back"
                    />
                  )
                )}
              </div>

              {/* Shimmer Hint Tag */}
              <div className="mt-3 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/60">
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tekan kad bila-bila masa untuk pusing ke bahagian depan atau belakang</span>
                </span>
              </div>
            </div>
          </div>

          {/* Dedicated high-res off-screen container for crisp PDF capture */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: '0',
              left: '-9999px',
              width: '460px',
              visibility: 'visible',
              pointerEvents: 'none',
              zIndex: -9999,
            }}
          >
            <div style={{ width: '460px', marginBottom: '20px' }}>
              <MalaysiaScoutCard
                member={member}
                elementId="interactive-card-front"
              />
            </div>
            <div style={{ width: '460px' }}>
              <MalaysiaScoutCardBack
                member={member}
                elementId="interactive-card-back"
              />
            </div>
          </div>

          {/* PDF & Photo Format Options Bar */}
          <div className="w-full max-w-[460px] mt-4 p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-400" />
              Pilihan Cetakan & Simpanan Kad
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Save Photo (PNG) */}
              <button
                onClick={handleDownloadPng}
                disabled={isGeneratingPng}
                className="text-left p-2.5 sm:p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-blue-500/30 hover:border-blue-400 text-white transition-all group cursor-pointer"
              >
                <div className="font-bold text-blue-300 flex items-center justify-between text-xs sm:text-sm">
                  <span>Save Photo</span>
                  <Camera className="w-3.5 h-3.5 text-blue-400 opacity-80 group-hover:opacity-100" />
                </div>
                <div className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Muat turun gambar bahagian depan sahaja (format PNG) terus ke galeri peranti.
                </div>
              </button>

              {/* Option 2: Save as PDF */}
              <button
                onClick={() => handleDownloadPdf('exact-cr80')}
                disabled={isGeneratingPdf}
                className="text-left p-2.5 sm:p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-amber-500/30 hover:border-amber-400 text-white transition-all group cursor-pointer"
              >
                <div className="font-bold text-amber-300 flex items-center justify-between text-xs sm:text-sm">
                  <span>Save as PDF</span>
                  <FileText className="w-3.5 h-3.5 text-amber-400 opacity-80 group-hover:opacity-100" />
                </div>
                <div className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Muat turun fail PDF kad (Depan & Belakang saiz standard). Sesuai untuk simpanan digital.
                </div>
              </button>

              {/* Option 3: Print Kad Keahlian */}
              <button
                onClick={handlePrintClick}
                className="text-left p-2.5 sm:p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-emerald-500/30 hover:border-emerald-400 text-white transition-all group cursor-pointer"
              >
                <div className="font-bold text-emerald-300 flex items-center justify-between text-xs sm:text-sm">
                  <span>Print Kad Keahlian</span>
                  <Printer className="w-3.5 h-3.5 text-emerald-400 opacity-80 group-hover:opacity-100" />
                </div>
                <div className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Cetak kad keahlian saiz tepat secara terus (Depan & Belakang) pada kertas keras atau laminasi.
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Scout Member Details & Verification Metadata */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-700 pb-2">
              <Info className="w-4 h-4" />
              <span>Maklumat Terperinci Ahli</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Nama Penuh:</span>
                <span className="font-extrabold text-white text-right max-w-[65%]">{member.fullName}</span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Nombor Ahli:</span>
                <span className="font-mono font-bold text-amber-300 text-right">{member.id}</span>
              </div>

              {member.icPassport && (
                <div className="flex items-start justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">No. Kad Pengenalan:</span>
                  <span className="font-mono font-bold text-slate-200 text-right">{member.icPassport}</span>
                </div>
              )}

              <div className="flex items-start justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Jawatan:
                </span>
                <span className="font-bold text-emerald-400 text-right">{member.rank || 'AHLI'}</span>
              </div>

              {member.troop && (
                <div className="flex items-start justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    Sekolah / Alamat:
                  </span>
                  <span className="font-semibold text-slate-200 text-right max-w-[65%]">{member.troop}</span>
                </div>
              )}

              <div className="flex items-start justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Sah Sehingga:
                </span>
                <span className="font-mono font-bold text-amber-400 text-right">
                  31.12.2026
                </span>
              </div>
            </div>

            {/* Exact Print Guidance */}
            <div className="bg-slate-900/80 rounded-xl p-3 border border-amber-500/20 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Panduan Cetakan Tepat 85.6mm × 54mm</span>
              </div>
              <p className="text-slate-400 leading-normal">
                Apabila mencetak terus dari pelayar web atau PDF, pastikan pilihan <strong>Skala (Scale)</strong> ditetapkan kepada <strong>100% (Actual Size)</strong> dan aktifkan <strong>"Background graphics"</strong> untuk hasil cetakan saiz fizikal kad sebenar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

