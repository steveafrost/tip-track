import prisma from "@/lib/prisma";
import { resolveAuthIdentity, resolveLegacyOwner } from "@/lib/auth-resolver";

type Counts = {
  migrated: number;
  legacyPreserved: number;
  skipped: number;
};

async function main() {
  const ownerKeys = await collectOwnerKeys();
  const counts: Counts = { migrated: 0, legacyPreserved: 0, skipped: 0 };

  for (const ownerKey of ownerKeys) {
    const appUser = await resolveOwnerKey(ownerKey, counts);

    if (appUser.id === ownerKey) {
      counts.skipped += 1;
      continue;
    }

    await prisma.order.updateMany({
      where: { createdBy: ownerKey },
      data: { createdBy: appUser.id },
    });
    await prisma.appStoreEntitlement.updateMany({
      where: { driverId: ownerKey },
      data: { driverId: appUser.id },
    });
    counts.migrated += 1;
  }

  console.log(
    JSON.stringify(
      {
        ownerKeys: ownerKeys.length,
        ...counts,
      },
      null,
      2
    )
  );
}

async function collectOwnerKeys() {
  const [orders, entitlements] = await Promise.all([
    prisma.order.findMany({
      distinct: ["createdBy"],
      select: { createdBy: true },
    }),
    prisma.appStoreEntitlement.findMany({
      distinct: ["driverId"],
      select: { driverId: true },
    }),
  ]);

  return Array.from(
    new Set([
      ...orders.map((order) => order.createdBy),
      ...entitlements.map((entitlement) => entitlement.driverId),
    ])
  ).filter(Boolean);
}

async function resolveOwnerKey(ownerKey: string, counts: Counts) {
  const existingAppUser = await prisma.appUser.findUnique({
    where: { id: ownerKey },
  });

  if (existingAppUser) return existingAppUser;

  if (ownerKey.startsWith("apple:")) {
    return resolveAuthIdentity({
      provider: "apple",
      providerSubject: ownerKey.slice("apple:".length),
    });
  }

  if (ownerKey.startsWith("google:")) {
    return resolveAuthIdentity({
      provider: "google",
      providerSubject: ownerKey.slice("google:".length),
    });
  }

  counts.legacyPreserved += 1;
  return resolveLegacyOwner(ownerKey);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
