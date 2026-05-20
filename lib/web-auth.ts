import { auth } from "@clerk/nextjs";
import { MobileApiError } from "@/lib/mobile-api";

export function getWebUserId() {
  const { userId } = auth();

  if (!userId) {
    throw new MobileApiError("Unauthorized", 401);
  }

  return userId;
}
