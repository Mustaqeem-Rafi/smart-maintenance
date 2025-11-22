import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Notification from "@/src/models/Notification";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    await Notification.findByIdAndUpdate(id, { isRead: true });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}