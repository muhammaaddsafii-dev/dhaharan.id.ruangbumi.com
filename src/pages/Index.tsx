import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Map, Users, Heart, Wallet } from "lucide-react";
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



const features = [
  {
    icon: Calendar,
    title: "Agenda Kegiatan",
    description: "Lihat jadwal dan agenda kegiatan komunitas yang akan datang",
    link: "/kegiatan",
    color: "bg-highlight",
  },
  {
    icon: Wallet,
    title: "Cashflow Transparan",
    description:
      "Transparansi pengelolaan dana komunitas untuk kepercayaan bersama",
    link: "/cashflow",
    color: "bg-accent",
  },
  {
    icon: Map,
    title: "Peta Kegiatan",
    description: "Jelajahi lokasi-lokasi kegiatan yang telah dilaksanakan",
    link: "/peta",
    color: "bg-primary",
  },
];

// DATA SLIDER PENGURUS
const pengurus = [
  {
    id: 1,
    nama: "Lorem Ipsum",
    jabatan: "Ketua Komunitas",
    foto: "https://s3.ap-southeast-1.amazonaws.com/cdn.ruangbumi.com/assets/dhaharan/tim-1.jpg"
  },
  {
    id: 2,
    nama: "Lorem Ipsum",
    jabatan: "Sekretaris",
    foto: "https://s3.ap-southeast-1.amazonaws.com/cdn.ruangbumi.com/assets/dhaharan/tim-2.jpg"
  },
  {
    id: 3,
    nama: "Lorem Ipsum",
    jabatan: "Koordinator Lapangan",
    foto: "https://s3.ap-southeast-1.amazonaws.com/cdn.ruangbumi.com/assets/dhaharan/tim-3.jpg",
  },
  {
    id: 4,
    nama: "Lorem Ipsum",
    jabatan: "Koordinator Lapangan",
    foto: "https://s3.ap-southeast-1.amazonaws.com/cdn.ruangbumi.com/assets/dhaharan/tim-4.jpg",
  },
  {
    id: 5,
    nama: "Lorem Ipsum",
    jabatan: "Koordinator Lapangan",
    foto: "https://s3.ap-southeast-1.amazonaws.com/cdn.ruangbumi.com/assets/dhaharan/tim-5.jpg",
  },
];

