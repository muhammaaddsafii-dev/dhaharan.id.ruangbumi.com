import { Link } from "react-router-dom";
import {
  Heart,
  Instagram,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Youtube,
  Phone,
  Home,
  Calendar,
  Wallet,
  Map,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Menu sesuai dengan Navbar
  const navItems = [
    { name: "Beranda", path: "/", icon: Home },
    { name: "Kegiatan", path: "/kegiatan", icon: Calendar },
    { name: "Cashflow", path: "/cashflow", icon: Wallet },
    { name: "Peta", path: "/peta", icon: Map },
  ];

  const socialLinks = [
    {
      icon: Instagram,
      href: "https://instagram.com/dhaharan.id",
      label: "Instagram",
      color: "hover:bg-pink-500",
    },
    {
      icon: Facebook,
      href: "https://facebook.com/dhaharan.id",
      label: "Facebook",
      color: "hover:bg-blue-600",
    },
    {
      icon: Twitter,
      href: "https://twitter.com/dhaharan_id",
      label: "Twitter",
      color: "hover:bg-sky-500",
    },
    {
      icon: Youtube,
      href: "https://youtube.com/@dhaharan",
      label: "YouTube",
      color: "hover:bg-red-600",
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-secondary to-secondary/50 border-t-4 border-foreground mt-auto relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4 sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="src/assets/logo-dhaharan.png"
                  alt="Logo dhaharan.id"
                  className="w-12 h-12 rounded-xl border-2 border-foreground shadow-cartoon-lg object-cover"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-foreground animate-pulse"></div>
              </div>
              <div>
                <span className="font-fredoka text-xl sm:text-2xl font-bold block">
                  dhaharan.id
                </span>
                <span className="text-xs text-muted-foreground font-nunito">
                  Social Collaboration
                </span>
              </div>
            </div>

            <p className="text-muted-foreground font-nunito text-sm leading-relaxed">
              Komunitas sosial yang berfokus pada kegiatan dan agenda sosial
              untuk membangun kebersamaan dan kepedulian sesama.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`w-10 h-10 rounded-xl border-2 border-foreground shadow-cartoon-sm bg-background flex items-center justify-center transition-all ${social.color} hover:text-white group`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation Menu - Sesuai Navbar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="font-fredoka font-semibold text-lg sm:text-xl flex items-center gap-2">
              <span className="w-1 h-6 bg-accent rounded-full"></span>
              Menu Cepat
            </h3>
            <nav className="flex flex-col gap-2.5">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all font-nunito text-sm flex items-center gap-2 group"
                  >
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {item.name}
                  </Link>
                );
              })}
              <Link
                to="/login"
                className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all font-nunito text-sm flex items-center gap-2 group mt-2 pt-2 border-t border-foreground/10"
              >
                <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Admin Login
              </Link>
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="font-fredoka font-semibold text-lg sm:text-xl flex items-center gap-2">
              <span className="w-1 h-6 bg-highlight rounded-full"></span>
              Hubungi Kami
            </h3>

            <div className="flex flex-col gap-3">
              <a
                href="mailto:hello@dhaharan.id"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-nunito text-sm group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                <span>hello@dhaharan.id</span>
              </a>

              <a
                href="tel:+628123456789"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-nunito text-sm group"
              >
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                <span>+62 812-3456-789</span>
              </a>

              <span className="flex items-start gap-2 text-muted-foreground font-nunito text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Surakarta, Jawa Tengah</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t-2 border-foreground/20 mt-10 sm:mt-12 pt-6 sm:pt-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground font-nunito text-xs sm:text-sm text-center sm:text-left">
              © {currentYear} dhaharan.id • Social Collaboration with{" "}
              <a
                href="https://ruangbumi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-highlight transition-colors underline-offset-2 hover:underline"
              >
                Ruang Bumi
              </a>
            </p>

            <div className="flex items-center gap-1 text-muted-foreground font-nunito text-xs sm:text-sm">
              <span>Dibuat dengan</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>untuk kawan semua</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Wave Effect at Bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-8 sm:h-12"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-background/10"
          ></path>
        </svg>
      </div>
    </footer>
  );
}
