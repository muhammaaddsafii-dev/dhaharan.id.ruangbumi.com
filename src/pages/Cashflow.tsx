// Cashflow.tsx - FULLY RESPONSIVE VERSION

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Download,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

// ---------------- MOCK DATA ----------------
const cashflowData = {
  balance: 15750000,
  totalIncome: 25000000,
  totalExpense: 9250000,

  monthlyData: [
    { month: "Jan", income: 5000000, expense: 2000000 },
    { month: "Feb", income: 4500000, expense: 1500000 },
    { month: "Mar", income: 6000000, expense: 2500000 },
    { month: "Apr", income: 5500000, expense: 1750000 },
    { month: "Mei", income: 4000000, expense: 1500000 },
  ],

  transactions: [
    {
      id: 1,
      type: "income",
      description: "Donasi Anggota Bulan Maret",
      amount: 5000000,
      date: "15 Maret 2024",
      category: "Donasi",
    },
    {
      id: 2,
      type: "expense",
      description: "Pembelian Sembako Baksos",
      amount: 2500000,
      date: "12 Maret 2024",
      category: "Kegiatan",
    },
    {
      id: 3,
      type: "income",
      description: "Sponsor Kegiatan Ramadhan",
      amount: 7500000,
      date: "10 Maret 2024",
      category: "Sponsor",
    },
    {
      id: 4,
      type: "expense",
      description: "Santunan Anak Yatim",
      amount: 3000000,
      date: "5 Maret 2024",
      category: "Santunan",
    },
    {
      id: 5,
      type: "income",
      description: "Donasi Tambahan",
      amount: 2000000,
      date: "1 Maret 2024",
      category: "Donasi",
    },
    {
      id: 6,
      type: "expense",
      description: "Operasional",
      amount: 900000,
      date: "27 Feb 2024",
      category: "Operasional",
    },
  ],
};

const expenseCategories = [
  { name: "Kegiatan", amount: 2500000, color: "bg-accent" },
  { name: "Santunan", amount: 3000000, color: "bg-highlight" },
  { name: "Operasional", amount: 1500000, color: "bg-primary" },
  { name: "Kesehatan", amount: 2250000, color: "bg-secondary" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// ---------------- COMPONENT ----------------
export default function Cashflow() {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  let filteredTransactions = cashflowData.transactions
    .filter((t) => (filter === "all" ? true : t.type === filter))
    .filter((t) => t.description.toLowerCase().includes(search.toLowerCase()));

  filteredTransactions = filteredTransactions.sort((a, b) =>
    sort === "asc" ? a.amount - b.amount : b.amount - a.amount
  );

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
      head: [["Tanggal", "Deskripsi", "Kategori", "Jenis", "Jumlah"]],
      body: filteredTransactions.map((t) => [
        t.date,
        t.description,
        t.category,
        t.type === "income" ? "Masuk" : "Keluar",
        formatCurrency(t.amount),
      ]),
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [30, 64, 175] },
    });

    doc.save("cashflow-transactions.pdf");
  };

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
                  {formatCurrency(cashflowData.balance).replace(/\s/g, "")}
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
                  {formatCurrency(cashflowData.totalIncome).replace(/\s/g, "")}
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
                  {formatCurrency(cashflowData.totalExpense).replace(/\s/g, "")}
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

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
                        className="flex-1 sm:flex-none h-9 text-xs sm:text-sm"
                      >
                        <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        {sort === "asc" ? "Terendah" : "Tertinggi"}
                      </Button>

                      <Button
                        size="sm"
                        variant="accent"
                        onClick={exportPDF}
                        className="flex-1 sm:flex-none h-9 text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        PDF
                      </Button>
                    </div>
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
                            .filter((t) => t.type === "income")
                            .reduce((sum, t) => sum + t.amount, 0)
                        ).replace(/\s/g, "")}
                      </Badge>
                      <Badge variant="highlight" className="text-xs px-2 py-1">
                        -
                        {formatCurrency(
                          filteredTransactions
                            .filter((t) => t.type === "expense")
                            .reduce((sum, t) => sum + t.amount, 0)
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

                  {paginatedTransactions.map((transaction, i) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl bg-secondary/50 border-2 border-foreground/10"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl flex items-center justify-center border-2 border-foreground shadow-cartoon-sm ${
                            transaction.type === "income"
                              ? "bg-accent"
                              : "bg-highlight"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-fredoka font-semibold text-sm sm:text-base truncate">
                            {transaction.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{transaction.date}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[10px] sm:text-xs px-1.5 py-0"
                            >
                              {transaction.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1">
                        <div
                          className={`font-fredoka font-bold text-base sm:text-lg ${
                            transaction.type === "income"
                              ? "text-accent"
                              : "text-highlight"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount).replace(
                            /\s/g,
                            ""
                          )}
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          {transaction.type === "income"
                            ? "Pemasukan"
                            : "Pengeluaran"}
                        </div>
                      </div>
                    </motion.div>
                  ))}
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

          {/* RIGHT – Charts + Breakdown - RESPONSIVE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 sm:gap-6"
          >
            {/* Expense breakdown */}
            <Card className="shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <PieChart className="w-4 h-4 sm:w-5 sm:h-5" /> Distribusi
                  Pengeluaran
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                {expenseCategories.map((c) => {
                  const percentage = Math.round(
                    (c.amount / cashflowData.totalExpense) * 100
                  );
                  return (
                    <div key={c.name}>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>{c.name}</span>
                        <span className="font-fredoka">{percentage}%</span>
                      </div>

                      <div className="h-2.5 sm:h-3 bg-secondary rounded-full overflow-hidden border border-foreground/20 mt-1.5 sm:mt-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6 }}
                          className={`h-full ${c.color}`}
                        />
                      </div>

                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {formatCurrency(c.amount)}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Bar chart - Responsive */}
            <Card className="shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="font-fredoka text-base sm:text-lg">
                  Grafik Cashflow Per Bulan
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="w-full h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashflowData.monthlyData}>
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
