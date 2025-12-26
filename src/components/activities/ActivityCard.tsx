import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Pencil, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity } from "@/types";
import { formatDate } from "@/utils/formatters";

interface ActivityCardProps {
  activity: Activity;
  index: number;
  onView: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  upcoming: { label: "Akan Datang", variant: "accent" as const },
  ongoing: { label: "Berlangsung", variant: "highlight" as const },
  completed: { label: "Selesai", variant: "secondary" as const },
};

export default function ActivityCard({
  activity,
  index,
  onView,
  onEdit,
  onDelete,
}: ActivityCardProps) {
  const status = statusConfig[activity.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-cartoon-lg transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <h3 className="font-fredoka font-semibold text-lg mb-2 truncate">
                {activity.title}
              </h3>
              <p className="text-sm text-muted-foreground font-nunito line-clamp-2 mb-3">
                {activity.description}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(activity.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{activity.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{activity.participants} orang</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="icon" variant="outline" onClick={() => onView(activity)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="secondary" onClick={() => onEdit(activity)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => onDelete(activity.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
