import { useState } from "react";
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
} from "lucide-react";
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

// Mock data with multiple images
const activities = [
  {
    id: 1,
    title: "Bagi-bagi Takjil Ramadhan",
    description: "Kegiatan pembagian takjil untuk masyarakat di area masjid.",
    date: "15 Maret 2024",
    time: "15:00 - 18:00 WIB",
    location: "Masjid Al-Ikhlas, Jakarta",
    category: "Ramadhan",
    status: "upcoming",
    participants: 45,
    images: [
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600",
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600",
    ],
  },
  {
    id: 2,
    title: "Santunan Anak Yatim",
    description:
      "Pemberian santunan dan perlengkapan sekolah untuk anak yatim.",
    date: "20 Februari 2024",
    time: "09:00 - 12:00 WIB",
    location: "Panti Asuhan Harapan",
    category: "Santunan",
    status: "completed",
    participants: 30,
    images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600",
    ],
  },
  {
    id: 3,
    title: "Bakti Sosial Desa Binaan",
    description: "Pembagian sembako dan pengobatan gratis.",
    date: "10 Januari 2024",
    time: "08:00 - 16:00 WIB",
    location: "Desa Sukamaju, Bogor",
    category: "Baksos",
    status: "completed",
    participants: 60,
    images: [
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600",
    ],
  },
  {
    id: 4,
    title: "Pengajian Bulanan",
    description: "Kajian rutin bulanan.",
    date: "25 Maret 2024",
    time: "19:00 - 21:00 WIB",
    location: "Aula Dhaharan, Depok",
    category: "Pengajian",
    status: "upcoming",
    participants: 100,
    images: [
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600",
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600",
    ],
  },
  {
    id: 5,
    title: "Donor Darah",
    description: "Kegiatan donor darah bersama PMI.",
    date: "5 April 2024",
    time: "08:00 - 14:00 WIB",
    location: "Gedung Serbaguna, Jakarta",
    category: "Kesehatan",
    status: "upcoming",
    participants: 80,
    images: [
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600",
    ],
  },
  {
    id: 6,
    title: "Bersih-Bersih Lingkungan",
    description: "Gotong royong membersihkan lingkungan dan sungai.",
    date: "15 Desember 2023",
    time: "06:00 - 10:00 WIB",
    location: "Kampung Melayu, Jakarta",
    category: "Lingkungan",
    status: "completed",
    participants: 40,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
    ],
  },
  {
    id: 7,
    title: "Bantuan Bencana",
    description: "Membantu korban bencana.",
    date: "15 Desember 2025",
    time: "06:00 - 10:00 WIB",
    location: "Kampung Melayu, Jakarta",
    category: "Lingkungan",
    status: "upcoming",
    participants: 40,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600",
    ],
  },
];

const categories = [
  "Semua",
  "Ramadhan",
  "Santunan",
  "Baksos",
  "Pengajian",
  "Kesehatan",
  "Lingkungan",
];

// Image Slider Component
function ImageSlider({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt="Activity"
        className="w-full h-full object-cover"
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
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
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
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border-2 border-foreground shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border-2 border-foreground shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // default tampilkan semua
  const [statusFilter, setStatusFilter] = useState("all");

  // pagination
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // FILTER LOGIC
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" || activity.category === selectedCategory;

    const matchesStatus =
      statusFilter === "all" ? true : activity.status === statusFilter;

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
                onValueChange={setSelectedCategory}
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
              {paginated.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden h-full group">
                    <div className="aspect-video relative overflow-hidden">
                      <ImageSlider images={activity.images} />

                      <div className="absolute top-3 left-3 flex gap-2 z-10">
                        <Badge
                          variant={
                            activity.status === "upcoming"
                              ? "highlight"
                              : "secondary"
                          }
                        >
                          {activity.status === "upcoming"
                            ? "Akan Datang"
                            : "Selesai"}
                        </Badge>

                        <Badge variant="accent">{activity.category}</Badge>
                      </div>

                      {/* Image Counter */}
                      {activity.images.length > 1 && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-semibold z-10">
                          {activity.images.length} foto
                        </div>
                      )}
                    </div>

                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">
                        {activity.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {activity.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span className="truncate">{activity.date}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span className="truncate">{activity.time}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">
                          {activity.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 shrink-0" />
                        {activity.participants} peserta
                      </div>

                      {activity.status === "upcoming" && (
                        <Button className="w-full mt-4">Daftar Sekarang</Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
    </div>
  );
}
