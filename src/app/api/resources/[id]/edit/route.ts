import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { uploadSchema } = await import("@/lib/validations");
    const editSchema = uploadSchema.partial();
    const validation = editSchema.safeParse(body);
    if (!validation.success) {
      const message = validation.error.issues[0]?.message || "Invalid update data";
      return NextResponse.json({ error: "Invalid data", message }, { status: 400 });
    }

    const { id } = await params;
    await connectToDatabase();

    const user = await User.findOne({ clerkId }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Check if the user is the owner or an admin
    const isOwner = resource.uploadedBy.userId.toString() === user._id.toString();
    const isAdmin = user.role === "admin" || user.role === "super_admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You don't own this resource" }, { status: 403 });
    }

    // Update validated fields
    const validData = validation.data;
    if (validData.title !== undefined) resource.title = validData.title;
    if (validData.description !== undefined) resource.description = validData.description;
    if (validData.type !== undefined) resource.type = validData.type;
    if (validData.university !== undefined) resource.university = validData.university;
    if (validData.course !== undefined) resource.course = validData.course;
    if (validData.semester !== undefined) resource.semester = validData.semester;
    if (validData.subject !== undefined) resource.subject = validData.subject;
    if (validData.year !== undefined) resource.year = validData.year;
    if (validData.examType !== undefined) resource.examType = validData.examType;

    // Note: We leave the `status` unchanged, so if it was approved, it remains approved.
    
    await resource.save();

    return NextResponse.json({
      success: true,
      message: "Resource updated successfully",
      data: resource
    });
  } catch (error) {
    console.error("Edit Resource API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
