import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Function to append or write members
export function saveMembers(members) {
  let existing = [];
  if (fs.existsSync(MEMBERS_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
    } catch (e) {
      existing = [];
    }
  }
  const map = new Map();
  existing.forEach(m => map.set(m.id, m));
  members.forEach(m => map.set(m.id, m));
  const merged = Array.from(map.values());
  fs.writeFileSync(MEMBERS_FILE, JSON.stringify(merged, null, 2));
  console.log(`Saved ${merged.length} total members to ${MEMBERS_FILE}`);
}
