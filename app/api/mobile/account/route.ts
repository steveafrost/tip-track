import { NextRequest, NextResponse } from "next/server";
import { deleteAccountData } from "@/lib/account-deletion";
import {
  authorizeMobileRequest,
  getMobileDriverId,
  mobileJsonError,
} from "@/lib/mobile-api";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    authorizeMobileRequest(request);
    const driverId = getMobileDriverId(request);
    const summary = await deleteAccountData(driverId);

    return NextResponse.json({
      deleted: true,
      ordersDeleted: summary.ordersDeleted,
      entitlementsDeleted: summary.entitlementsDeleted,
    });
  } catch (error) {
    return mobileJsonError(error);
  }
}
