"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function getLocations() {
  const { userId } = auth();

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
