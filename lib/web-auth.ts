import { currentUser } from "@clerk/nextjs";
import { MobileApiError } from "@/lib/mobile-api";

export async function getWebUserId() {
  const user = await currentUser();

  if (!user) {
    throw new MobileApiError("Unauthorized", 401);
  }

  const appleAccount = user.externalAccounts.find((account) => {
    return account.provider === "apple";
  });

  if (!appleAccount?.externalId) {
    throw new MobileApiError("Sign in with Apple is required", 403);
  }

  return `apple:${appleAccount.externalId}`;
}

export async function getWebUserSession() {
  const user = await currentUser();

  if (!user) {
    throw new MobileApiError("Unauthorized", 401);
  }

  const appleAccount = user.externalAccounts.find((account) => {
    return account.provider === "apple";
  });

  if (!appleAccount?.externalId) {
    throw new MobileApiError("Sign in with Apple is required", 403);
  }

  return {
    userId: `apple:${appleAccount.externalId}`,
    displayName: getDisplayName(user),
  };
}

function getDisplayName(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const primaryEmail = user.emailAddresses.find((emailAddress) => {
    return emailAddress.id === user.primaryEmailAddressId;
  });

  return name || primaryEmail?.emailAddress || user.username || "TipTrack Driver";
}
