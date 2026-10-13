import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";

import { escapeRegex } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";
    const university = searchParams.get("university") || "";
    const sort = searchParams.get("sort") || "recent";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12;

    await connectToDatabase();

    // Build query
    const query: any = { status: "approved" };

    if (q) {
      const safeQ = escapeRegex(q);
      // Regex search across title, subject, course, and tags safely
      query.$or = [
        { title: { $regex: safeQ, $options: "i" } },
        { subject: { $regex: safeQ, $options: "i" } },
        { course: { $regex: safeQ, $options: "i" } },
        { tags: { $regex: safeQ, $options: "i" } },
      ];
    }

    if (type) {
      query.type = type;
    }

    if (university) {
      query.university = { $regex: escapeRegex(university), $options: "i" };
    }

    // Build sort
    let sortOptions: any = { createdAt: -1 };
    if (sort === "popular") sortOptions = { downloads: -1, views: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };

    // Execute
    const { userId } = await auth();
    let currentUser: any = null;
    if (userId) {
      currentUser = await User.findOne({ clerkId: userId }).lean();
    }

    const skip = (page - 1) * limit;
    const [rawResources, total] = await Promise.all([
      Resource.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Resource.countDocuments(query),
    ]);

    // Attach computed properties for the UI
    const resources = rawResources.map((res: any) => {
      const likesCount = Array.isArray(res.likes) ? res.likes.length : 0;
      let hasLiked = false;
      let hasSaved = false;

      if (currentUser) {
        hasLiked = Array.isArray(res.likes) && res.likes.some((uid: any) => uid.toString() === currentUser._id.toString());
        hasSaved = Array.isArray(currentUser.savedResources) && currentUser.savedResources.some((rid: any) => rid.toString() === res._id.toString());
      }

      // Strip internal arrays (likes ObjectIds, viewedBy identifiers) from the response
      const { likes, viewedBy, ...safeResource } = res;

      return {
        ...safeResource,
        likesCount,
        hasLiked,
        hasSaved
      };
    });

    return NextResponse.json({
      success: true,
      data: resources,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch Resources API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
