export enum UnitType {
  PENTADBIRAN = 'Pentadbiran',
  KURIKULUM = 'Kurikulum',
  KOKURIKULUM = 'Kokurikulum',
  HEM = 'Hal Ehwal Murid',
  PIBG = 'PIBG'
}

export interface OPRData {
  id: string;
  unit: UnitType | '';
  tajukProgram: string;
  tarikh: string;
  hari: string;
  masa: string;
  objektif: string; // Bullet points or paragraph
  aktiviti: string; // Summary
  kekuatan: string;
  kelemahan: string;
  penambahbaikan: string; // AI Generated
  refleksi: string; // AI Generated
  disediakanOleh: string;
  jawatan: string;
  gambar: string[]; // Base64 strings or Object URLs
  status: 'Draft' | 'Submitted';
  createdAt: number;
}

export interface DashboardStats {
  totalReports: number;
  byUnit: Record<UnitType, number>;
  recentReports: OPRData[];
}

export interface GenerateAIResponse {
  penambahbaikan: string;
  refleksi: string;
}
