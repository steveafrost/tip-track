import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { MobileApiError } from "@/lib/mobile-api";

export type AuthProvider = "apple" | "google" | "legacy";

export type VerifiedIdentity = {
  provider: AuthProvider;
  providerSubject: string;
  email?: string;
  displayName?: string;
};

export async function resolveAuthIdentity(identity: VerifiedIdentity) {
  const existingIdentity = await prisma.authIdentity.findUnique({
    where: identityWhere(identity),
    include: { user: true },
  });

  if (existingIdentity) {
    await updateIdentityMetadata(existingIdentity.id, identity);
    return existingIdentity.user;
  }

  try {
    const created = await prisma.appUser.create({
      data: {
        displayName: identity.displayName,
        primaryEmail: identity.email,
        identities: {
          create: identityData(identity),
        },
      },
    });

    return created;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const racedIdentity = await prisma.authIdentity.findUnique({
        where: identityWhere(identity),
        include: { user: true },
      });

      if (racedIdentity) return racedIdentity.user;
    }

    throw error;
  }
}

export async function resolveLinkedAuthIdentities(identities: VerifiedIdentity[]) {
  if (!identities.length) {
    throw new MobileApiError("Sign in with Apple or Google is required", 403);
  }

  const existingIdentities = await prisma.authIdentity.findMany({
    where: {
      OR: identities.map((identity) => ({
        provider: identity.provider,
        providerSubject: identity.providerSubject,
      })),
    },
    include: { user: true },
  });
  const userIds = Array.from(
    new Set(existingIdentities.map((identity) => identity.userId))
  );

  if (userIds.length > 1) {
    throw new MobileApiError(
      "These logins are already connected to different TipTrack accounts",
      409
    );
  }

  const appUser = existingIdentities[0]?.user ?? (await resolveAuthIdentity(identities[0]));

  for (const identity of identities) {
    await linkAuthIdentity({ userId: appUser.id, identity });
  }

  return appUser;
}

export async function linkAuthIdentity({
  userId,
  identity,
}: {
  userId: string;
  identity: VerifiedIdentity;
}) {
  const existingIdentity = await prisma.authIdentity.findUnique({
    where: identityWhere(identity),
  });

  if (existingIdentity && existingIdentity.userId !== userId) {
    throw new MobileApiError(
      "That login is already connected to another TipTrack account",
      409
    );
  }

  if (existingIdentity) {
    await updateIdentityMetadata(existingIdentity.id, identity);
    return prisma.appUser.findUniqueOrThrow({ where: { id: userId } });
  }

  return prisma.appUser.update({
    where: { id: userId },
    data: {
      displayName: identity.displayName,
      primaryEmail: identity.email,
      identities: {
        create: identityData(identity),
      },
    },
  });
}

export async function resolveLegacyOwner(ownerKey: string) {
  const existingUser = await prisma.appUser.findUnique({
    where: { id: ownerKey },
  });

  if (existingUser) return existingUser;

  return resolveAuthIdentity({
    provider: "legacy",
    providerSubject: ownerKey,
    displayName: ownerKey,
  });
}

function identityWhere(identity: VerifiedIdentity) {
  return {
    provider_providerSubject: {
      provider: identity.provider,
      providerSubject: identity.providerSubject,
    },
  };
}

function identityData(identity: VerifiedIdentity) {
  return {
    provider: identity.provider,
    providerSubject: identity.providerSubject,
    email: identity.email,
    displayName: identity.displayName,
  };
}

async function updateIdentityMetadata(
  identityId: string,
  identity: VerifiedIdentity
) {
  await prisma.authIdentity.update({
    where: { id: identityId },
    data: {
      email: identity.email,
      displayName: identity.displayName,
      user: {
        update: {
          displayName: identity.displayName,
          primaryEmail: identity.email,
        },
      },
    },
  });
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
