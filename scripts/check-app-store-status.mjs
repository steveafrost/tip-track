#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { sign } from "node:crypto";

const bundleId = "com.steveafrost.tiptrack";
const keyId = "38R6G5B784";
const issuerId = "4e8ddd0a-9e6c-4877-ae9d-3f7168c02256";
const keyPath = join(homedir(), ".appstoreconnect", "private_keys", `AuthKey_${keyId}.p8`);
const statePath = join(process.cwd(), ".tmp", "app-store-status.json");
const shouldNotify = process.argv.includes("--notify");
const shouldTestIMessage = process.argv.includes("--test-imessage");
const iMessageRecipient = process.env.APP_STORE_STATUS_IMESSAGE_TO;

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function createToken() {
  const privateKey = readFileSync(keyPath, "utf8");
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const payload = {
    iss: issuerId,
    iat: now - 30,
    exp: now + 20 * 60,
    aud: "appstoreconnect-v1",
  };
  const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signature = sign("sha256", Buffer.from(signingInput), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });
  return `${signingInput}.${signature.toString("base64url")}`;
}

async function appStoreConnect(path, token) {
  const response = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }
  return JSON.parse(body);
}

function sendMacNotification(title, message) {
  execFileSync("/usr/bin/osascript", [
    "-e",
    `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`,
  ]);
}

function sendIMessage(message) {
  if (!iMessageRecipient) {
    throw new Error("APP_STORE_STATUS_IMESSAGE_TO is required for iMessage notifications.");
  }

  execFileSync("/usr/bin/osascript", [
    "-e",
    `
      on run argv
        set recipientHandle to item 1 of argv
        set messageText to item 2 of argv
        tell application "Messages"
          set targetService to 1st service whose service type = iMessage
          set targetBuddy to buddy recipientHandle of targetService
          send messageText to targetBuddy
        end tell
      end run
    `,
    iMessageRecipient,
    message,
  ]);
}

function notify(title, message) {
  if (!shouldNotify) return;

  if (iMessageRecipient) {
    sendIMessage(`${title}: ${message}`);
    return;
  }

  sendMacNotification(title, message);
}

function readPreviousState() {
  try {
    return JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    return null;
  }
}

function writeCurrentState(status) {
  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, `${JSON.stringify(status, null, 2)}\n`);
}

if (shouldTestIMessage) {
  sendIMessage("TipTrack App Store watcher test: iMessage notifications are active.");
  console.log("Sent TipTrack App Store watcher iMessage test.");
  process.exit(0);
}

const token = createToken();
const apps = await appStoreConnect(`/v1/apps?filter[bundleId]=${bundleId}`, token);
const app = apps.data[0];

if (!app) {
  throw new Error(`No App Store Connect app found for ${bundleId}`);
}

const versions = await appStoreConnect(`/v1/apps/${app.id}/appStoreVersions?limit=10`, token);
const iosVersion = versions.data.find((version) => version.attributes.platform === "IOS") ?? versions.data[0];

if (!iosVersion) {
  throw new Error(`No App Store versions found for ${app.attributes.name}`);
}

const status = {
  checkedAt: new Date().toISOString(),
  appId: app.id,
  appName: app.attributes.name,
  bundleId: app.attributes.bundleId,
  versionId: iosVersion.id,
  versionString: iosVersion.attributes.versionString,
  appStoreState: iosVersion.attributes.appStoreState,
  releaseType: iosVersion.attributes.releaseType,
};

const previous = readPreviousState();

const stateChanged = previous?.appStoreState && previous.appStoreState !== status.appStoreState;
const isLive = status.appStoreState === "READY_FOR_SALE";

if (stateChanged && isLive) {
  notify("TipTrack is live", `${status.appName} ${status.versionString} is READY_FOR_SALE.`);
} else if (stateChanged) {
  notify("TipTrack App Store status changed", `${previous.appStoreState} -> ${status.appStoreState}`);
}

writeCurrentState(status);

console.log(`${status.checkedAt} ${status.appName} ${status.versionString}: ${status.appStoreState}`);
