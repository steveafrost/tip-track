import { currentUser } from "@clerk/nextjs";
import { resolveLinkedAuthIdentities } from "@/lib/auth-resolver";
import { MobileApiError } from "@/lib/mobile-api";
import type { VerifiedIdentity } from "@/lib/auth-resolver";

export async function getWebUserId() {
  return (await getWebUserSession()).userId;
}

export async function getWebUserSession() {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new MobileApiError("Web sign-in is not configured", 503);
  }

  const user = await currentUser();

  if (!user) {
    throw new MobileApiError("Unauthorized", 401);
  }

  const identities = user.externalAccounts
    .map((account): VerifiedIdentity | null => {
      if (account.provider !== "apple" && account.provider !== "google") {
        return null;
      }

      return {
        provider: account.provider,
        providerSubject: account.externalId,
        email: account.emailAddress,
        displayName:
          [account.firstName, account.lastName].filter(Boolean).join(" ") ||
          account.emailAddress ||
          undefined,
      };
    })
    .filter((identity): identity is VerifiedIdentity => Boolean(identity));

  if (!identities.length) {
    throw new MobileApiError("Sign in with Apple or Google is required", 403);
  }

  const appUser = await resolveLinkedAuthIdentities(identities);

  return {
    userId: appUser.id,
    displayName: appUser.displayName ?? getDisplayName(user),
  };
}

function getDisplayName(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const primaryEmail = user.emailAddresses.find((emailAddress) => {
    return emailAddress.id === user.primaryEmailAddressId;
  });

  return name || primaryEmail?.emailAddress || user.username || "TipTrack Driver";
}
