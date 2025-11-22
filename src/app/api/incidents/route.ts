import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User";
import Notification from "@/src/models/Notification"; // Import Notification
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"; 

// Smart Priority Logic (Keep existing)
function calculatePriority(title: string, description: string): 'High' | 'Medium' | 'Low' {
  const text = `${title || ""} ${description || ""}`.toLowerCase();
  const highKeywords = ["severe", "critical", "urgent", "emergency", "danger", "fire", "smoke", "flood", "leak", "burst", "broken", "failure", "hazard", "shock", "outage", "dead"];
  const lowKeywords = ["minor", "cosmetic", "suggestion", "low", "noise", "flicker", "scratch", "dirty", "cleaning", "paint"];

  if (highKeywords.some((word) => text.includes(word))) return "High";
  if (lowKeywords.some((word) => text.includes(word))) return "Low";
  return "Medium";
}

export async function POST(req: Request) {
  try {
    await connectDB();
    
    // 1. Get Current User Session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // 2. Find the User in DB
    const reporter = await User.findOne({ email: session.user.email });
    if (!reporter) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, category, location, images } = body;

    // 3. Duplicate Detection Logic
    const [longitude, latitude] = location.coordinates;
    const potentialDuplicates = await Incident.find({
      category: category,
      status: { $in: ['Open', 'In Progress'] }, 
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: 20 // 20 meters
        }
      }
    });

    const stopWords = ['the', 'and', 'is', 'at', 'in', 'on', 'to', 'for', 'of', 'a', 'an', 'my', 'not', 'working'];
    const newKeywords = title.toLowerCase().split(/\s+/)
      .filter((w: string) => w.length > 2 && !stopWords.includes(w));

    const isRealDuplicate = potentialDuplicates.some((existing: any) => {
      const existingTitle = existing.title.toLowerCase();
      return newKeywords.some((keyword: string) => existingTitle.includes(keyword));
    });

    if (isRealDuplicate) {
      return NextResponse.json({ 
        error: "Duplicate Incident Detected!", 
        message: `A similar report about "${category}" already exists at this location.` 
      }, { status: 409 });
    }

    // 4. Create Incident
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

    // --- NEW: Notify Admins ---
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      userId: admin._id,
      incidentId: newIncident._id,
      title: "New Incident Reported",
      message: `${reporter.name} reported: "${title}" (${category}). Priority: ${autoPriority}`,
      type: 'info'
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    // --------------------------

    return NextResponse.json({ message: "Incident Reported!", priority: autoPriority, incident: newIncident }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}