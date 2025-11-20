import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import User from '@/src/models/User';
import Incident from '@/src/models/Incident';

export async function GET() {
  try {
    await connectDB();

    // 1. Clear existing data (Avoids duplicates)
    await User.deleteMany({});
    await Incident.deleteMany({});

    // 2. Create Dummy Users
    const student = await User.create({
      name: "Rahul Student",
      email: "rahul@college.edu",
      role: "student",
      department: "Computer Science"
    });

    const admin = await User.create({
      name: "Principal Admin",
      email: "admin@college.edu",
      role: "admin"
    });

    const tech = await User.create({
      name: "Ramesh Technician",
      email: "ramesh@college.edu",
      role: "technician",
      department: "Electrical",
      isAvailable: true
    });

    // 3. Create a Dummy Incident (Linked to the Student)
    const incident = await Incident.create({
      title: "Water Cooler Leaking",
      description: "The water cooler on the 2nd floor near the labs is leaking water all over the floor.",
      category: "Water",
      priority: "High",
      status: "Open",
      location: {
        type: "Point",
        coordinates: [77.6, 12.9], // Dummy Lat/Long
        address: "Main Block, 2nd Floor"
      },
      reportedBy: student._id, // Linking the relationship
      images: ["https://placehold.co/600x400?text=Leaking+Cooler"]
    });

    return NextResponse.json({ 
      message: "Database Seeded Successfully!", 
      data: { student, admin, tech, incident } 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}