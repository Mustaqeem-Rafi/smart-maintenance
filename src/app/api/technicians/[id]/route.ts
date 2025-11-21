import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import User from "@/src/models/User";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // 1. Check if user exists
    const technician = await User.findById(id);
    if (!technician) {
      return NextResponse.json(
        { error: "Technician not found" },
        { status: 404 }
      );
    }

    // 2. Delete the user
    await User.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Technician deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}