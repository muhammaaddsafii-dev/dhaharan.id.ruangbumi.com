import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Check, X, Mail, Phone, Briefcase, Calendar, Pencil, Trash2 } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VolunteerAPI, KegiatanAPI } from "@/types";
import { formatDate } from "@/utils/formatters";
import { volunteerAPI, kegiatanAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

/* ================= STATUS CONFIG ================= */
const statusConfig = {
  pending: { label: "Menunggu", variant: "default" as const },
  approved: { label: "Diterima", variant: "accent" as const },
};

export default function VolunteersView() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [volunteers, setVolunteers] = useState<VolunteerAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerAPI | null>(null);
  const [kegiatanList, setKegiatanList] = useState<KegiatanAPI[]>([]);
  const [isLoadingKegiatan, setIsLoadingKegiatan] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    phone: "",
    skill: "",
    motivasi: "",
    kegiatan: "",
    is_approved: false,
  });

  // Load volunteers data
  useEffect(() => {
    loadVolunteers();
    loadKegiatan();
  }, []);

  const loadVolunteers = async () => {
    try {
      setIsLoading(true);
      const data = await volunteerAPI.getAll();
      setVolunteers(data);
    } catch (error) {
      console.error("Error loading volunteers:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data volunteer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadKegiatan = async () => {
    try {
      setIsLoadingKegiatan(true);
      const data = await kegiatanAPI.getAll();
      const upcomingKegiatan = data.filter(k => k.status_kegiatan === 1);
      setKegiatanList(upcomingKegiatan);
    } catch (error) {
      console.error("Error loading kegiatan:", error);
    } finally {
      setIsLoadingKegiatan(false);
    }
  };

  /* ================= HANDLER ================= */
  const onApprove = async (id: number) => {
    try {
      await volunteerAPI.approve(id);
      toast({
        title: "Volunteer Diterima",
        description: "Volunteer berhasil diterima",
      });
      loadVolunteers();
    } catch (error) {
      console.error("Error approving volunteer:", error);
      toast({
        title: "Error",
        description: "Gagal menerima volunteer",
        variant: "destructive",
      });
    }
  };

  const onDelete = async (id: number, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus volunteer ${nama}?`)) {
      return;
    }

    try {
      await volunteerAPI.delete(id);
      toast({
        title: "Volunteer Dihapus",
        description: "Data volunteer berhasil dihapus",
      });
      loadVolunteers();
    } catch (error) {
      console.error("Error deleting volunteer:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus volunteer",
        variant: "destructive",
      });
    }
  };

  const onEdit = (volunteer: VolunteerAPI) => {
    setEditingVolunteer(volunteer);
    setFormData({
      nama: volunteer.nama,
      email: volunteer.email,
      phone: volunteer.phone,
      skill: volunteer.skill,
      motivasi: volunteer.motivasi,
      kegiatan: volunteer.kegiatan.toString(),
      is_approved: volunteer.is_approved,
    });
    setIsModalOpen(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingVolunteer) return;

    try {
      const updateData = {
        nama: formData.nama,
        email: formData.email,
        phone: formData.phone,
        skill: formData.skill,
        motivasi: formData.motivasi,
        kegiatan: parseInt(formData.kegiatan),
        is_approved: formData.is_approved,
      };

      await volunteerAPI.update(editingVolunteer.id!, updateData);
      
      toast({
        title: "Data Diperbarui",
        description: "Data volunteer berhasil diperbarui",
      });

      setIsModalOpen(false);
      setEditingVolunteer(null);
      loadVolunteers();
    } catch (error) {
      console.error("Error updating volunteer:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data volunteer",
        variant: "destructive",
      });
    }
  };

  const filteredVolunteers = volunteers
    .filter((v) => {
      if (filter === "all") return true;
      if (filter === "pending") return !v.is_approved;
      if (filter === "approved") return v.is_approved;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() - 
        new Date(a.created_at || "").getTime()
    );

  const pendingCount = volunteers.filter((v) => !v.is_approved).length;
  const approvedCount = volunteers.filter((v) => v.is_approved).length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center animate-pulse">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Memuat data volunteer...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* ================= HEADER - RESPONSIVE ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="font-fredoka text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
          Pengajuan Volunteer
        </h1>
        <p className="text-muted-foreground font-nunito text-xs sm:text-sm md:text-base">
          Kelola dan review pengajuan volunteer
        </p>
      </motion.div>

      {/* ================= SUMMARY - RESPONSIVE ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-secondary">
            <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-primary border-2 border-foreground shadow-cartoon-sm flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-70 truncate">
                  Menunggu Review
                </p>
                <p className="font-fredoka text-xl sm:text-2xl font-bold">
                  {pendingCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-accent">
            <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-card border-2 border-foreground shadow-cartoon flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-70 text-accent-foreground truncate">
                  Volunteer Aktif
                </p>
                <p className="font-fredoka text-xl sm:text-2xl font-bold text-accent-foreground">
                  {approvedCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ================= FILTER - RESPONSIVE ================= */}
      <div className="flex gap-2 flex-wrap mb-4 sm:mb-6 overflow-x-auto pb-1">
        {(["all", "pending", "approved"] as const).map((status) => (
          <Button
            key={status}
            size="sm"
            variant={filter === status ? "secondary" : "outline"}
            onClick={() => setFilter(status)}
            className="h-9 sm:h-10 text-xs sm:text-sm shrink-0"
          >
            {status === "all" ? "Semua" : statusConfig[status].label}
          </Button>
        ))}
      </div>

      {/* ================= LIST - RESPONSIVE ================= */}
      {filteredVolunteers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {filteredVolunteers.map((v, index) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-cartoon transition-all h-full">
                <CardContent className="p-4 sm:p-5 space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-fredoka text-base sm:text-lg font-bold truncate">
                        {v.nama}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {v.created_at ? formatDate(v.created_at) : "-"}
                      </p>
                    </div>
                    <Badge
                      variant={v.is_approved ? "accent" : "default"}
                      className="text-[10px] sm:text-xs shrink-0"
                    >
                      {v.is_approved ? "Diterima" : "Menunggu"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">{v.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      {v.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">{v.skill}</span>
                    </div>
                    {v.kegiatan_detail && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate">
                          {v.kegiatan_detail.nama} - {formatDate(v.kegiatan_detail.tanggal)}
                        </span>
                      </div>
                    )}
                    {v.motivasi && v.motivasi !== "-" && (
                      <div className="pt-2 border-t">
                        <p className="text-[10px] sm:text-xs font-semibold mb-1">Motivasi:</p>
                        <p className="text-[10px] sm:text-xs line-clamp-2">{v.motivasi}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {!v.is_approved && (
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-400 hover:bg-emerald-500 h-9 sm:h-10 text-xs sm:text-sm"
                        onClick={() => onApprove(v.id!)}
                      >
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Terima
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 sm:h-10 text-xs sm:text-sm px-3"
                      onClick={() => onEdit(v)}
                    >
                      <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-9 sm:h-10 text-xs sm:text-sm px-3"
                      onClick={() => onDelete(v.id!, v.nama)}
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 text-muted-foreground">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Belum ada pengajuan volunteer</p>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-full max-w-2xl bg-card border-2 border-foreground rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-fredoka text-xl font-bold">Edit Volunteer</h2>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmitEdit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-nama">Nama Lengkap *</Label>
                        <Input
                          id="edit-nama"
                          value={formData.nama}
                          onChange={(e) =>
                            setFormData({ ...formData, nama: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-email">Email *</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-phone">Nomor Telepon *</Label>
                        <Input
                          id="edit-phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-skill">Keahlian</Label>
                        <Input
                          id="edit-skill"
                          value={formData.skill}
                          onChange={(e) =>
                            setFormData({ ...formData, skill: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-kegiatan">Kegiatan *</Label>
                      {isLoadingKegiatan ? (
                        <div className="h-11 border-2 border-input rounded-xl flex items-center justify-center bg-secondary/20">
                          <span className="text-sm text-muted-foreground">Memuat...</span>
                        </div>
                      ) : (
                        <Select
                          value={formData.kegiatan}
                          onValueChange={(value) =>
                            setFormData({ ...formData, kegiatan: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kegiatan" />
                          </SelectTrigger>
                          <SelectContent>
                            {kegiatanList.map((kegiatan) => (
                              <SelectItem
                                key={kegiatan.id}
                                value={kegiatan.id!.toString()}
                              >
                                {kegiatan.nama} - {formatDate(kegiatan.tanggal)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-motivasi">Motivasi</Label>
                      <Textarea
                        id="edit-motivasi"
                        value={formData.motivasi}
                        onChange={(e) =>
                          setFormData({ ...formData, motivasi: e.target.value })
                        }
                        rows={4}
                      />
                    </div>

                    {/* Status Approval */}
                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-foreground bg-secondary/20">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          id="edit-is-approved"
                          checked={formData.is_approved}
                          onChange={(e) =>
                            setFormData({ ...formData, is_approved: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-2 border-foreground accent-primary cursor-pointer"
                        />
                        <Label htmlFor="edit-is-approved" className="font-semibold cursor-pointer">
                          Volunteer Disetujui
                        </Label>
                      </div>
                      <Badge variant={formData.is_approved ? "accent" : "default"} className="shrink-0">
                        {formData.is_approved ? "Diterima" : "Menunggu"}
                      </Badge>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit" className="flex-1">
                        Simpan Perubahan
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
