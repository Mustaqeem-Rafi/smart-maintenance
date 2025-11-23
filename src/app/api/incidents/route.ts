
import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User";
import Notification from "@/src/models/Notification"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"; 

function calculatePriority(title: string, description: string): 'High' | 'Medium' | 'Low' {
  const text = `${title || ""} ${description || ""}`.toLowerCase();
  const highKeywords = ["severe", "critical", "urgent", "danger", "fire", "smoke", "flood", "leak", "broken", "shock"];
  if (highKeywords.some((word) => text.includes(word))) return "High";
  return "Medium"; 
}

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Identify the Reporter
    const reporter = await User.findOne({ email: session.user.email });
    if (!reporter) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { title, description, category, location, images } = body;

    // 2. Create Incident
    const autoPriority = calculatePriority(title, description);
    
    const newIncident = await Incident.create({
      title,
      description,
      category,
      location,
      images,
      priority: autoPriority,
      reportedBy: reporter._id, 
      status: 'Open',
      createdAt: new Date()
    });

    // --- NOTIFICATIONS ---
    const notifications = [];

    // A. Notify the Reporter (Student or Staff) ONLY
    notifications.push({
      userId: reporter._id,  
      incidentId: newIncident._id,
      title: "Report Submitted",
      message: `We have received your report: "${title}".`,
      type: 'info'
    });

    // B. Notify ADMINS
    const admins = await User.find({ role: 'admin' });
    admins.forEach(admin => {
      notifications.push({
        userId: admin._id,
        incidentId: newIncident._id,
        title: "New Incident Reported",
        message: `${reporter.name} reported: "${title}" (${category}).`,
        type: 'info'
      });
    });

    await Notification.insertMany(notifications);

    return NextResponse.json({ message: "Reported successfully", incident: newIncident }, { status: 201 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}