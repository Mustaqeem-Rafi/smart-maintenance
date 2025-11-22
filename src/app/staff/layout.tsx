"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  LogOut,
  Settings,
  HelpCircle
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { label: "Report Incident", href: "/staff/report", icon: PlusCircle },
    { label: "My Reports", href: "/staff/reports", icon: FileText },
  ];

  const secondaryItems = [
    { label: "Settings", href: "/staff/settings", icon: Settings },
    { label: "Help", href: "/staff/help", icon: HelpCircle },
  ];

  return (
    <div className="flex min-h-screen bg-[#f6f6f8] font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-50 hidden md:flex">
        
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              TP
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">TechPortal</h1>
              <p className="text-xs text-gray-500">Staff Access</p>
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase mb-2">System</p>
            {secondaryItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer / Log Out */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-700" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}