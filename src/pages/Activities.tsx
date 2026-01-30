import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, Search, Eye, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ActivityModal from "@/components/activities/ActivityModal";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, ModalMode } from "@/types";
import { toast } from "@/hooks/use-toast";
import { kegiatanAPI } from "@/services/api";
import type { KegiatanAPI } from "@/types";
import { formatDate } from "@/utils/formatters";

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

const statusConfig = {
  upcoming: { label: "Akan Datang", variant: "accent" as const },
  ongoing: { label: "Berlangsung", variant: "highlight" as const },
  completed: { label: "Selesai", variant: "secondary" as const },
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    (a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || a.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
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

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder="Cari kegiatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 sm:pl-12 h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-11">
            <SelectValue placeholder="Status Kegiatan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="upcoming">Akan Datang</SelectItem>
            <SelectItem value="ongoing">Berlangsung</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Activities Table */}
      {filteredActivities.length > 0 ? (
        <div className="rounded-xl border-2 border-foreground shadow-cartoon overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-accent [&_th]:text-accent-foreground text-center">
              <TableRow className="hover:bg-accent">
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead className="text-center">Nama Kegiatan</TableHead>
                <TableHead className="text-center">Tanggal</TableHead>
                <TableHead className="text-center">Lokasi</TableHead>
                <TableHead className="text-center">Peserta</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((activity, index) => {
                  const status = statusConfig[activity.status as keyof typeof statusConfig] || statusConfig.upcoming;
                  return (
                    <TableRow key={activity.id}>
                      <TableCell className="text-center font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {activity.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDate(activity.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{activity.location}</TableCell>
                      <TableCell className="text-center">
                        {activity.participants}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(activity)}
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(activity)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-orange-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(activity.id)}
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {filteredActivities.length > itemsPerPage && (
            <div className="flex justify-center gap-2 py-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <div className="flex items-center px-4 font-medium text-sm">
                Halaman {currentPage} dari {Math.ceil(filteredActivities.length / itemsPerPage)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredActivities.length / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(filteredActivities.length / itemsPerPage)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 border rounded-md"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="font-fredoka text-base sm:text-lg font-semibold mb-2">
            {searchQuery || statusFilter !== "all"
              ? "Tidak Ada Hasil"
              : "Belum Ada Kegiatan"}
          </h3>
          <p className="text-muted-foreground font-nunito text-xs sm:text-sm mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Coba kata kunci atau filter lain"
              : "Tambahkan kegiatan pertama Anda"}
          </p>
          {(!searchQuery && statusFilter === "all") && (
            <Button
              onClick={handleCreate}
              variant="accent"
              className="h-10 sm:h-11"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="ml-1 sm:ml-2">Tambah Kegiatan</span>
            </Button>
          )}
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
