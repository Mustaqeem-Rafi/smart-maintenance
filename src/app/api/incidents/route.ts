import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User";
import Notification from "@/src/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"; 

// --- 1. CONFIGURATION: DEPARTMENT MAPPING ---
const DEPARTMENT_MAP: Record<string, string> = {
  "Electricity": "Electrical",
  "Electrical": "Electrical",
  "Water Supply": "(Plumber|Plumbing|Water)", 
  "Water-Supply": "(Plumber|Plumbing|Water)", 
  "Water": "(Plumber|Plumbing|Water)",
  "Plumbing": "(Plumber|Plumbing|Water)",
  "Internet / Wi-Fi": "(Network Engineer|Internet|Wifi)",
  "Internet": "(Network Engineer|Internet|Wifi)",
  "Wi-Fi": "(Network Engineer|Internet|Wifi)",
  "Civil / Furniture": "(Civil|Carpenter)",
  "Civil": "(Civil|Carpenter)",
  "Furniture": "(Civil|Carpenter)",
  "Lift": "Lift Mechanic"
};

// --- 2. SMART PRIORITY LOGIC ---
function calculatePriority(title: string, description: string): 'High' | 'Medium' | 'Low' {
  const text = `${title || ""} ${description || ""}`.toLowerCase();
  const highKeywords = ["severe", "critical", "urgent", "emergency", "danger", "fire", "smoke", "flood", "leak", "burst", "broken", "failure", "hazard", "shock", "outage", "dead"];
  const lowKeywords = ["minor", "cosmetic", "suggestion", "low", "noise", "flicker", "scratch", "dirty", "cleaning", "paint"];
  
  if (highKeywords.some(k => text.includes(k))) return 'High';
  if (lowKeywords.some(k => text.includes(k))) return 'Low';
  return 'Medium';
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, description, category, location, images, studentEmail } = body;

    // --- 3. AUTHENTICATION (Hybrid) ---
    // Try to get logged-in user first
    let reporter;
    const session = await getServerSession(authOptions);
    
    if (session?.user?.email) {
        reporter = await User.findOne({ email: session.user.email });
    } 
    
    // Fallback: Check body for studentEmail (Testing mode)
    if (!reporter && studentEmail) {
        reporter = await User.findOne({ email: studentEmail });
    }

    // Fallback: Guest User
    if (!reporter) {
        reporter = await User.findOne({ role: 'student', email: { $regex: /^guest/ } });
        if (!reporter) {
             reporter = await User.create({
                name: "Guest Student",
                email: `guest${Date.now()}@college.edu`,
                role: 'student'
            });
        }
    }

    // --- 4. DUPLICATE DETECTION (Smart) ---
    if (location && location.coordinates) {
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

        // Stop-word filtering for better title matching
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
    }

    // --- 5. JOB POOL LOGIC (Requirement: Show to ALL in dept) ---
    // We purposely set assignedTo = null so it appears in the 'Pool'
    // for everyone matching the category.
    
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}