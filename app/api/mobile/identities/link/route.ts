import { NextRequest, NextResponse } from "next/server";
import {
  authorizeMobileRequest,
  getMobileDriverId,
  mobileJsonError,
} from "@/lib/mobile-api";
import { linkAuthIdentity } from "@/lib/auth-resolver";
import { verifyProviderIdentity } from "@/lib/provider-identities";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    authorizeMobileRequest(request);
    const userId = getMobileDriverId(request);
    const body = await request.json();
    const provider =
      typeof body.provider === "string" ? body.provider.trim() : "";
    const identityToken =
      typeof body.identityToken === "string" ? body.identityToken.trim() : "";
    const rawNonce =
      typeof body.rawNonce === "string" ? body.rawNonce.trim() : undefined;
    const displayName =
      typeof body.displayName === "string" ? body.displayName.trim() : "";

    const identity = await verifyProviderIdentity({
      provider,
      identityToken,
      rawNonce,
      displayName,
    });
    const appUser = await linkAuthIdentity({ userId, identity });

    return NextResponse.json({
      userId: appUser.id,
      displayName:
        appUser.displayName ?? identity.displayName ?? "TipTrack Driver",
    });
  } catch (error) {
    return mobileJsonError(error);
  }
}
