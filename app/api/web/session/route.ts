import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { mobileJsonError, MobileApiError } from "@/lib/mobile-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new MobileApiError("Unauthorized", 401);
    }

    return NextResponse.json({
      userId: user.id,
      displayName: getDisplayName(user),
    });
  } catch (error) {
    return mobileJsonError(error);
  }
}

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) return "TipTrack Driver";

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const primaryEmail = user.emailAddresses.find((emailAddress) => {
    return emailAddress.id === user.primaryEmailAddressId;
  });

  return name || primaryEmail?.emailAddress || user.username || "TipTrack Driver";
}
