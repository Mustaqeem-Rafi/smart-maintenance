"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  User, 
  LogOut 
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
    { name: "History", href: "/student/history", icon: History },
    { name: "Profile", href: "/student/profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed on the left */}
      <aside className="w-64 bg-blue-700 text-white p-6 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          <h1 className="text-2xl font-bold mb-1">Smart Maint.</h1>
          <p className="text-blue-200 text-xs mb-8">Student Portal</p>
          
          <nav className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`flex items-center gap-3 p-3 rounded-xl transition ${
                    isActive ? "bg-blue-800 shadow-inner" : "hover:bg-blue-600"
                  }`}
                >
                  <Icon size={20} /> {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <button className="flex items-center gap-3 text-blue-200 hover:text-white transition mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}