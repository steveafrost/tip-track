import { NextRequest, NextResponse } from "next/server";

export class MobileApiError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export function authorizeMobileRequest(request: NextRequest) {
  const configuredToken = process.env.MOBILE_API_TOKEN;

  if (!configuredToken) return;

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${configuredToken}`) {
    throw new MobileApiError("Unauthorized", 401);
  }
}

export function getMobileDriverId(request: NextRequest) {
  const driverId = request.headers.get("x-tip-track-driver-id");

  if (!driverId) {
    throw new MobileApiError("Missing driver id", 401);
  }

  return driverId;
}

export function slugDriverName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join("-");

  if (!slug) {
    throw new MobileApiError("Driver name must contain letters or numbers", 400);
  }

  return `mobile:${slug}`;
}

export function mobileJsonError(error: unknown) {
  if (error instanceof MobileApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export function serializeOrder(order: {
  id: string;
  externalId: string;
  tip: number | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  location: {
    address: string;
    coordinates: number[];
  };
}) {
  return {
    id: order.id,
    externalId: order.externalId,
    address: order.location.address,
    latitude: order.location.coordinates[0] ?? 0,
    longitude: order.location.coordinates[1] ?? 0,
    tip: order.tip,
    createdBy: order.createdBy,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}
