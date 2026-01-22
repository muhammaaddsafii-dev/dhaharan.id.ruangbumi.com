import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ActivityCard from "@/components/activities/ActivityCard";
import ActivityModal from "@/components/activities/ActivityModal";
import { Activity, ModalMode } from "@/types";
import { toast } from "@/hooks/use-toast";
import { kegiatanAPI } from "@/services/api";
import type { KegiatanAPI } from "@/types";

// Helper function to convert API data to Activity format
const convertAPIToActivity = (apiData: KegiatanAPI): Activity => {
  // Get all photo URLs if available
  const imageUrls = apiData.foto && apiData.foto.length > 0 
    ? apiData.foto.map(foto => foto.file_path)
    : [];
  
  // First image for backward compatibility
  const imageUrl = imageUrls.length > 0 ? imageUrls[0] : "";

  // Map status_kegiatan to status
  let status: Activity["status"] = "upcoming";
  if (apiData.status_kegiatan_detail) {
    const statusName = apiData.status_kegiatan_detail.nama.toLowerCase();
    if (statusName.includes("selesai") || statusName.includes("completed")) {
      status = "completed";
    } else if (statusName.includes("berlangsung") || statusName.includes("ongoing")) {
      status = "ongoing";
    }
  }

  // Extract location and coordinates from GeoJSON
  let location = "";
  let coordinates: [number, number] | undefined = undefined;
  
  if (apiData.lokasi) {
    // Handle GeoJSON format
    if (apiData.lokasi.coordinates && Array.isArray(apiData.lokasi.coordinates)) {
      const [lng, lat] = apiData.lokasi.coordinates;
      coordinates = [lat, lng]; // Convert to [lat, lng] for Leaflet
      location = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  return {
    id: apiData.id?.toString() || "",
    title: apiData.nama,
    description: apiData.deskripsi,
    date: apiData.tanggal,
    location: location,
    participants: apiData.jumlah_peserta,
    status: status,
    image: imageUrl,
    images: imageUrls, // Add all images
    createdAt: apiData.created_at?.split("T")[0] || "",
    coordinates: coordinates,
    status_kegiatan: apiData.status_kegiatan, // Save original ID (without _id suffix)
    jenis_kegiatan: apiData.jenis_kegiatan, // Save original ID (without _id suffix)
    status_kegiatan_detail: apiData.status_kegiatan_detail, // Save detail object
    jenis_kegiatan_detail: apiData.jenis_kegiatan_detail, // Save detail object
  };
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  // Fetch activities from API
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await kegiatanAPI.getAll();
      
      // Validate data is array
      if (!Array.isArray(data)) {
        console.error("API response is not an array:", data);
        toast({
          title: "Error",
          description: "Format data tidak sesuai. Silakan periksa backend.",
          variant: "destructive",
        });
        setActivities([]);
        return;
      }
      
      const convertedActivities = data.map(convertAPIToActivity);
      setActivities(convertedActivities);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      
      // Check if it's a network error
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast({
          title: "Error Koneksi",
          description: "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Gagal memuat data kegiatan. Silakan coba lagi.",
          variant: "destructive",
        });
      }
      
      // Set empty array on error
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setModalMode("create");
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleView = async (activity: Activity) => {
    // Fetch fresh data from API
    const freshData = await kegiatanAPI.getById(parseInt(activity.id));
    const updatedActivity = convertAPIToActivity(freshData);
    setModalMode("view");
    setSelectedActivity(updatedActivity);
    setIsModalOpen(true);
  };

  const handleEdit = async (activity: Activity) => {
    // Fetch fresh data from API
    const freshData = await kegiatanAPI.getById(parseInt(activity.id));
    const updatedActivity = convertAPIToActivity(freshData);
    setModalMode("edit");
    setSelectedActivity(updatedActivity);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus kegiatan ini? Semua foto yang terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan."
    );
    
    if (!confirmed) {
      return; // User cancelled
    }
    
    try {
      await kegiatanAPI.delete(parseInt(id));
      setActivities(activities.filter((a) => a.id !== id));
      toast({
        title: "Kegiatan Dihapus",
        description: "Kegiatan berhasil dihapus dari daftar.",
      });
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus kegiatan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (data: Omit<Activity, "id" | "createdAt">) => {
    try {
      if (modalMode === "create") {
        // Create new activity
        toast({
          title: "Kegiatan Ditambahkan! 🎉",
          description: "Kegiatan baru berhasil ditambahkan.",
        });
      } else if (modalMode === "edit" && selectedActivity) {
        // Update existing activity
        toast({
          title: "Kegiatan Diperbarui",
          description: "Perubahan berhasil disimpan.",
        });
      }
      
      // Refresh activities list
      await fetchActivities();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan kegiatan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data kegiatan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent border-2 border-foreground shadow-cartoon flex items-center justify-center shrink-0"
            >
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="font-fredoka text-xl sm:text-2xl md:text-3xl font-bold truncate">
                Kegiatan Sosial
              </h1>
              <p className="text-muted-foreground font-nunito text-xs sm:text-sm">
                Kelola semua kegiatan organisasi
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            variant="accent"
            className="w-full sm:w-auto h-10 sm:h-11"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="ml-1 sm:ml-2">Tambah Kegiatan</span>
          </Button>
        </div>
      </motion.div>

      {/* Search - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 sm:mb-6"
      >
        <div className="relative max-w-full sm:max-w-md">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder="Cari kegiatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 sm:pl-12 h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>
      </motion.div>

      {/* Activities List - Responsive Grid */}
      {filteredActivities.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {filteredActivities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              index={index}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="py-12 sm:py-16 text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <h3 className="font-fredoka text-base sm:text-lg font-semibold mb-2">
                {searchQuery ? "Tidak Ada Hasil" : "Belum Ada Kegiatan"}
              </h3>
              <p className="text-muted-foreground font-nunito text-xs sm:text-sm mb-4">
                {searchQuery
                  ? "Coba kata kunci lain"
                  : "Tambahkan kegiatan pertama Anda"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={handleCreate}
                  variant="accent"
                  className="h-10 sm:h-11"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="ml-1 sm:ml-2">Tambah Kegiatan</span>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        mode={modalMode}
        activity={selectedActivity}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
