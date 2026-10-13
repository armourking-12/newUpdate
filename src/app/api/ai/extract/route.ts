import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

export const maxDuration = 60; // Allow 60 seconds for AI processing

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    // 2. Rate limiting (10 AI requests per minute per user)
    const now = Date.now();
    const windowMs = 60 * 1000;
    const limit = 10;
    const rateLimitMap: Map<string, { count: number; start: number }> =
      (globalThis as any).__aiRateLimitMap || new Map();
    (globalThis as any).__aiRateLimitMap = rateLimitMap;

    const record = rateLimitMap.get(userId) || { count: 0, start: now };
    if (now - record.start > windowMs) {
      record.count = 1;
      record.start = now;
    } else {
      record.count += 1;
    }
    rateLimitMap.set(userId, record);

    if (record.count > limit) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before extracting again." },
        { status: 429 }
      );
    }

    // 3. Parse and validate body
    const body = await request.json();
    const { fileBase64, mimeType } = body;

    if (!fileBase64 || !mimeType) {
      return NextResponse.json(
        { error: "File data and mimeType are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert academic document parser.
      Analyze this academic document (could be an exam paper, assignment, or study notes).
      Extract the following information and return it strictly as a JSON object.
      Do not include any markdown formatting (like \`\`\`json), just return the raw JSON object.

      If a piece of information is not present or cannot be determined confidently, leave it as an empty string "" (or null for numbers).
      For "tags", provide a comma-separated string of 3-5 relevant keywords.

      Expected JSON Structure:
      {
        "university": "string",
        "course": "string",
        "semester": number | null,
        "subject": "string",
        "year": number | null,
        "examType": "string (MUST be exactly one of: 'Mid-Term', 'End-Term', 'Supplementary', 'Internal', 'Practical', 'Viva', 'Debarred', 'Back' or empty string)",
        "title": "string (create a short, descriptive title if none exists)",
        "description": "string (a brief 1-2 sentence description of the content)",
        "tags": "string (comma separated)"
      }
    `;

    // Support both images and PDFs through inlineData
    const documentPart = {
      inlineData: {
        data: fileBase64.replace(/^data:(image|application)\/\w+;base64,/, ""),
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, documentPart]);
    const responseText = result.response.text();

    const cleanJsonString = responseText
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    const extractedData = JSON.parse(cleanJsonString);

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error) {
    console.error("Gemini AI Extraction Error:", error);
    return NextResponse.json(
      { error: "Failed to extract data from document. Please try again or enter manually." },
      { status: 500 }
    );
  }
}
