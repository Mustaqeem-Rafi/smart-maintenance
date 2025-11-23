import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import Incident from '@/src/models/Incident';

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { incidentId, status } = await req.json();

    if (!incidentId || !status) {
        return NextResponse.json({ error: "Missing incidentId or status" }, { status: 400 });
    }

    const updateData: any = { status };
    
    // Record timestamp if resolved (Your Logic)
    if (status === 'Resolved') {
      updateData.resolvedAt = new Date();
    }

    const incident = await Incident.findByIdAndUpdate(
      incidentId, 
      updateData,
      { new: true }
    );

    if (!incident) {
        return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, incident });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}