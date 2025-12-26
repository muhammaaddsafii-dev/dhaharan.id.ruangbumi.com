import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content - Responsive margins */}
      <main className="flex-1 w-full p-3 sm:p-4 md:p-6 lg:p-8 pt-20 sm:pt-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
