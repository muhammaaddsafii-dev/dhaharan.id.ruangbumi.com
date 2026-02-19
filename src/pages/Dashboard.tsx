import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatCurrency, formatShortDate } from "@/utils/formatters";
import { KegiatanAPI, TransaksiAPI } from "@/types";
import { kegiatanAPI, transaksiAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [activities, setActivities] = useState<KegiatanAPI[]>([]);
  const [cashflow, setCashflow] = useState<TransaksiAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  // Load data dari backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load kegiatan dan transaksi secara parallel
        const [kegiatanData, transaksiData, summary] = await Promise.all([
          kegiatanAPI.getAll(),
          transaksiAPI.getAll(),
          transaksiAPI.getSummary(),
        ]);

        setActivities(kegiatanData);
        setCashflow(transaksiData);
        setTotalIncome(Number(summary.total_pemasukan));
        setTotalExpense(Number(summary.total_pengeluaran));
        setBalance(Number(summary.saldo));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data dashboard",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter kegiatan yang akan datang (status_kegiatan = 1)
  const upcomingActivities = activities
    .filter((a) => a.status_kegiatan === 1)
    .slice(0, 3);

  // 3 transaksi terakhir
  const recentCashflow = cashflow.slice(0, 3);

  // Hitung kegiatan aktif (status bukan completed/3)
  const activeActivitiesCount = activities.filter(
    (a) => a.status_kegiatan !== 3
  ).length;

  // Calculate totals from cashflow list for consistency
  const calculatedIncome = cashflow
    .filter((t) => t.tipe_transaksi_detail?.nama.toLowerCase() === "pemasukan")
    .reduce((sum, t) => sum + Number(t.jumlah), 0);

  const calculatedExpense = cashflow
    .filter((t) => t.tipe_transaksi_detail?.nama.toLowerCase() === "pengeluaran")
    .reduce((sum, t) => sum + Number(t.jumlah), 0);

  const calculatedBalance = calculatedIncome - calculatedExpense;

  const stats = [
    {
      title: "Kegiatan Aktif",
      value: activeActivitiesCount,
      icon: Calendar,
      bg: "bg-primary",
      iconColor: "text-primary-foreground",
    },
    {
      title: "Total Pemasukan",
      value: formatCurrency(calculatedIncome),
      icon: TrendingUp,
      bg: "bg-accent",
      iconColor: "text-accent-foreground",
    },
    {
      title: "Total Pengeluaran",
      value: formatCurrency(calculatedExpense),
      icon: TrendingDown,
      bg: "bg-highlight",
      iconColor: "text-highlight-foreground",
    },
    {
      title: "Saldo",
      value: formatCurrency(calculatedBalance),
      icon: Wallet,
      bg: "bg-secondary",
      iconColor: "text-secondary-foreground",
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center animate-pulse">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Memuat dashboard...</p>
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
        <h1 className="font-fredoka text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
          Selamat Datang! 👋
        </h1>
        <p className="text-muted-foreground font-nunito text-sm sm:text-base">
          Kelola kegiatan sosial dan keuangan organisasi Anda dengan mudah.
        </p>
      </motion.div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={stat.bg}>
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium opacity-80 line-clamp-1">
                      {stat.title}
                    </p>
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 opacity-60 shrink-0 ${stat.iconColor}`}
                    />
                  </div>
                  <p className="font-fredoka text-base sm:text-xl md:text-2xl font-bold truncate">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Content Grid - Responsive */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">Kegiatan Mendatang</span>
              </CardTitle>
              <Link to="/activities">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Lihat Semua</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {upcomingActivities.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {upcomingActivities.map((activity, index) => {
                    const dateParts = formatShortDate(activity.tanggal).split(" ");
                    const day = dateParts[0];
                    const month = dateParts[1];

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-secondary/50 border-2 border-foreground/10 hover:border-foreground/30 transition-all"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl bg-primary border-2 border-foreground shadow-cartoon-sm flex flex-col items-center justify-center font-fredoka font-bold py-1.5 px-1">
                          <span className="text-[10px] sm:text-xs leading-none opacity-80 uppercase">
                            {day}
                          </span>
                          <span className="text-sm sm:text-base leading-none mt-0.5 uppercase">
                            {month}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate text-sm sm:text-base">
                            {activity.nama}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{activity.jumlah_peserta} peserta</span>
                          </div>
                        </div>
                        <Badge
                          variant="accent"
                          className="text-[10px] sm:text-xs px-1.5 sm:px-2 shrink-0"
                        >
                          Akan Datang
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-nunito text-sm">
                    Belum ada kegiatan mendatang
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Cashflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">Transaksi Terakhir</span>
              </CardTitle>
              <Link to="/addcashflow">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Lihat Semua</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {recentCashflow.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {recentCashflow.map((item, index) => {
                    const isIncome = item.tipe_transaksi_detail?.nama.toLowerCase() === "pemasukan";
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl bg-secondary/50 border-2 border-foreground/10 hover:border-foreground/30 transition-all"
                      >
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl border-2 border-foreground shadow-cartoon-sm flex items-center justify-center ${isIncome ? "bg-accent" : "bg-highlight"
                            }`}
                        >
                          {isIncome ? (
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
                          ) : (
                            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-highlight-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate text-xs sm:text-sm">
                            {item.nama}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {item.tipe_transaksi_detail?.nama || "-"}
                          </p>
                        </div>
                        <span
                          className={`font-fredoka font-bold text-xs sm:text-sm shrink-0 ${isIncome ? "text-accent" : "text-highlight"
                            }`}
                        >
                          {isIncome ? "+" : "-"}{" "}
                          {formatCurrency(Number(item.jumlah))
                            .replace(/\s/g, "")
                            .replace("Rp", "")}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <Wallet className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-nunito text-sm">Belum ada transaksi</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
