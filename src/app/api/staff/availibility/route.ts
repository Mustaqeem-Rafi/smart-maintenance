import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import User from "@/src/models/User";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { email, isAvailable } = await req.json();

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await User.findOneAndUpdate(
      { email },
      { isAvailable },
      { new: true }
    );

    // --- ADD THIS CHECK ---
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Now it is safe to access user.isAvailable
    return NextResponse.json({ success: true, isAvailable: user.isAvailable });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}