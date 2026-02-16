import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://be-dhaharan-278881327745.asia-southeast1.run.app/api';

// Types matching backend models
export interface BahanResep {
  id?: number;
  nama: string;
  takaran: string;
}

export interface StepsResep {
  id?: number;
  urutan: number;
  nama: string;
}

export interface TipsResep {
  id?: number;
  urutan: number;
  nama: string;
}

export interface NutrisiResep {
  id?: number;
  label: string;
  nilai: string;
}

export interface FotoResep {
  id?: number;
  file_path: string;
  file_name: string;
}

export interface Resep {
  id?: number;
  judul: string;
  deskripsi: string;
  kategori: 'makanan' | 'minuman' | 'dessert' | 'snack';
  tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit';
  waktu_memasak: number; // in minutes
  waktu_persiapan: number; // in minutes
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

export interface ResepCreatePayload {
  judul: string;
  deskripsi: string;
  kategori: string;
  tingkat_kesulitan: string;
  waktu_memasak: number;
  waktu_persiapan: number;
  porsi: number;
  kalori: number;
  bahan: Array<{ nama: string; takaran: string }>;
  steps: Array<{ urutan: number; nama: string }>;
  tips: Array<{ urutan: number; nama: string }>;
  nutrisi: Array<{ label: string; nilai: string }>;
}

class ResepService {
  private axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Get all resep
  async getAllResep(): Promise<Resep[]> {
    const response = await this.axiosInstance.get('/resep/');
    // Handle paginated response from Django REST Framework
    if (response.data.results) {
      return response.data.results;
    }
    // Handle direct array response
    return Array.isArray(response.data) ? response.data : [];
  }

  // Get single resep with all relations
  async getResepById(id: number): Promise<Resep> {
    const response = await this.axiosInstance.get<Resep>(`/resep/${id}/`);
    return response.data;
  }

  // Get resep by kategori
  async getResepByKategori(kategori: string): Promise<Resep[]> {
    const response = await this.axiosInstance.get<Resep[]>('/resep/by_kategori/', {
      params: { kategori }
    });
    return response.data;
  }

  // Create resep with all relations
  async createResep(data: ResepCreatePayload): Promise<Resep> {
    // Step 1: Create main resep
    const resepResponse = await this.axiosInstance.post<Resep>('/resep/', {
      judul: data.judul,
      deskripsi: data.deskripsi,
      kategori: data.kategori,
      tingkat_kesulitan: data.tingkat_kesulitan,
      waktu_memasak: data.waktu_memasak,
      waktu_persiapan: data.waktu_persiapan,
      porsi: data.porsi,
      kalori: data.kalori,
    });

    const resepId = resepResponse.data.id!;

    // Step 2: Create bahan
    if (data.bahan && data.bahan.length > 0) {
      await Promise.all(
        data.bahan.map(bahan =>
          this.axiosInstance.post('/bahan-resep/', {
            resep: resepId,
            nama: bahan.nama,
            takaran: bahan.takaran,
          })
        )
      );
    }

    // Step 3: Create steps
    if (data.steps && data.steps.length > 0) {
      await Promise.all(
        data.steps.map(step =>
          this.axiosInstance.post('/steps-resep/', {
            resep: resepId,
            urutan: step.urutan,
            nama: step.nama,
          })
        )
      );
    }

    // Step 4: Create tips
    if (data.tips && data.tips.length > 0) {
      await Promise.all(
        data.tips.map(tip =>
          this.axiosInstance.post('/tips-resep/', {
            resep: resepId,
            urutan: tip.urutan,
            nama: tip.nama,
          })
        )
      );
    }

    // Step 5: Create nutrisi
    if (data.nutrisi && data.nutrisi.length > 0) {
      await Promise.all(
        data.nutrisi.map(nutr =>
          this.axiosInstance.post('/nutrisi-resep/', {
            resep: resepId,
            label: nutr.label,
            nilai: nutr.nilai,
          })
        )
      );
    }

    // Step 6: Fetch complete resep with all relations
    return this.getResepById(resepId);
  }

