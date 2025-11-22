import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import User from "@/src/models/User";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { email, name, department } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Update the user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { name, department },
      { new: true } // Return the updated document
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}