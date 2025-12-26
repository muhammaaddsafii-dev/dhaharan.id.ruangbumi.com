import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ActivityCard from "@/components/activities/ActivityCard";
import ActivityModal from "@/components/activities/ActivityModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { initialActivities } from "@/data/mockData";
import { Activity, ModalMode } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function Activities() {
  const [activities, setActivities] = useLocalStorage<Activity[]>(
    "activities",
    initialActivities
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  const filteredActivities = activities.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setModalMode("create");
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleView = (activity: Activity) => {
    setModalMode("view");
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setModalMode("edit");
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
    toast({
      title: "Kegiatan Dihapus",
      description: "Kegiatan berhasil dihapus dari daftar.",
    });
  };

  const handleSave = (data: Omit<Activity, "id" | "createdAt">) => {
    if (modalMode === "create") {
      const newActivity: Activity = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setActivities([newActivity, ...activities]);
      toast({
        title: "Kegiatan Ditambahkan! 🎉",
        description: "Kegiatan baru berhasil ditambahkan.",
      });
    } else if (modalMode === "edit" && selectedActivity) {
      setActivities(
        activities.map((a) =>
          a.id === selectedActivity.id ? { ...a, ...data } : a
        )
      );
      toast({
        title: "Kegiatan Diperbarui",
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
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent border-2 border-foreground shadow-cartoon flex items-center justify-center shrink-0"
            >
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="font-fredoka text-xl sm:text-2xl md:text-3xl font-bold truncate">
                Kegiatan Sosial
              </h1>
              <p className="text-muted-foreground font-nunito text-xs sm:text-sm">
                Kelola semua kegiatan organisasi
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            variant="accent"
            className="w-full sm:w-auto h-10 sm:h-11"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="ml-1 sm:ml-2">Tambah Kegiatan</span>
          </Button>
        </div>
      </motion.div>

      {/* Search - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 sm:mb-6"
      >
        <div className="relative max-w-full sm:max-w-md">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder="Cari kegiatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 sm:pl-12 h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>
      </motion.div>

      {/* Activities List - Responsive Grid */}
      {filteredActivities.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {filteredActivities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
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
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="py-12 sm:py-16 text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <h3 className="font-fredoka text-base sm:text-lg font-semibold mb-2">
                {searchQuery ? "Tidak Ada Hasil" : "Belum Ada Kegiatan"}
              </h3>
              <p className="text-muted-foreground font-nunito text-xs sm:text-sm mb-4">
                {searchQuery
                  ? "Coba kata kunci lain"
                  : "Tambahkan kegiatan pertama Anda"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={handleCreate}
                  variant="accent"
                  className="h-10 sm:h-11"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="ml-1 sm:ml-2">Tambah Kegiatan</span>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        mode={modalMode}
        activity={selectedActivity}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