  // Update resep with all relations
  async updateResep(id: number, data: ResepCreatePayload): Promise<Resep> {
    // Step 1: Update main resep
    await this.axiosInstance.patch(`/resep/${id}/`, {
      judul: data.judul,
      deskripsi: data.deskripsi,
      kategori: data.kategori,
      tingkat_kesulitan: data.tingkat_kesulitan,
      waktu_memasak: data.waktu_memasak,
      waktu_persiapan: data.waktu_persiapan,
      porsi: data.porsi,
      kalori: data.kalori,
    });

    // Step 2: Delete old related data
    const currentResep = await this.getResepById(id);

    // Delete old bahan
    if (currentResep.bahan && currentResep.bahan.length > 0) {
      await Promise.all(
        currentResep.bahan.map(bahan =>
          this.axiosInstance.delete(`/bahan-resep/${bahan.id}/`)
        )
      );
    }

    // Delete old steps
    if (currentResep.steps && currentResep.steps.length > 0) {
      await Promise.all(
        currentResep.steps.map(step =>
          this.axiosInstance.delete(`/steps-resep/${step.id}/`)
        )
      );
    }

    // Delete old tips
    if (currentResep.tips && currentResep.tips.length > 0) {
      await Promise.all(
        currentResep.tips.map(tip =>
          this.axiosInstance.delete(`/tips-resep/${tip.id}/`)
        )
      );
    }

    // Delete old nutrisi
    if (currentResep.nutrisi && currentResep.nutrisi.length > 0) {
      await Promise.all(
        currentResep.nutrisi.map(nutr =>
          this.axiosInstance.delete(`/nutrisi-resep/${nutr.id}/`)
        )
      );
    }

    // Step 3: Create new related data
    // Create bahan
    if (data.bahan && data.bahan.length > 0) {
      await Promise.all(
        data.bahan.map(bahan =>
          this.axiosInstance.post('/bahan-resep/', {
            resep: id,
            nama: bahan.nama,
            takaran: bahan.takaran,
          })
        )
      );
    }

    // Create steps
    if (data.steps && data.steps.length > 0) {
      await Promise.all(
        data.steps.map(step =>
          this.axiosInstance.post('/steps-resep/', {
            resep: id,
            urutan: step.urutan,
            nama: step.nama,
          })
        )
      );
    }

    // Create tips
    if (data.tips && data.tips.length > 0) {
      await Promise.all(
        data.tips.map(tip =>
          this.axiosInstance.post('/tips-resep/', {
            resep: id,
            urutan: tip.urutan,
            nama: tip.nama,
          })
        )
      );
    }

    // Create nutrisi
    if (data.nutrisi && data.nutrisi.length > 0) {
      await Promise.all(
        data.nutrisi.map(nutr =>
          this.axiosInstance.post('/nutrisi-resep/', {
            resep: id,
            label: nutr.label,
            nilai: nutr.nilai,
          })
        )
      );
    }

    // Step 4: Fetch complete resep with all relations
    return this.getResepById(id);
  }

  // Delete resep (cascade delete will handle relations)
  async deleteResep(id: number): Promise<void> {
    await this.axiosInstance.delete(`/resep/${id}/`);
  }

  // Upload foto to S3
  async uploadFoto(file: File, title?: string): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'resep'); // Specify folder for resep

    if (title) {
      formData.append('title', title);
    }

    const response = await this.axiosInstance.post('/upload/s3/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Create foto resep
  async createFotoResep(resepId: number, fileUrl: string, fileName: string): Promise<FotoResep> {
    const response = await this.axiosInstance.post<FotoResep>('/foto-resep/', {
      resep: resepId,
      file_path: fileUrl,
      file_name: fileName,
    });
    return response.data;
  }

  // Delete foto resep
  async deleteFotoResep(fotoId: number): Promise<void> {
    await this.axiosInstance.delete(`/foto-resep/${fotoId}/`);
  }

  // Upload and attach foto to resep
  async uploadAndAttachFoto(resepId: number, file: File, title?: string): Promise<FotoResep> {
    const uploadResult = await this.uploadFoto(file, title);
    return this.createFotoResep(resepId, uploadResult.url, uploadResult.filename);
  }

  // Delete all fotos for a resep and upload new ones
  async replaceAllFotos(resepId: number, files: File[]): Promise<FotoResep[]> {
    // Get current resep
    const resep = await this.getResepById(resepId);

    // Delete old fotos
    if (resep.foto && resep.foto.length > 0) {
      await Promise.all(
        resep.foto.map(foto => this.deleteFotoResep(foto.id!))
      );
    }

    // Upload and attach new fotos
    const uploadPromises = files.map(file => this.uploadAndAttachFoto(resepId, file));
    return Promise.all(uploadPromises);
  }
}

export const resepService = new ResepService();
