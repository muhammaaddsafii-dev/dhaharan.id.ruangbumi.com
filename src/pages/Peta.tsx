import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Calendar, Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KegiatanAPI } from "@/types";
import { kegiatanAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import L from "leaflet";

interface ActivityLocation extends KegiatanAPI {
  coordinates: { lat: number; lng: number };
}

// LEAFLET ICON FIX
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// FlyTo Component
function FlyToLocation({ coords }: any) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 14, { duration: 1.2 });
  }, [coords]);
  return null;
}

// FullScreenNavigation Helper Component
function FullScreenNavigation({ data, onUpdate, onClose }: any) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        onUpdate((data.index - 1 + data.images.length) % data.images.length);
      if (e.key === "ArrowRight")
        onUpdate((data.index + 1) % data.images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, onUpdate, onClose]);
  return null;
}

export default function Peta() {
  const [activityLocations, setActivityLocations] = useState<ActivityLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<ActivityLocation | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [fullScreenData, setFullScreenData] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  // Load data dari backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const kegiatan = await kegiatanAPI.getAll();

        // Transform data: extract coordinates dari lokasi GeoJSON
        const locationsWithCoords: ActivityLocation[] = kegiatan.map((k) => ({
          ...k,
          coordinates: {
            lat: k.lokasi.coordinates[1], // GeoJSON format: [lng, lat]
            lng: k.lokasi.coordinates[0],
          },
        }));

        setActivityLocations(locationsWithCoords);
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

  // Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // AUTOPLAY SLIDER
  useEffect(() => {
    if (!selectedLocation || !selectedLocation.foto || selectedLocation.foto.length === 0) return;
    const total = selectedLocation.foto.length;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % total);
    }, 2800);
    return () => clearInterval(timer);
  }, [selectedLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center animate-pulse">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Memuat data peta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <Badge className="mb-3 sm:mb-4 text-xs sm:text-sm">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Lokasi Kegiatan
          </Badge>

          <h1 className="font-fredoka text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 px-2">
            Peta Kegiatan
          </h1>

          <p className="font-nunito text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Jelajahi lokasi-lokasi kegiatan yang telah dilaksanakan.
          </p>
        </motion.div>

        {/* GRID LAYOUT */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* MAP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden h-full">
              <CardContent className="p-0 h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[700px]">
                <MapContainer
                  center={[-2.5489, 118.0149]} // Koordinat tengah Indonesia
                  zoom={5} // Zoom level untuk melihat seluruh Indonesia
                  scrollWheelZoom={true}
                  className="w-full h-full map-container"
                  style={{ minHeight: "400px" }}
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                  />

                  {selectedLocation && (
                    <FlyToLocation coords={selectedLocation.coordinates} />
                  )}

                  <MarkerClusterGroup chunkedLoading>
                    {activityLocations.map((loc) => (
                      <Marker
                        key={loc.id}
                        position={[loc.coordinates.lat, loc.coordinates.lng]}
                        eventHandlers={{
                          click: () => {
                            setSelectedLocation(loc);
                            setSlideIndex(0);
                          },
                        }}
                      >
                        <Popup>
                          <div className="font-semibold">{loc.nama}</div>
                          <div className="text-xs text-muted-foreground">
                            Lat: {loc.coordinates.lat.toFixed(4)}, Lng: {loc.coordinates.lng.toFixed(4)}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MarkerClusterGroup>
                </MapContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {selectedLocation ? (
              <Card className="h-full">
                <CardHeader className="pb-0 p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <Badge variant="highlight" className="text-xs">
                      {selectedLocation.jenis_kegiatan_detail?.nama || "Kegiatan"}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedLocation(null)}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <CardTitle className="mt-2 text-base sm:text-lg">
                    {selectedLocation.nama}
                  </CardTitle>

                  <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
                    {formatDate(selectedLocation.tanggal)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  {/* DESCRIPTION */}
                  <p className="text-xs sm:text-sm text-muted-foreground font-nunito">
                    {selectedLocation.deskripsi}
                  </p>

                  {/* Jumlah Peserta */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Badge variant="secondary">
                      {selectedLocation.jumlah_peserta} Peserta
                    </Badge>
                    <Badge variant={selectedLocation.status_kegiatan === 1 ? "highlight" : selectedLocation.status_kegiatan === 2 ? "accent" : "secondary"}>
                      {selectedLocation.status_kegiatan_detail?.nama || "Status"}
                    </Badge>
                  </div>

                  {/* AUTOPLAY SLIDER */}
                  {selectedLocation.foto && selectedLocation.foto.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                        <Camera className="w-4 h-4" /> Dokumentasi ({selectedLocation.foto.length})
                      </div>

                      <div className="relative w-full overflow-hidden rounded-xl">
                        <motion.div
                          className="flex"
                          animate={{ x: `-${slideIndex * 100}%` }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        >
                          {selectedLocation.foto.map(
                            (foto, i: number) => (
                              <img
                                key={foto.id || i}
                                src={foto.file_path}
                                alt={`${selectedLocation.nama} - ${i + 1}`}
                                className="w-full h-48 sm:h-64 object-cover rounded-xl flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                                onError={(e) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600";
                                }}
                                onClick={() =>
                                  setFullScreenData({
                                    images: selectedLocation.foto.map((f) => f.file_path),
                                    index: i,
                                  })
                                }
                              />
                            )
                          )}
                        </motion.div>

                        {/* Bullet Indicator */}
                        <div className="flex justify-center gap-2 sm:gap-3 mt-3">
                          {selectedLocation.foto.map((_, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setSlideIndex(idx)}
                              className={`rounded-full transition-all ${slideIndex === idx
                                ? "w-3 h-3 sm:w-4 sm:h-4 bg-orange-500"
                                : "w-2 h-2 sm:w-3 sm:h-3 bg-gray-300"
                                }`}
                              aria-label={`Slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {(!selectedLocation.foto || selectedLocation.foto.length === 0) && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      Belum ada dokumentasi
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <h3 className="font-fredoka text-base sm:text-lg font-semibold px-1">
                  Daftar Lokasi ({activityLocations.length})
                </h3>

                <div className="space-y-3 max-h-[500px] sm:max-h-[640px] overflow-y-auto pr-2">
                  {activityLocations.map((loc) => (
                    <motion.div
                      key={loc.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card
                        className="cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => {
                          setSelectedLocation(loc);
                          setSlideIndex(0);
                        }}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-primary border border-foreground flex items-center justify-center">
                              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-fredoka font-semibold text-xs sm:text-sm truncate">
                                {loc.nama}
                              </h4>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                Lat: {loc.coordinates.lat.toFixed(4)}, Lng: {loc.coordinates.lng.toFixed(4)}
                              </p>

                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] sm:text-xs"
                                >
                                  {loc.jenis_kegiatan_detail?.nama || "Kegiatan"}
                                </Badge>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  {formatDate(loc.tanggal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* CUSTOM CSS FOR LEAFLET ZOOM CONTROLS */}
      <style>{`
        /* Posisikan zoom controls agar tidak overlap dengan sidebar */
        .leaflet-control-zoom {
          margin-top: 10px !important;
          margin-right: 10px !important;
        }

        /* Di mobile, pindahkan zoom controls ke kanan bawah */
        @media (max-width: 640px) {
          .leaflet-control-zoom {
            margin-top: auto !important;
            margin-bottom: 20px !important;
            margin-right: 10px !important;
          }
          
          .leaflet-top.leaflet-left {
            top: auto !important;
            bottom: 0 !important;
            left: auto !important;
            right: 0 !important;
          }
        }

        /* Pastikan zoom controls memiliki z-index yang tepat */
        .leaflet-control-zoom {
          z-index: 400 !important;
        }

        /* Style untuk map container */
        .map-container {
          position: relative;
          z-index: 1;
        }

        /* Sembunyikan scrollbar di daftar lokasi */
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 20px;
        }
      `}</style>
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
              onUpdate={(idx) =>
                setFullScreenData({ ...fullScreenData, index: idx })
              }
              onClose={() => setFullScreenData(null)}
            />

            <motion.div
              className="relative w-full max-w-5xl h-auto flex flex-col items-center justify-center pointer-events-auto"
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
                        setFullScreenData((prev) =>
                          prev
                            ? {
                              ...prev,
                              index:
                                (prev.index - 1 + prev.images.length) %
                                prev.images.length,
                            }
                            : null
                        );
                      }}
                      className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 z-[60] hover:scale-110 hidden md:flex"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullScreenData((prev) =>
                          prev
                            ? {
                              ...prev,
                              index: (prev.index + 1) % prev.images.length,
                            }
                            : null
                        );
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
                            setFullScreenData((prev) =>
                              prev
                                ? {
                                  ...prev,
                                  index:
                                    (prev.index - 1 + prev.images.length) %
                                    prev.images.length,
                                }
                                : null
                            );
                          } else {
                            // Swipe Left -> Next
                            setFullScreenData((prev) =>
                              prev
                                ? {
                                  ...prev,
                                  index: (prev.index + 1) % prev.images.length,
                                }
                                : null
                            );
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
                        setFullScreenData((prev) =>
                          prev ? { ...prev, index: idx } : null
                        );
                      }}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${idx === fullScreenData.index
                          ? "border-white scale-110 shadow-lg"
                          : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${idx}`}
                        className="w-full h-full object-cover"
                      />
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
