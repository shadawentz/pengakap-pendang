import * as XLSX from 'xlsx';
import { ScoutMember } from '../types';

export interface ColumnMapping {
  id: string;
  fullName: string;
  icPassport: string;
  troop: string;
  section: string;
  rank: string;
  dateOfBirth: string;
  issueDate: string;
  expiryDate: string;
  bloodGroup: string;
  emergencyContact: string;
  photoUrl: string;
  notes: string;
}

export function autoDetectColumns(headers: string[]): ColumnMapping {
  const findMatch = (candidates: string[]): string => {
    for (const cand of candidates) {
      const found = headers.find(h => {
        const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
        return clean.includes(target) || target.includes(clean);
      });
      if (found) return found;
    }
    return '';
  };

  return {
    id: findMatch(['scoutid', 'membershipno', 'memberid', 'idnumber', 'id', 'noahli', 'matric', 'cardno']),
    fullName: findMatch(['fullname', 'name', 'namapenuh', 'nama', 'scoutname', 'membername']),
    icPassport: findMatch(['ic', 'passport', 'nric', 'mykad', 'nationalid', 'noic', 'nokp']),
    troop: findMatch(['troop', 'patrol', 'unit', 'kumpulan', 'group', 'district', 'daerah']),
    section: findMatch(['section', 'kategori', 'category', 'scoutsection', 'cubs', 'rovers']),
    rank: findMatch(['rank', 'pangkat', 'role', 'position', 'jawatan', 'level']),
    dateOfBirth: findMatch(['dateofbirth', 'dob', 'tarikhlahir', 'birthdate', 'birth']),
    issueDate: findMatch(['issuedate', 'issued', 'tarikhdaftar', 'dateissued', 'registered']),
    expiryDate: findMatch(['expirydate', 'expiry', 'validthru', 'tarikhtamat', 'validuntil']),
    bloodGroup: findMatch(['bloodgroup', 'blood', 'bloodtype', 'darah', 'kumpulandarah']),
    emergencyContact: findMatch(['emergencycontact', 'emergency', 'phone', 'contact', 'notelefon', 'guardian']),
    photoUrl: findMatch(['photourl', 'photo', 'picture', 'image', 'gambar', 'avatar']),
    notes: findMatch(['notes', 'badge', 'awards', 'catatan', 'remark', 'achievement'])
  };
}

export async function parseExcelFile(file: File): Promise<{
  headers: string[];
  rawRows: any[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Take the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Get rows as array of objects
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
        
        if (rawRows.length === 0) {
          resolve({ headers: [], rawRows: [] });
          return;
        }

        const headers = Object.keys(rawRows[0]);
        resolve({ headers, rawRows });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function mapRawRowsToMembers(rawRows: any[], mapping: ColumnMapping): ScoutMember[] {
  return rawRows
    .map((row, index) => {
      const getVal = (colKey: string): string => {
        if (!colKey || !row[colKey]) return '';
        const val = row[colKey];
        if (val instanceof Date) {
          return val.toISOString().split('T')[0];
        }
        return String(val).trim();
      };

      const id = getVal(mapping.id) || `SCT-${String(index + 1).padStart(4, '0')}`;
      const fullName = getVal(mapping.fullName) || 'SCOUT MEMBER';
      
      return {
        id,
        fullName: fullName.toUpperCase(),
        icPassport: getVal(mapping.icPassport),
        troop: getVal(mapping.troop) || 'Daerah Pendang, Kedah',
        section: getVal(mapping.section) || 'Senior Scout',
        rank: getVal(mapping.rank) || 'Scout Member',
        dateOfBirth: getVal(mapping.dateOfBirth),
        issueDate: getVal(mapping.issueDate) || new Date().toISOString().split('T')[0],
        expiryDate: getVal(mapping.expiryDate) || '2028-12-31',
        bloodGroup: getVal(mapping.bloodGroup) || 'O+',
        emergencyContact: getVal(mapping.emergencyContact),
        photoUrl: getVal(mapping.photoUrl),
        status: 'ACTIVE' as const,
        notes: getVal(mapping.notes)
      };
    })
    .filter(m => m.id && m.fullName);
}

export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      "Scout ID": "SCT-2026-0101",
      "Full Name": "MUHAMMAD HARITH DANIAL",
      "IC / Passport": "090412-14-5501",
      "Troop / Patrol": "Daerah Pendang (Cobra Patrol)",
      "Section": "Senior Scout",
      "Rank / Role": "Patrol Leader",
      "Date of Birth": "2009-04-12",
      "Issue Date": "2026-01-01",
      "Expiry Date": "2028-12-31",
      "Blood Group": "O+",
      "Emergency Contact": "+60 12-345 6789 (Father)",
      "Photo URL": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
      "Achievements / Notes": "First Class Scout, Camporee Gold Medal"
    },
    {
      "Scout ID": "SCT-2026-0102",
      "Full Name": "CHLOE TAN XIN ROU",
      "IC / Passport": "100823-10-6214",
      "Troop / Patrol": "Daerah Pendang (Eagle Patrol)",
      "Section": "Senior Scout",
      "Rank / Role": "Assistant Patrol Leader",
      "Date of Birth": "2010-08-23",
      "Issue Date": "2026-01-01",
      "Expiry Date": "2028-12-31",
      "Blood Group": "A+",
      "Emergency Contact": "+60 19-876 5432 (Mother)",
      "Photo URL": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
      "Achievements / Notes": "Pioneering & Wilderness Survival Badge"
    },
    {
      "Scout ID": "SCT-2026-0103",
      "Full Name": "DIVESH KUMAR A/L RAMESH",
      "IC / Passport": "080215-08-4493",
      "Troop / Patrol": "Daerah Pendang (Falcon Patrol)",
      "Section": "Senior Scout",
      "Rank / Role": "Quartermaster",
      "Date of Birth": "2008-02-15",
      "Issue Date": "2025-06-15",
      "Expiry Date": "2027-12-31",
      "Blood Group": "B+",
      "Emergency Contact": "+60 13-445 9901 (Guardian)",
      "Photo URL": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      "Achievements / Notes": "Bushcraft Master, Lifesaving Class I"
    },
    {
      "Scout ID": "SCT-2026-0104",
      "Full Name": "AINUL MARDIYAH BINTI AZMAN",
      "IC / Passport": "120610-10-7788",
      "Troop / Patrol": "Daerah Pendang (Otter Patrol)",
      "Section": "Junior Scout",
      "Rank / Role": "Second Class Scout",
      "Date of Birth": "2012-06-10",
      "Issue Date": "2026-02-01",
      "Expiry Date": "2028-12-31",
      "Blood Group": "AB+",
      "Emergency Contact": "+60 17-332 1198 (Mother)",
      "Photo URL": "",
      "Achievements / Notes": "Camp Craft, Knots & Lashings Badge"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths nicely
  worksheet['!cols'] = [
    { wch: 16 }, // ID
    { wch: 28 }, // Name
    { wch: 18 }, // IC
    { wch: 35 }, // Troop
    { wch: 16 }, // Section
    { wch: 22 }, // Rank
    { wch: 14 }, // DOB
    { wch: 14 }, // Issue
    { wch: 14 }, // Expiry
    { wch: 12 }, // Blood
    { wch: 25 }, // Emergency
    { wch: 45 }, // Photo
    { wch: 35 }  // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Scout_Roster_Template');

  XLSX.writeFile(workbook, 'Scout_Membership_Roster_Template.xlsx');
}
