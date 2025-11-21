import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User"; // Critical import!

export async function GET(req: Request) {
  try {
    await connectDB();
    const incidents = await Incident.find({})
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name'); 

    return NextResponse.json({ incidents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}