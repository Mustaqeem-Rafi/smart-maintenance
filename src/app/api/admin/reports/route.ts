import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch all incidents
    const incidents = await Incident.find({}).sort({ createdAt: 1 });

    // 2. Calculate Summary Stats
    const total = incidents.length;
    const open = incidents.filter((i) => i.status === "Open").length;
    const resolved = incidents.filter((i) => i.status === "Resolved").length;
    const inProgress = incidents.filter((i) => i.status === "In Progress").length;

    // 3. Group by Category (for Pie Chart)
    const categoryMap: Record<string, number> = {};
    incidents.forEach((i) => {
      categoryMap[i.category] = (categoryMap[i.category] || 0) + 1;
    });
    const categoryData = Object.keys(categoryMap).map((key) => ({
      name: key,
      value: categoryMap[key],
    }));

    // 4. Group by Date (Last 7 Days for Bar Chart)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString("en-US", { weekday: "short" }); // e.g., "Mon"
    }).reverse();

    const trendData = last7Days.map((day) => {
      // Count incidents created on this specific day name
      // (Note: In a real app, match specific dates, not just names)
      const count = incidents.filter((i) => 
        new Date(i.createdAt).toLocaleDateString("en-US", { weekday: "short" }) === day
      ).length;
      return { name: day, incidents: count };
    });

    return NextResponse.json({
      stats: { total, open, resolved, inProgress },
      categoryData,
      trendData
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}