import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  mobileJsonError,
  serializeOrder,
} from "@/lib/mobile-api";
import { getWebUserId } from "@/lib/web-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = await getWebUserId();

    const locations = await prisma.location.findMany({
      where: {
        orders: {
          some: { createdBy: userId },
        },
      },
      include: {
        orders: {
          where: { createdBy: userId },
          include: { location: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { address: "asc" },
    });

    return NextResponse.json({
      locations: locations.map((location) => ({
        id: location.id,
        address: location.address,
        latitude: location.coordinates[0] ?? 0,
        longitude: location.coordinates[1] ?? 0,
        orders: location.orders.map(serializeOrder),
      })),
    });
  } catch (error) {
    return mobileJsonError(error);
  }
}
