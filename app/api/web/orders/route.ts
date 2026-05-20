import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getMobileDriverId,
  mobileJsonError,
  serializeOrder,
} from "@/lib/mobile-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const driverId = getMobileDriverId(request);

    const orders = await prisma.order.findMany({
      where: { createdBy: driverId },
      include: { location: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders: orders.map(serializeOrder) });
  } catch (error) {
    return mobileJsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const driverId = getMobileDriverId(request);
    const body = await request.json();

    const externalId =
      typeof body.externalId === "string" ? body.externalId.trim() : "";
    const address =
      typeof body.location?.address === "string"
        ? body.location.address.trim()
        : "";
    const latitude = Number(body.location?.latitude ?? 0);
    const longitude = Number(body.location?.longitude ?? 0);

    if (externalId.length < 2) {
      return NextResponse.json(
        { error: "Order ID must contain at least 2 characters" },
        { status: 400 }
      );
    }

    if (address.length < 2) {
      return NextResponse.json(
        { error: "Please enter a delivery address" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { externalId },
      select: { id: true },
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: "That order ID is already saved" },
        { status: 409 }
      );
    }

    const order = await prisma.order.create({
      data: {
        externalId,
        createdBy: driverId,
        location: {
          connectOrCreate: {
            where: { address },
            create: {
              address,
              coordinates: [latitude, longitude],
            },
          },
        },
      },
      include: { location: true },
    });

    return NextResponse.json({ order: serializeOrder(order) }, { status: 201 });
  } catch (error) {
    return mobileJsonError(error);
  }
}
