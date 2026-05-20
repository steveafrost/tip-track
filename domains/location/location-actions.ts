"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getWebUserId } from "@/lib/web-auth";

export async function getLocations() {
  const userId = await getWebUserId().catch(() => null);

  if (!userId) redirect("/");

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
