import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  Settings,
  Menu,
  X,
  LogOut,
  DollarSign,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Kegiatan", path: "/activities" },
  { icon: Wallet, label: "Cashflow", path: "/addcashflow" },
  { icon: Users, label: "Volunteer", path: "/volunteersview" },
  { icon: DollarSign, label: "Donasi", path: "/donationsview" },
  { icon: Settings, label: "Pengaturan", path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* MOBILE MENU BUTTON - Fixed at top left */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileTap={{ scale: 0.9 }}
        className="fixed top-4 left-4 z-[60] bg-primary w-12 h-12 rounded-xl border-2 border-foreground shadow-cartoon-lg flex items-center justify-center md:hidden"
      >
        <Menu className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      {/* OVERLAY - Mobile only */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR - FULL HEIGHT */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -300,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          // Mobile: fixed, full viewport height
          "fixed top-0 left-0 h-screen w-[280px] bg-card border-r-2 border-foreground z-[80] flex flex-col",
          // Desktop: static, auto height, always visible
          "md:!translate-x-0 md:sticky md:top-0 md:h-screen md:z-10 md:w-[240px] lg:w-[260px]"
        )}
      >
        {/* Header - No rounded corners */}
        <div className="p-3 sm:p-4 border-b-2 border-foreground flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="src/assets/logo-dhaharan.png"
              alt="Logo Dhaharan"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-foreground shadow-cartoon object-cover shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-fredoka text-base sm:text-lg font-bold truncate">
                Dhaharan.id
              </h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block truncate">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Close button - Mobile only */}
          <button onClick={() => setIsOpen(false)} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation - Scrollable if needed */}
        <nav className="flex-1 p-2 sm:p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={item.path} onClick={() => setIsOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl border-2 transition-all font-nunito font-semibold text-sm",
                      isActive
                        ? "bg-primary text-primary-foreground border-foreground shadow-cartoon"
                        : "border-transparent hover:bg-secondary hover:border-foreground hover:shadow-cartoon-sm"
                    )}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout Button - Sticky at bottom */}
        <div className="p-2 sm:p-3 border-t-2 border-foreground shrink-0">
          <Button
            variant="destructive"
            className="w-full flex items-center justify-center gap-2 text-sm h-10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
