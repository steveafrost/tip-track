"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({});

    return { orders };
  } catch (error) {
    console.error(error);

    return { error };
  }
}

export async function addOrder({
  address,
  externalId,
}: {
  address: string;
  externalId: string;
}) {
  const { userId } = auth();

  if (!userId)
    throw new Error(`User must be signed in to create order: ${userId}`);

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
        createdBy: userId,
      },
    });

    revalidatePath("/search");
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

    revalidatePath("/search");
    revalidatePath("/reports");

    return { order };
  } catch (error) {
    console.error(error);

    return { error };
  }
}
