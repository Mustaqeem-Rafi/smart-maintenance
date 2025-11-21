import React from 'react';
import ClientProfileView from './ClientProfileView'; // We will create this next

export default function StudentProfilePage() {
  // In a real app, fetch this from your API/DB based on session
  const studentData = {
    name: "John Doe",
    id: "student_001",
    email: "john.doe@university.edu",
    department: "Computer Science",
    year: "3rd Year",
    phone: "+91 98765 43210",
    avatar: "JD", // Initials
    stats: {
      totalReports: 12,
      resolved: 10,
      pending: 2
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ClientProfileView user={studentData} />
    </div>
  );
}