import { NextRequest, NextResponse } from "next/server";
import { mobileJsonError } from "@/lib/mobile-api";
import { getWebUserSession } from "@/lib/web-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(await getWebUserSession());
  } catch (error) {
    return mobileJsonError(error);
  }
}
