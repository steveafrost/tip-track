"use server";

import prisma from "@/lib/prisma";

export async function addOrder({
  address,
  externalId,
}: {
  address: string;
  externalId: string;
}) {
  try {
    const order = await prisma.order.create({
      data: {
        externalId,
        location: {
          connectOrCreate: {
            where: { address },
            create: { address },
          },
        },
      },
    });

    return { order };
  } catch (error) {
    return { error };
  }
}
