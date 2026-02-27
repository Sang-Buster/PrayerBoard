import { NextRequest, NextResponse } from "next/server";
import { insertPrayer, getPrayers } from "@/lib/db";
import { verifyAuthFromRequest } from "@/lib/auth";

// In-memory rate limiting
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Clean expired entries periodically
  if (Math.random() < 0.1) {
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetAt) rateLimit.delete(key);
    }
  }

  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// POST - Public: submit a prayer request
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, request: prayerRequest, is_anonymous } = body;

    // Validation
    if (
      !prayerRequest ||
      typeof prayerRequest !== "string" ||
      prayerRequest.trim().length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Prayer request is required." },
        { status: 400 }
      );
    }

    if (prayerRequest.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Prayer request must be 2000 characters or less.",
        },
        { status: 400 }
      );
    }

    const sanitizedName =
      name && typeof name === "string" ? name.trim().slice(0, 100) : "Anonymous";
    const sanitizedRequest = prayerRequest.trim();
    const isAnonymous = Boolean(is_anonymous);

    await insertPrayer(sanitizedName, sanitizedRequest, isAnonymous);

    return NextResponse.json({
      success: true,
      message: "Prayer received",
    });
  } catch (error) {
    console.error("Error submitting prayer:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// GET - Auth required: list prayer requests
export async function GET(request: NextRequest) {
  try {
    if (!verifyAuthFromRequest(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );

    const result = await getPrayers(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching prayers:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred." },
      { status: 500 }
    );
  }
}
