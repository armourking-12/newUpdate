import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { Resource } from "@/lib/db/models/Resource";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch total users
    const totalUsers = await User.countDocuments();

    // Fetch total resources (approved only)
    const totalResources = await Resource.countDocuments({ status: "approved" });

    // Sum all downloads across all resources
    const downloadsAggregation = await Resource.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, totalDownloads: { $sum: "$downloads" } } }
    ]);
    
    const totalDownloads = downloadsAggregation.length > 0 ? downloadsAggregation[0].totalDownloads : 0;

    // Count unique universities case-insensitively
    const universitiesAggregation = await Resource.aggregate([
      { $match: { status: "approved", university: { $exists: true, $ne: "" } } },
      { $group: { _id: { $toUpper: { $trim: { input: "$university" } } } } },
      { $count: "total" }
    ]);
    const totalUniversities = universitiesAggregation.length > 0 ? universitiesAggregation[0].total : 0;

    return NextResponse.json({
      success: true,
      data: {
        users: totalUsers,
        resources: totalResources,
        downloads: totalDownloads,
        universities: totalUniversities
      }
    });
  } catch (error) {
    console.error("Public Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch public stats" },
      { status: 500 }
    );
  }
}
