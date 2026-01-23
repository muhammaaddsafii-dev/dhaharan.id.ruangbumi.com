import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, User, Mail, Phone, MessageSquare, ArrowLeft, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { volunteerAPI, kegiatanAPI } from "@/services/api";
import { KegiatanAPI } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VolunteerSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skill: "",
    motivation: "",
    kegiatan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kegiatanList, setKegiatanList] = useState<KegiatanAPI[]>([]);
  const [isLoadingKegiatan, setIsLoadingKegiatan] = useState(true);

  // Load kegiatan dengan status "Akan Datang" (status_kegiatan = 1)
  useEffect(() => {
    const loadKegiatan = async () => {
      try {
        setIsLoadingKegiatan(true);
        const data = await kegiatanAPI.getAll();
        // Filter hanya kegiatan dengan status_kegiatan = 1 (Akan Datang)
        const upcomingKegiatan = data.filter(k => k.status_kegiatan === 1);
        setKegiatanList(upcomingKegiatan);
      } catch (error) {
        console.error("Error loading kegiatan:", error);
        toast({
          title: "Error",
          description: "Gagal memuat daftar kegiatan",
          variant: "destructive",
        });
      } finally {
        setIsLoadingKegiatan(false);
      }
    };

    loadKegiatan();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.kegiatan) {
      toast({
        title: "Lengkapi data",
        description: "Mohon lengkapi nama, email, nomor telepon, dan pilih kegiatan",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const volunteerData = {
        nama: formData.name,
        email: formData.email,
        phone: formData.phone,
        skill: formData.skill || "-",
        motivasi: formData.motivation || "-",
        kegiatan: parseInt(formData.kegiatan),
      };

      await volunteerAPI.create(volunteerData);

      toast({
        title: "Pendaftaran Berhasil! 🎉",
        description:
          "Terima kasih telah mendaftar sebagai volunteer. Tim kami akan menghubungi Anda segera.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        skill: "",
        motivation: "",
        kegiatan: "",
      });
    } catch (error: any) {
      console.error("Error submitting volunteer:", error);
      toast({
        title: "Gagal mendaftar",
        description: error.response?.data?.message || "Terjadi kesalahan saat mendaftar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="volunteer"
      className="py-24 bg-accent/20 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-primary/30 rounded-3xl rotate-12 -z-10" />
      <div className="absolute bottom-10 right-20 w-32 h-32 bg-secondary/50 blob-shape -z-10" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-accent/30 border-2 border-foreground shadow-cartoon-sm mb-4">
            <span className="font-fredoka font-semibold">Volunteer</span>
          </div>
          <h2 className="font-fredoka text-3xl md:text-5xl font-bold mb-4">
            Bergabung Sebagai <span className="text-accent">Volunteer</span>
          </h2>
          <p className="font-nunito text-lg text-muted-foreground max-w-2xl mx-auto">
            Jadilah bagian dari tim dhaharan.id dan berkontribusi langsung dalam
            kegiatan sosial kami.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Button Kembali */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent border-2 border-foreground shadow-cartoon-sm flex items-center justify-center">
                    <Users className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle>Form Pendaftaran Volunteer</CardTitle>
                    <CardDescription>
                      Isi data diri dan keahlian Anda
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="font-fredoka text-base mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nama Lengkap *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Masukkan nama lengkap"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-fredoka text-base mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="font-fredoka text-base mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Nomor Telepon *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="skill" className="font-fredoka text-base mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Keahlian yang Anda miliki
                      </Label>
                      <Input
                        id="skill"
                        name="skill"
                        placeholder="Contoh: Memasak, Fotografi, dll"
                        value={formData.skill}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Pilih Kegiatan */}
                  <div>
                    <Label htmlFor="kegiatan" className="font-fredoka text-base mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Pilih Kegiatan *
                    </Label>
                    {isLoadingKegiatan ? (
                      <div className="h-11 border-2 border-input rounded-xl flex items-center justify-center bg-secondary/20">
                        <span className="text-sm text-muted-foreground">Memuat kegiatan...</span>
                      </div>
                    ) : kegiatanList.length === 0 ? (
                      <div className="h-11 border-2 border-input rounded-xl flex items-center justify-center bg-secondary/20">
                        <span className="text-sm text-muted-foreground">Belum ada kegiatan yang akan datang</span>
                      </div>
                    ) : (
                      <Select
                        value={formData.kegiatan}
                        onValueChange={(value) => setFormData({ ...formData, kegiatan: value })}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Pilih kegiatan yang ingin diikuti" />
                        </SelectTrigger>
                        <SelectContent>
                          {kegiatanList.map((kegiatan) => (
                            <SelectItem key={kegiatan.id} value={kegiatan.id!.toString()}>
                              {kegiatan.nama} - {new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { 
                                day: 'numeric',
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Motivation */}
                  <div>
                    <Label htmlFor="motivation" className="font-fredoka text-base mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Motivasi bergabung
                    </Label>
                    <Textarea
                      id="motivation"
                      name="motivation"
                      placeholder="Ceritakan mengapa Anda ingin menjadi volunteer di dhaharan.id..."
                      value={formData.motivation}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="w-full text-lg"
                    disabled={isSubmitting || kegiatanList.length === 0}
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Users className="w-5 h-5" />
                        Daftar Sebagai Volunteer
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
