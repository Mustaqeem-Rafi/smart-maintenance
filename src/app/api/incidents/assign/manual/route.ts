import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User";
import Notification from "@/src/models/Notification";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { incidentId, technicianId } = await req.json();

    // 1. Fetch Technician details FIRST to validate
    const technician = await User.findById(technicianId);
    if (!technician) {
        return NextResponse.json({ error: "Technician not found" }, { status: 404 });
    }

    // 2. Update Incident
    const incident = await Incident.findByIdAndUpdate(
        incidentId, 
        { assignedTo: technicianId, status: "In Progress" },
        { new: true }
    );

    if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });

    const admins = await User.find({ role: 'admin' });

    // --- NOTIFICATIONS ---
    const notifications = [];

    // A. Notify the Reporter ONLY
    notifications.push({
      userId: incident.reportedBy, 
      incidentId: incident._id,
      title: "Technician Assigned",
      // Now safe to access technician.name because we checked it above
      message: `Technician ${technician.name} is now working on your report: "${incident.title}".`,
      type: 'assigned'
    });

    // B. Notify the Assigned Technician ONLY
    notifications.push({
      userId: technicianId, 
      incidentId: incident._id,
      title: "New Task",
      message: `You have been assigned to: "${incident.title}".`,
      type: 'info'
    });

    // C. Notify ADMINS
    admins.forEach(admin => {
      notifications.push({
        userId: admin._id,
        incidentId: incident._id,
        title: "Assignment Update",
        message: `Assigned ${technician.name} to ticket #${incident._id.toString().slice(-6).toUpperCase()}.`,
        type: 'info'
      });
    });

    await Notification.insertMany(notifications);

    return NextResponse.json({ success: true, message: "Assigned successfully." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}