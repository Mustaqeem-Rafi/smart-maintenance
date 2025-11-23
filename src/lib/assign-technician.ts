import User from '@/src/models/User';

// Map Incident Categories to Technician Departments
const DEPARTMENT_MAP: Record<string, string> = {
  'Water': 'Plumbing',
  'Electricity': 'Electrical',
  'Internet': 'Internet',
  'Civil': 'Civil',
  'HVAC': 'HVAC',
  'Other': 'General'
};

export async function findAvailableTechnician(category: string): Promise<string | null> {
  const targetDept = DEPARTMENT_MAP[category] || 'General';

  // Find a technician who is:
  // 1. In the correct department
  // 2. Marked as 'isAvailable'
  // 3. Has the 'technician' role
  // Sort by oldest created to distribute work (Round Robin-ish)
  const technician = await User.findOne({
    role: 'technician',
    department: targetDept,
    isAvailable: true
  }).sort({ createdAt: 1 }); 

  if (technician) {
    return technician._id.toString();
  }

  return null;
}