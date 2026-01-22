import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Users, Camera, Sparkles, Upload, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Activity, ModalMode } from "@/types";
import { formatDate } from "@/utils/formatters";
import { kegiatanAPI, fotoKegiatanAPI, jenisKegiatanAPI, statusKegiatanAPI, uploadToS3 } from "@/services/api";
import type { JenisKegiatan, StatusKegiatan } from "@/types";
import { toast } from "@/hooks/use-toast";
import LocationPicker from "@/components/LocationPicker";
import LocationViewer from "@/components/LocationViewer";

interface ActivityModalProps {
  isOpen: boolean;
  mode: ModalMode;
  activity: Activity | null;
  onClose: () => void;
  onSave: (activity: Omit<Activity, "id" | "createdAt">) => void;
}

const statuses = [
  { value: "upcoming", label: "Akan Datang", color: "bg-accent" },
  { value: "ongoing", label: "Berlangsung", color: "bg-primary" },
  { value: "completed", label: "Selesai", color: "bg-secondary" },
];

export default function ActivityModal({
  isOpen,
  mode,
  activity,
  onClose,
  onSave,
}: ActivityModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    participants: 0,
    status: "upcoming" as Activity["status"],
    image: "",
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [jenisKegiatanList, setJenisKegiatanList] = useState<JenisKegiatan[]>([]);
  const [statusKegiatanList, setStatusKegiatanList] = useState<StatusKegiatan[]>([]);
  const [selectedJenisKegiatan, setSelectedJenisKegiatan] = useState<number | string>("");
  const [selectedStatusKegiatan, setSelectedStatusKegiatan] = useState<number | string>("");
  
  // Location picker state
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  
  // Slider state for view mode
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch jenis and status kegiatan on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [jenisData, statusData] = await Promise.all([
          jenisKegiatanAPI.getAll(),
          statusKegiatanAPI.getAll(),
        ]);
        setJenisKegiatanList(jenisData);
        setStatusKegiatanList(statusData);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    
    if (isOpen) {
      fetchMetadata();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activity && (mode === "edit" || mode === "view")) {
      setFormData({
        title: activity.title,
        description: activity.description,
        date: activity.date,
        location: activity.location,
        participants: activity.participants,
        status: activity.status,
        image: activity.image || "",
      });
      
      // Set jenis kegiatan and status kegiatan from activity data
      if (activity.jenis_kegiatan) {
        setSelectedJenisKegiatan(activity.jenis_kegiatan);
      }
      if (activity.status_kegiatan) {
        setSelectedStatusKegiatan(activity.status_kegiatan);
      }
      
      // Reset images first to avoid showing old images
      setUploadedImages([]);
      setSelectedFiles([]);
      
      // Then load new images
      if (activity.images && activity.images.length > 0) {
        setUploadedImages(activity.images);
      } else if (activity.image) {
        setUploadedImages([activity.image]);
      }
      
      // Reset slider index
      setCurrentImageIndex(0);
      
      // Use coordinates from activity if available
      if (activity.coordinates) {
        setSelectedCoordinates(activity.coordinates);
      } else {
        // Fallback: try to parse from location string
        const coordMatch = activity.location.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
        if (coordMatch) {
          const coords: [number, number] = [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
          setSelectedCoordinates(coords);
        }
      }
    } else {
      setFormData({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        location: "",
        participants: 0,
        status: "upcoming",
        image: "",
      });
      setSelectedFiles([]);
      setUploadedImages([]);
      setSelectedCoordinates(null);
      setCurrentImageIndex(0);
      // Set default values for new activity
      if (jenisKegiatanList.length > 0) {
        setSelectedJenisKegiatan(jenisKegiatanList[0].id);
      }
      if (statusKegiatanList.length > 0) {
        setSelectedStatusKegiatan(statusKegiatanList[0].id);
      }
    }
  }, [activity, mode, isOpen, jenisKegiatanList, statusKegiatanList]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Preview images
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedCoordinates([lat, lng]);
    setFormData({
      ...formData,
      location: address,
    });
  };

  // Slider navigation functions
  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? uploadedImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === uploadedImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate coordinates selected
    if (!selectedCoordinates) {
      toast({
        title: "Lokasi Belum Dipilih",
        description: "Silakan pilih lokasi pada peta terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);

    try {
      // Use selectedStatusKegiatan directly if it's already a number
      // Otherwise try to map from formData.status
      let statusId = selectedStatusKegiatan;
      
      // If selectedStatusKegiatan is empty string or not set, try to find from formData.status
      if (!statusId || statusId === "") {
        if (statusKegiatanList.length > 0) {
          const statusMapping: { [key: string]: string } = {
            "upcoming": "akan datang",
            "ongoing": "berlangsung", 
            "completed": "selesai"
          };
          
          const foundStatus = statusKegiatanList.find(s => 
            s.nama.toLowerCase().includes(statusMapping[formData.status])
          );
          
          if (foundStatus) {
            statusId = foundStatus.id;
          }
        }
      }
      
      // Convert to number if it's still string
      const finalStatusId = typeof statusId === 'string' ? parseInt(statusId) : statusId;
      const finalJenisId = typeof selectedJenisKegiatan === 'string' ? parseInt(selectedJenisKegiatan) : selectedJenisKegiatan;

      // Use selected coordinates or default to Yogyakarta
      const lokasi: {
        type: string;
        coordinates: [number, number];
      } = {
        type: "Point",
        coordinates: selectedCoordinates 
          ? [selectedCoordinates[1], selectedCoordinates[0]] as [number, number] // GeoJSON format: [lng, lat]
          : [110.3695, -7.7956] as [number, number] // Default: Yogyakarta
      };

      if (mode === "create") {
        // Create new kegiatan
        const newKegiatan = await kegiatanAPI.create({
          nama: formData.title,
          deskripsi: formData.description,
          tanggal: formData.date,
          jumlah_peserta: formData.participants,
          lokasi: lokasi,
          jenis_kegiatan: finalJenisId,
          status_kegiatan: finalStatusId,
        });

        // Upload photos if any
        if (selectedFiles.length > 0 && newKegiatan.id) {
        // Upload each file
          for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append('kegiatan', newKegiatan.id.toString());
          formData.append('file_path', file);
          formData.append('file_name', file.name);
          
          await fotoKegiatanAPI.create(formData);
        }
      }

      } else if (mode === "edit" && activity) {
        // Update existing kegiatan
        await kegiatanAPI.update(parseInt(activity.id), {
          nama: formData.title,
          deskripsi: formData.description,
          tanggal: formData.date,
          jumlah_peserta: formData.participants,
          lokasi: lokasi,
          jenis_kegiatan: finalJenisId,
          status_kegiatan: finalStatusId,
        });

        // Only upload new photos if any, don't delete existing ones
        if (selectedFiles.length > 0) {
          // Upload new photos
          for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('kegiatan', activity.id);
            formData.append('file_path', file);
            formData.append('file_name', file.name);
            
            await fotoKegiatanAPI.create(formData);
          }
        }
      }

      // Call parent's onSave
      onSave(formData);
      
    } catch (error) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan kegiatan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const isViewMode = mode === "view";
  const currentStatus = statuses.find((s) => s.value === formData.status);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-2xl bg-card border-2 border-foreground rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            >
              {/* Header - Sticky */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-foreground shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent border-2 border-foreground shadow-cartoon-sm flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-fredoka text-base sm:text-lg font-bold truncate">
                      {mode === "create"
                        ? "Tambah Kegiatan"
                        : mode === "edit"
                        ? "Edit Kegiatan"
                        : "Detail Kegiatan"}
                    </h2>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {isViewMode
                        ? "Informasi lengkap kegiatan"
                        : "Isi formulir dengan lengkap"}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="h-9 w-9 shrink-0 hover:bg-destructive/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {isViewMode ? (
                  /* VIEW MODE */
                  <div className="p-4 sm:p-6 space-y-5">
                    {/* Title & Status */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-fredoka text-xl sm:text-2xl font-bold flex-1 leading-tight">
                          {formData.title}
                        </h3>
                        <Badge
                          className={`${currentStatus?.color} text-xs sm:text-sm shrink-0 h-7`}
                        >
                          {currentStatus?.label}
                        </Badge>
                      </div>
                      {formData.description && (
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {formData.description}
                        </p>
                      )}
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-3 pt-4 border-t-2 border-foreground/10">
                      <div className="grid sm:grid-cols-2 gap-3">
                        {/* Date */}
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 border border-foreground/10">
                          <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-accent" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Tanggal
                            </p>
                            <p className="font-semibold text-sm truncate">
                              {formatDate(formData.date)}
                            </p>
                          </div>
                        </div>

                        {/* Participants */}
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 border border-foreground/10">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Peserta
                            </p>
                            <p className="font-semibold text-sm">
                              {formData.participants} orang
                            </p>
                          </div>
                        </div>

                        {/* Jenis Kegiatan */}
                        {activity?.jenis_kegiatan_detail && (
                          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 border border-foreground/10">
                            <div className="w-10 h-10 rounded-lg bg-highlight/20 border border-highlight/30 flex items-center justify-center shrink-0">
                              <Sparkles className="w-5 h-5 text-highlight" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground mb-0.5">
                                Jenis Kegiatan
                              </p>
                              <p className="font-semibold text-sm">
                                {activity.jenis_kegiatan_detail.nama}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Status Kegiatan Detail */}
                        {activity?.status_kegiatan_detail && (
                          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 border border-foreground/10">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground mb-0.5">
                                Status
                              </p>
                              <p className="font-semibold text-sm">
                                {activity.status_kegiatan_detail.nama}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 border border-foreground/10">
                        <div className="w-10 h-10 rounded-lg bg-highlight/20 border border-highlight/30 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-highlight" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Lokasi
                          </p>
                          <p className="font-semibold text-sm">
                            {formData.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Location Map (if coordinates exist) */}
                    {selectedCoordinates && (
                      <div className="pt-2">
                        <label className="block text-sm font-semibold mb-2.5">
                          Lokasi di Peta
                        </label>
                        <LocationViewer location={selectedCoordinates} zoom={5} />
                        <p className="text-xs text-muted-foreground mt-2">
                          📍 {selectedCoordinates[0].toFixed(6)}, {selectedCoordinates[1].toFixed(6)}
                        </p>
                      </div>
                    )}

                    {/* Image Preview (if exists) */}
                    {uploadedImages.length > 0 && (
                      <div className="pt-2">
                        <label className="block text-sm font-semibold mb-2.5">
                          Foto Kegiatan
                        </label>
                        
                        {/* Image Slider */}
                        <div className="relative rounded-xl border-2 border-foreground/10 overflow-hidden bg-secondary/30">
                          {/* Main Image */}
                          <div className="relative aspect-video">
                            <AnimatePresence mode="wait">
                              <motion.img
                                key={currentImageIndex}
                                src={uploadedImages[currentImageIndex]}
                                alt={`${formData.title} ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.3 }}
                              />
                            </AnimatePresence>
                            
                            {/* Navigation Arrows - only show if more than 1 image */}
                            {uploadedImages.length > 1 && (
                              <>
                                <button
                                  onClick={goToPrevImage}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-sm border-2 border-white/20"
                                >
                                  <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                  onClick={goToNextImage}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-sm border-2 border-white/20"
                                >
                                  <ChevronRight className="w-6 h-6" />
                                </button>
                              </>
                            )}
                            
                            {/* Image Counter */}
                            {uploadedImages.length > 1 && (
                              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium border border-white/20">
                                {currentImageIndex + 1} / {uploadedImages.length}
                              </div>
                            )}
                          </div>
                          
                          {/* Thumbnail Navigation - only show if more than 1 image */}
                          {uploadedImages.length > 1 && (
                            <div className="flex gap-2 p-3 bg-secondary/50 overflow-x-auto">
                              {uploadedImages.map((image, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentImageIndex
                                      ? 'border-accent ring-2 ring-accent/50'
                                      : 'border-foreground/20 hover:border-foreground/40'
                                  }`}
                                >
                                  <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* EDIT/CREATE MODE */
                  <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-5">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Judul Kegiatan{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="Contoh: Bagi-bagi Takjil Ramadhan"
                          className="h-11"
                          required
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Deskripsi
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Jelaskan detail kegiatan (opsional)"
                          className="min-h-[100px] resize-none"
                        />
                      </div>

                      {/* Jenis Kegiatan Dropdown */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Jenis Kegiatan{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={selectedJenisKegiatan}
                          onChange={(e) => setSelectedJenisKegiatan(parseInt(e.target.value))}
                          className="w-full h-11 px-3 border-2 border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                          required
                        >
                          <option value="">Pilih Jenis Kegiatan</option>
                          {Array.isArray(jenisKegiatanList) && jenisKegiatanList.map((jenis) => (
                            <option key={jenis.id} value={jenis.id}>
                              {jenis.nama}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date & Participants Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2.5">
                            Tanggal <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              setFormData({ ...formData, date: e.target.value })
                            }
                            className="h-11"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2.5">
                            Jumlah Peserta{" "}
                            <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="number"
                            value={formData.participants}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                participants: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                            className="h-11"
                            min={0}
                            required
                          />
                        </div>
                      </div>

                      {/* Location - Direct Map Picker */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Lokasi <span className="text-destructive">*</span>
                        </label>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            💡 Klik pada peta untuk memilih lokasi kegiatan
                          </p>
                          <LocationPicker
                            center={selectedCoordinates || [-7.7956, 110.3695]}
                            zoom={13}
                            onLocationSelect={handleLocationSelect}
                            selectedLocation={selectedCoordinates}
                          />
                          {selectedCoordinates && (
                            <div className="p-3 rounded-lg bg-secondary/50 border border-foreground/10">
                              <p className="text-xs text-muted-foreground mb-1">
                                📍 Lokasi Terpilih:
                              </p>
                              <p className="text-sm font-medium">
                                {formData.location || `${selectedCoordinates[0].toFixed(6)}, ${selectedCoordinates[1].toFixed(6)}`}
                              </p>
                            </div>
                          )}
                          {!selectedCoordinates && (
                            <p className="text-xs text-destructive">
                              ⚠️ Silakan pilih lokasi pada peta
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Kegiatan Dropdown */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Status Kegiatan{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={selectedStatusKegiatan}
                          onChange={(e) => setSelectedStatusKegiatan(parseInt(e.target.value))}
                          className="w-full h-11 px-3 border-2 border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                          required
                        >
                          <option value="">Pilih Status Kegiatan</option>
                          {Array.isArray(statusKegiatanList) && statusKegiatanList.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.nama}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Upload Foto - Multiple */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Upload Foto{" "}
                          <span className="text-muted-foreground text-xs font-normal">
                            (Multiple foto)
                          </span>
                        </label>
                        
                        {/* Upload Button */}
                        <label className="border-2 border-dashed border-foreground/20 rounded-xl p-6 sm:p-8 text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group block">
                          <input
                            type="file"
                            multiple
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Upload className="w-6 h-6 text-accent" />
                          </div>
                          <p className="text-sm font-medium mb-1">
                            Klik untuk upload multiple foto
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, JPEG maksimal 5MB per file
                          </p>
                        </label>

                        {/* Preview Images */}
                        {uploadedImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {uploadedImages.map((image, index) => (
                              <div key={index} className="relative group">
                                <div className="rounded-lg border-2 border-foreground/10 overflow-hidden">
                                  <img
                                    src={image}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {selectedFiles[index]?.name || 'Image'}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 mt-6 border-t-2 border-foreground/10">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11"
                        onClick={onClose}
                        disabled={uploading}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        variant="accent"
                        className="flex-1 h-11"
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {mode === "create"
                              ? "Tambah Kegiatan"
                              : "Simpan Perubahan"}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
