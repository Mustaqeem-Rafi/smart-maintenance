import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import Incident from '@/src/models/Incident';
import User from '@/src/models/User';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // --- DUPLICATE DETECTION LOGIC START ---
    
    // 1. Extract key data
    const { category, location } = body;
    const [longitude, latitude] = location.coordinates;

    // 2. Search for existing similar incidents
    const duplicate = await Incident.findOne({
      category: category,
      // Only check active issues (Closed issues don't count as duplicates)
      status: { $in: ['Open', 'In Progress'] }, 
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 20 // Distance in meters (Adjustable)
        }
      }
    });

    // 3. If found, block the submission
    if (duplicate) {
      return NextResponse.json(
        { 
          error: "Duplicate Incident Detected!", 
          message: `A similar ${category} report already exists nearby (ID: ${duplicate._id}).` 
        }, 
        { status: 409 } // 409 Conflict
      );
    }
    // --- DUPLICATE DETECTION LOGIC END ---

    // HACK: Find a reporter (Simulating Auth)
    let reporter = await User.findOne({ role: 'student' });
    
    // Safety net: Create guest if no users exist
    if (!reporter) {
        reporter = await User.create({
            name: "Guest Student",
            email: `guest${Date.now()}@college.edu`,
            role: 'student'
        });
    }

    // Create the new incident
    const newIncident = await Incident.create({
      ...body,
      reportedBy: reporter._id,
      status: 'Open',
      history: [{ action: 'Created', by: reporter._id, date: new Date() }]
    });

    return NextResponse.json({ message: "Incident Reported!", incident: newIncident }, { status: 201 });

  } catch (error: any) {
    console.error("API Error:", error); // Helpful for debugging
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}