"use server";

import prisma from "@/lib/prisma";

export async function getLocations() {
  try {
    const locations = await prisma.location.findMany({
      include: {
        orders: true,
      },
      orderBy: { address: "asc" },
    });

    return { locations };
  } catch (error) {
    return { error };
  }
}
