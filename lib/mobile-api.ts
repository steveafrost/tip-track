import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

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
  const sessionToken = request.headers.get("x-tip-track-session-token");

  if (sessionToken) {
    return verifyMobileSessionToken(sessionToken).driverId;
  }

  if (process.env.MOBILE_ALLOW_LEGACY_DRIVER_HEADER !== "true") {
    throw new MobileApiError("Missing user session", 401);
  }

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

export function createMobileSessionToken({
  driverId,
  displayName,
}: {
  driverId: string;
  displayName?: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    driverId,
    displayName,
    iat: now,
    exp: now + 60 * 60 * 24 * 90,
  };

  return signMobileSessionPayload(payload);
}

export function mobileJsonError(error: unknown) {
  if (error instanceof MobileApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
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

function signMobileSessionPayload(payload: {
  driverId: string;
  displayName?: string;
  iat: number;
  exp: number;
}) {
  const encodedHeader = encodeBase64Url({ alg: "HS256", typ: "JWT" });
  const encodedPayload = encodeBase64Url(payload);
  const signature = sign(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyMobileSessionToken(token: string) {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new MobileApiError("Invalid user session", 401);
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`);
  const providedSignature = Buffer.from(encodedSignature, "base64url");
  const expectedSignatureBytes = Buffer.from(expectedSignature, "base64url");

  if (
    providedSignature.length !== expectedSignatureBytes.length ||
    !timingSafeEqual(providedSignature, expectedSignatureBytes)
  ) {
    throw new MobileApiError("Invalid user session", 401);
  }

  let payload: { driverId?: string; exp?: number };

  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    throw new MobileApiError("Invalid user session", 401);
  }

  if (!payload.driverId || !payload.exp) {
    throw new MobileApiError("Invalid user session", 401);
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new MobileApiError("User session expired", 401);
  }

  return { driverId: payload.driverId };
}

function sign(value: string) {
  return createHmac("sha256", getMobileSessionSecret())
    .update(value)
    .digest("base64url");
}

function encodeBase64Url(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function getMobileSessionSecret() {
  const secret =
    process.env.MOBILE_SESSION_SECRET ??
    process.env.MOBILE_API_TOKEN ??
    process.env.CLERK_SECRET_KEY;

  if (!secret) {
    throw new MobileApiError("Mobile session secret is not configured", 500);
  }

  return secret;
}
