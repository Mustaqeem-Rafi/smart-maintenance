import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import User from '@/src/models/User';
import Incident from '@/src/models/Incident';
import Prediction from '@/src/models/Prediction';
import Notification from '@/src/models/Notification';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    console.log("🌱 Starting Full-Proof Seed...");

    // 1. CLEAN SLATE (Incidents & Predictions only)
    // We wipe incidents to prevent "duplicate pattern" noise in the AI engine
    await Incident.deleteMany({});
    await Prediction.deleteMany({});
    await Notification.deleteMany({});
    console.log("🧹 Old data cleared.");

    // 2. ENSURE USERS EXIST (Upsert Strategy)
    const passwordHash = await bcrypt.hash("password123", 10);

    // Helper to create/update user
    const upsertUser = async (email: string, name: string, role: string, dept?: string) => {
      return await User.findOneAndUpdate(
        { email }, // Find by email
        { 
          name, 
          password: passwordHash, 
          role, 
          department: dept,
          isAvailable: true 
        },
        { upsert: true, new: true } // Create if not exists, return new doc
      );
    };

    const admin = await upsertUser("admin@college.edu", "Principal Admin", "admin");
    const student = await upsertUser("rahul@college.edu", "Rahul Student", "student");
    const tech = await upsertUser("ramesh@college.edu", "Ramesh Technician", "technician", "Electrical");

    console.log("👤 Users verified/created.");

    // 3. PLANT DATA STORIES (The AI Triggers)
    
    // --- HELPER: Relative Date ---
    const daysAgo = (days: number, hour: number = 10) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      d.setHours(hour, 0, 0, 0);
      return d;
    };

    const incidents = [];

    // STORY 1: THE DYING ELEVATOR (Deterioration)
    // Intervals: 20 -> 15 -> 10 -> 5 days (Accelerating failure)
    const elevatorDates = [5, 15, 30, 50];
    elevatorDates.forEach((day) => {
      incidents.push({
        title: "Elevator Stuck on 2nd Floor",
        description: "Elevator door not closing properly and making grinding noise.",
        category: "Civil",
        priority: "High",
        status: "Resolved",
        location: { type: "Point", coordinates: [77.6, 12.9], address: "Hostel C - Elevator Shaft" },
        reportedBy: student._id,
        resolvedAt: daysAgo(day - 1),
        createdAt: daysAgo(day)
      });
    });

    // STORY 2: THE CLOCKWORK AC (High Confidence Forecast)
    // Fails every 14 days. Last failure 13 days ago. Next is tomorrow.
    [13, 27, 41, 55, 69].forEach((day) => {
      incidents.push({
        title: "Library AC Not Cooling",
        description: "Air conditioner blowing warm air. Filter seems clogged.",
        category: "Electricity",
        priority: "Medium",
        status: "Resolved",
        location: { type: "Point", coordinates: [77.59, 12.91], address: "Central Library - Reading Room" },
        reportedBy: student._id,
        resolvedAt: daysAgo(day - 1),
        createdAt: daysAgo(day)
      });
    });

    // STORY 3: THE MONDAY CURSE (Seasonality)
    // Fails only on Mondays.
    let current = new Date();
    let mondaysFound = 0;
    while (mondaysFound < 5) {
      current.setDate(current.getDate() - 1);
      if (current.getDay() === 1) { // 1 = Monday
        incidents.push({
          title: "Gym Water Cooler Leaking",
          description: "Water cooler leaking puddle on the floor after weekend.",
          category: "Water",
          priority: "Medium",
          status: "Resolved",
          location: { type: "Point", coordinates: [77.61, 12.92], address: "Sports Complex - Gym" },
          reportedBy: student._id,
          createdAt: new Date(current)
        });
        mondaysFound++;
      }
    }

    // STORY 4: THE CHAIN REACTION (Correlation)
    // Power fail -> 2h later -> Wifi fail
    [2, 10, 20].forEach((day) => {
      // Event A
      incidents.push({
        title: "Main Block Power Outage",
        description: "Complete blackout in the west wing.",
        category: "Electricity",
        priority: "High",
        status: "Resolved",
        location: { type: "Point", coordinates: [77.62, 12.93], address: "Main Block" },
        reportedBy: student._id,
        createdAt: daysAgo(day, 10)
      });
      // Event B (2 hours later)
      incidents.push({
        title: "Main Block Wi-Fi Down",
        description: "Routers are off due to earlier power surge.",
        category: "Internet",
        priority: "High",
        status: "Resolved",
        location: { type: "Point", coordinates: [77.62, 12.93], address: "Main Block" },
        reportedBy: student._id,
        createdAt: daysAgo(day, 12)
      });
    });

    // STORY 5: THE SPATIAL CLUSTER (Anomaly)
    // 5 failures in Science Block TODAY
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
        status: "Open", // Active!
        location: { type: "Point", coordinates: [77.63, 12.94], address: "Science Block - Chemistry Lab" },
        reportedBy: student._id,
        createdAt: new Date(Date.now() - idx * 1000 * 60 * 30)
      });
    });

    await Incident.insertMany(incidents);

    return NextResponse.json({ 
      success: true,
      message: "Database Reset & Seeded Successfully!", 
      users: {
        admin: "admin@college.edu",
        student: "rahul@college.edu",
        technician: "ramesh@college.edu",
        password: "password123"
      },
      stats: {
        incidentsCreated: incidents.length,
        storiesInjected: 5
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}