"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

export async function getLocations() {
  const { userId } = auth();

  if (!userId)
    throw new Error(`User must be signed in to get locations: ${userId}`);

  try {
    const locations = await prisma.location.findMany({
      where: {
        orders: {
          some: { createdBy: userId },
        },
      },
      include: {
        orders: {
          where: { createdBy: userId },
        },
      },
      orderBy: { address: "asc" },
    });

    return { locations };
  } catch (error) {
    return { error };
  }
}
