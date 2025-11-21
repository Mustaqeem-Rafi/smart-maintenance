import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User"; // Required for population

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    // Await params in Next.js 15+
    const { id } = await params;

    const incident = await Incident.findById(id)
      .populate("reportedBy", "name email") // Get Reporter Name
      .populate("assignedTo", "name email specialisation"); // Get Technician Name

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ incident });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}