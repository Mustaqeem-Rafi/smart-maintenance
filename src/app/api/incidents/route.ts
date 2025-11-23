<<<<<<< Updated upstream
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
=======
import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import Incident from '@/src/models/Incident';
import User from '@/src/models/User';

// --- ROBUST CONFIGURATION ---
// Maps variations of Incident Categories to DB Department Keywords
const DEPARTMENT_MAP: Record<string, string> = {
  // Electrical Variations
  "Electricity": "Electrical",
  "Electrical": "Electrical",
  
  // Water / Plumbing Variations (Covers Ajay Singh)
  "Water Supply": "(Plumber|Plumbing|Water)", 
  "Water-Supply": "(Plumber|Plumbing|Water)", 
  "Water": "(Plumber|Plumbing|Water)",
  "Plumbing": "(Plumber|Plumbing|Water)",
>>>>>>> Stashed changes

  // Internet Variations
  "Internet / Wi-Fi": "(Network Engineer|Internet|Wifi)",
  "Internet": "(Network Engineer|Internet|Wifi)",
  "Wi-Fi": "(Network Engineer|Internet|Wifi)",

  // Civil Variations
  "Civil / Furniture": "(Civil|Carpenter)",
  "Civil": "(Civil|Carpenter)",
  "Furniture": "(Civil|Carpenter)",

  // Other
  "Lift": "Lift Mechanic"
};

export async function POST(req: Request) {
  try {
    await connectDB();
    
<<<<<<< Updated upstream
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
=======
    const body = await req.json();
    const { title, description, category, location, studentEmail } = body;

    console.log(`📝 New Report Received. Category: "${category}"`);

    // --- 1. DUPLICATE CHECK ---
    if (location && location.coordinates) {
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
          console.log("⚠️ Duplicate incident blocked.");
          return NextResponse.json(
            { error: "Duplicate Incident Detected!", message: `Similar report exists nearby.` }, 
            { status: 409 }
          );
        }
    }

    // --- 2. REPORTER AUTH ---
    let reporter = await User.findOne({ role: 'student' });
    if (studentEmail) {
        const foundUser = await User.findOne({ email: studentEmail });
        if (foundUser) reporter = foundUser;
    }
    if (!reporter) {
        reporter = await User.create({
            name: "Guest Student",
            email: `guest${Date.now()}@college.edu`,
            role: 'student'
        });
    }

    // --- 3. AUTO-ASSIGNMENT ---
    let assignedTo = null;
    
    // 1. Try Exact Match in Map
    // 2. If not found, try matching keys (e.g. "Water" inside "Water Supply")
    // 3. Fallback to category itself
    let targetDeptRegex = DEPARTMENT_MAP[category] || category;
    
    // Safety Check: If category didn't match keys exactly, try to find a partial key
    if (!DEPARTMENT_MAP[category]) {
        const partialKey = Object.keys(DEPARTMENT_MAP).find(k => category.includes(k) || k.includes(category));
        if (partialKey) {
            targetDeptRegex = DEPARTMENT_MAP[partialKey];
        }
    }
    
    console.log(`🤖 Auto-Assign: Looking for technician matching Regex: /${targetDeptRegex}/i`);

    // Search for technician (Case Insensitive, Partial Match)
    const qualifiedTechs = await User.find({
        role: 'technician', 
        department: { $regex: new RegExp(targetDeptRegex, 'i') }
    });

    if (qualifiedTechs.length > 0) {
        // Load Balance
        const techWorkloads = await Promise.all(qualifiedTechs.map(async (tech) => {
            const activeJobs = await Incident.countDocuments({
                assignedTo: tech._id,
                status: { $in: ['Open', 'In Progress'] }
            });
            return { id: tech._id, name: tech.name, count: activeJobs };
        }));

        techWorkloads.sort((a, b) => a.count - b.count);
        assignedTo = techWorkloads[0].id;
        console.log(`✅ Assigned to: ${techWorkloads[0].name} (Active Jobs: ${techWorkloads[0].count})`);
    } else {
        console.log(`⚠️ No technician found for regex /${targetDeptRegex}/i`);
        
        // LOG AVAILABLE TECHS FOR DEBUGGING
        const allTechs = await User.find({ role: 'technician' }).select('name department');
        console.log("DEBUG: Current DB Technicians:", allTechs.map(t => `${t.name}: "${t.department}"`));
    }

    // --- 4. CREATE INCIDENT ---
    const newIncident = await Incident.create({
      title,
      description,
      category,
      location,
      reportedBy: reporter._id,
      assignedTo: assignedTo,
      status: assignedTo ? 'In Progress' : 'Open',
      history: [{ action: 'Created', by: reporter._id, date: new Date() }]
    });

    return NextResponse.json({ 
        message: "Reported Successfully!", 
        incident: newIncident,
        autoAssigned: !!assignedTo 
    }, { status: 201 });
>>>>>>> Stashed changes

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}