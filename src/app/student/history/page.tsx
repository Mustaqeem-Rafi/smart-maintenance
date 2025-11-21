import dbConnect from '@/src/lib/db';
import Complaint, { IComplaint } from '@/src/models/Complaint';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic'; // Ensure data is fetched on every request

async function getStudentComplaints(studentId: string): Promise<IComplaint[]> {
  await dbConnect();
  
  const complaints = await Complaint.find({ studentId: studentId })
                                    .sort({ dateSubmitted: -1 })
                                    .lean();
  
  // Serialize the data for passing to the client component
  return JSON.parse(JSON.stringify(complaints));
}


export default async function StudentHistoryPage() {
  const DUMMY_STUDENT_ID = 'student_001';
  const complaints = await getStudentComplaints(DUMMY_STUDENT_ID);

  return (
    <div className="p-8 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">My Incident & Complaint History</h1>
      
      <div className="space-y-6">
        
        {complaints.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-gray-50">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-lg text-gray-600">You have not submitted any complaints yet.</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint._id.toString()} className="border p-5 rounded-lg shadow-sm transition hover:shadow-md bg-white">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{complaint.title}</h2>
                <div className={`px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1 ${
                  complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                  complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {complaint.status === 'Resolved' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  {complaint.status}
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">{complaint.description.substring(0, 150)}...</p>
              
              <div className="text-sm text-gray-500 flex justify-between">
                <p><strong>Category:</strong> {complaint.category}</p>
                <p>
                  <strong>Reported:</strong> {new Date(complaint.dateSubmitted).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
        
      </div>
    </div>
  );
}