import axios from 'axios';
import { KegiatanAPI, FotoKegiatan, JenisKegiatan, StatusKegiatan } from '@/types';

// Base URL untuk API - sesuaikan dengan backend Anda
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper untuk upload ke S3
export const uploadToS3 = async (file: File, folder: string = 'kegiatan'): Promise<string> => {
  try {
    // Upload via backend endpoint
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const { data } = await api.post('/upload/s3/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data.url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image to S3');
  }
};

// Kegiatan API
export const kegiatanAPI = {
  // Get all kegiatan
  getAll: async (): Promise<KegiatanAPI[]> => {
    try {
      const { data } = await api.get('/kegiatan/');

      console.log('Raw API response:', data);

      if (data && typeof data === 'object') {
        // Check if it's paginated response (has 'results' field)
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }

        // Check if it's direct array
        if (Array.isArray(data)) {
          return data;
        }
      }

      console.warn('Unexpected API response format:', data);
      return [];
    } catch (error: any) {
      console.error('Error in kegiatanAPI.getAll:', error);
      throw error;
    }
  },

  // Get single kegiatan by ID
  getById: async (id: number): Promise<KegiatanAPI> => {
    const { data } = await api.get(`/kegiatan/${id}/`);
    console.log('Raw API response for getById:', data);
    return data;
  },

  // Create new kegiatan
  create: async (kegiatan: Omit<KegiatanAPI, 'id'>): Promise<KegiatanAPI> => {
    const { data } = await api.post('/kegiatan/', kegiatan);
    return data;
  },

  // Update kegiatan
  update: async (id: number, kegiatan: Partial<KegiatanAPI>): Promise<KegiatanAPI> => {
    const { data } = await api.patch(`/kegiatan/${id}/`, kegiatan);
    return data;
  },

  // Delete kegiatan
  delete: async (id: number): Promise<void> => {
    await api.delete(`/kegiatan/${id}/`);
  },

  // Replace all photos (delete all existing photos)
  replaceAllPhotos: async (id: number): Promise<{ deleted_count: number; message: string }> => {
    const { data } = await api.post(`/kegiatan/${id}/replace_all_photos/`, {});
    return data;
  },
};

// Foto Kegiatan API
export const fotoKegiatanAPI = {
  // Get all foto for a kegiatan
  getByKegiatan: async (kegiatanId: number): Promise<FotoKegiatan[]> => {
    const { data } = await api.get(`/foto-kegiatan/?kegiatan=${kegiatanId}`);
    return data;
  },

  // Create new foto kegiatan
  create: async (fotoData: FormData | Omit<FotoKegiatan, 'id'>): Promise<FotoKegiatan> => {
    const config = fotoData instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};

    const { data } = await api.post('/foto-kegiatan/', fotoData, config);
    return data;
  },

  // Delete foto kegiatan
  delete: async (id: number): Promise<void> => {
    await api.delete(`/foto-kegiatan/${id}/`);
  },
};

// Jenis Kegiatan API
export const jenisKegiatanAPI = {
  getAll: async (): Promise<JenisKegiatan[]> => {
    try {
      const { data } = await api.get('/jenis-kegiatan/');

      console.log('Raw API response for jenisKegiatanAPI.getAll:', data);

      if (data && typeof data === 'object') {
        // Check if it's paginated response (has 'results' field)
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }

        // Check if it's direct array
        if (Array.isArray(data)) {
          return data;
        }
      }

      console.warn('Unexpected jenisKegiatan API response format:', data);
      return [];
    } catch (error: any) {
      console.error('Error in jenisKegiatanAPI.getAll:', error);
      return []; // Return empty array instead of throwing
    }
  },
};

// Status Kegiatan API
export const statusKegiatanAPI = {
  getAll: async (): Promise<StatusKegiatan[]> => {
    try {
      const { data } = await api.get('/status-kegiatan/');

      console.log('Raw API response for statusKegiatanAPI.getAll:', data);

      if (data && typeof data === 'object') {
        // Check if it's paginated response (has 'results' field)
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }

        // Check if it's direct array
        if (Array.isArray(data)) {
          return data;
        }
      }

      console.warn('Unexpected statusKegiatan API response format:', data);
      return [];
    } catch (error: any) {
      console.error('Error in statusKegiatanAPI.getAll:', error);
      return []; // Return empty array instead of throwing
    }
  },
};

// Tipe Transaksi API
export const tipeTransaksiAPI = {
  getAll: async () => {
    try {
      const { data } = await api.get('/tipe-transaksi/');

      if (data && typeof data === 'object') {
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }
        if (Array.isArray(data)) {
          return data;
        }
      }

      return [];
    } catch (error: any) {
      console.error('Error in tipeTransaksiAPI.getAll:', error);
      return [];
    }
  },
};

