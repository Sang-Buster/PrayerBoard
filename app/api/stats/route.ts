import { NextRequest, NextResponse } from "next/server";
import { verifyAuthFromRequest } from "@/lib/auth";
import { getStats } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    if (!verifyAuthFromRequest(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const stats = await getStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred." },
      { status: 500 }
    );
  }
}
