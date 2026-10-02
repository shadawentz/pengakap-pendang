import React, { useState, useEffect } from 'react';
import { ScoutMember, TroopSettings, ThemeColor } from '../types';
import { 
  parseExcelFile, 
  autoDetectColumns, 
  mapRawRowsToMembers, 
  downloadSampleExcelTemplate, 
  ColumnMapping 
} from '../utils/excelParser';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Check, 
  AlertCircle, 
  Lock, 
  Settings, 
  Users, 
  Trash2, 
  RefreshCw, 
  Palette, 
  ShieldCheck, 
  ChevronRight,
  Sliders,
  Eye,
  KeyRound
} from 'lucide-react';

interface OrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TroopSettings;
  onSettingsUpdated: (newSettings: TroopSettings) => void;
  onRosterUpdated: () => void;
}

export const OrganizerModal: React.FC<OrganizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsUpdated,
  onRosterUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'branding' | 'roster'>('upload');
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Upload state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    id: '',
    fullName: '',
    icPassport: '',
    troop: '',
    section: '',
    rank: '',
    dateOfBirth: '',
    issueDate: '',
    expiryDate: '',
    bloodGroup: '',
    emergencyContact: '',
    photoUrl: '',
    notes: '',
  });
  const [previewMembers, setPreviewMembers] = useState<ScoutMember[]>([]);
  const [uploadMode, setUploadMode] = useState<'merge' | 'replace'>('merge');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);

  // Settings state
  const [brandingForm, setBrandingForm] = useState<TroopSettings>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Roster state
  const [rosterMembers, setRosterMembers] = useState<ScoutMember[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');

  // Check saved session
  useEffect(() => {
    const savedToken = sessionStorage.getItem('scout_organizer_token');
    if (savedToken) {
      setIsAuthenticated(true);
    }
  }, []);

  // Sync settings when passed
  useEffect(() => {
    setBrandingForm(settings);
  }, [settings]);

  // Load roster when on roster tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'roster') {
      fetchRoster();
    }
  }, [isAuthenticated, activeTab]);

  const fetchRoster = async () => {
    try {
      setIsLoadingRoster(true);
      const res = await fetch('/api/organizer/members', {
        headers: {
          Authorization: 'Bearer scout-auth',
          'x-organizer-pin': 'scout2026',
        },
      });
      const data = await res.json();
      if (data.success) {
        setRosterMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setIsLoadingRoster(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setIsVerifyingPin(true);

    try {
      const res = await fetch('/api/organizer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('scout_organizer_token', data.token || 'scout-auth');
      } else {
        setPinError(data.message || 'Incorrect PIN. Default is scout2026');
      }
    } catch (err) {
      setPinError('Connection error. Please try again.');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setExcelFile(file);
      const { headers: detectedHeaders, rawRows: rows } = await parseExcelFile(file);
      setHeaders(detectedHeaders);
      setRawRows(rows);

      // Auto-detect column mapping
      const mapping = autoDetectColumns(detectedHeaders);
      setColumnMapping(mapping);

      // Generate preview members
      const mapped = mapRawRowsToMembers(rows, mapping);
      setPreviewMembers(mapped);
      setUploadResult(null);
    } catch (err) {
      console.error('Failed to parse Excel file:', err);
      alert('Failed to parse file. Please upload a valid .xlsx, .xls, or .csv spreadsheet.');
    }
  };

  const handleMappingChange = (field: keyof ColumnMapping, selectedHeader: string) => {
    const updated = { ...columnMapping, [field]: selectedHeader };
    setColumnMapping(updated);
    const remapped = mapRawRowsToMembers(rawRows, updated);
    setPreviewMembers(remapped);
  };

  const handleCommitUpload = async () => {
    if (previewMembers.length === 0) return;

    try {
      setIsUploading(true);
      setUploadResult(null);

      const res = await fetch('/api/organizer/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer scout-auth',
          'x-organizer-pin': 'scout2026',
        },
        body: JSON.stringify({
          members: previewMembers,
          mode: uploadMode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setUploadResult({
          success: true,
          message: `Successfully uploaded ${data.uploadedCount} scout members! Total records: ${data.totalRecords}`,
        });
        onRosterUpdated();
        // Clear staged file after 3s
        setTimeout(() => {
          setExcelFile(null);
          setPreviewMembers([]);
          setRawRows([]);
        }, 3000);
      } else {
        setUploadResult({
          success: false,
          message: data.message || 'Failed to upload records.',
        });
      }
    } catch (err) {
      setUploadResult({
        success: false,
        message: 'Network error during upload.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      setSettingsSuccess(false);

      const res = await fetch('/api/organizer/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer scout-auth',
          'x-organizer-pin': 'scout2026',
        },
        body: JSON.stringify(brandingForm),
      });

      const data = await res.json();
      if (data.success) {
        onSettingsUpdated(data.settings);
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      alert('Failed to save troop settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm(`Are you sure you want to delete scout ID ${id}?`)) return;

    try {
      const res = await fetch(`/api/organizer/members/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer scout-auth',
          'x-organizer-pin': 'scout2026',
        },
      });
      const data = await res.json();
      if (data.success) {
        setRosterMembers(prev => prev.filter(m => m.id !== id));
        onRosterUpdated();
      }
    } catch (err) {
      alert('Failed to delete member');
    }
  };

  const handleResetSamples = async () => {
    if (!confirm('Reset roster and settings to default sample data? This will restore initial test records.')) return;

    try {
      const res = await fetch('/api/organizer/reset-samples', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer scout-auth',
          'x-organizer-pin': 'scout2026',
        },
      });
      const data = await res.json();
      if (data.success) {
        alert('Reset to sample data successfully!');
        fetchRoster();
        onRosterUpdated();
      }
    } catch (err) {
      alert('Failed to reset samples');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Organizer Portal & Excel Bulk Uploader
              </h2>
              <p className="text-xs text-slate-400">
                Discreet database management, card customization, and bulk scout roster upload
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Barrier if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
              <KeyRound className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Organizer Security Access</h3>
            <p className="text-xs text-slate-400 mb-6">
              To keep member data discreet and private, bulk uploading and database administration require the organizer passcode.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Organizer PIN (Default: scout2026)"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="text-xs text-red-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingPin}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50"
              >
                {isVerifyingPin ? 'Verifying...' : 'Unlock Organizer Console'}
              </button>

              <p className="text-[11px] text-slate-500 pt-2">
                Tip: Default organizer PIN is <code className="text-amber-400 bg-slate-800 px-1 py-0.5 rounded font-mono">scout2026</code>
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-slate-800 bg-slate-950/40 text-xs">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-3 px-3.5 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'upload'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Excel Upload</span>
              </button>

              <button
                onClick={() => setActiveTab('roster')}
                className={`py-3 px-3.5 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'roster'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Current Roster ({rosterMembers.length || settings.totalMembersCount || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('branding')}
                className={`py-3 px-3.5 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'branding'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Card Design & Troop Settings</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: BULK EXCEL UPLOAD */}
              {activeTab === 'upload' && (
                <div className="space-y-6">
                  {/* Step 1: Template download & Drag drop file uploader */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Need a spreadsheet template?</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                          XLSX / CSV Ready
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Download our pre-configured Scout Roster spreadsheet with sample columns and formatting.
                      </p>
                    </div>

                    <button
                      onClick={downloadSampleExcelTemplate}
                      className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-amber-300 border border-amber-400/30 transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Excel Template (.xlsx)</span>
                    </button>
                  </div>

                  {/* Drag & Drop Upload Zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className="border-2 border-dashed border-slate-700 hover:border-amber-400/80 rounded-2xl p-6 sm:p-8 text-center bg-slate-800/30 transition-all group flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => {
                      const input = document.getElementById('excel-file-input');
                      input?.click();
                    }}
                  >
                    <input
                      id="excel-file-input"
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {excelFile ? `Selected: ${excelFile.name}` : 'Click to select or drag & drop Excel / CSV file'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Supports .xlsx, .xls, and .csv files with auto-detection for Scout ID, Name, Troop, Rank, Dates, and Emergency contacts.
                    </p>
                  </div>

                  {/* Step 2: Column Mapping If file loaded */}
                  {rawRows.length > 0 && (
                    <div className="space-y-4 bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-700/80">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Step 2: Verify Column Mapping ({rawRows.length} Rows Detected)</span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Our system auto-matched these headers. Adjust if any column needs remapping.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        {[
                          { key: 'id', label: 'Scout ID / Membership No *', required: true },
                          { key: 'fullName', label: 'Full Name *', required: true },
                          { key: 'troop', label: 'Troop / Unit / Patrol' },
                          { key: 'section', label: 'Section (e.g. Senior Scout)' },
                          { key: 'rank', label: 'Rank / Role' },
                          { key: 'icPassport', label: 'IC / Passport No.' },
                          { key: 'dateOfBirth', label: 'Date of Birth' },
                          { key: 'issueDate', label: 'Date Issued' },
                          { key: 'expiryDate', label: 'Date Expires' },
                          { key: 'bloodGroup', label: 'Blood Group' },
                          { key: 'emergencyContact', label: 'Emergency Contact' },
                          { key: 'photoUrl', label: 'Photo URL / Image' },
                          { key: 'notes', label: 'Achievements / Notes' },
                        ].map(({ key, label, required }) => (
                          <div key={key} className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                              <span>{label}</span>
                              {required && <span className="text-[9px] text-amber-400 font-mono">Required</span>}
                            </label>
                            <select
                              value={columnMapping[key as keyof ColumnMapping] || ''}
                              onChange={(e) => handleMappingChange(key as keyof ColumnMapping, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-hidden"
                            >
                              <option value="">-- Do Not Import / Default --</option>
                              {headers.map((h) => (
                                <option key={h} value={h}>
                                  {h}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>

                      {/* Preview Table */}
                      <div className="mt-4 pt-3 border-t border-slate-700/60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            Data Preview ({previewMembers.length} records parsed)
                          </span>
                          <span className="text-[11px] text-slate-400">First 5 rows shown below</span>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/60 max-h-48 text-[11px]">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-800/80 text-slate-300 font-semibold sticky top-0">
                              <tr>
                                <th className="p-2">ID</th>
                                <th className="p-2">Name</th>
                                <th className="p-2">Troop</th>
                                <th className="p-2">Rank</th>
                                <th className="p-2">Expires</th>
                                <th className="p-2">Blood</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                              {previewMembers.slice(0, 5).map((m, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/40 font-mono">
                                  <td className="p-2 text-amber-300 font-bold">{m.id}</td>
                                  <td className="p-2 font-sans font-semibold text-white">{m.fullName}</td>
                                  <td className="p-2 font-sans">{m.troop}</td>
                                  <td className="p-2 font-sans">{m.rank}</td>
                                  <td className="p-2">{m.expiryDate}</td>
                                  <td className="p-2 text-red-400">{m.bloodGroup}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Step 3: Commit / Save Mode */}
                      <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                              type="radio"
                              name="uploadMode"
                              checked={uploadMode === 'merge'}
                              onChange={() => setUploadMode('merge')}
                              className="accent-amber-500"
                            />
                            <span>Merge & Update Existing Records</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                              type="radio"
                              name="uploadMode"
                              checked={uploadMode === 'replace'}
                              onChange={() => setUploadMode('replace')}
                              className="accent-amber-500"
                            />
                            <span>Replace Entire Roster</span>
                          </label>
                        </div>

                        <button
                          onClick={handleCommitUpload}
                          disabled={isUploading || previewMembers.length === 0}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>{isUploading ? 'Uploading to Server...' : `Import ${previewMembers.length} Members`}</span>
                        </button>
                      </div>

                      {uploadResult && (
                        <div
                          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                            uploadResult.success
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                              : 'bg-red-500/10 border border-red-500/30 text-red-300'
                          }`}
                        >
                          {uploadResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                          <span>{uploadResult.message}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CURRENT ROSTER */}
              {activeTab === 'roster' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search ID, Name, Troop..."
                        value={rosterSearch}
                        onChange={(e) => setRosterSearch(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={fetchRoster}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        title="Refresh Roster"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRoster ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        onClick={handleResetSamples}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        Reset to Sample Scouts
                      </button>
                    </div>
                  </div>

                  {/* Roster Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/80 max-h-[50vh] text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-800/90 text-slate-300 font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="p-3">Scout ID</th>
                          <th className="p-3">Full Name</th>
                          <th className="p-3">Troop / Patrol</th>
                          <th className="p-3">Rank</th>
                          <th className="p-3">Validity</th>
                          <th className="p-3">Blood</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {rosterMembers
                          .filter((m) => {
                            const query = rosterSearch.toLowerCase();
                            return (
                              m.id.toLowerCase().includes(query) ||
                              m.fullName.toLowerCase().includes(query) ||
                              m.troop.toLowerCase().includes(query)
                            );
                          })
                          .map((m) => (
                            <tr key={m.id} className="hover:bg-slate-800/40">
                              <td className="p-3 font-mono font-bold text-amber-300">{m.id}</td>
                              <td className="p-3 font-semibold text-white">{m.fullName}</td>
                              <td className="p-3 text-slate-300">{m.troop}</td>
                              <td className="p-3 text-slate-300">{m.rank}</td>
                              <td className="p-3 font-mono text-slate-400">{m.expiryDate || '2028-12-31'}</td>
                              <td className="p-3 font-mono font-bold text-red-400">{m.bloodGroup || '-'}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteMember(m.id)}
                                  className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        {rosterMembers.length === 0 && !isLoadingRoster && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              No scout members found in database. Upload an Excel file or click "Reset to Sample Scouts".
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: BRANDING & CARD DESIGN */}
              {activeTab === 'branding' && (
                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Troop / Group Name</label>
                      <input
                        type="text"
                        value={brandingForm.troopName}
                        onChange={(e) => setBrandingForm({ ...brandingForm, troopName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-amber-400"
                        placeholder="e.g. Daerah Pendang, Kedah"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Scout Association / Movement</label>
                      <input
                        type="text"
                        value={brandingForm.associationName}
                        onChange={(e) => setBrandingForm({ ...brandingForm, associationName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-amber-400"
                        placeholder="e.g. World Organization of the Scout Movement"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Council / District Name</label>
                      <input
                        type="text"
                        value={brandingForm.councilName}
                        onChange={(e) => setBrandingForm({ ...brandingForm, councilName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-amber-400"
                        placeholder="e.g. National Scout Council"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Scout Motto (Back of Card)</label>
                      <input
                        type="text"
                        value={brandingForm.motto}
                        onChange={(e) => setBrandingForm({ ...brandingForm, motto: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-amber-400"
                        placeholder="e.g. Be Prepared - Sediamengabdi"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Signatory Authorized Name</label>
                      <input
                        type="text"
                        value={brandingForm.signatoryName}
                        onChange={(e) => setBrandingForm({ ...brandingForm, signatoryName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-amber-400"
                        placeholder="e.g. Capt. Arthur H. Vance, Woodbadge"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Signatory Title</label>
                      <input
                        type="text"
                        value={brandingForm.signatoryTitle}
                        onChange={(e) => setBrandingForm({ ...brandingForm, signatoryTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-amber-400"
                        placeholder="e.g. District Scout Commissioner"
                      />
                    </div>
                  </div>

                  {/* Color Theme Selector */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      <span>Card Aesthetic & Theme Color</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { id: 'navy', name: 'Royal Navy & Gold', preview: 'from-blue-900 to-slate-900 border-amber-400' },
                        { id: 'forest', name: 'Forest Pine & Gold', preview: 'from-emerald-900 to-teal-950 border-yellow-400' },
                        { id: 'purple', name: 'World Scout Purple', preview: 'from-purple-900 to-indigo-950 border-white' },
                        { id: 'maroon', name: 'Rover Maroon & Gold', preview: 'from-rose-900 to-slate-900 border-amber-400' },
                        { id: 'gold', name: 'Deluxe Black & Gold', preview: 'from-neutral-900 to-black border-yellow-400' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setBrandingForm({ ...brandingForm, themeColor: t.id as ThemeColor })}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                            brandingForm.themeColor === t.id
                              ? 'border-amber-400 ring-2 ring-amber-400/30 bg-slate-800'
                              : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800'
                          }`}
                        >
                          <div className={`w-full h-4 rounded bg-gradient-to-r ${t.preview} border`} />
                          <span className="text-[11px] font-bold text-white leading-tight mt-1">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Verification Setting */}
                  <div className="p-3 bg-slate-800/40 border border-slate-700 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Require Secondary DOB Verification for Public Lookup</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        When enabled, visitors must enter both their Scout ID and Date of Birth to see their membership card.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brandingForm.requireDobVerification || false}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, requireDobVerification: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    {settingsSuccess && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Settings saved successfully!
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50"
                    >
                      {isSavingSettings ? 'Saving...' : 'Save Branding & Preferences'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
