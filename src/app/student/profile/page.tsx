import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/src/lib/db';
import User from '@/src/models/User';
import Incident from '@/src/models/Incident';
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';
import ClientProfileView from './ClientProfileView'; 

export const dynamic = 'force-dynamic';

export default async function StudentProfilePage() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect('/login');
  }

  // Fetch User Data
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) redirect('/login');

  // Fetch Real Stats
  const totalReports = await Incident.countDocuments({ reportedBy: user._id });
  const resolvedReports = await Incident.countDocuments({ reportedBy: user._id, status: 'Resolved' });
  const pendingReports = await Incident.countDocuments({ reportedBy: user._id, status: { $in: ['Open', 'In Progress'] } });

  // Prepare Data Object
  const studentData = {
    name: user.name,
    id: user._id.toString().slice(-6).toUpperCase(), // Mocking a student ID from MongoID
    email: user.email,
    department: user.department || "General",
    year: "Current", // Field doesn't exist in DB yet, keeping static
    phone: "Not Provided", // Field doesn't exist in DB yet
    avatar: user.name.charAt(0).toUpperCase(),
    stats: {
      totalReports,
      resolved: resolvedReports,
      pending: pendingReports
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ClientProfileView user={studentData} />
    </div>
  );
}