import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Users, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Activity, ModalMode } from "@/types";
import { formatDate } from "@/utils/formatters";

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

  useEffect(() => {
    if (activity && (mode === "edit" || mode === "view")) {
      setFormData({
        title: activity.title,
        description: activity.description,
        date: activity.date,
        location: activity.location,
        participants: activity.participants,
        status: activity.status,
        image: activity.image,
      });
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
    }
  }, [activity, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

                    {/* Image Preview (if exists) */}
                    {formData.image && (
                      <div className="pt-2">
                        <label className="block text-sm font-semibold mb-2.5">
                          Foto Kegiatan
                        </label>
                        <div className="rounded-xl border-2 border-foreground/10 overflow-hidden">
                          <img
                            src={formData.image}
                            alt={formData.title}
                            className="w-full h-48 object-cover"
                          />
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

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Lokasi <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            })
                          }
                          placeholder="Contoh: Masjid Al-Ikhlas, Yogyakarta"
                          className="h-11"
                          required
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Status Kegiatan
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {statuses.map((status) => (
                            <Button
                              key={status.value}
                              type="button"
                              variant={
                                formData.status === status.value
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="h-10 text-xs sm:text-sm"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  status: status.value as Activity["status"],
                                })
                              }
                            >
                              {status.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Upload Foto */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Upload Foto{" "}
                          <span className="text-muted-foreground text-xs font-normal">
                            (Opsional)
                          </span>
                        </label>
                        <div className="border-2 border-dashed border-foreground/20 rounded-xl p-6 sm:p-8 text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Camera className="w-6 h-6 text-accent" />
                          </div>
                          <p className="text-sm font-medium mb-1">
                            Klik untuk upload atau drag & drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, JPEG maksimal 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 mt-6 border-t-2 border-foreground/10">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11"
                        onClick={onClose}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        variant="accent"
                        className="flex-1 h-11"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {mode === "create"
                          ? "Tambah Kegiatan"
                          : "Simpan Perubahan"}
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
