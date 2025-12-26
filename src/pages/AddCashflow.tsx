import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Wallet, Search, TrendingUp, TrendingDown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CashflowCard from "@/components/cashflow/CashflowCard";
import CashflowModal from "@/components/cashflow/CashflowModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { initialCashflow } from "@/data/mockData";
import { CashflowItem, ModalMode } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "@/hooks/use-toast";

export default function Cashflow() {
  const [cashflow, setCashflow] = useLocalStorage<CashflowItem[]>(
    "cashflow",
    initialCashflow
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedItem, setSelectedItem] = useState<CashflowItem | null>(null);

  const filteredCashflow = cashflow.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalIncome = cashflow
    .filter((c) => c.type === "income")
    .reduce((sum, c) => sum + c.amount, 0);
  const totalExpense = cashflow
    .filter((c) => c.type === "expense")
    .reduce((sum, c) => sum + c.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleCreate = () => {
    setModalMode("create");
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleView = (item: CashflowItem) => {
    setModalMode("view");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleEdit = (item: CashflowItem) => {
    setModalMode("edit");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCashflow(cashflow.filter((c) => c.id !== id));
    toast({
      title: "Transaksi Dihapus",
      description: "Transaksi berhasil dihapus dari daftar.",
    });
  };

  const handleSave = (data: Omit<CashflowItem, "id" | "createdAt">) => {
    if (modalMode === "create") {
      const newItem: CashflowItem = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCashflow([newItem, ...cashflow]);
      toast({
        title: "Transaksi Ditambahkan! 💰",
        description: "Transaksi baru berhasil ditambahkan.",
      });
    } else if (modalMode === "edit" && selectedItem) {
      setCashflow(
        cashflow.map((c) => (c.id === selectedItem.id ? { ...c, ...data } : c))
      );
      toast({
        title: "Transaksi Diperbarui",
        description: "Perubahan berhasil disimpan.",
      });
    }
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout>
      {/* Header - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary border-2 border-foreground shadow-cartoon flex items-center justify-center shrink-0"
            >
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="font-fredoka text-xl sm:text-2xl md:text-3xl font-bold truncate">
                Cashflow
              </h1>
              <p className="text-muted-foreground font-nunito text-xs sm:text-sm">
                Kelola keuangan organisasi
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            className="w-full sm:w-auto h-10 sm:h-11"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="ml-1 sm:ml-2">Tambah Transaksi</span>
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards - Responsive */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-accent">
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-accent-foreground/80 truncate">
                    Pemasukan
                  </p>
                  <p className="font-fredoka text-xs sm:text-lg md:text-xl font-bold text-accent-foreground truncate">
                    {formatCurrency(totalIncome)
                      .replace(/\s/g, "")
                      .replace("Rp", "")
                      .substring(0, 8)}
                  </p>
                </div>
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-accent-foreground/60 shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-highlight">
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-highlight-foreground/80 truncate">
                    Pengeluaran
                  </p>
                  <p className="font-fredoka text-xs sm:text-lg md:text-xl font-bold text-highlight-foreground truncate">
                    {formatCurrency(totalExpense)
                      .replace(/\s/g, "")
                      .replace("Rp", "")
                      .substring(0, 8)}
                  </p>
                </div>
                <TrendingDown className="w-4 h-4 sm:w-6 sm:h-6 text-highlight-foreground/60 shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-secondary">
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-secondary-foreground/80 truncate">
                    Saldo
                  </p>
                  <p
                    className={`font-fredoka text-xs sm:text-lg md:text-xl font-bold truncate ${
                      balance >= 0 ? "text-accent" : "text-highlight"
                    }`}
                  >
                    {formatCurrency(balance)
                      .replace(/\s/g, "")
                      .replace("Rp", "")
                      .substring(0, 8)}
                  </p>
                </div>
                <Wallet className="w-4 h-4 sm:w-6 sm:h-6 text-secondary-foreground/60 shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6"
      >
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 sm:pl-12 h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
            className="h-10 sm:h-11 text-xs sm:text-sm shrink-0"
          >
            Semua
          </Button>
          <Button
            variant={filterType === "income" ? "accent" : "outline"}
            size="sm"
            onClick={() => setFilterType("income")}
            className="h-10 sm:h-11 text-xs sm:text-sm shrink-0"
          >
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Pemasukan
          </Button>
          <Button
            variant={filterType === "expense" ? "highlight" : "outline"}
            size="sm"
            onClick={() => setFilterType("expense")}
            className="h-10 sm:h-11 text-xs sm:text-sm shrink-0"
          >
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Pengeluaran
          </Button>
        </div>
      </motion.div>

      {/* Cashflow List */}
      {filteredCashflow.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {filteredCashflow.map((item, index) => (
            <CashflowCard
              key={item.id}
              item={item}
              index={index}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="py-12 sm:py-16 text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center">
                <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <h3 className="font-fredoka text-base sm:text-lg font-semibold mb-2">
                {searchQuery || filterType !== "all"
                  ? "Tidak Ada Hasil"
                  : "Belum Ada Transaksi"}
              </h3>
              <p className="text-muted-foreground font-nunito text-xs sm:text-sm mb-4">
                {searchQuery || filterType !== "all"
                  ? "Coba filter lain"
                  : "Tambahkan transaksi pertama Anda"}
              </p>
              {!searchQuery && filterType === "all" && (
                <Button onClick={handleCreate} className="h-10 sm:h-11">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="ml-1 sm:ml-2">Tambah Transaksi</span>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modal */}
      <CashflowModal
        isOpen={isModalOpen}
        mode={modalMode}
        item={selectedItem}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
