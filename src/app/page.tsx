'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, Zap, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 flex flex-col">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          {/* Updated Logo Icon */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs tracking-tighter">
            00
          </div>
          {/* Updated Brand Name */}
          <span className="text-xl font-bold text-slate-900 tracking-tight">_00byPass00_</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-600 font-medium hover:text-blue-600 transition">
            Log in
          </Link>
          <Link href="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto px-8 pt-12 pb-20 lg:pt-24 lg:pb-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6 border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Live System v2.0
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Maintenance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Reimagined.
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
              Streamline campus facility management with AI-powered incident tracking, real-time analytics, and seamless communication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2 group">
                  Launch Dashboard
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </Link>
             
            </div>
          </motion.div>

          {/* Right Content (Abstract Visual) */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="relative"
          >
            <div className="relative bg-slate-100 rounded-3xl p-8 border border-slate-200 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
               {/* Mock UI Card 1 */}
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 flex items-center gap-4">
                  <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">System Operational</h3>
                    <p className="text-sm text-slate-500">All systems running smoothly</p>
                  </div>
                  <div className="ml-auto text-green-600 font-bold text-sm">98%</div>
               </div>
               
               {/* Mock UI Card 2 */}
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 flex items-center gap-4">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">New Incident</h3>
                    <p className="text-sm text-slate-500">Reported in Block A</p>
                  </div>
                  <button className="ml-auto bg-slate-900 text-white text-xs px-3 py-1 rounded-md">View</button>
               </div>

               {/* Mock Chart */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-40 flex items-end justify-between gap-2">
                  {[40, 70, 50, 90, 30, 80].map((h, i) => (
                    <div key={i} className="w-full bg-blue-100 rounded-t-md relative group hover:bg-blue-600 transition-colors" style={{ height: `${h}%` }}>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Clock className="text-blue-600" />}
            title="Real-Time Tracking"
            desc="Monitor maintenance requests as they happen with live status updates."
          />
          <FeatureCard 
            icon={<BarChart3 className="text-purple-600" />}
            title="Smart Analytics"
            desc="Visualize campus infrastructure health with predictive heatmaps."
          />
           <FeatureCard 
            icon={<Shield className="text-green-600" />}
            title="Role-Based Access"
            desc="Secure portals dedicated for Students, Admins, and Technicians."
          />
        </div>
      </main>

      {/* Footer with Copyright */}
      <footer className="border-t border-slate-100 bg-slate-50 mt-auto">
        <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} _00byPass00_. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-blue-600 transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-600 transition">Terms of Service</Link>
            <Link href="#" className="hover:text-blue-600 transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-slate-100 group">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}