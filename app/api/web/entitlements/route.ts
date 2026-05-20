import { NextRequest, NextResponse } from "next/server";
import { getStoreKitEntitlement } from "@/lib/app-store-entitlements";
import { mobileJsonError } from "@/lib/mobile-api";
import { getWebUserId } from "@/lib/web-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = await getWebUserId();
    const entitlement = await getStoreKitEntitlement(userId);

    return NextResponse.json({ entitlement });
  } catch (error) {
    return mobileJsonError(error);
  }
}
