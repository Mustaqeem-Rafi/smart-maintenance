import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/src/lib/db';
import Incident from '@/src/models/Incident';
import User from '@/src/models/User';
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';
import ClientHistoryList from './ClientHistoryList';

export const dynamic = 'force-dynamic';

export default async function StudentHistoryPage() {
  await dbConnect();

  // 1. Auth Check
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect('/login');
  }

  // 2. Get User ID
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    redirect('/login');
  }

  // 3. Fetch Incidents (Replacing old 'Complaint' logic)
  const incidentsRaw = await Incident.find({ reportedBy: user._id })
    .sort({ createdAt: -1 })
    .lean();

  // Serialize for Client Component
  const incidents = JSON.parse(JSON.stringify(incidentsRaw));

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Case History</h1>
          <p className="text-slate-500 mt-2 text-lg">
            View the live status and timeline of all your reported issues.
          </p>
        </div>
        
        {/* Pass real data to Client Component */}
        <ClientHistoryList complaints={incidents} />
      </div>
    </div>
  );
}