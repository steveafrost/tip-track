import {
  createHash,
  createPublicKey,
  createVerify,
  type JsonWebKey,
} from "crypto";

const appleIssuer = "https://appleid.apple.com";
const appleKeysUrl = "https://appleid.apple.com/auth/keys";
const defaultAudience = "com.steveafrost.tiptrack";

type AppleKey = {
  kid: string;
  alg: string;
  kty: string;
  use: string;
  n: string;
  e: string;
};

type AppleKeysResponse = {
  keys: AppleKey[];
};

export type AppleIdentity = {
  subject: string;
  email?: string;
};

type AppleIdentityPayload = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  nonce?: string;
};

let cachedAppleKeys: { expiresAt: number; keys: AppleKey[] } | null = null;

export async function verifyAppleIdentityToken({
  identityToken,
  rawNonce,
}: {
  identityToken: string;
  rawNonce?: string;
}): Promise<AppleIdentity> {
  const [encodedHeader, encodedPayload, encodedSignature] =
    identityToken.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Invalid Apple identity token");
  }

  const header = parseJwtPart<{ kid?: string; alg?: string }>(encodedHeader);
  const payload = parseJwtPart<AppleIdentityPayload>(encodedPayload);

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported Apple identity token");
  }

  const key = (await getAppleKeys()).find((candidate) => {
    return candidate.kid === header.kid && candidate.alg === "RS256";
  });

  if (!key) {
    throw new Error("Apple identity key not found");
  }

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const isSignatureValid = verifier.verify(
    createPublicKey({ key: key as JsonWebKey, format: "jwk" }),
    Buffer.from(encodedSignature, "base64url")
  );

  if (!isSignatureValid) {
    throw new Error("Invalid Apple identity token signature");
  }

  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== appleIssuer) {
    throw new Error("Invalid Apple identity token issuer");
  }

  if (!payload.sub) {
    throw new Error("Apple identity token is missing a subject");
  }

  if (!payload.exp || payload.exp <= now) {
    throw new Error("Apple identity token has expired");
  }

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const expectedAudiences = getExpectedAudiences();

  if (!audiences.some((audience) => audience && expectedAudiences.includes(audience))) {
    throw new Error("Apple identity token audience does not match TipTrack");
  }

  if (rawNonce) {
    const expectedNonce = createHash("sha256").update(rawNonce).digest("hex");

    if (payload.nonce !== expectedNonce) {
      throw new Error("Apple identity token nonce does not match");
    }
  }

  return {
    subject: payload.sub,
    email: payload.email,
  };
}

async function getAppleKeys() {
  if (cachedAppleKeys && cachedAppleKeys.expiresAt > Date.now()) {
    return cachedAppleKeys.keys;
  }

  const response = await fetch(appleKeysUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Could not load Apple identity keys");
  }

  const body = (await response.json()) as AppleKeysResponse;
  cachedAppleKeys = {
    expiresAt: Date.now() + 60 * 60 * 1000,
    keys: body.keys,
  };

  return body.keys;
}

function parseJwtPart<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

function getExpectedAudiences() {
  const configured =
    process.env.APPLE_SIGN_IN_AUDIENCE ?? process.env.APPLE_BUNDLE_ID;

  return (configured ?? defaultAudience)
    .split(",")
    .map((audience) => audience.trim())
    .filter(Boolean);
}
