import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import User from '@/src/models/User';
import Incident from '@/src/models/Incident';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    console.log("🌱 Starting Smart Seed (Additive Mode)...");

    // 1. FIND AN EXISTING REPORTER
    // We need a real user ID to link these incidents to.
    // We try to find a student, or fall back to any user.
    let reporter = await User.findOne({ role: 'student' });
    
    if (!reporter) {
      // Fallback: Try finding ANY user
      reporter = await User.findOne({});
    }

    if (!reporter) {
      return NextResponse.json(
        { error: "No users found! Please register a user via /register first." }, 
        { status: 400 }
      );
    }

    console.log(`📝 Assigning smart data to user: ${reporter.name} (${reporter._id})`);

    // --- HELPER: Create Date relative to now ---
    const daysAgo = (days: number, hour: number = 10) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      d.setHours(hour, 0, 0, 0);
      return d;
    };

    const incidents = [];

    // ====================================================
    // STORY 1: THE DYING ELEVATOR (Deterioration Model)
    // Intervals shrinking: 20 -> 15 -> 10 -> 5 days
    // ====================================================
    const elevatorDates = [5, 15, 30, 50];
    elevatorDates.forEach((day) => {
      incidents.push({
        title: "Elevator Stuck on 2nd Floor",
        description: "Elevator door not closing properly and making grinding noise.",
        category: "Civil",
        priority: "High",
        status: "Resolved",
        location: { type: "Point", coordinates: [77.6, 12.9], address: "Hostel C - Elevator Shaft" },
        reportedBy: reporter._id,
        createdAt: daysAgo(day)
      });
    });

    // ====================================================
    // STORY 2: THE CLOCKWORK AC (High Confidence Model)
    // Fails exactly every 14 days. Last one 13 days ago.
    // ====================================================
    [13, 27, 41, 55, 69].forEach((day) => {
      incidents.push({
        title: "Library AC Not Cooling",
        description: "Air conditioner blowing warm air. Filter seems clogged.",
        category: "Electricity",
        priority: "Medium",
        status: "Resolved",
        location: { type: "Point", coordinates: [77.59, 12.91], address: "Central Library - Reading Room" },
        reportedBy: reporter._id,
        createdAt: daysAgo(day)
      });
    });

    // ====================================================
    // STORY 3: THE MONDAY CURSE (Seasonality Model)
    // Fails only on Mondays.
    // ====================================================
    let current = new Date();
    let mondaysFound = 0;
    while (mondaysFound < 5) {
      current.setDate(current.getDate() - 1);
      if (current.getDay() === 1) { // 1 = Monday
        incidents.push({
          title: "Gym Water Cooler Leaking",
          description: "Water cooler leaking puddle on the floor.",
          category: "Water",
          priority: "Medium",
          status: "Resolved",
          location: { type: "Point", coordinates: [77.61, 12.92], address: "Sports Complex - Gym" },
          reportedBy: reporter._id,
          createdAt: new Date(current)
        });
        mondaysFound++;
      }
    }

    // ====================================================
    // STORY 4: THE CHAIN REACTION (Correlation Model)
    // "Main Block Power" fails -> 2 hours later -> "Main Block Wifi" fails
    // ====================================================
    [2, 10, 20].forEach((day) => {
      // Event A: Power Cut
      incidents.push({
        title: "Main Block Power Outage",
        description: "Complete blackout in the west wing.",
        category: "Electricity",
        priority: "High",
        status: "Resolved",
        location: { type: "Point", coordinates: [77.62, 12.93], address: "Main Block" },
        reportedBy: reporter._id,
        createdAt: daysAgo(day, 10) // 10:00 AM
      });

      // Event B: Wifi Down (2 hours later)
      incidents.push({
        title: "Main Block Wi-Fi Down",
        description: "Routers are off due to earlier power surge.",
        category: "Internet",
        priority: "High",
        status: "Resolved",
        location: { type: "Point", coordinates: [77.62, 12.93], address: "Main Block" },
        reportedBy: reporter._id,
        createdAt: daysAgo(day, 12) // 12:00 PM
      });
    });

    // ====================================================
    // STORY 5: THE SPATIAL CLUSTER (Anomaly Model)
    // 5 random failures in "Science Block" TODAY
    // ====================================================
    const scienceIssues = [
      { cat: "Water", title: "Lab Sink Clogged" },
      { cat: "Electricity", title: "Projector Sparking" },
      { cat: "Civil", title: "Ceiling Tile Falling" },
      { cat: "Internet", title: "Lab PC No Network" },
      { cat: "Other", title: "Strange Gas Smell" }
    ];

    scienceIssues.forEach((issue, idx) => {
      incidents.push({
        title: issue.title,
        description: "Reported during lab session.",
        category: issue.cat,
        priority: "High",
        status: "Open",
        location: { type: "Point", coordinates: [77.63, 12.94], address: "Science Block - Chemistry Lab" },
        reportedBy: reporter._id,
        createdAt: new Date(Date.now() - idx * 1000 * 60 * 30) // Every 30 mins today
      });
    });

    // 2. Insert the Data (Append, do not delete)
    await Incident.insertMany(incidents);

    return NextResponse.json({ 
      message: "Smart Data Injected Successfully!", 
      details: `Added ${incidents.length} incidents to existing database. Assigned to user: ${reporter.name}.`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}