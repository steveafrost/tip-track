import { NextRequest, NextResponse } from "next/server";
import {
  authorizeMobileRequest,
  createMobileSessionToken,
  mobileJsonError,
  slugDriverName,
} from "@/lib/mobile-api";
import { resolveAuthIdentity, resolveLegacyOwner } from "@/lib/auth-resolver";
import { verifyProviderIdentity } from "@/lib/provider-identities";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    authorizeMobileRequest(request);

    const body = await request.json();
    const displayName =
      typeof body.displayName === "string" ? body.displayName.trim() : "";
    const identityToken =
      typeof body.identityToken === "string" ? body.identityToken.trim() : "";
    const provider =
      typeof body.provider === "string" ? body.provider.trim() : "apple";
    const rawNonce =
      typeof body.rawNonce === "string" ? body.rawNonce.trim() : undefined;

    if (identityToken) {
      const identity = await verifyProviderIdentity({
        provider,
        identityToken,
        rawNonce,
        displayName,
      });
      const appUser = await resolveAuthIdentity(identity);
      const sessionToken = createMobileSessionToken({
        driverId: appUser.id,
        displayName: appUser.displayName ?? identity.displayName,
      });

      return NextResponse.json({
        driverId: appUser.id,
        displayName:
          appUser.displayName ?? identity.displayName ?? "TipTrack Driver",
        sessionToken,
      });
    }

    if (process.env.MOBILE_ALLOW_NAME_SESSIONS !== "true") {
      return NextResponse.json(
        { error: "Sign in with Apple or Google is required" },
        { status: 400 }
      );
    }

    if (displayName.length < 2) {
      return NextResponse.json(
        { error: "Driver name must contain at least 2 characters" },
        { status: 400 }
      );
    }

    const appUser = await resolveLegacyOwner(slugDriverName(displayName));

    return NextResponse.json({
      driverId: appUser.id,
      displayName: appUser.displayName ?? displayName,
      sessionToken: createMobileSessionToken({
        driverId: appUser.id,
        displayName,
      }),
    });
  } catch (error) {
    return mobileJsonError(error);
  }
}
