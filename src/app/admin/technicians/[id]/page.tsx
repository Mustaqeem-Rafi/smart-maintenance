"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Briefcase, 
  CheckCircle, 
  XCircle,
  Loader2
} from "lucide-react";

interface TechnicianDetail {
  _id: string;
  name: string;
  email: string;
  department: string;
  isAvailable: boolean;
  createdAt: string;
}

interface AssignedIncident {
  _id: string;
  title: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function TechnicianDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [tech, setTech] = useState<TechnicianDetail | null>(null);
  const [incidents, setIncidents] = useState<AssignedIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // 1. We need an API to get a single user (We can reuse /api/profile or create a specific one)
        // For hackathon speed, let's fetch ALL technicians and find one (Not efficient for prod, but fast for now)
        const resTech = await fetch("/api/technicians");
        const dataTech = await resTech.json();
        const foundTech = dataTech.technicians.find((t: any) => t._id === id);
        setTech(foundTech);

        // 2. Fetch Incidents assigned to this tech
        const resInc = await fetch("/api/admin/incidents");
        const dataInc = await resInc.json();
        const assigned = dataInc.incidents.filter((i: any) => i.assignedTo?._id === id);
        setIncidents(assigned);

      } catch (error) {
        console.error("Error fetching details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (!tech) return <div className="p-10 text-center text-red-500">Technician not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/admin/technicians" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Technicians
        </Link>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 mb-8 shadow-sm flex flex-col md:flex-row items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold">
            {tech.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tech.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {tech.email}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> {tech.department}
              </div>
              <div className={`flex items-center gap-2 font-medium ${tech.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                {tech.isAvailable ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {tech.isAvailable ? "Available" : "Offline"}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Tasks */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Assigned Incidents ({incidents.length})</h2>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          {incidents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No active tasks assigned.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase font-medium">
                <tr>
                  <th className="px-6 py-3">Incident</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {incidents.map((inc) => (
                  <tr key={inc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{inc.title}</td>
                    <td className="px-6 py-4">{inc.priority}</td>
                    <td className="px-6 py-4">{inc.status}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/incidents/${inc._id}`} className="text-blue-600 hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}