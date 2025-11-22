import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import User from "@/src/models/User";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectDB();
    
    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get User ID
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Fetch Incidents reported by this user
    const incidents = await Incident.find({ reportedBy: user._id });

    // 4. Calculate Stats
    const total = incidents.length;
   const resolved = incidents.filter(i => i.status === 'Resolved').length;
    const open = incidents.filter(i => i.status === 'Open').length;
    const inProgress = incidents.filter(i => i.status === 'In Progress').length;

    // 5. Prepare Chart Data (By Category)
    const categoryMap: Record<string, number> = {};
    incidents.forEach(i => {
      categoryMap[i.category] = (categoryMap[i.category] || 0) + 1;
    });
    
    const chartData = Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key]
    }));

    return NextResponse.json({
      stats: { total, resolved, open, inProgress },
      chartData
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}