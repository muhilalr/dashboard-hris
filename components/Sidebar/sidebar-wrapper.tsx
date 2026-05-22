"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar/sidebar";
import { Navbar } from "@/components/Navbar/navbar";
import { SidebarProvider } from "@/components/Sidebar/sidebar-context";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Jangan tampilkan sidebar di halaman login atau halaman error auth
  const isAuthPage = pathname === "/login" || pathname.startsWith("/auth");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
