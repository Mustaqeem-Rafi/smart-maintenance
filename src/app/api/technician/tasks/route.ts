import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import Incident from '@/src/models/Incident';
import User from '@/src/models/User';
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    await connectDB();

    // 1. Securely identify the user from the session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    console.log(`🔍 Fetching tasks for logged-in user: ${email}`);

    // 2. Find the Technician Profile
    const technician = await User.findOne({ email });

    if (!technician) {
        return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // 3. Role Check (Security Layer)
    // Optional: Allow admins to peek, but strictly lock down others
    if (technician.role !== 'technician' && technician.role !== 'admin') {
        return NextResponse.json({ error: "Access Denied. Technician role required." }, { status: 403 });
    }

    // 4. Fetch Assigned Tasks
    const tasks = await Incident.find({ 
        assignedTo: technician._id,
        status: { $ne: 'Resolved' } // Show active tasks (Open/In Progress)
    }).sort({ createdAt: -1 });

    return NextResponse.json({ tasks });

  } catch (error: any) {
    console.error("Fetch Tasks Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}