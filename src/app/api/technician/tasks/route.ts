import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import Incident from '@/src/models/Incident';
import User from '@/src/models/User';

export async function GET(req: Request) {
  try {
    await connectDB();

    // Get the email from the URL query parameter (e.g., ?email=suresh@college.edu)
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email');

    // --- IDENTIFY THE TECHNICIAN ---
    
    // 1. Use the email from the URL if provided
    // 2. Fallback to "ramesh@college.edu" (Default Demo User)
    const targetEmail = queryEmail || "ramesh@college.edu";
    
    console.log(`🔍 searching for technician: ${targetEmail}`);

    let technician = await User.findOne({ email: targetEmail });

    // 3. Fallback: If that user doesn't exist, just grab the first technician found
    if (!technician) {
        console.log(`⚠️ User ${targetEmail} not found. Picking first available technician...`);
        technician = await User.findOne({ role: 'technician' });
    }

    if (!technician) {
        return NextResponse.json({ error: "No technician account found in database." }, { status: 404 });
    }

    console.log(`✅ Fetching tasks for: ${technician.name} (${technician.department})`);

    // --- FETCH TASKS ---
    const tasks = await Incident.find({ 
        assignedTo: technician._id,
        status: { $ne: 'Resolved' } 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ tasks });

  } catch (error: any) {
    console.error("Fetch Tasks Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}