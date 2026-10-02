export interface ScoutMember {
  id: string; // e.g. SCT-2026-0042
  fullName: string;
  icPassport?: string;
  troop: string; // e.g. Daerah Pendang, Kedah
  section: string; // Cub Scout, Junior Scout, Senior Scout, Rover Scout, Scout Leader
  rank: string; // Patrol Leader, First Class Scout, etc.
  dateOfBirth?: string;
  issueDate?: string;
  expiryDate?: string;
  bloodGroup?: string; // A+, O+, etc.
  emergencyContact?: string;
  photoUrl?: string;
  status?: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  notes?: string;
}

export type ThemeColor = 'navy' | 'forest' | 'purple' | 'maroon' | 'gold';

export interface TroopSettings {
  troopName: string;
  associationName: string;
  councilName: string;
  themeColor: ThemeColor;
  motto: string;
  signatoryTitle: string;
  signatoryName: string;
  requireDobVerification?: boolean;
  totalMembersCount?: number;
}
