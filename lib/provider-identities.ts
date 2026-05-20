import { verifyAppleIdentityToken } from "@/lib/apple-sign-in";
import { verifyGoogleIdentityToken } from "@/lib/google-sign-in";
import { MobileApiError } from "@/lib/mobile-api";
import type { VerifiedIdentity } from "@/lib/auth-resolver";

export async function verifyProviderIdentity({
  provider,
  identityToken,
  rawNonce,
  displayName,
}: {
  provider: string;
  identityToken: string;
  rawNonce?: string;
  displayName?: string;
}): Promise<VerifiedIdentity> {
  if (provider === "apple") {
    const appleIdentity = await verifyAppleIdentityToken({
      identityToken,
      rawNonce,
    }).catch(() => {
      throw new MobileApiError("Invalid Apple sign-in", 401);
    });

    return {
      provider: "apple",
      providerSubject: appleIdentity.subject,
      email: appleIdentity.email,
      displayName: displayName || appleIdentity.email,
    };
  }

  if (provider === "google") {
    const googleIdentity = await verifyGoogleIdentityToken(identityToken).catch(
      () => {
        throw new MobileApiError("Invalid Google sign-in", 401);
      }
    );

    return {
      provider: "google",
      providerSubject: googleIdentity.subject,
      email: googleIdentity.email,
      displayName: displayName || googleIdentity.displayName,
    };
  }

  throw new MobileApiError("Unsupported login provider", 400);
}