// Transaksi API
export const transaksiAPI = {
  // Get all transaksi
  getAll: async () => {
    try {
      const { data } = await api.get('/transaksi/');

      if (data && typeof data === 'object') {
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }
        if (Array.isArray(data)) {
          return data;
        }
      }

      return [];
    } catch (error: any) {
      console.error('Error in transaksiAPI.getAll:', error);
      throw error;
    }
  },

  // Get single transaksi by ID
  getById: async (id: number) => {
    const { data } = await api.get(`/transaksi/${id}/`);
    return data;
  },

  // Create new transaksi
  create: async (transaksi: any) => {
    const { data } = await api.post('/transaksi/', transaksi);
    return data;
  },

  // Update transaksi
  update: async (id: number, transaksi: any) => {
    const { data } = await api.patch(`/transaksi/${id}/`, transaksi);
    return data;
  },

  // Delete transaksi
  delete: async (id: number) => {
    await api.delete(`/transaksi/${id}/`);
  },

  // Get summary
  getSummary: async () => {
    try {
      const { data } = await api.get('/transaksi/summary/');
      return data;
    } catch (error: any) {
      console.error('Error in transaksiAPI.getSummary:', error);
      return {
        total_pemasukan: 0,
        total_pengeluaran: 0,
        saldo: 0
      };
    }
  },
};

// Volunteer API
export const volunteerAPI = {
  // Get all volunteers
  getAll: async () => {
    try {
      const { data } = await api.get('/volunteer/');

      if (data && typeof data === 'object') {
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }
        if (Array.isArray(data)) {
          return data;
        }
      }

      return [];
    } catch (error: any) {
      console.error('Error in volunteerAPI.getAll:', error);
      throw error;
    }
  },

  // Get pending volunteers
  getPending: async () => {
    try {
      const { data } = await api.get('/volunteer/pending/');

      if (data && typeof data === 'object') {
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }
        if (Array.isArray(data)) {
          return data;
        }
      }

      return [];
    } catch (error: any) {
      console.error('Error in volunteerAPI.getPending:', error);
      return [];
    }
  },

  // Create new volunteer
  create: async (volunteer: any) => {
    const { data } = await api.post('/volunteer/', volunteer);
    return data;
  },

  // Update volunteer
  update: async (id: number, volunteer: any) => {
    const { data } = await api.patch(`/volunteer/${id}/`, volunteer);
    return data;
  },

  // Approve volunteer
  approve: async (id: number) => {
    const { data } = await api.post(`/volunteer/${id}/approve/`);
    return data;
  },

  // Delete volunteer (reject)
  delete: async (id: number) => {
    await api.delete(`/volunteer/${id}/`);
  },
};

// Resep API
export const resepAPI = {
  // Get all resep
  getAll: async () => {
    try {
      const { data } = await api.get('/resep/');

      if (data && typeof data === 'object') {
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }
        if (Array.isArray(data)) {
          return data;
        }
      }

      return [];
    } catch (error: any) {
      console.error('Error in resepAPI.getAll:', error);
      throw error;
    }
  },

  // Get single resep by ID
  getById: async (id: number) => {
    const { data } = await api.get(`/resep/${id}/`);
    return data;
  },

  // Filter by category
  getByKategori: async (kategori: string) => {
    try {
      const { data } = await api.get(`/resep/by_kategori/?kategori=${kategori}`);

      if (data && typeof data === 'object') {
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }
        if (Array.isArray(data)) {
          return data;
        }
      }

      return [];
    } catch (error: any) {
      console.error('Error in resepAPI.getByKategori:', error);
      return [];
    }
  },
};

// Pengurus API
export const pengurusAPI = {
  // Get all pengurus
  getAll: async () => {
    try {
      const { data } = await api.get('/pengurus/');

      if (data && typeof data === 'object') {
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }
        if (Array.isArray(data)) {
          return data;
        }
      }

      return [];
    } catch (error: any) {
      console.error('Error in pengurusAPI.getAll:', error);
      throw error;
    }
  },

  // Get single pengurus by ID
  getById: async (id: number) => {
    const { data } = await api.get(`/pengurus/${id}/`);
    return data;
  },

  // Create new pengurus
  create: async (pengurus: any) => {
    const { data } = await api.post('/pengurus/', pengurus);
    return data;
  },

  // Update pengurus
  update: async (id: number, pengurus: any) => {
    const { data } = await api.patch(`/pengurus/${id}/`, pengurus);
    return data;
  },

  // Delete pengurus
  delete: async (id: number) => {
    await api.delete(`/pengurus/${id}/`);
    return true;
  },
};

export default api;
