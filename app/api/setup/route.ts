import { NextRequest, NextResponse } from "next/server";
import { verifyAuthFromRequest } from "@/lib/auth";
import { setupDatabase } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    if (!verifyAuthFromRequest(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await setupDatabase();

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully.",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { success: false, message: "Database setup failed." },
      { status: 500 }
    );
  }
}
