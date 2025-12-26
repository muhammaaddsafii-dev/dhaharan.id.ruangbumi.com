import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Tag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CashflowItem, ModalMode } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface CashflowModalProps {
  isOpen: boolean;
  mode: ModalMode;
  item: CashflowItem | null;
  onClose: () => void;
  onSave: (item: Omit<CashflowItem, "id" | "createdAt">) => void;
}

const categories = [
  "Donasi",
  "Operasional",
  "Transport",
  "Perlengkapan",
  "Lainnya",
];

export default function CashflowModal({
  isOpen,
  mode,
  item,
  onClose,
  onSave,
}: CashflowModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: 0,
    type: "income" as CashflowItem["type"],
    category: "Donasi",
    date: "",
  });

  useEffect(() => {
    if (item && (mode === "edit" || mode === "view")) {
      setFormData({
        title: item.title,
        description: item.description,
        amount: item.amount,
        type: item.type,
        category: item.category,
        date: item.date,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        amount: 0,
        type: "income",
        category: "Donasi",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [item, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isViewMode = mode === "view";
  const isIncome = formData.type === "income";

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
              className="w-full max-w-lg bg-card border-2 border-foreground rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            >
              {/* Header - Sticky */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-foreground shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border-2 border-foreground shadow-cartoon-sm flex items-center justify-center ${
                      mode === "create" || mode === "edit"
                        ? "bg-primary"
                        : isIncome
                        ? "bg-accent"
                        : "bg-highlight"
                    }`}
                  >
                    {mode === "view" ? (
                      isIncome ? (
                        <TrendingUp className="w-5 h-5 text-accent-foreground" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-highlight-foreground" />
                      )
                    ) : (
                      <TrendingUp className="w-5 h-5 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-fredoka text-base sm:text-lg font-bold">
                      {mode === "create"
                        ? "Tambah Transaksi"
                        : mode === "edit"
                        ? "Edit Transaksi"
                        : "Detail Transaksi"}
                    </h2>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {isViewMode
                        ? "Informasi lengkap transaksi"
                        : "Isi data dengan lengkap"}
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
                    {/* Amount Section */}
                    <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-foreground bg-secondary/30">
                      <div
                        className={`w-14 h-14 rounded-xl border-2 border-foreground shadow-cartoon-sm flex items-center justify-center shrink-0 ${
                          isIncome ? "bg-accent" : "bg-highlight"
                        }`}
                      >
                        {isIncome ? (
                          <TrendingUp className="w-7 h-7 text-accent-foreground" />
                        ) : (
                          <TrendingDown className="w-7 h-7 text-highlight-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge
                          variant={isIncome ? "accent" : "highlight"}
                          className="mb-2"
                        >
                          {isIncome ? "Pemasukan" : "Pengeluaran"}
                        </Badge>
                        <p
                          className={`font-fredoka text-2xl sm:text-3xl font-bold ${
                            isIncome ? "text-accent" : "text-highlight"
                          }`}
                        >
                          {isIncome ? "+" : "-"}{" "}
                          {formatCurrency(formData.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-fredoka text-xl sm:text-2xl font-bold mb-2">
                        {formData.title}
                      </h3>
                      {formData.description && (
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {formData.description}
                        </p>
                      )}
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-3 pt-4 border-t-2 border-foreground/10">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-foreground/10">
                        <Tag className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Kategori
                          </p>
                          <p className="font-semibold text-sm">
                            {formData.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-foreground/10">
                        <Calendar className="w-5 h-5 text-accent shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Tanggal
                          </p>
                          <p className="font-semibold text-sm">
                            {formatDate(formData.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* EDIT/CREATE MODE */
                  <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-5">
                      {/* Transaction Type */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Tipe Transaksi{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <Button
                            type="button"
                            variant={
                              formData.type === "income" ? "accent" : "outline"
                            }
                            className="h-11 justify-center"
                            onClick={() =>
                              setFormData({ ...formData, type: "income" })
                            }
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Pemasukan
                          </Button>
                          <Button
                            type="button"
                            variant={
                              formData.type === "expense"
                                ? "highlight"
                                : "outline"
                            }
                            className="h-11 justify-center"
                            onClick={() =>
                              setFormData({ ...formData, type: "expense" })
                            }
                          >
                            <TrendingDown className="w-4 h-4 mr-2" />
                            Pengeluaran
                          </Button>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Judul <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="Contoh: Donasi Pak Ahmad"
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
                          placeholder="Jelaskan detail transaksi (opsional)"
                          className="min-h-[100px] resize-none"
                        />
                      </div>

                      {/* Amount & Date Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2.5">
                            Jumlah (Rp){" "}
                            <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="number"
                            value={formData.amount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                amount: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                            className="h-11"
                            min={0}
                            required
                          />
                        </div>
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
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          Kategori
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => (
                            <Button
                              key={cat}
                              type="button"
                              variant={
                                formData.category === cat
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="h-9 px-4"
                              onClick={() =>
                                setFormData({ ...formData, category: cat })
                              }
                            >
                              {cat}
                            </Button>
                          ))}
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
                        {mode === "create"
                          ? "Tambah Transaksi"
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
