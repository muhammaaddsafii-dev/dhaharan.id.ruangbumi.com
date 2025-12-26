import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Pencil, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CashflowItem } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface CashflowCardProps {
  item: CashflowItem;
  index: number;
  onView: (item: CashflowItem) => void;
  onEdit: (item: CashflowItem) => void;
  onDelete: (id: string) => void;
}

export default function CashflowCard({
  item,
  index,
  onView,
  onEdit,
  onDelete,
}: CashflowCardProps) {
  const isIncome = item.type === "income";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-cartoon-lg transition-all">
        <CardContent className="p-3 sm:p-5">
          {/* Layout untuk Mobile - Horizontal Compact */}
          <div className="flex gap-2.5 sm:hidden">
            {/* Icon */}
            <div
              className={`w-12 h-12 shrink-0 rounded-xl border-2 border-foreground shadow-cartoon-sm flex items-center justify-center ${
                isIncome ? "bg-accent" : "bg-highlight"
              }`}
            >
              {isIncome ? (
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              ) : (
                <TrendingDown className="w-5 h-5 text-highlight-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-fredoka font-semibold text-sm leading-tight truncate">
                  {item.title}
                </h3>
                <span
                  className={`font-fredoka font-bold text-sm shrink-0 ${
                    isIncome ? "text-accent" : "text-highlight"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(item.amount).replace(/\s/g, "")}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-1.5">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5"
                >
                  {item.category}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(item.date)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={isIncome ? "accent" : "highlight"}
                  className="text-[10px] px-1.5 py-0 h-5"
                >
                  {isIncome ? "Pemasukan" : "Pengeluaran"}
                </Badge>
                <div className="flex gap-1.5">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onView(item)}
                    className="h-7 w-7"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => onEdit(item)}
                    className="h-7 w-7"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className="h-7 w-7"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Layout untuk Desktop - Original Layout */}
          <div className="hidden sm:flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl border-2 border-foreground shadow-cartoon-sm flex items-center justify-center ${
                  isIncome ? "bg-accent" : "bg-highlight"
                }`}
              >
                {isIncome ? (
                  <TrendingUp className="w-6 h-6 text-accent-foreground" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-highlight-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={isIncome ? "accent" : "highlight"}>
                    {isIncome ? "Pemasukan" : "Pengeluaran"}
                  </Badge>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <h3 className="font-fredoka font-semibold text-lg mb-1 truncate">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground font-nunito line-clamp-1 mb-2">
                  {item.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.date)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`font-fredoka font-bold text-lg ${
                  isIncome ? "text-accent" : "text-highlight"
                }`}
              >
                {isIncome ? "+" : "-"} {formatCurrency(item.amount)}
              </span>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onView(item)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
