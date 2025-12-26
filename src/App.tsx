import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Kegiatan from "./pages/Kegiatan";
import Cashflow from "./pages/Cashflow";
import AddCashflow from "./pages/AddCashflow";
import Activities from "./pages/Activities";
import Setting from "./pages/Settings";
import Peta from "./pages/Peta";
import Login from "./pages/Login";
import Admin from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import DonationSection from "./pages/DonationSection";
import VolunteerSection from "./pages/VolunteerSection";
import VolunteersView from "./pages/VolunteersView";
import DonationsView from "./pages/DonationsView";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/kegiatan" element={<Kegiatan />} />
            <Route path="/cashflow" element={<Cashflow />} />
            <Route path="/peta" element={<Peta />} />
          </Route>
          <Route path="/dashboard" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
           <Route path="/AddCashflow" element={<AddCashflow />} />
            <Route path="/activities" element={<Activities />} />
             <Route path="/settings" element={<Setting />} />
             <Route path="/donationsection" element={<DonationSection />} />
             <Route path="/volunteersection" element={<VolunteerSection />} />
             <Route path="/volunteersview" element={<VolunteersView />} />
            <Route path="/donationsview" element={<DonationsView />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
