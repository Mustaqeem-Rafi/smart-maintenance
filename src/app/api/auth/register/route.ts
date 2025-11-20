import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import User from '@/src/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    // 1. Domain Validation (The Milestone 1 Requirement)
    // Change 'college.edu' to whatever domain you want to test with, or 'gmail.com' for local testing
    const ALLOWED_DOMAIN = "college.edu"; 
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return NextResponse.json(
        { error: `Access Denied. You must use a valid @${ALLOWED_DOMAIN} email address.` },
        { status: 403 }
      );
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create Student
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student' // Default role is always student for public registration
    });

    return NextResponse.json({ message: "Student registered successfully!" }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}