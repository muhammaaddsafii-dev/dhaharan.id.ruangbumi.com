import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Wallet, Search, TrendingUp, TrendingDown, Download, Eye, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CashflowCard from "@/components/cashflow/CashflowCard";
import CashflowModal from "@/components/cashflow/CashflowModal";
import { CashflowItem, ModalMode, TransaksiAPI, TipeTransaksi } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toast } from "@/hooks/use-toast";
import { transaksiAPI, tipeTransaksiAPI } from "@/services/api";

export default function Cashflow() {
  const [cashflow, setCashflow] = useState<CashflowItem[]>([]);
  const [tipeTransaksi, setTipeTransaksi] = useState<TipeTransaksi[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [sortType, setSortType] = useState<"monthly" | "yearly">("monthly");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedItem, setSelectedItem] = useState<CashflowItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Mostrar 5 grupos por página

  // Fungsi untuk mengkonversi TransaksiAPI ke CashflowItem
  const convertToCashflowItem = (transaksi: TransaksiAPI): CashflowItem => {
    const tipeNama = transaksi.tipe_transaksi_detail?.nama || "";
    const type = tipeNama.toLowerCase() === "pemasukan" ? "income" : "expense";

    return {
      id: transaksi.id?.toString() || "",
      title: transaksi.nama,
      description: transaksi.deskripsi,
      amount: Number(transaksi.jumlah),
      type: type,
      date: transaksi.tanggal,
      createdAt: transaksi.created_at || transaksi.tanggal,
    };
  };

  // Fungsi untuk mengkonversi CashflowItem ke TransaksiAPI
  const convertToTransaksiAPI = (item: Omit<CashflowItem, "id" | "createdAt">): Omit<TransaksiAPI, "id"> => {
    // Cari tipe transaksi berdasarkan type
    const tipeNama = item.type === "income" ? "Pemasukan" : "Pengeluaran";
    const tipe = tipeTransaksi.find(t => t.nama === tipeNama);

    return {
      nama: item.title,
      deskripsi: item.description,
      jumlah: item.amount,
      tanggal: item.date,
      tipe_transaksi: tipe?.id || 1, // default ke 1 jika tidak ditemukan
    };
  };

  // Load data awal
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load tipe transaksi terlebih dahulu
        const tipeData = await tipeTransaksiAPI.getAll();
        setTipeTransaksi(tipeData);

        // Load transaksi
        const transaksiData = await transaksiAPI.getAll();
        const cashflowData = transaksiData.map(convertToCashflowItem);
        setCashflow(cashflowData);

        // Load summary
        const summary = await transaksiAPI.getSummary();
        setTotalIncome(Number(summary.total_pemasukan));
        setTotalExpense(Number(summary.total_pengeluaran));
        setBalance(Number(summary.saldo));

      } catch (error) {
        console.error("Error loading cashflow data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data transaksi",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCashflow = cashflow.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || c.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    // Always sort by date descending internally
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Group by month or year
  const groupedCashflow = filteredCashflow.reduce((acc, item) => {
    const date = new Date(item.date);
    let key = "";

    if (sortType === "monthly") {
      key = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    } else { // yearly
      key = date.getFullYear().toString();
    }

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, CashflowItem[]>);

  const handleExport = () => {
    // Assuming backend is running on localhost:8000. 
    // Ideally this URL comes from env or api service configuration
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    window.location.href = `${API_BASE_URL}/transaksi/export_excel/?group_by=${sortType}`;
  };

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

  const handleDelete = async (id: string) => {
    try {
      await transaksiAPI.delete(Number(id));

      // Update local state
      setCashflow(cashflow.filter((c) => c.id !== id));

      // Reload summary
      const summary = await transaksiAPI.getSummary();
      setTotalIncome(Number(summary.total_pemasukan));
      setTotalExpense(Number(summary.total_pengeluaran));
      setBalance(Number(summary.saldo));

      toast({
        title: "Transaksi Dihapus",
        description: "Transaksi berhasil dihapus dari daftar.",
      });
    } catch (error) {
      console.error("Error deleting transaksi:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (data: Omit<CashflowItem, "id" | "createdAt">) => {
    try {
      if (modalMode === "create") {
        const transaksiData = convertToTransaksiAPI(data);
        const newTransaksi = await transaksiAPI.create(transaksiData);
        const newItem = convertToCashflowItem(newTransaksi);

        setCashflow([newItem, ...cashflow]);

        toast({
          title: "Transaksi Ditambahkan! 💰",
          description: "Transaksi baru berhasil ditambahkan.",
        });
      } else if (modalMode === "edit" && selectedItem) {
        const transaksiData = convertToTransaksiAPI(data);
        const updatedTransaksi = await transaksiAPI.update(Number(selectedItem.id), transaksiData);
        const updatedItem = convertToCashflowItem(updatedTransaksi);

        setCashflow(
          cashflow.map((c) => (c.id === selectedItem.id ? updatedItem : c))
        );

        toast({
          title: "Transaksi Diperbarui",
          description: "Perubahan berhasil disimpan.",
        });
      }

      // Reload summary
      const summary = await transaksiAPI.getSummary();
      setTotalIncome(Number(summary.total_pemasukan));
      setTotalExpense(Number(summary.total_pengeluaran));
      setBalance(Number(summary.saldo));

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving transaksi:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center animate-pulse">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Memuat data transaksi...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
                    className={`font-fredoka text-xs sm:text-lg md:text-xl font-bold truncate ${balance >= 0 ? "text-accent" : "text-highlight"
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
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Select value={sortType} onValueChange={(v: "monthly" | "yearly") => setSortType(v)}>
            <SelectTrigger className="w-[140px] h-10 sm:h-11">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="h-10 sm:h-11"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </motion.div>

      {/* Cashflow List */}
      {/* Cashflow List / Table */}
      {filteredCashflow.length > 0 ? (
        filterType === "all" ? (
          <div className="space-y-6">
            {Object.entries(groupedCashflow)
              .sort(([, itemsA], [, itemsB]) => new Date(itemsB[0].date).getTime() - new Date(itemsA[0].date).getTime())
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map(([groupTitle, items]) => (
                <div key={groupTitle} className="space-y-3">
                  <h3 className="font-fredoka text-lg font-semibold text-foreground px-1">{groupTitle}</h3>
                  <div className="rounded-xl border-2 border-foreground shadow-cartoon overflow-hidden bg-card">
                    <Table>
                      <TableHeader className="bg-accent [&_th]:text-accent-foreground text-center">
                        <TableRow className="hover:bg-accent">
                          <TableHead className="w-[50px] text-center">No</TableHead>
                          <TableHead>Nama Transaksi</TableHead>
                          <TableHead className="text-center">Tanggal</TableHead>
                          <TableHead className="text-center">Tipe</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-center font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">{item.description}</div>
                            </TableCell>
                            <TableCell className="text-center">{formatDate(item.date)}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={item.type === 'income' ? 'accent' : 'highlight'}>
                                {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleView(item)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                  <Pencil className="w-4 h-4 text-orange-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}

            {/* Pagination Controls */}
            {Object.keys(groupedCashflow).length > itemsPerPage && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                <div className="flex items-center px-4 font-medium">
                  Halaman {currentPage} dari {Math.ceil(Object.keys(groupedCashflow).length / itemsPerPage)}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(Object.keys(groupedCashflow).length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(Object.keys(groupedCashflow).length / itemsPerPage)}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </div>
        ) : (
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
        )
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
