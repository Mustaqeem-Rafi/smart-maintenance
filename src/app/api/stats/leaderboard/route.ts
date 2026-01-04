import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";

export async function GET() {
  try {
    await connectDB();

    // Aggregation pipeline to count resolved issues per location
    const leaderboard = await Incident.aggregate([
      { $match: { status: "Resolved" } }, // Only look at finished tasks
      {
        $group: {
          _id: "$location.address", // Group by the address field
          resolvedCount: { $sum: 1 }, // Count the number of documents
        }
      },
      { $sort: { resolvedCount: -1 } }, // Sort highest to lowest
      { $limit: 10 } // Top 10 locations
    ]);

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}