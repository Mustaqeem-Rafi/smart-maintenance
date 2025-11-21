"use client";

import { useEffect, useState, useRef } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download,
  FileText,
  Loader2
} from "lucide-react";
import { useReactToPrint } from "react-to-print"; // <--- NEW LIBRARY

// Chart Colors
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Ref to capture the dashboard content
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/reports");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- NEW PDF EXPORT LOGIC (Native Browser Print) ---
  // This opens the "Print to PDF" dialog which renders charts perfectly.
  const handleExportPDF = useReactToPrint({
    contentRef: reportRef, // Updated for latest react-to-print
    documentTitle: `Maintenance_Report_${new Date().toISOString().split('T')[0]}`,
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header with Export Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
            <p className="text-gray-500 mt-1">Real-time insights into campus infrastructure health.</p>
          </div>
          
          <button 
            onClick={() => handleExportPDF && handleExportPDF()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export / Print PDF</span>
          </button>
        </div>

        {/* --- REPORT CONTENT (Wrapped in ref for capture) --- */}
        <div ref={reportRef} className="space-y-8 bg-gray-50 dark:bg-gray-950 p-4 -m-4 print:bg-white print:p-8">
          
          {/* 1. Stats Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Reports */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm print:border print:border-gray-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reports</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data?.stats.total}</h3>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg print:bg-blue-100">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="font-medium">+12%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm print:border print:border-gray-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data?.stats.resolved}</h3>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg print:bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 print:bg-gray-200">
                <div 
                  className="bg-green-500 h-1.5 rounded-full print:bg-green-600" 
                  style={{ width: `${data?.stats.total > 0 ? (data?.stats.resolved / data?.stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm print:border print:border-gray-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Action</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data?.stats.open}</h3>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg print:bg-red-100">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">Requires immediate attention</p>
            </div>

            {/* SLA */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm print:border print:border-gray-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Response</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">2h 15m</h3>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg print:bg-orange-100">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">Within SLA limits</p>
            </div>

          </div>

          {/* 2. Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:space-y-8">
            
            {/* Bar Chart: Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm print:break-inside-avoid print:border print:border-gray-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Incident Volume (Last 7 Days)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="incidents" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Categories */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm print:break-inside-avoid print:border print:border-gray-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Issues by Category</h3>
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data?.categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                  <div className="text-center">
                     <p className="text-3xl font-bold text-gray-900 dark:text-white">{data?.stats.total}</p>
                     <p className="text-xs text-gray-500 uppercase">Total</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}