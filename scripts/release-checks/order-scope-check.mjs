import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return;

  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator < 0) continue;

    const key = trimmed.slice(0, separator);
    let value = trimmed.slice(separator + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile(".env.production.local");

const prisma = new PrismaClient();
const suffix = Date.now().toString(36);
const externalId = `release-scope-${suffix}`;
const address = `Release Scope Check ${suffix}`;
const createdBy = [`release-user-a-${suffix}`, `release-user-b-${suffix}`];

try {
  await prisma.location.upsert({
    where: { address },
    update: {},
    create: { address, coordinates: [0, 0] },
  });
  const location = await prisma.location.findUniqueOrThrow({ where: { address } });

  await prisma.order.create({
    data: { externalId, createdBy: createdBy[0], locationId: location.id },
  });
  await prisma.order.create({
    data: { externalId, createdBy: createdBy[1], locationId: location.id },
  });

  let duplicateSameDriverRejected = false;
  try {
    await prisma.order.create({
      data: { externalId, createdBy: createdBy[0], locationId: location.id },
    });
  } catch (error) {
    duplicateSameDriverRejected = error?.code === "P2002";
  }

  const tempRows = await prisma.order.count({
    where: { externalId, createdBy: { in: createdBy } },
  });

  console.log(
    JSON.stringify(
      {
        sameExternalIdAcrossDrivers: tempRows === 2,
        duplicateSameDriverRejected,
        tempRows,
      },
      null,
      2
    )
  );

  if (tempRows !== 2 || !duplicateSameDriverRejected) {
    process.exitCode = 1;
  }
} finally {
  await prisma.order.deleteMany({
    where: { externalId, createdBy: { in: createdBy } },
  });
  await prisma.location.deleteMany({ where: { address } });
  await prisma.$disconnect();
}
