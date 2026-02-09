// Cashflow.tsx - FULLY RESPONSIVE VERSION

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TransaksiAPI } from "@/types";
import { transaksiAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// ---------------- COMPONENT ----------------
export default function Cashflow() {
  // State untuk data dari backend
  const [transactions, setTransactions] = useState<TransaksiAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load data dari backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [transaksiData, summary] = await Promise.all([
          transaksiAPI.getAll(),
          transaksiAPI.getSummary(),
        ]);

        setTransactions(transaksiData);
        setTotalIncome(Number(summary.total_pemasukan));
        setTotalExpense(Number(summary.total_pengeluaran));
        setBalance(Number(summary.saldo));
      } catch (error) {
        console.error("Error loading cashflow data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data cashflow",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate monthly data untuk chart dari transactions
  const generateMonthlyData = () => {
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const date = new Date(t.tanggal);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('id-ID', { month: 'short' });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }

      const data = monthlyMap.get(monthKey)!;
      const isIncome = t.tipe_transaksi_detail?.nama.toLowerCase() === 'pemasukan';

      if (isIncome) {
        data.income += Number(t.jumlah);
      } else {
        data.expense += Number(t.jumlah);
      }
    });

    // Convert to array and sort by date
    const sortedData = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6) // Last 6 months
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return {
          month: date.toLocaleDateString('id-ID', { month: 'short' }),
          income: data.income,
          expense: data.expense,
        };
      });

    return sortedData;
  };

  const monthlyData = generateMonthlyData();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  let filteredTransactions = transactions
    .filter((t) => {
      if (filter === "all") return true;
      const isIncome = t.tipe_transaksi_detail?.nama.toLowerCase() === "pemasukan";
      return filter === "income" ? isIncome : !isIncome;
    })
    .filter((t) => t.nama.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Sort by date (terbaru dulu)
      return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / itemsPerPage)
  );
  if (currentPage > totalPages) setCurrentPage(totalPages);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt" });
    doc.setFontSize(12);
    doc.text("Laporan Riwayat Transaksi Komunitas", 40, 40);

    autoTable(doc, {
      startY: 60,
      head: [["Tanggal", "Deskripsi", "Tipe", "Jenis", "Jumlah"]],
      body: filteredTransactions.map((t) => [
        formatDate(t.tanggal),
        t.nama,
        t.tipe_transaksi_detail?.nama || "-",
        t.tipe_transaksi_detail?.nama.toLowerCase() === "pemasukan" ? "Masuk" : "Keluar",
        formatCurrency(Number(t.jumlah)),
      ]),
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [30, 64, 175] },
    });

    doc.save("cashflow-transactions.pdf");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center animate-pulse">
            <Wallet className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Memuat data cashflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* HEADER - RESPONSIVE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          <Badge className="mb-2 sm:mb-4 text-xs sm:text-sm" variant="accent">
            <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Transparansi Dana
          </Badge>

          <h1 className="font-fredoka text-2xl sm:text-4xl md:text-5xl font-bold px-2">
            Cashflow Komunitas
          </h1>
          <p className="font-nunito text-xs sm:text-base text-muted-foreground max-w-xl mx-auto mt-1 sm:mt-3 px-4">
            Laporan pemasukan dan pengeluaran yang disusun secara transparan &
            terbuka.
          </p>
        </motion.div>

        {/* SUMMARY CARDS - FULLY RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-cartoon-lg border-2 border-foreground">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <h3 className="font-fredoka font-semibold text-xs sm:text-sm">
                      Saldo
                    </h3>
                  </div>
                </div>
                <p className="font-fredoka text-xl sm:text-3xl font-bold text-primary">
                  {formatCurrency(balance).replace(/\s/g, "")}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Total dana tersedia
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Income Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-cartoon-lg border-2 border-foreground">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    </div>
                    <h3 className="font-fredoka font-semibold text-xs sm:text-sm">
                      Pemasukan
                    </h3>
                  </div>
                </div>
                <p className="font-fredoka text-xl sm:text-3xl font-bold text-accent">
                  {formatCurrency(totalIncome).replace(/\s/g, "")}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Total dana masuk
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expense Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-cartoon-lg border-2 border-foreground">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-highlight/20 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-highlight" />
                    </div>
                    <h3 className="font-fredoka font-semibold text-xs sm:text-sm">
                      Pengeluaran
                    </h3>
                  </div>
                </div>
                <p className="font-fredoka text-xl sm:text-3xl font-bold text-highlight">
                  {formatCurrency(totalExpense).replace(/\s/g, "")}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Total dana keluar
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* MAIN GRID - RESPONSIVE */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8 items-start">
          {/* LEFT – TRANSACTIONS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2 flex flex-col h-full"
          >
            <Card className="flex flex-col h-full shadow-lg">
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Search Bar - Mobile First */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <Input
                      placeholder="Cari transaksi..."
                      className="flex-1 h-9 sm:h-10 text-sm"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                    />

                    {/* <Button
                      size="sm"
                      variant="accent"
                      onClick={exportPDF}
                      className="flex-1 sm:flex-none h-9 text-xs sm:text-sm"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      PDF
                    </Button> */}
                  </div>

                  {/* Filter Buttons - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        size="sm"
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => {
                          setFilter("all");
                          setCurrentPage(1);
                        }}
                        className="flex-1 sm:flex-none h-8 text-xs"
                      >
                        Semua
                      </Button>
                      <Button
                        size="sm"
                        variant={filter === "income" ? "accent" : "outline"}
                        onClick={() => {
                          setFilter("income");
                          setCurrentPage(1);
                        }}
                        className="flex-1 sm:flex-none h-8 text-xs"
                      >
                        Pemasukan
                      </Button>
                      <Button
                        size="sm"
                        variant={filter === "expense" ? "highlight" : "outline"}
                        onClick={() => {
                          setFilter("expense");
                          setCurrentPage(1);
                        }}
                        className="flex-1 sm:flex-none h-8 text-xs"
                      >
                        Pengeluaran
                      </Button>
                    </div>

                    <div className="flex items-center justify-center sm:justify-end gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        Total: {filteredTransactions.length}
                      </Badge>
                      <Badge variant="accent" className="text-xs px-2 py-1">
                        +
                        {formatCurrency(
                          filteredTransactions
                            .filter((t) => t.tipe_transaksi_detail?.nama.toLowerCase() === "pemasukan")
                            .reduce((sum, t) => sum + Number(t.jumlah), 0)
                        ).replace(/\s/g, "")}
                      </Badge>
                      <Badge variant="highlight" className="text-xs px-2 py-1">
                        -
                        {formatCurrency(
                          filteredTransactions
                            .filter((t) => t.tipe_transaksi_detail?.nama.toLowerCase() === "pengeluaran")
                            .reduce((sum, t) => sum + Number(t.jumlah), 0)
                        ).replace(/\s/g, "")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col h-full p-3 sm:p-6">
                <div className="space-y-2.5 sm:space-y-4 flex-1 overflow-auto pr-1">
                  {paginatedTransactions.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Tidak ada transaksi ditemukan.
                    </p>
                  )}

                  {filter === "all" ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Nama Transaksi</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedTransactions.map((transaction) => {
                            const isIncome =
                              transaction.tipe_transaksi_detail?.nama.toLowerCase() ===
                              "pemasukan";
                            return (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatDate(transaction.tanggal)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {transaction.nama}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-normal"
                                  >
                                    {transaction.tipe_transaksi_detail?.nama || "-"}
                                  </Badge>
                                </TableCell>
                                <TableCell
                                  className={`text-right font-bold ${isIncome ? "text-accent" : "text-highlight"
                                    }`}
                                >
                                  {isIncome ? "+" : "-"}
                                  {formatCurrency(Number(transaction.jumlah))}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    paginatedTransactions.map((transaction, i) => {
                      const isIncome =
                        transaction.tipe_transaksi_detail?.nama.toLowerCase() ===
                        "pemasukan";

                      return (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl bg-secondary/50 border-2 border-foreground/10"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div
                              className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl flex items-center justify-center border-2 border-foreground shadow-cartoon-sm ${isIncome ? "bg-accent" : "bg-highlight"
                                }`}
                            >
                              {isIncome ? (
                                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
                              ) : (
                                <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-fredoka font-semibold text-sm sm:text-base truncate">
                                {transaction.nama}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(transaction.tanggal)}</span>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] sm:text-xs px-1.5 py-0"
                                >
                                  {transaction.tipe_transaksi_detail?.nama || "-"}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1">
                            <div
                              className={`font-fredoka font-bold text-base sm:text-lg ${isIncome ? "text-accent" : "text-highlight"
                                }`}
                            >
                              {isIncome ? "+" : "-"}
                              {formatCurrency(Number(transaction.jumlah)).replace(
                                /\s/g,
                                ""
                              )}
                            </div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">
                              {isIncome ? "Pemasukan" : "Pengeluaran"}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Pagination - Responsive */}
                {filteredTransactions.length > itemsPerPage && (
                  <div className="flex justify-center items-center gap-3 sm:gap-4 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      Prev
                    </Button>

                    <div className="text-xs sm:text-sm font-medium">
                      Hal {currentPage} / {totalPages}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT – Charts - RESPONSIVE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 sm:gap-6"
          >
            {/* Bar chart - Responsive */}
            <Card className="shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="font-fredoka text-base sm:text-lg">
                  Grafik Cashflow Per Bulan
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Menampilkan 6 bulan terakhir
                </p>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-0">
                {monthlyData.length > 0 ? (
                  <div className="w-full h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis
                          tickFormatter={(v) => (v / 1000000).toFixed(0) + "jt"}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(v) => formatCurrency(v as number)}
                          contentStyle={{ fontSize: "12px" }}
                        />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />

                        <Bar
                          dataKey="income"
                          name="Pemasukan"
                          fill="#86a9cf"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="expense"
                          name="Pengeluaran"
                          fill="#e37749"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">Belum ada data transaksi</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
