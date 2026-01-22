// Types untuk Activity
export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  participants: number;
  status: "upcoming" | "ongoing" | "completed";
  image?: string;
  images?: string[]; // Add array of all images
  createdAt: string;
  coordinates?: [number, number]; // [lat, lng] for map display
  status_kegiatan?: number; // Add ID from database
  jenis_kegiatan?: number; // Add ID from database
  status_kegiatan_detail?: StatusKegiatan; // Add detail from database
  jenis_kegiatan_detail?: JenisKegiatan; // Add detail from database
}

// Types untuk API Backend
export interface JenisKegiatan {
  id: number;
  nama: string;
  deskripsi?: string;
}

export interface StatusKegiatan {
  id: number;
  nama: string;
  deskripsi?: string;
}

export interface FotoKegiatan {
  id?: number;
  kegiatan?: number;
  file_path: string;
  file_name: string;
}

export interface KegiatanAPI {
  id?: number;
  nama: string;
  deskripsi: string;
  tanggal: string;
  jumlah_peserta: number;
  lokasi: {
    type: string;
    coordinates: [number, number];
  };
  jenis_kegiatan: number;
  status_kegiatan: number;
  foto?: FotoKegiatan[];
  jenis_kegiatan_detail?: JenisKegiatan;
  status_kegiatan_detail?: StatusKegiatan;
  created_at?: string;
  updated_at?: string;
}

// Types untuk Cashflow
export interface CashflowItem {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  createdAt: string;
}

// Modal Mode
export type ModalMode = "create" | "edit" | "view";
