import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import User from '@/src/models/User';

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get('email');

    if (!rawEmail) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const email = rawEmail.trim();
    console.log(`🔍 Profile API: Searching for user '${email}'...`);

    // FIX: Cast the result to 'any' to bypass TypeScript error on 'phoneNumber'
    const user: any = await User.findOne({ 
        email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('-password'); 

    if (!user) {
        console.log(`❌ Profile API: User '${email}' NOT FOUND in database.`);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`✅ Profile API: Found user '${user.name}'`);

    return NextResponse.json({ 
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
            // Using 'any' allows us to access these fields even if they aren't in the TS definition
            department: user.department || "General",
            phone: user.phoneNumber || "Not Provided",
            joined: user.createdAt,
            isAvailable: user.isAvailable ?? true
        } 
    });

  } catch (error: any) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}