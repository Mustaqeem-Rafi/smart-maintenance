"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  User, 
  LogOut,
  Trophy // Make sure to import Trophy for the leaderboard
} from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Report Issue", href: "/student/report", icon: PlusCircle },
    { name: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
    { name: "History", href: "/student/history", icon: History },
    { name: "Profile", href: "/student/profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white p-6 flex flex-col justify-between sticky top-0 h-screen shadow-xl z-20">
        <div>
          <h1 className="text-2xl font-bold mb-1">Smart Maint.</h1>
          <p className="text-blue-200 text-xs mb-8 uppercase tracking-widest text-[10px]">Student Portal</p>
          
          <nav className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-blue-800 shadow-inner" : "hover:bg-blue-600"
                  }`}
                >
                  <Icon size={20} /> {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <button className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors mt-auto font-medium">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}