export default function Index() {
  const [current, setCurrent] = useState(0);
  const [recentActivities, setRecentActivities] = useState<KegiatanAPI[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  // Load 3 kegiatan terbaru
  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        setIsLoadingActivities(true);
        const allKegiatan = await kegiatanAPI.getAll();
        
        // Sort by tanggal descending dan ambil 3 terbaru
        const sorted = allKegiatan
          .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
          .slice(0, 3);
        
        setRecentActivities(sorted);
      } catch (error) {
        console.error("Error loading recent activities:", error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    loadRecentActivities();
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % pengurus.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('src/assets/hero-bg.jpg')",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6" variant="highlight">
                🌟 Komunitas Sosial Indonesia
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-fredoka text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Bersama{" "}
              <span className="text-highlight relative inline-block">
                Dhaharan
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 8C50 4 150 4 198 8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              Berbagi Kebaikan
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-nunito text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Komunitas sosial yang berfokus pada kegiatan dan agenda sosial
              untuk membangun kebersamaan, kepedulian, dan semangat berbagi.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/kegiatan">
                <Button size="xl">
                  Lihat Kegiatan <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/volunteersection">
                <Button size="xl" variant="outline">
                  Gabung Sekarang
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">Informasi</Badge>
            <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-4">
              Jelajahi Komunitas Kami
            </h2>
            <p className="font-nunito text-muted-foreground max-w-2xl mx-auto">
              Transparansi informasi untuk semua yang berpartisipasi dalam
              kegiatan komunitas Dhaharan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={feature.link}>
                    <Card className="h-full group cursor-pointer hover:shadow-cartoon-lg transition-shadow">
                      <CardHeader>
                        <div
                          className={`w-14 h-14 rounded-2xl ${feature.color} border-2 border-foreground shadow-cartoon-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-7 h-7" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center gap-2 text-highlight font-fredoka font-semibold text-sm group-hover:gap-3 transition-all">
                          Selengkapnya <ArrowRight className="w-4 h-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Activities Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge className="mb-4" variant="accent">
                Kegiatan Terbaru
              </Badge>
              <h2 className="font-fredoka text-3xl md:text-4xl font-bold">
                Aktivitas Terakhir Kami
              </h2>
            </div>
            <Link to="/kegiatan">
              <Button variant="outline">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {isLoadingActivities ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden h-full">
                  <div className="aspect-video bg-secondary animate-pulse" />
                  <CardHeader>
                    <div className="h-6 bg-secondary animate-pulse rounded mb-2" />
                    <div className="h-4 bg-secondary animate-pulse rounded w-3/4" />
                  </CardHeader>
                </Card>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden h-full group hover:shadow-cartoon-lg transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      {activity.foto && activity.foto.length > 0 ? (
                        <img
                          src={activity.foto[0].file_path}
                          alt={activity.nama}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge
                        className="absolute top-3 left-3"
                        variant="highlight"
                      >
                        {activity.jenis_kegiatan_detail?.nama || "Kegiatan"}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">
                        {activity.nama}
                      </CardTitle>
                      <CardDescription className="flex flex-col gap-1">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> {formatDate(activity.tanggal)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Map className="w-4 h-4" /> 
                          Lat: {activity.lokasi.coordinates[1].toFixed(4)}, 
                          Lng: {activity.lokasi.coordinates[0].toFixed(4)}
                        </span>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                Belum ada kegiatan
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ⭐ STRUKTUR PENGURUS */}
      <section className="py-24 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 relative overflow-hidden">
        {/* Aksen Blur Background */}
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-accent/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-4" variant="accent">
            Struktur Pengurus
          </Badge>
          <h2 className="font-fredoka text-3xl md:text-4xl font-bold">
            Pengurus Dhaharan
          </h2>
          <p className="font-nunito text-muted-foreground max-w-xl mx-auto mt-3">
            Orang-orang hebat di balik berjalannya berbagai kegiatan sosial
            Dhaharan.
          </p>

          {/* Wrapper Slider */}
          <div className="relative w-full max-w-lg mx-auto mt-12 overflow-hidden">
            {/* Card Slide */}
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {pengurus.map((p) => (
                <div key={p.id} className="min-w-full flex justify-center px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-xl shadow-cartoon-lg border-2 border-foreground p-6 sm:p-8 rounded-3xl w-full max-w-sm flex flex-col items-center"
                  >
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        src={p.foto}
                        alt={p.nama}
                        className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <Heart
                          className="w-6 h-6 text-primary-foreground"
                          fill="currentColor"
                        />
                      </div>
                    </motion.div>

                    <h3 className="mt-6 text-xl sm:text-2xl font-semibold font-fredoka">
                      {p.nama}
                    </h3>
                    <Badge variant="secondary" className="mt-2">
                      {p.jabatan}
                    </Badge>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Bullet Indicator */}
            <div className="flex justify-center gap-2 sm:gap-3 mt-8">
              {pengurus.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`transition-all rounded-full ${
                    current === idx
                      ? "w-8 h-3 bg-highlight shadow-md"
                      : "w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-primary border-2 border-foreground shadow-cartoon-lg p-8 md:p-12 text-center overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-4">
                  Siap Berbagi Kebaikan?
                </h2>
                <p className="font-nunito text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                  Bergabunglah bersama kami dalam membangun komunitas yang penuh
                  kepedulian dan semangat berbagi.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/volunteersection">
                    <Button
                      size="xl"
                      variant="outline"
                      className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
                    >
                      Jadi Volunteer
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
