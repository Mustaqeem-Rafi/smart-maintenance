import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import Notification from "@/src/models/Notification"; // Import Notification Model

export async function POST(req: Request) {
  try {
    await connectDB();
    const { incidentId, technicianId } = await req.json();

    const incident = await Incident.findByIdAndUpdate(
        incidentId, 
        { 
            assignedTo: technicianId,
            status: "In Progress" 
        },
        { new: true }
    );

    if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });

    // --- CREATE NOTIFICATION ---
    await Notification.create({
      userId: incident.reportedBy, // Notify the reporter
      incidentId: incident._id,
      title: "Technician Assigned",
      message: `A technician has been assigned to your report: "${incident.title}". Work will begin shortly.`,
      type: 'assigned'
    });
    // ---------------------------

    return NextResponse.json({ success: true, message: "Technician assigned successfully." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}