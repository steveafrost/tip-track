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
    await prisma.order.create({
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
  } catch (error) {
    console.error(error);
  }
}

export async function updateOrder({
  externalId,
  tip,
}: {
  externalId: string;
  tip: number;
}) {
  try {
    const order = await prisma.order.update({
      where: { externalId },
      data: {
        tip,
      },
    });

    return { order };
  } catch (error) {
    console.error(error);

    return { error };
  }
}
