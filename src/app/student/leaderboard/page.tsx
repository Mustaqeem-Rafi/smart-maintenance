"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Target, Award, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/stats/leaderboard");
        const json = await res.json();
        setData(json.leaderboard || []);
      } catch (err) {
        console.error("Leaderboard fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link href="/student/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className="text-center mb-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
            <Trophy className="text-yellow-600 w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Maintenance Leaderboard</h1>
          <p className="text-slate-500 mt-2">Rankings based on successfully resolved maintenance issues per block.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {data.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200 shadow-lg scale-105' : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
                  index === 0 ? 'bg-yellow-400 text-white' : 
                  index === 1 ? 'bg-slate-300 text-white' : 
                  index === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{item._id || "General Area"}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Target size={14} /> Completed Maintenance
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black text-blue-600">{item.resolvedCount}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fixed</div>
              </div>
            </motion.div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-dashed text-center text-slate-400">
            No data available yet. Start resolving issues to see the rankings!
          </div>
        )}
      </div>
    </div>
  );
}