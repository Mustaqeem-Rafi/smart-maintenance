import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import Notification from "@/src/models/Notification";
import User from "@/src/models/User";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();

    if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Fetch with populate to get reporter name for the message
    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      { 
        status: status,
        resolvedAt: status === 'Resolved' ? new Date() : null
      },
      { new: true }
    ).populate('reportedBy', 'name');

    if (!updatedIncident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    // --- NOTIFICATIONS ---
    if (status === 'Resolved') {
      
      // 1. Notify Reporter (Student/Staff)
      // We use (updatedIncident.reportedBy as any)._id because TS sees it as just an ObjectId or just a Name string depending on population
      await Notification.create({
        userId: (updatedIncident.reportedBy as any)._id, 
        incidentId: updatedIncident._id,
        title: "Issue Resolved",
        message: `Your report "${updatedIncident.title}" has been marked as Resolved.`,
        type: 'resolved'
      });

      // 2. Notify All Admins
      const admins = await User.find({ role: 'admin' });
      const adminNotifs = admins.map(admin => ({
        userId: admin._id,
        incidentId: updatedIncident._id,
        title: "Incident Resolved",
        // --- FIX IS HERE: Cast to 'any' to read the populated 'name' ---
        message: `The issue "${updatedIncident.title}" reported by ${(updatedIncident.reportedBy as any).name} is now Resolved.`,
        type: 'resolved'
      }));
      
      if (adminNotifs.length > 0) {
        await Notification.insertMany(adminNotifs);
      }
    }
    // ---------------------

    return NextResponse.json({ success: true, incident: updatedIncident });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}