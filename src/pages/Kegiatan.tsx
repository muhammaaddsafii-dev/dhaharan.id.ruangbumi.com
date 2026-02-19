import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Filter,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KegiatanAPI, JenisKegiatan } from "@/types";
import { kegiatanAPI, jenisKegiatanAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

// Image Slider Component
function ImageSlider({ images, onImageClick }: { images: string[], onImageClick?: (index: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-full bg-secondary flex items-center justify-center">
        <Calendar className="w-12 h-12 text-muted-foreground opacity-50" />
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt="Activity"
        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
        onClick={() => onImageClick?.(0)}
      />
    );
  }

  return (
    <div className="relative w-full h-full group">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => onImageClick?.(currentIndex)}
        />
      </AnimatePresence>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border-2 border-foreground shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border-2 border-foreground shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/75"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Kegiatan() {
  const [activities, setActivities] = useState<KegiatanAPI[]>([]);
  const [jenisKegiatan, setJenisKegiatan] = useState<JenisKegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("all");

  // pagination
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // State for Full Screen Image Slider
  const [fullScreenData, setFullScreenData] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  // Load data dari backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const [kegiatanData, jenisData] = await Promise.all([
          kegiatanAPI.getAll(),
          jenisKegiatanAPI.getAll(),
        ]);

        setActivities(kegiatanData);
        setJenisKegiatan(jenisData);
      } catch (error) {
        console.error("Error loading kegiatan:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data kegiatan",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Buat list kategori dari jenis kegiatan
  const categories = ["Semua", ...jenisKegiatan.map(j => j.nama)];

  // Format tanggal ke format Indonesia
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // FILTER LOGIC
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" ||
      activity.jenis_kegiatan_detail?.nama === selectedCategory;

    const matchesStatus = (() => {
      if (statusFilter === "all") return true;
      if (statusFilter === "upcoming") return activity.status_kegiatan === 1; // Akan Datang
      if (statusFilter === "ongoing") return activity.status_kegiatan === 2; // Berlangsung
      if (statusFilter === "completed") return activity.status_kegiatan === 3; // Selesai
      return true;
    })();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // PAGINATION SLICE
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginated = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // if filter berubah → reset ke halaman 1
  const applyFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Helper untuk mendapatkan status badge
  const getStatusBadge = (statusId: number) => {
    if (statusId === 1) return { label: "Akan Datang", variant: "highlight" as const };
    if (statusId === 2) return { label: "Berlangsung", variant: "accent" as const };
    if (statusId === 3) return { label: "Selesai", variant: "secondary" as const };
    return { label: "Unknown", variant: "default" as const };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center animate-pulse">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Memuat kegiatan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="highlight">
            <Calendar className="w-4 h-4 mr-1" />
            Agenda Komunitas
          </Badge>

          <h1 className="font-fredoka text-4xl md:text-5xl font-bold mb-4">
            Kegiatan & Agenda
          </h1>

          <p className="font-nunito text-muted-foreground max-w-2xl mx-auto">
            Temukan berbagai kegiatan sosial yang telah dan akan dilaksanakan.
          </p>
        </motion.div>

        {/* FILTER SECTION */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* CATEGORY */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />

              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full lg:w-[180px] h-10 rounded-md border-2 border-foreground shadow-cartoon-sm">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SEARCH */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cari kegiatan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-12"
              />
            </div>

            {/* STATUS */}
            <div className="flex gap-2 w-full lg:w-auto">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => applyFilter("all")}
                className="flex-1 lg:flex-none"
              >
                Semua
              </Button>

              <Button
                variant={statusFilter === "upcoming" ? "default" : "outline"}
                onClick={() => applyFilter("upcoming")}
                className="flex-1 lg:flex-none"
              >
                Akan Datang
              </Button>

              <Button
                variant={statusFilter === "completed" ? "default" : "outline"}
                onClick={() => applyFilter("completed")}
                className="flex-1 lg:flex-none"
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>

        {/* LIST */}
        {paginated.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((activity, index) => {
                const statusBadge = getStatusBadge(activity.status_kegiatan);
                const images = activity.foto?.map(f => f.file_path) || [];

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden h-full group">
                      <div className="aspect-video relative overflow-hidden">
                        <ImageSlider
                          images={images}
                          onImageClick={(idx) => setFullScreenData({ images, index: idx })}
                        />

                        <div className="absolute top-3 left-3 flex gap-2 z-10">
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>

                          {activity.jenis_kegiatan_detail && (
                            <Badge variant="accent">
                              {activity.jenis_kegiatan_detail.nama}
                            </Badge>
                          )}
                        </div>

                        {/* Image Counter */}
                        {images.length > 1 && (
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-semibold z-10">
                            {images.length} foto
                          </div>
                        )}
                      </div>

                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">
                          {activity.nama}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {activity.deskripsi}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span className="truncate">{formatDate(activity.tanggal)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="line-clamp-1">
                            {activity.lokasi?.coordinates
                              ? `${activity.lokasi.coordinates[1]}, ${activity.lokasi.coordinates[0]}`
                              : "Lokasi tidak tersedia"
                            }
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 shrink-0" />
                          {activity.jumlah_peserta} peserta
                        </div>

                        {activity.status_kegiatan === 1 && (
                          <Link to="/volunteersection">
                            <Button className="w-full mt-4">Daftar Sekarang</Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 sm:gap-3 mt-10">
                <Button
                  disabled={currentPage === 1}
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Prev</span>
                </Button>

                <div className="px-3 sm:px-4 py-2 border-2 border-foreground rounded-lg shadow-cartoon-sm font-semibold text-sm">
                  {currentPage} / {totalPages}
                </div>

                <Button
                  disabled={currentPage === totalPages}
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  size="sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 sm:ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>

            <h3 className="font-fredoka text-xl font-semibold mb-2">
              Tidak ada kegiatan ditemukan
            </h3>

            <p className="font-nunito text-muted-foreground">
              Coba ubah filter atau kata kunci pencarian.
            </p>
          </motion.div>
        )}
      </div>

      {/* Full Screen Image Slider Modal */}
      <AnimatePresence>
        {fullScreenData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 pb-4 pt-20 md:p-10"
            onClick={() => setFullScreenData(null)}
          >
            {/* Keyboard Navigation Handler */}
            <FullScreenNavigation
              data={fullScreenData}
              onUpdate={(idx) => setFullScreenData({ ...fullScreenData, index: idx })}
              onClose={() => setFullScreenData(null)}
            />

            <motion.div
              className="relative w-full max-w-5xl h-auto flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setFullScreenData(null)}
                className="absolute -top-12 right-0 md:-right-12 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 z-[70] group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>

              {/* Main Image Container */}
              <div className="relative w-full flex justify-center items-center">
                {/* Navigation Buttons (Desktop) */}
                {fullScreenData.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullScreenData(prev => prev ? {
                          ...prev,
                          index: (prev.index - 1 + prev.images.length) % prev.images.length
                        } : null);
                      }}
                      className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 z-[60] hover:scale-110 hidden md:flex"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullScreenData(prev => prev ? {
                          ...prev,
                          index: (prev.index + 1) % prev.images.length
                        } : null);
                      }}
                      className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 z-[60] hover:scale-110 hidden md:flex"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Main Image */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={fullScreenData.index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative flex items-center justify-center"
                  >
                    <img
                      src={fullScreenData.images[fullScreenData.index]}
                      alt={`Full View ${fullScreenData.index + 1}`}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl select-none"
                      draggable={false}
                    />

                    {/* Swipe Area Overlay for Touch */}
                    <div
                      className="absolute inset-0 md:hidden touch-pan-y"
                      onTouchStart={(e) => {
                        const touch = e.touches[0];
                        // Store start X
                        (e.target as any).startX = touch.clientX;
                      }}
                      onTouchEnd={(e) => {
                        const touch = e.changedTouches[0];
                        const diff = touch.clientX - (e.target as any).startX;
                        if (Math.abs(diff) > 50) {
                          if (diff > 0) {
                            // Swipe Right -> Prev
                            setFullScreenData(prev => prev ? {
                              ...prev,
                              index: (prev.index - 1 + prev.images.length) % prev.images.length
                            } : null);
                          } else {
                            // Swipe Left -> Next
                            setFullScreenData(prev => prev ? {
                              ...prev,
                              index: (prev.index + 1) % prev.images.length
                            } : null);
                          }
                        }
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Counter caption */}
              <div className="mt-4 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/10 z-[60]">
                {fullScreenData.index + 1} / {fullScreenData.images.length}
              </div>

              {/* Thumbnails (Desktop only) */}
              {fullScreenData.images.length > 1 && (
                <div className="mt-4 hidden md:flex gap-2 p-2 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 max-w-[90vw] overflow-x-auto z-[60]">
                  {fullScreenData.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullScreenData(prev => prev ? { ...prev, index: idx } : null);
                      }}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${idx === fullScreenData.index ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for keyboard navigation
function FullScreenNavigation({
  data,
  onUpdate,
  onClose
}: {
  data: { images: string[], index: number },
  onUpdate: (idx: number) => void,
  onClose: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        onUpdate((data.index + 1) % data.images.length);
      } else if (e.key === "ArrowLeft") {
        onUpdate((data.index - 1 + data.images.length) % data.images.length);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, onUpdate, onClose]);

  return null;
}
