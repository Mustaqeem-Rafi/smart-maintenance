import dbConnect from '@/src/lib/db';
import Complaint from '@/src/models/Complaint';
import { IComplaint } from '@/src/models/Complaint';
import { AlertTriangle } from 'lucide-react';


// Tell Next.js this is a server component that can fetch data
export const dynamic = 'force-dynamic';

// Function to fetch all complaints for a specific (placeholder) student
async function getStudentComplaints(studentId: string): Promise<IComplaint[]> {
  await dbConnect(); // Ensure connection is established
  
  // In a real app, you would use authentication to get the real studentId
  const complaints = await Complaint.find({ studentId: studentId })
                                    .sort({ dateSubmitted: -1 })
                                    .lean(); // .lean() makes the result plain JavaScript objects
  
  // Mongoose returns dates as objects, convert them to serializable strings for Next.js
  return JSON.parse(JSON.stringify(complaints));
}


export default async function StudentDashboard() {
  const DUMMY_STUDENT_ID = 'student_001'; // Placeholder for testing
  const complaints = await getStudentComplaints(DUMMY_STUDENT_ID);



  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === COLUMN 1 & 2: PROFILE AND NEW COMPLAINT FORM === */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Student Profile Overview */}
          <div className="p-6 bg-white shadow rounded-lg border-t-4 border-blue-500">
            <h2 className="text-xl font-semibold mb-2">My Profile</h2>
            <p><strong>Name:</strong> John Doe (DUMMY)</p>
            <p><strong>ID:</strong> {DUMMY_STUDENT_ID}</p>
            <p><strong>Email:</strong> john.doe@university.edu</p>
          </div>
          
          {/* NEW COMPLAINT FORM INTEGRATION */}
          // Use an anchor tag to link directly to your existing report page
<div className="p-6 bg-white shadow rounded-lg border-t-4 border-red-500 text-center">
  <h2 className="text-xl font-semibold mb-3">Found a New Issue?</h2>
  <a 
    href="/report" 
    className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
  >
    <AlertTriangle className="w-5 h-5"/>
    Report New Incident
  </a>
</div>
        </div>

        {/* === COLUMN 3: COMPLAINT HISTORY === */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Complaint History ({complaints.length})</h2>
          
          {/* Complaint History Table (Simplified for column) */}
          <div className="bg-white shadow rounded-lg p-4">
            {complaints.length === 0 ? (
              <p className="text-center text-gray-500">No complaints filed yet.</p>
            ) : (
              // Display only a small history list here
              complaints.slice(0, 5).map((complaint) => (
                <div key={complaint._id.toString()} className="border-b py-2 last:border-b-0">
                  <p className="font-medium text-sm text-gray-800">{complaint.title}</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {complaint.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <a href="/" className="text-blue-500 hover:underline">← Back to Home</a>
      </div>
    </div>
  );
}