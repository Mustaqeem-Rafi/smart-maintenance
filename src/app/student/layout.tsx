"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  LogOut, 
  PlusCircle 
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  
  const navItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Report Issue", href: "/report", icon: PlusCircle },
    { label: "History", href: "/student/history", icon: FileText },
    { label: "Profile", href: "/student/profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col p-4 shadow-xl fixed h-full">
        <div className="p-2 border-b border-blue-600 mb-8">
          <h1 className="text-2xl font-bold">Smart Maint.</h1>
          <p className="text-blue-200 text-xs">Student Portal</p>
        </div>
        
        <nav className="grow space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-150"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        {/* Logout Button */}
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-red-200 hover:bg-blue-700 hover:text-white transition duration-150 mt-auto"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content Wrapper (Added margin-left to account for fixed sidebar) */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children} 
      </main>
    </div>
  );
}