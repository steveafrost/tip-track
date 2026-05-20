import { NextRequest, NextResponse } from "next/server";
import {
  authorizeMobileRequest,
  getMobileDriverId,
  mobileJsonError,
} from "@/lib/mobile-api";
import {
  getStoreKitEntitlement,
  syncStoreKitEntitlement,
} from "@/lib/app-store-entitlements";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    authorizeMobileRequest(request);
    const driverId = getMobileDriverId(request);
    const entitlement = await getStoreKitEntitlement(driverId);

    return NextResponse.json({ entitlement });
  } catch (error) {
    return mobileJsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    authorizeMobileRequest(request);
    const driverId = getMobileDriverId(request);
    const body = await request.json();
    const signedTransactionInfo =
      typeof body.signedTransactionInfo === "string"
        ? body.signedTransactionInfo
        : "";

    await syncStoreKitEntitlement({ driverId, signedTransactionInfo });
    const entitlement = await getStoreKitEntitlement(driverId);

    return NextResponse.json({ entitlement });
  } catch (error) {
    return mobileJsonError(error);
  }
}
