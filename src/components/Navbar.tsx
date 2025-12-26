import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Calendar, Wallet, Map, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Beranda", path: "/", icon: Home },
  { name: "Kegiatan", path: "/kegiatan", icon: Calendar },
  { name: "Cashflow", path: "/cashflow", icon: Wallet },
  { name: "Peta", path: "/peta", icon: Map },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b-2 border-foreground z-[1000]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="src/assets/logo-dhaharan.png"
              alt="Logo"
              className="w-10 h-10 rounded-xl border-2 border-foreground shadow-cartoon-sm object-cover"
            />
            <span className="font-fredoka text-xl font-bold hidden sm:block">
              dhaharan.id
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login">
              <Button variant="accent" size="sm">
                <User className="w-4 h-4" />
                Admin
              </Button>
            </Link>
            {/* <Link to="/dashboard">
              <Button variant="accent" size="sm">
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            </Link> */}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b-2 border-foreground overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              <div className="border-t-2 border-foreground/20 pt-4 mt-2 flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="accent" className="w-full justify-start gap-2">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
                {/* <Link to="/admin" onClick={() => setIsOpen(false)}>
                  <Button variant="accent" className="w-full justify-start gap-2">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                </Link> */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
