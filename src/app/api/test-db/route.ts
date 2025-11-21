import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: 'Success', message: 'Connected to MongoDB!' });
  } catch (error: any) {
    return NextResponse.json({ status: 'Error', message: error.message }, { status: 500 });
  }
}