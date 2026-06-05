import { Environment, SignedDataVerifier } from "@apple/app-store-server-library";
import { readFileSync } from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { MobileApiError } from "@/lib/mobile-api";

export const TIPTRACK_UNLOCK_PRODUCT_ID =
  "com.steveafrost.tiptrack.pro.unlock.v2";
export const TIPTRACK_LEGACY_UNLOCK_PRODUCT_ID =
  "com.steveafrost.tiptrack.pro.unlock";
const TIPTRACK_UNLOCK_PRODUCT_IDS = new Set([
  TIPTRACK_UNLOCK_PRODUCT_ID,
  TIPTRACK_LEGACY_UNLOCK_PRODUCT_ID,
]);

const bundleId = "com.steveafrost.tiptrack";
const appAppleId = 6771138274;

const appleRootCertificates = [
  readFileSync(path.join(process.cwd(), "certs/apple/AppleRootCA-G3.cer")),
  readFileSync(path.join(process.cwd(), "certs/apple/AppleRootCA-G2.cer")),
  readFileSync(
    path.join(process.cwd(), "certs/apple/AppleIncRootCertificate.cer")
  ),
];

async function verifySignedTransaction(signedTransactionInfo: string) {
  const productionVerifier = new SignedDataVerifier(
    appleRootCertificates,
    true,
    Environment.PRODUCTION,
    bundleId,
    appAppleId
  );

  try {
    return await productionVerifier.verifyAndDecodeTransaction(
      signedTransactionInfo
    );
  } catch {
    const sandboxVerifier = new SignedDataVerifier(
      appleRootCertificates,
      true,
      Environment.SANDBOX,
      bundleId
    );

    return sandboxVerifier.verifyAndDecodeTransaction(signedTransactionInfo);
  }
}

export async function syncStoreKitEntitlement({
  driverId,
  signedTransactionInfo,
}: {
  driverId: string;
  signedTransactionInfo: string;
}) {
  if (!signedTransactionInfo || signedTransactionInfo.split(".").length !== 3) {
    throw new MobileApiError("Missing signed StoreKit transaction", 400);
  }

  let transaction;

  try {
    transaction = await verifySignedTransaction(signedTransactionInfo);
  } catch {
    throw new MobileApiError("StoreKit transaction could not be verified", 400);
  }

  if (
    !transaction.productId ||
    !TIPTRACK_UNLOCK_PRODUCT_IDS.has(transaction.productId)
  ) {
    throw new MobileApiError("StoreKit transaction is for the wrong product", 400);
  }

  if (!transaction.transactionId || !transaction.originalTransactionId) {
    throw new MobileApiError("StoreKit transaction is missing identifiers", 400);
  }

  const purchasedAt = new Date(transaction.purchaseDate ?? Date.now());
  const revokedAt = transaction.revocationDate
    ? new Date(transaction.revocationDate)
    : null;

  return prisma.appStoreEntitlement.upsert({
    where: {
      driverId_productId: {
        driverId,
        productId: transaction.productId,
      },
    },
    update: {
      transactionId: transaction.transactionId,
      originalTransactionId: transaction.originalTransactionId,
      environment: String(transaction.environment ?? Environment.PRODUCTION),
      purchasedAt,
      revokedAt,
    },
    create: {
      driverId,
      productId: transaction.productId,
      transactionId: transaction.transactionId,
      originalTransactionId: transaction.originalTransactionId,
      environment: String(transaction.environment ?? Environment.PRODUCTION),
      purchasedAt,
      revokedAt,
    },
  });
}

export async function getStoreKitEntitlement(driverId: string) {
  const entitlement = await prisma.appStoreEntitlement.findFirst({
    where: {
      driverId,
      productId: {
        in: Array.from(TIPTRACK_UNLOCK_PRODUCT_IDS),
      },
      revokedAt: null,
    },
    orderBy: {
      purchasedAt: "desc",
    },
  });

  const revokedFallback = entitlement
    ? null
    : await prisma.appStoreEntitlement.findFirst({
        where: {
          driverId,
          productId: {
            in: Array.from(TIPTRACK_UNLOCK_PRODUCT_IDS),
          },
        },
        orderBy: {
          purchasedAt: "desc",
        },
      });

  const resolvedEntitlement = entitlement ?? revokedFallback;

  return {
    isPro: Boolean(entitlement),
    productId: resolvedEntitlement?.productId ?? TIPTRACK_UNLOCK_PRODUCT_ID,
    environment: resolvedEntitlement?.environment ?? null,
    purchasedAt: resolvedEntitlement?.purchasedAt.toISOString() ?? null,
    revokedAt: resolvedEntitlement?.revokedAt?.toISOString() ?? null,
  };
}
