import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Check,
  X,
  Mail,
  Phone,
  MessageSquare,
  Search,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/utils/formatters";

/* =====================
   TYPES
===================== */
type DonationStatus = "pending" | "approved" | "rejected";

interface DonationRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  message?: string;
  status: DonationStatus;
  createdAt: string;
}

/* =====================
   STATUS CONFIG
===================== */
const statusConfig = {
  pending: {
    label: "Menunggu",
    className: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  approved: {
    label: "Disetujui",
    className: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-rose-100 text-rose-700 border-rose-300",
  },
};

export default function DonationsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | DonationStatus>("all");

  const [donations, setDonations] = useState<DonationRequest[]>([
    {
      id: "1",
      name: "Ahmad Fauzi",
      email: "ahmad@mail.com",
      phone: "08123456789",
      amount: 250000,
      message: "Semoga bermanfaat",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Siti Aminah",
      email: "siti@mail.com",
      phone: "08987654321",
      amount: 500000,
      status: "approved",
      createdAt: new Date().toISOString(),
    },
  ]);

  const updateStatus = (id: string, status: DonationStatus) => {
    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const filteredDonations = donations.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filter === "all" || d.status === filter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      {/* ================= HEADER - RESPONSIVE ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent border-2 border-foreground shadow-cartoon flex items-center justify-center shrink-0"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
          <div className="min-w-0">
            <h1 className="font-fredoka text-xl sm:text-2xl md:text-3xl font-bold truncate">
              Donasi Masuk
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Kelola dan verifikasi donasi dari donatur
            </p>
          </div>
        </div>
      </motion.div>

      {/* ================= SEARCH & FILTER - RESPONSIVE ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6"
      >
        {/* SEARCH */}
        <div className="relative max-w-full sm:max-w-md w-full">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder="Cari nama / email donatur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 sm:pl-12 h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>

        {/* FILTER */}
        <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
          {(["all", "pending", "approved", "rejected"] as const).map(
            (status) => (
              <Button
                key={status}
                size="sm"
                variant={filter === status ? "secondary" : "outline"}
                onClick={() => setFilter(status)}
                className="h-10 sm:h-11 text-xs sm:text-sm shrink-0"
              >
                {status === "all" ? "Semua" : statusConfig[status].label}
              </Button>
            )
          )}
        </div>
      </motion.div>

      {/* ================= LIST - RESPONSIVE ================= */}
      {filteredDonations.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {filteredDonations.map((donation, index) => (
            <motion.div
              key={donation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full">
                <CardHeader className="flex flex-row items-start justify-between gap-4 p-4 sm:p-6">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-sm sm:text-base">
                      {donation.name}
                    </CardTitle>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {formatDate(donation.createdAt)}
                    </p>
                  </div>
                  <Badge
                    className={`border text-[10px] sm:text-xs shrink-0 ${
                      statusConfig[donation.status].className
                    }`}
                  >
                    {statusConfig[donation.status].label}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
                  <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <div className="flex gap-2 items-center truncate">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">{donation.email}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      {donation.phone}
                    </div>
                    {donation.message && (
                      <div className="flex gap-2 items-start">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 shrink-0" />
                        <em className="line-clamp-2 text-[10px] sm:text-xs">
                          "{donation.message}"
                        </em>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t">
                    <p className="font-fredoka text-base sm:text-lg text-accent truncate">
                      {formatCurrency(donation.amount)}
                    </p>

                    {donation.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 border-rose-300 hover:bg-rose-50 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                          onClick={() => updateStatus(donation.id, "rejected")}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline ml-1">Tolak</span>
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                          onClick={() => updateStatus(donation.id, "approved")}
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline ml-1">Setujui</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* ================= EMPTY STATE ================= */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardContent className="py-12 sm:py-16 text-center">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">
                {searchQuery ? "Data tidak ditemukan" : "Belum ada donasi"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
