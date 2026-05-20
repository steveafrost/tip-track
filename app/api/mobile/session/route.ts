import { NextRequest, NextResponse } from "next/server";
import {
  authorizeMobileRequest,
  createMobileSessionToken,
  MobileApiError,
  mobileJsonError,
  slugDriverName,
} from "@/lib/mobile-api";
import { verifyAppleIdentityToken } from "@/lib/apple-sign-in";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    authorizeMobileRequest(request);

    const body = await request.json();
    const displayName =
      typeof body.displayName === "string" ? body.displayName.trim() : "";
    const identityToken =
      typeof body.identityToken === "string" ? body.identityToken.trim() : "";
    const rawNonce =
      typeof body.rawNonce === "string" ? body.rawNonce.trim() : undefined;

    if (identityToken) {
      const appleIdentity = await verifyAppleIdentityToken({
        identityToken,
        rawNonce,
      }).catch(() => {
        throw new MobileApiError("Invalid Apple sign-in", 401);
      });
      const driverId = `apple:${appleIdentity.subject}`;
      const sessionToken = createMobileSessionToken({
        driverId,
        displayName: displayName || appleIdentity.email,
      });

      return NextResponse.json({
        driverId,
        displayName: displayName || appleIdentity.email || "TipTrack Driver",
        sessionToken,
      });
    }

    if (process.env.MOBILE_ALLOW_NAME_SESSIONS !== "true") {
      return NextResponse.json(
        { error: "Sign in with Apple is required" },
        { status: 400 }
      );
    }

    if (displayName.length < 2) {
      return NextResponse.json(
        { error: "Driver name must contain at least 2 characters" },
        { status: 400 }
      );
    }

    const driverId = slugDriverName(displayName);

    return NextResponse.json({
      driverId,
      displayName,
      sessionToken: createMobileSessionToken({ driverId, displayName }),
    });
  } catch (error) {
    return mobileJsonError(error);
  }
}
