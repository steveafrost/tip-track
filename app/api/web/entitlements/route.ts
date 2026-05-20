import { NextRequest, NextResponse } from "next/server";
import { getStoreKitEntitlement } from "@/lib/app-store-entitlements";
import { getMobileDriverId, mobileJsonError } from "@/lib/mobile-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const driverId = getMobileDriverId(request);
    const entitlement = await getStoreKitEntitlement(driverId);

    return NextResponse.json({ entitlement });
  } catch (error) {
    return mobileJsonError(error);
  }
}
