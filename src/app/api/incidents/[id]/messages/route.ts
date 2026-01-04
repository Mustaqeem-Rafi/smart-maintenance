import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Message from "@/src/models/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";

// GET: Fetch all messages for this incident
export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // Change this line
) {
  try {
    await connectDB();
    const { id } = await params; // Add this line

    const messages = await Message.find({ incidentId: id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name role');

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// POST: Send a new message
export async function POST(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    const newMessage = await Message.create({
      incidentId: id,
      senderId: session.user.id, // Assuming your session has the user ID
      content
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}