"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  ArrowRight, 
  PlusCircle, 
  X, 
  Loader2, 
  BrainCircuit, 
  RefreshCw,
  TrendingUp,
  AlertOctagon
} from "lucide-react";
import dynamic from 'next/dynamic'; 
import NotificationBell from "@/src/components/NotificationBell";

const HeatmapView = dynamic(() => import("@/src/components/HeatmapView"), { 
  ssr: false, 
  loading: () => (
    <div className="h-96 w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
});

interface Incident {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  location: { address?: string; coordinates?: [number, number] };
  createdAt: string;
}

interface Prediction {
  _id: string;
  title: string;
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  algorithm: string;
  location: string;
  predictedDate?: string;
}

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAI, setRunningAI] = useState(false);
  const [stats, setStats] = useState({ open: 0, highPriority: 0, resolved: 0 });

  const fetchData = async () => {
    try {
      // 1. Fetch Incidents
      const res = await fetch("/api/admin/incidents");
      const data = await res.json();
      
      if (data.incidents) {
        setIncidents(data.incidents);
        
        const open = data.incidents.filter((i: Incident) => i.status === 'Open').length;
        const high = data.incidents.filter((i: Incident) => i.priority === 'High' && i.status !== 'Resolved').length;
        const resolved = data.incidents.filter((i: Incident) => i.status === 'Resolved').length;
        
        setStats({ open, highPriority: high, resolved });
      }

      // 2. Fetch Existing Predictions (Don't run logic yet, just fetch)
      // Note: You might need a simple GET endpoint for predictions or just use the run endpoint if it returns existing on GET
      // For now, we assume we only see them after running the analysis.
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runAIDiagnostics = async () => {
    setRunningAI(true);
    try {
      const res = await fetch("/api/predictions/run", { method: "POST" });
      const data = await res.json();
      if (data.success && data.predictions) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      alert("AI Engine Failed: " + error);
    } finally {
      setRunningAI(false);
    }
  };

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "In Progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Resolved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100";
    }
  };

  const getPredictionStyles = (severity: string) => {
    switch (severity) {
      case 'Critical': return "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100";
      case 'High': return "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100";
      case 'Medium': return "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100";
      default: return "border-gray-200 bg-gray-50 text-gray-900";
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
        
        {/* 1. Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-gray-900 dark:text-white text-3xl font-bold">Dashboard</h1>
          
          <div className="flex items-center gap-3">
            <NotificationBell />
            
            <Link 
              href="/report" 
              className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create New Incident</span>
            </Link>
          </div>
        </div>

        {/* 2. AI PREDICTION ENGINE SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-600" /> 
              Predictive Maintenance Engine
            </h2>
            <button 
              onClick={runAIDiagnostics}
              disabled={runningAI}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md shadow-purple-200 transition disabled:opacity-50"
            >
              {runningAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {runningAI ? "Analyzing Patterns..." : "Run Diagnostics"}
            </button>
          </div>

          {/* Results Grid */}
          {predictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4">
              {predictions.map((pred, idx) => (
                <div key={idx} className={`p-5 rounded-xl border-l-4 shadow-sm ${getPredictionStyles(pred.severity)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">{pred.algorithm}</span>
                    <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded">{pred.confidenceScore}% Conf.</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2 flex items-center gap-2">
                    {pred.severity === 'Critical' && <AlertOctagon className="w-5 h-5" />}
                    {pred.title}
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed mb-3">{pred.message}</p>
                  <div className="flex items-center gap-2 text-xs font-medium opacity-75">
                    <TrendingUp className="w-3 h-3" />
                    {pred.location}
                    {pred.predictedDate && <span>• Expected: {new Date(pred.predictedDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State / Placeholder
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <BrainCircuit className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Run diagnostics to detect failure patterns, wear-out risks, and anomalies.</p>
            </div>
          )}
        </div>

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Open Incidents</p>
            <p className="text-gray-900 dark:text-white text-3xl font-bold">{stats.open}</p>
            <p className="text-red-600 text-sm font-medium">Requires attention</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">High Priority Alerts</p>
            <p className="text-gray-900 dark:text-white text-3xl font-bold">{stats.highPriority}</p>
            <p className="text-orange-600 text-sm font-medium">Critical issues</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Total Resolved</p>
            <p className="text-gray-900 dark:text-white text-3xl font-bold">{stats.resolved}</p>
            <p className="text-green-600 text-sm font-medium">Good progress</p>
          </div>
        </div>

        {/* 4. Campus Heatmap */}
        <div className="h-96 w-full">
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Campus Incident Heatmap</h3>
            <HeatmapView incidents={incidents} viewMode="heatmap" />
        </div>

        {/* 5. Recent Incidents Table */}
        <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold">Recent Incidents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Issue Title</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center">Loading data...</td></tr>
                ) : incidents.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center">No incidents found.</td></tr>
                ) : (
                  incidents.slice(0, 5).map((incident) => (
                    <tr key={incident._id} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {incident.title}
                      </td>
                      <td className="px-6 py-4">
                        {incident.location?.address || "GPS Location"}
                      </td>
                      <td className="px-6 py-4">{incident.category}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(incident.priority)}`}>
                          {incident.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}