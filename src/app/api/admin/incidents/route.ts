import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User"; // <--- CRITICAL: You MUST import this here!

export async function GET(req: Request) {
  try {
    await connectDB();
    
    // Ensure the User model is registered before querying
    console.log("User model registered:", !!User); 

    const incidents = await Incident.find({})
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email'); // This needs the User model to work

    return NextResponse.json({ incidents });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}