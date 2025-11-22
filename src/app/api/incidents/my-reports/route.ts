import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectDB();
    
    // 1. Get Session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find User ID from Email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Find incidents reported by this specific user
    const incidents = await Incident.find({ reportedBy: user._id })
      .sort({ createdAt: -1 }); // Newest first

    return NextResponse.json({ incidents });

  } catch (error: any) {
    console.error("My Reports API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}