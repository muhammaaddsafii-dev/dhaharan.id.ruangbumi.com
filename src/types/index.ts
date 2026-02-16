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
  photos?: FotoKegiatan[]; // Add array of full photo objects including IDs
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
  date: string;
  createdAt: string;
}

// Types untuk Transaksi API
export interface TipeTransaksi {
  id: number;
  nama: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransaksiAPI {
  id?: number;
  nama: string;
  tipe_transaksi: number;
  tipe_transaksi_detail?: TipeTransaksi;
  deskripsi: string;
  jumlah: number;
  tanggal: string;
  created_at?: string;
  updated_at?: string;
}

// Types untuk Volunteer
export interface VolunteerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  motivation: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface VolunteerAPI {
  id?: number;
  nama: string;
  email: string;
  phone: string;
  skill: string;
  motivasi: string;
  kegiatan: number;
  kegiatan_detail?: {
    id: number;
    nama: string;
    tanggal: string;
  };
  is_approved: boolean;
  created_at?: string;
  updated_at?: string;
}

// Types untuk Resep
export interface BahanResep {
  id?: number;
  resep?: number;
  nama: string;
  takaran: string;
}

export interface StepsResep {
  id?: number;
  urutan: number;
  resep?: number;
  nama: string;
}

export interface TipsResep {
  id?: number;
  urutan: number;
  resep?: number;
  nama: string;
}

export interface NutrisiResep {
  id?: number;
  label: string;
  nilai: string;
  resep?: number;
}

export interface FotoResep {
  id?: number;
  resep?: number;
  file_path: string;
  file_name: string;
}

export interface ResepAPI {
  id?: number;
  judul: string;
  deskripsi: string;
  kategori: string;
  tingkat_kesulitan: string;
  waktu_memasak: number;
  waktu_persiapan: number;
  porsi: number;
  kalori: number;
  bahan?: BahanResep[];
  steps?: StepsResep[];
  tips?: TipsResep[];
  nutrisi?: NutrisiResep[];
  foto?: FotoResep[];
  created_at?: string;
  updated_at?: string;
}

// Types for Pengurus
export interface Pengurus {
  id?: number;
  nama: string;
  jabatan: string;
  photo?: string;
  created_at?: string;
  updated_at?: string;
}

// Modal Mode
export type ModalMode = "create" | "edit" | "view";
