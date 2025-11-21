export default function StudentProfilePage() {
  const DUMMY_STUDENT_ID = 'student_001';

  return (
    <div className="p-8 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Student Profile & Settings</h1>
      
      <div className="space-y-6">
        
        {/* Profile Information */}
        <div className="border p-4 rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Basic Information</h2>
          <p><strong>Name:</strong> John Doe (DUMMY)</p>
          <p><strong>ID:</strong> {DUMMY_STUDENT_ID}</p>
          <p><strong>Email:</strong> john.doe@university.edu</p>
          <p><strong>Department:</strong> Computer Science</p>
        </div>
        
        {/* Settings Placeholder */}
        <div className="border p-4 rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Account Settings</h2>
          <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
            Change Password
          </button>
          <p className="mt-3 text-sm text-gray-600">
            (Future feature: Update contact information, privacy settings.)
          </p>
        </div>
        
      </div>
    </div>
  );
}