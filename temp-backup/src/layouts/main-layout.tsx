import { useState } from "react";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-grow">
        <Sidebar open={sidebarOpen} closeSidebar={closeSidebar} />

        <main className="flex-grow p-4 lg:p-6 bg-neutral-50 mt-0 lg:mt-0 transition-all duration-300">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
