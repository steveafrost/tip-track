"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { LocationLookup } from "./order.constants";
import { redirect } from "next/navigation";

export async function getOrders() {
  const { userId } = auth();

  if (!userId) redirect("/");

  try {
    const orders = await prisma.order.findMany({
      where: { createdBy: userId },
    });

    return { orders };
  } catch (error) {
    console.error(error);

    return { error };
  }
}

export async function getOrdersWithLocation() {
  const { userId } = auth();

  if (!userId) redirect("/");

  try {
    const ordersWithLocation = await prisma.order.findMany({
      where: { createdBy: userId },
      include: { location: true },
    });

    return { orders: ordersWithLocation };
  } catch (error) {
    console.error(error);

    return { error };
  }
}

export async function addOrder({
  location,
  externalId,
}: {
  location: LocationLookup;
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
            where: { address: location.address },
            create: {
              address: location.address,
              coordinates: [location.latitude, location.longitude],
            },
          },
        },
        createdBy: userId,
      },
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/");
}

export async function updateOrder({
  externalId,
  tip,
  location,
}: {
  externalId: string;
  tip: number;
  location?: LocationLookup;
}) {
  try {
    await prisma.order.update({
      where: { externalId },
      data: {
        location: location
          ? {
              connectOrCreate: {
                where: { address: location.address },
                create: {
                  address: location.address,
                  coordinates: [location.latitude, location.longitude],
                },
              },
            }
          : undefined,
        tip,
      },
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/");
}
