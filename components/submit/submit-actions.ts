"use server";

import prisma from "@/lib/prisma";

export async function addOrder({
  address,
  externalId,
  tip,
}: {
  address: string;
  externalId: string;
  tip: string;
}) {
  try {
    const order = await prisma.order.create({
      data: {
        externalId,
        tip: parseInt(tip),
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
