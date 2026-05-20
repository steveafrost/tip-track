import {
  createPublicKey,
  createVerify,
  type JsonWebKey,
} from "crypto";

const googleIssuer = "https://accounts.google.com";
const googleLegacyIssuer = "accounts.google.com";
const googleKeysUrl = "https://www.googleapis.com/oauth2/v3/certs";

type GoogleKey = {
  kid: string;
  alg: string;
  kty: string;
  use: string;
  n: string;
  e: string;
};

type GoogleKeysResponse = {
  keys: GoogleKey[];
};

type GoogleIdentityPayload = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
};

export type GoogleIdentity = {
  subject: string;
  email?: string;
  displayName?: string;
};

let cachedGoogleKeys: { expiresAt: number; keys: GoogleKey[] } | null = null;

export async function verifyGoogleIdentityToken(
  identityToken: string
): Promise<GoogleIdentity> {
  const [encodedHeader, encodedPayload, encodedSignature] =
    identityToken.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Invalid Google identity token");
  }

  const header = parseJwtPart<{ kid?: string; alg?: string }>(encodedHeader);
  const payload = parseJwtPart<GoogleIdentityPayload>(encodedPayload);

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported Google identity token");
  }

  const key = (await getGoogleKeys()).find((candidate) => {
    return candidate.kid === header.kid && candidate.alg === "RS256";
  });

  if (!key) {
    throw new Error("Google identity key not found");
  }

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const isSignatureValid = verifier.verify(
    createPublicKey({ key: key as JsonWebKey, format: "jwk" }),
    Buffer.from(encodedSignature, "base64url")
  );

  if (!isSignatureValid) {
    throw new Error("Invalid Google identity token signature");
  }

  if (payload.iss !== googleIssuer && payload.iss !== googleLegacyIssuer) {
    throw new Error("Invalid Google identity token issuer");
  }

  if (!payload.sub) {
    throw new Error("Google identity token is missing a subject");
  }

  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Google identity token has expired");
  }

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const expectedAudiences = getExpectedAudiences();

  if (!audiences.some((audience) => audience && expectedAudiences.includes(audience))) {
    throw new Error("Google identity token audience does not match TipTrack");
  }

  const emailVerified =
    payload.email_verified === true || payload.email_verified === "true";

  return {
    subject: payload.sub,
    email: emailVerified ? payload.email : undefined,
    displayName: payload.name,
  };
}

async function getGoogleKeys() {
  if (cachedGoogleKeys && cachedGoogleKeys.expiresAt > Date.now()) {
    return cachedGoogleKeys.keys;
  }

  const response = await fetch(googleKeysUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Could not load Google identity keys");
  }

  const body = (await response.json()) as GoogleKeysResponse;
  cachedGoogleKeys = {
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
    process.env.GOOGLE_SIGN_IN_AUDIENCE ??
    process.env.GOOGLE_SERVER_CLIENT_ID ??
    process.env.GOOGLE_CLIENT_ID;

  return (configured ?? "")
    .split(",")
    .map((audience) => audience.trim())
    .filter(Boolean);
}
