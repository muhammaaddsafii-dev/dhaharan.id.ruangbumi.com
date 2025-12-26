// ============================================
// Settings-Responsive.tsx
// ============================================
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Database,
  Trash2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const handleClearData = () => {
    localStorage.removeItem("activities");
    localStorage.removeItem("cashflow");
    toast({
      title: "Data Dihapus",
      description: "Semua data telah direset ke default.",
    });
    window.location.reload();
  };

  const settingSections = [
    {
      icon: User,
      title: "Profil Organisasi",
      description: "Kelola informasi organisasi Anda",
      color: "bg-primary",
    },
    {
      icon: Bell,
      title: "Notifikasi",
      description: "Atur preferensi notifikasi",
      color: "bg-accent",
    },
    {
      icon: Palette,
      title: "Tampilan",
      description: "Sesuaikan tema dan tampilan",
      color: "bg-highlight",
    },
    {
      icon: Database,
      title: "Data & Backup",
      description: "Kelola data dan backup",
      color: "bg-secondary",
    },
  ];

  return (
    <DashboardLayout>
      {/* Header - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center shrink-0"
          >
            <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
          <div className="min-w-0">
            <h1 className="font-fredoka text-xl sm:text-2xl md:text-3xl font-bold truncate">
              Pengaturan
            </h1>
            <p className="text-muted-foreground font-nunito text-xs sm:text-sm">
              Kelola preferensi aplikasi
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings Grid - Responsive */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {settingSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-cartoon-lg transition-all cursor-pointer">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl ${section.color} border-2 border-foreground shadow-cartoon-sm flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-base truncate">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm truncate">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Organization Info - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Informasi Organisasi
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Detail informasi organisasi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2">
                Nama Organisasi
              </label>
              <Input defaultValue="Dhaharan.id" className="h-10 sm:h-11" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2">
                Email
              </label>
              <Input
                type="email"
                defaultValue="contact@dhaharan.id"
                className="h-10 sm:h-11"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2">
                Telepon
              </label>
              <Input
                defaultValue="+62 8888-8888-8888"
                className="h-10 sm:h-11"
              />
            </div>
            <Button variant="accent" className="w-full sm:w-auto h-10 sm:h-11">
              Simpan Perubahan
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 sm:mt-8"
      >
        <Card className="border-destructive/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-destructive flex items-center gap-2 text-sm sm:text-base">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Zona Berbahaya
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Tindakan ini tidak dapat dibatalkan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button
              variant="destructive"
              onClick={handleClearData}
              className="w-full sm:w-auto h-10 sm:h-11"
            >
              <Trash2 className="w-4 h-4" />
              <span className="ml-2">Reset Semua Data</span>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
