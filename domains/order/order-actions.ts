"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LocationLookup } from "./order.constants";
import { redirect } from "next/navigation";
import { getWebUserId } from "@/lib/web-auth";

export async function getOrders() {
  const userId = await getWebUserId().catch(() => null);

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
  const userId = await getWebUserId().catch(() => null);

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
  tip,
}: {
  location: LocationLookup;
  externalId: string;
  tip?: number | null;
}) {
  const userId = await getWebUserId().catch(() => null);

  if (!userId)
    throw new Error(`User must be signed in to create order: ${userId}`);

  try {
    const existingOrder = await prisma.order.findFirst({
      where: { externalId, createdBy: userId },
      select: { id: true },
    });

    if (existingOrder) {
      throw new Error("That order ID is already saved");
    }

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
        tip: tip ?? undefined,
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
  const userId = await getWebUserId().catch(() => null);

  if (!userId)
    throw new Error(`User must be signed in to update order: ${userId}`);

  try {
    const existingOrder = await prisma.order.findFirst({
      where: { externalId, createdBy: userId },
      select: { id: true },
    });

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    await prisma.order.update({
      where: { id: existingOrder.id },
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
