import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getMobileDriverId,
  mobileJsonError,
  serializeOrder,
} from "@/lib/mobile-api";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    externalId: string;
  };
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const driverId = getMobileDriverId(request);
    const body = await request.json();

    const existingOrder = await prisma.order.findFirst({
      where: {
        externalId: params.externalId,
        createdBy: driverId,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const address =
      typeof body.location?.address === "string"
        ? body.location.address.trim()
        : "";
    const latitude = Number(body.location?.latitude ?? 0);
    const longitude = Number(body.location?.longitude ?? 0);
    const tip = Number(body.tip);

    if (!Number.isInteger(tip) || tip < 0 || tip > 4) {
      return NextResponse.json({ error: "Invalid tip value" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        tip,
        location:
          address.length >= 2
            ? {
                connectOrCreate: {
                  where: { address },
                  create: {
                    address,
                    coordinates: [latitude, longitude],
                  },
                },
              }
            : undefined,
      },
      include: { location: true },
    });

    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    return mobileJsonError(error);
  }
}
