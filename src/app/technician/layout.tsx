"use client";

import Link from 'next/link';
import { Wrench, ClipboardList, User, LogOut, Zap } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Tech Sidebar */}
      <aside className="w-72 bg-slate-900 text-white hidden md:flex flex-col shadow-2xl fixed h-full z-50 overflow-hidden">
        
        {/* Decorative Gradient Blob */}
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-blue-900/20 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Tech<span className="text-blue-500">Portal</span></span>
          </div>
          <p className="text-xs text-slate-400 font-medium pl-1">Field Operations Unit</p>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-4 py-6 space-y-2">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
          
          <Link 
            href="/technician/dashboard" 
            className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-300 hover:text-white hover:bg-blue-600/10 border border-transparent hover:border-blue-500/50 transition-all duration-300 ease-out"
          >
            <ClipboardList className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">My Job Queue</span>
            <Zap className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-yellow-400 transition-opacity" />
          </Link>

          <Link 
            href="/technician/profile" 
            className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-600/10 border border-transparent hover:border-purple-500/50 transition-all duration-300 ease-out"
          >
            <User className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="font-medium">My Profile</span>
          </Link>
        </nav>

        {/* Footer - FIXED LOGOUT BUTTON */}
        <div className="relative p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-2 px-4 py-3 w-full text-red-400 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-8 transition-all duration-500 ease-in-out">
        {children}
      </main>
    </div>
  );
}