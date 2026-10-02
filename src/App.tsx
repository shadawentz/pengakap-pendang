import React, { useState, useEffect } from 'react';
import { ScoutMember, TroopSettings } from './types';
import { CardViewer } from './components/CardViewer';
import { DiscreetLookupHero } from './components/DiscreetLookupHero';
import { OrganizerModal } from './components/OrganizerModal';
import { PrintArea } from './components/PrintArea';
import { MalaysiaScoutEmblem } from './components/MalaysiaScoutEmblem';
import { BG_APP_URL } from './components/cardAssets';
import { Compass } from 'lucide-react';

const defaultSettings: TroopSettings = {
  troopName: "Daerah Pendang, Kedah",
  associationName: "PERSEKUTUAN PENGAKAP MALAYSIA",
  councilName: "THE SCOUTS ASSOCIATION OF MALAYSIA",
  themeColor: "navy",
  motto: "BE PREPARED - SEDIAMENGABDI",
  signatoryTitle: "Pesuruhjaya Pengakap Daerah",
  signatoryName: "Ketua Pesuruhjaya Pengakap",
  requireDobVerification: false,
  totalMembersCount: 965,
};

export default function App() {
  const [settings, setSettings] = useState<TroopSettings>(defaultSettings);
  const [currentMember, setCurrentMember] = useState<ScoutMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
    checkUrlParams();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  // Check if ?id= parameter is present in URL (e.g. scanned from QR code)
  const checkUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) {
      handleVerifyId(idParam);
    }
  };

  // Discreet Verification Query
  const handleVerifyId = async (id: string, dob?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const url = new URL(`/api/members/verify/${encodeURIComponent(id.trim())}`, window.location.origin);
      if (dob) {
        url.searchParams.set('dob', dob.trim());
      }

      const res = await fetch(url.toString());
      const data = await res.json();

      if (res.ok && data.success && data.member) {
        setCurrentMember(data.member);
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
        // Update URL query without full reload
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('id', data.member.id);
        window.history.pushState({}, '', newUrl.toString());
        return true;
      } else {
        setErrorMessage(
          data.message || 'No scout membership record found matching this ID. Please double-check your membership number.'
        );
        setCurrentMember(null);
        return false;
      }
    } catch (err) {
      setErrorMessage('Could not connect to the Scout membership verification server. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMember = () => {
    setCurrentMember(null);
    setErrorMessage(null);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('id');
    window.history.pushState({}, '', newUrl.toString());
  };

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col font-['Inter'] antialiased relative selection:bg-amber-400 selection:text-slate-950"
      style={{
        backgroundImage: `url(${BG_APP_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Semi-transparent dark overlay for high contrast and readability */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] pointer-events-none -z-0 print:hidden" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Header */}
        <header className="border-b border-slate-700/60 bg-slate-950/85 backdrop-blur-md sticky top-0 z-30 shadow-md print:hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo & Portal Branding */}
            <div
              onClick={handleClearMember}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-full bg-[#151272] border border-white/20 p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <MalaysiaScoutEmblem className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white font-sans uppercase">
                  Portal Kad Digital Pengakap
                </span>
                <span className="text-[11px] sm:text-xs text-amber-400 font-bold pl-2 sm:pl-2.5 tracking-wide">
                  Daerah Pendang
                </span>
              </div>
            </div>
          </div>
        </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center print:hidden">
        {currentMember ? (
          <CardViewer
            member={currentMember}
            settings={settings}
            onSearchAnother={handleClearMember}
          />
        ) : (
          <DiscreetLookupHero
            settings={settings}
            onVerify={handleVerifyId}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        )}
      </main>

      {/* Dedicated Print Area (rendered only during browser print) */}
      <PrintArea member={currentMember} settings={settings} />

      {/* Organizer Console Modal */}
      <OrganizerModal
        isOpen={isOrganizerModalOpen}
        onClose={() => setIsOrganizerModalOpen(false)}
        settings={settings}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
        onRosterUpdated={() => {
          fetchSettings();
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 py-5 text-center text-xs text-slate-300 print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-100 font-sans tracking-wide text-xs sm:text-sm">
              Persekutuan Pengakap Malaysia Daerah Pendang
            </span>
          </div>

          <div className="text-[11px] sm:text-xs text-amber-300 font-semibold tracking-wide">
            Developed by Miss Shada 2026
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
