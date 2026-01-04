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

    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      { 
        status: status,
        resolvedAt: status === 'Resolved' ? new Date() : null
      },
      { new: true }
    ).populate('reportedBy', 'name').populate('assignedTo', 'name');

    if (!updatedIncident) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // --- NOTIFICATIONS ---
    if (status === 'Resolved') {
      const notifications = [];
      const admins = await User.find({ role: 'admin' });

      // A. Notify Reporter ONLY
      // We use 'as any' because populated field structure differs from ObjectId
      notifications.push({
        userId: (updatedIncident.reportedBy as any)._id, 
        incidentId: updatedIncident._id,
        title: "Issue Resolved",
        message: `Your report "${updatedIncident.title}" is now Resolved.`,
        type: 'resolved'
      });

      // B. Notify Assigned Technician (Optional but good for closure)
      if (updatedIncident.assignedTo) {
        notifications.push({
          userId: (updatedIncident.assignedTo as any)._id,
          incidentId: updatedIncident._id,
          title: "Ticket Closed",
          message: `Ticket "${updatedIncident.title}" marked resolved.`,
          type: 'info'
        });
      }

      // C. Notify ADMINS
      admins.forEach(admin => {
        notifications.push({
          userId: admin._id,
          incidentId: updatedIncident._id,
          title: "Incident Resolved",
          message: `Ticket "${updatedIncident.title}" is now Resolved.`,
          type: 'resolved'
        });
      });
      
      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ success: true, incident: updatedIncident });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}