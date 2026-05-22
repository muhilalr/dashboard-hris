"use client";

import { useSidebar } from "@/components/Sidebar/sidebar-context";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { isOpen, setIsOpen } = useSidebar();
  const pathname = usePathname();

  // Menentukan judul halaman berdasarkan URL
  let pageTitle = "KodingYuk HRIS";
  if (pathname.startsWith("/dashboard")) pageTitle = "Dashboard";
  if (pathname.startsWith("/absensi")) pageTitle = "Absensi";
  if (pathname.startsWith("/cuti")) pageTitle = "Cuti & Izin";
  if (pathname.startsWith("/recruitment")) pageTitle = "Recruitment";
  if (pathname.startsWith("/training")) pageTitle = "Training Scheduler";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Kiri: Brand & Judul Halaman */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-xs font-bold text-white shadow-sm lg:hidden">
            K
          </div>
          <div className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 leading-tight">{pageTitle}</span>
            <span className="text-xs text-slate-500 hidden sm:block">KodingYuk HRIS Portal</span>
          </div>
        </div>

        {/* Kanan: Hamburger Button (Hanya Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Kanan: Profil (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Notifications Button */}
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          
          <div className="h-6 w-px bg-slate-200"></div>

          {/* Profile Dropdown */}
          <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-2 rounded-full transition-colors border border-transparent hover:border-slate-200">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
               AD
             </div>
             <div className="hidden xl:block text-left">
               <p className="text-sm font-semibold text-slate-700 leading-tight">Aqila Dewi</p>
               <p className="text-[10px] text-slate-500">Tech Department</p>
             </div>
             <svg className="w-4 h-4 text-slate-400 hidden xl:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
             </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
