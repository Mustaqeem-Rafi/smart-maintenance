import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"; // Make sure this export exists!

export async function GET(req: Request) {
  try {
    await connectDB();
    
    // Fetch all incidents, sorted by newest first
    const incidents = await Incident.find({})
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email'); // Get student details too

    return NextResponse.json({ incidents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}