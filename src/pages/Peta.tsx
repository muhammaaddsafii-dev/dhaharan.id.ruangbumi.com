import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import L from "leaflet";

// LEAFLET ICON FIX
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Dummy data
const activityLocations = [
  {
    id: 1,
    title: "Bagi-bagi Takjil Ramadhan",
    description:
      "Kegiatan pembagian takjil kepada masyarakat sekitar menjelang waktu berbuka puasa.",
    date: "15 Maret 2024",
    location: "Masjid Al-Ikhlas, Jakarta Selatan",
    coordinates: { lat: -6.2615, lng: 106.8106 },
    images: [
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
    ],
    category: "Ramadhan",
  },
  {
    id: 2,
    title: "Santunan Anak Yatim",
    description:
      "Program pemberian santunan dan paket kebutuhan kepada anak-anak yatim.",
    date: "20 Februari 2024",
    location: "Depok",
    coordinates: { lat: -6.4025, lng: 106.7942 },
    images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
    ],
    category: "Santunan",
  },
  {
    id: 3,
    title: "Bersih-Bersih Lingkungan",
    description:
      "Kegiatan gotong royong membersihkan lingkungan RW dan area taman bermain.",
    date: "5 Januari 2024",
    location: "Tangerang Selatan",
    coordinates: { lat: -6.2907, lng: 106.7227 },
    images: [
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
    ],
    category: "Sosial",
  },
  {
    id: 4,
    title: "Pelatihan Literasi Digital",
    description:
      "Pengenalan keamanan digital dan penggunaan teknologi kepada warga.",
    date: "10 April 2024",
    location: "Kantor Kelurahan Cilandak",
    coordinates: { lat: -6.2897, lng: 106.7997 },
    images: [
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
    ],
    category: "Pendidikan",
  },
  {
    id: 5,
    title: "Pemeriksaan Kesehatan Gratis",
    description:
      "Pemeriksaan kesehatan meliputi tensi darah, gula darah, dan konsultasi dokter.",
    date: "28 Mei 2024",
    location: "Puskesmas Kemang",
    coordinates: { lat: -6.2576, lng: 106.8201 },
    images: [
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
    ],
    category: "Kesehatan",
  },
  {
    id: 6,
    title: "Kelas Mengaji Anak",
    description:
      "Pembinaan dan edukasi membaca Al-Qur'an untuk anak-anak usia 6–12 tahun.",
    date: "1 Mei 2024",
    location: "TPA Darussalam, Bekasi",
    coordinates: { lat: -6.2476, lng: 107.0031 },
    images: [
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
    ],
    category: "Keagamaan",
  },
];

// FlyTo Component
function FlyToLocation({ coords }: any) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 14, { duration: 1.2 });
  }, [coords]);
  return null;
}

export default function Peta() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // AUTOPLAY SLIDER
  useEffect(() => {
    if (!selectedLocation) return;
    const total = selectedLocation.images.length;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % total);
    }, 2800);
    return () => clearInterval(timer);
  }, [selectedLocation]);

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
                  center={[-6.2088, 106.8456]}
                  zoom={10}
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
                          <div className="font-semibold">{loc.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {loc.location}
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
                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <Badge variant="highlight" className="text-xs">
                      {selectedLocation.category}
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
                    {selectedLocation.title}
                  </CardTitle>

                  <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
                    {selectedLocation.date}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {/* DESCRIPTION */}
                  <p className="text-xs sm:text-sm text-muted-foreground font-nunito">
                    {selectedLocation.description}
                  </p>

                  {/* LOCATION */}
                  <div className="flex items-start gap-2 text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 text-highlight shrink-0" />
                    <span>{selectedLocation.location}</span>
                  </div>

                  {/* AUTOPLAY SLIDER */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                      <Camera className="w-4 h-4" /> Dokumentasi
                    </div>

                    <div className="relative w-full overflow-hidden rounded-xl">
                      <motion.div
                        className="flex"
                        animate={{ x: `-${slideIndex * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        {selectedLocation.images.map(
                          (img: string, i: number) => (
                            <img
                              key={i}
                              src={img}
                              alt={`${selectedLocation.title} - ${i + 1}`}
                              className="w-full h-48 sm:h-64 object-cover rounded-xl flex-shrink-0"
                            />
                          )
                        )}
                      </motion.div>

                      {/* Bullet Indicator */}
                      <div className="flex justify-center gap-2 sm:gap-3 mt-3">
                        {selectedLocation.images.map((_: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setSlideIndex(idx)}
                            className={`rounded-full transition-all ${
                              slideIndex === idx
                                ? "w-3 h-3 sm:w-4 sm:h-4 bg-orange-500"
                                : "w-2 h-2 sm:w-3 sm:h-3 bg-gray-300"
                            }`}
                            aria-label={`Slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
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
                                {loc.title}
                              </h4>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                {loc.location}
                              </p>

                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] sm:text-xs"
                                >
                                  {loc.category}
                                </Badge>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  {loc.date}
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
    </div>
  );
}
