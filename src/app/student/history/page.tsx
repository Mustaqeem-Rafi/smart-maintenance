import React from 'react';
import { getServerSession } from 'next-auth';
import dbConnect from '@/src/lib/db';
import Incident from '@/src/models/Incident';
import User from '@/src/models/User';
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';
import ClientHistoryList from './ClientHistoryList'; 

export const dynamic = 'force-dynamic';

async function getStudentIncidents() {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await User.findOne({ email: session.user.email });
  if (!user) return [];

  const incidents = await Incident.find({ reportedBy: user._id })
                                  .sort({ createdAt: -1 })
                                  .lean();
  
  // Transform data to match what ClientHistoryList expects
  // (Mapping 'createdAt' to 'dateSubmitted' to avoid changing the client component)
  return JSON.parse(JSON.stringify(incidents)).map((inc: any) => ({
    ...inc,
    dateSubmitted: inc.createdAt // Map for compatibility
  }));
}

export default async function StudentHistoryPage() {
  const complaints = await getStudentIncidents();

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Case History</h1>
          <p className="text-slate-500 mt-2 text-lg">
            View the live status and timeline of all your reported issues.
          </p>
        </div>
        
        <ClientHistoryList complaints={complaints} />
      </div>
    </div>
  );
}