import { NextRequest, NextResponse } from "next/server";
import { getFileFromPostgres } from "@/lib/storage/postgres";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const file = await getFileFromPostgres(id);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const isDownload = searchParams.get("download") === "1";

    const encodedFileName = encodeURIComponent(file.fileName);
    const disposition = isDownload ? "attachment" : "inline";

    const headers = new Headers();
    headers.set("Content-Type", file.mimeType || "application/pdf");
    headers.set("Content-Length", file.fileSize.toString());
    headers.set(
      "Content-Disposition",
      `${disposition}; filename="${file.fileName.replace(/[\r\n"]/g, "")}"; filename*=UTF-8''${encodedFileName}`
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(file.data as unknown as BodyInit, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving file from PostgreSQL:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse(null, { status: 400 });
    }

    const file = await getFileFromPostgres(id);
    if (!file) {
      return new NextResponse(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", file.mimeType || "application/pdf");
    headers.set("Content-Length", file.fileSize.toString());
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(null, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("HEAD request error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
