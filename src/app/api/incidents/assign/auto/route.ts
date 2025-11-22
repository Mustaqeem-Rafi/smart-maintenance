import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User";
import Notification from "@/src/models/Notification";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { incidentId } = await req.json();

    // 1. Fetch Incident
    const incident = await Incident.findById(incidentId);
    if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });

    if (incident.assignedTo) {
      return NextResponse.json({ error: "Incident is already assigned." }, { status: 400 });
    }

    // 2. Find Candidates (Filter by Specialty)
    // We look for technicians whose 'department' matches the incident 'category'
    let candidates = await User.find({ 
      role: "technician", 
      department: incident.category 
    });

    // Fallback: If no specialists found, consider ALL technicians
    if (candidates.length === 0) {
      candidates = await User.find({ role: "technician" });
    }

    if (candidates.length === 0) {
      return NextResponse.json({ error: "No technicians found in the system." }, { status: 404 });
    }

    // 3. Calculate Workload for each candidate
    const candidatesWithStats = await Promise.all(
      candidates.map(async (tech) => {
        const activeTasks = await Incident.countDocuments({
          assignedTo: tech._id,
          status: { $in: ['Open', 'In Progress'] }
        });
        return { ...tech.toObject(), activeTasks };
      })
    );

    // 4. Intelligent Sorting Logic
    // Priority 1: Is Available? (True comes first)
    // Priority 2: Lowest Active Tasks
    candidatesWithStats.sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1; // a is free, b is busy -> a wins
      if (!a.isAvailable && b.isAvailable) return 1;  // b is free, a is busy -> b wins
      
      // If availability is same, pick the one with fewer tasks
      return a.activeTasks - b.activeTasks;
    });

    const bestTech = candidatesWithStats[0];

    // 5. Assign the Technician
    incident.assignedTo = bestTech._id;
    incident.status = "In Progress";
    await incident.save();

    // --- CREATE NOTIFICATION ---
    await Notification.create({
      userId: incident.reportedBy, 
      incidentId: incident._id,
      title: "Technician Assigned",
      message: `Auto-assign successful. ${bestTech.name} is now handling your report: "${incident.title}".`,
      type: 'assigned'
    });
    // ---------------------------

    return NextResponse.json({ 
      success: true, 
      message: "Assignment Successful",
      techName: bestTech.name,
      techLoad: bestTech.activeTasks 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}