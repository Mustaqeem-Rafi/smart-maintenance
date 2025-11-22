import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, message, userEmail } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    // --- SIMULATION MODE (No Real Email) ---
    // Instead of crashing with invalid credentials, we just log it.
    console.log("========================================");
    console.log("🎫 NEW SUPPORT TICKET RECEIVED");
    console.log("----------------------------------------");
    console.log(`👤 From:    ${userEmail}`);
    console.log(`📝 Subject: ${subject}`);
    console.log(`💬 Message: ${message}`);
    console.log("========================================");

    // Return success so the UI shows the green checkmark
    return NextResponse.json({ success: true, message: "Ticket logged successfully" });

  } catch (error: any) {
    console.error("Support API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}