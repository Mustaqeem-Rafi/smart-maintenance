import React from 'react';
import dbConnect from '@/src/lib/db';
import Complaint, { IComplaint } from '@/src/models/Complaint';
import ClientHistoryList from './ClientHistoryList'; // import from same directory (create ClientHistoryList.tsx if missing)

// Ensure data is fetched on every request
export const dynamic = 'force-dynamic';

async function getStudentComplaints(studentId: string) {
  await dbConnect();
  
  const complaints = await Complaint.find({ studentId: studentId })
                                    .sort({ dateSubmitted: -1 })
                                    .lean();
  
  // Serialize the data (convert MongoDB objects to simple JSON)
  return JSON.parse(JSON.stringify(complaints));
}

export default async function StudentHistoryPage() {
  const DUMMY_STUDENT_ID = 'student_001';
  const complaints = await getStudentComplaints(DUMMY_STUDENT_ID);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Case History</h1>
          <p className="text-slate-500 mt-2 text-lg">
            View the live status and timeline of all your reported issues.
          </p>
        </div>
        
        {/* Pass the data to the Client Component for the fancy UI */}
        <ClientHistoryList complaints={complaints} />
      </div>
    </div>
  );
}