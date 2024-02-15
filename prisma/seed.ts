import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const load = async () => {
  try {
    await prisma.order.create({
      data: {
        externalId: "123",
        location: {
          connectOrCreate: {
            where: { address: "123 Main St" },
            create: { address: "123 Main St" },
          },
        },
        createdBy: "user_2cQ1rwUB9l4Vt3CRrQp7Dtn9z9w",
      },
    });

    await prisma.order.create({
      data: {
        externalId: "456",
        location: {
          connectOrCreate: {
            where: { address: "456 Main St" },
            create: { address: "456 Main St" },
          },
        },
        createdBy: "user_2cQ1rwUB9l4Vt3CRrQp7Dtn9z9w",
      },
    });

    await prisma.order.create({
      data: {
        externalId: "789",
        location: {
          connectOrCreate: {
            where: { address: "789 Main St" },
            create: { address: "789 Main St" },
          },
        },
        createdBy: "789",
      },
    });

    console.log("Seeded Orders");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

load().catch((e) => {
  console.error(e);
  process.exit(1);
});
