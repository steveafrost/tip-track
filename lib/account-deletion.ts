import prisma from "@/lib/prisma";

export type AccountDeletionSummary = {
  ordersDeleted: number;
  entitlementsDeleted: number;
  userDeleted: boolean;
};

export async function deleteAccountData(
  userId: string
): Promise<AccountDeletionSummary> {
  return prisma.$transaction(async (tx) => {
    const orders = await tx.order.deleteMany({
      where: { createdBy: userId },
    });
    const entitlements = await tx.appStoreEntitlement.deleteMany({
      where: { driverId: userId },
    });
    const users = await tx.appUser.deleteMany({
      where: { id: userId },
    });

    return {
      ordersDeleted: orders.count,
      entitlementsDeleted: entitlements.count,
      userDeleted: users.count > 0,
    };
  });
}
