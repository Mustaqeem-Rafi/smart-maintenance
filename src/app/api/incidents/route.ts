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
      assignedTo: null, // <--- JOB POOL: Null means "Up for grabs"
      status: 'Open',   // <--- JOB POOL: Open status
      createdAt: new Date(),
      history: [{ action: 'Created', by: reporter._id, date: new Date() }]
    });

    // --- 6. NOTIFICATIONS (To Admins) ---
    // (Optional: You could also notify Technicians here via Department Map if you have a Notification model setup)
    try {
        const admins = await User.find({ role: 'admin' });
        const notifications = admins.map(admin => ({
            userId: admin._id,
            incidentId: newIncident._id,
            title: "New Incident Reported",
            message: `${reporter.name} reported: "${title}" (${category}). Priority: ${autoPriority}`,
            type: 'info',
            createdAt: new Date()
        }));
        
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
    } catch (err) {
        console.error("Notification Error (Non-blocking):", err);
    }

    return NextResponse.json({ 
        message: "Incident Reported! Sent to Department Pool.", 
        priority: autoPriority, 
        incident: newIncident 
    }, { status: 201 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}