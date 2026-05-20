import { NextRequest, NextResponse } from "next/server";
import { mobileJsonError, slugDriverName } from "@/lib/mobile-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const displayName =
      typeof body.displayName === "string" ? body.displayName.trim() : "";

    if (displayName.length < 2) {
      return NextResponse.json(
        { error: "Driver name must contain at least 2 characters" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      driverId: slugDriverName(displayName),
      displayName,
    });
  } catch (error) {
    return mobileJsonError(error);
  }
}
