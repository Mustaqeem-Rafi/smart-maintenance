import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db"; // Using your working path
import User from "@/src/models/User";
import Incident from "@/src/models/Incident";
import bcrypt from "bcryptjs";

// GET: Fetch all technicians (Existing code)
export async function GET() {
  try {
    await connectDB();
    const technicians = await User.find({ role: "technician" });

    const techniciansWithStats = await Promise.all(
      technicians.map(async (tech) => {
        const activeCount = await Incident.countDocuments({
          assignedTo: tech._id,
          status: { $in: ["Open", "In Progress"] },
        });
        return { ...tech.toObject(), activeIncidents: activeCount };
      })
    );

    return NextResponse.json({ technicians: techniciansWithStats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new technician (NEW CODE)
export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, department } = await req.json();

    // 1. Check for duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create Technician
    const newTech = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "technician",
      department: department || "General",
      isAvailable: true
    });

    return NextResponse.json({ message: "Technician created!", technician: newTech }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}