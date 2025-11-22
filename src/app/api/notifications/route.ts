import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/src/lib/db";
import Notification from "@/src/models/Notification";
import User from "@/src/models/User";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(20); // Limit to last 20

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}