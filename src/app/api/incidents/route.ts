import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User";

// Smart Priority Logic
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
    const body = await req.json();
    const { title, description, category, location } = body;

    // Duplicate Detection (20m radius)
    const [longitude, latitude] = location.coordinates;
    const duplicate = await Incident.findOne({
      category: category,
      status: { $in: ['Open', 'In Progress'] }, 
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: 20 
        }
      }
    });

    if (duplicate) {
      return NextResponse.json({ error: "Duplicate Incident Detected!", message: `A similar ${category} report exists nearby.` }, { status: 409 });
    }

    // Find Reporter (Simulated Auth for now)
    let reporter = await User.findOne({ role: 'student' });
    if (!reporter) {
        reporter = await User.create({ name: "Guest Student", email: `guest${Date.now()}@college.edu`, role: 'student', password: "guest" });
    }

    // Create Incident
    const autoPriority = calculatePriority(title, description);
    const newIncident = await Incident.create({
      ...body,
      priority: autoPriority,
      reportedBy: reporter._id,
      status: 'Open',
      createdAt: new Date()
    });

    return NextResponse.json({ message: "Incident Reported!", priority: autoPriority, incident: newIncident }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}