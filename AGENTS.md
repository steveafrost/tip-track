# TipTrack — Agent Knowledge Document

## App Overview

**TipTrack** is a delivery driver tip-tracking app. It helps drivers log orders, remember addresses, record tip ranges (No Tip / <$5 / $5-10 / >$10 / >$20), and review tip patterns by location. Originally a Next.js PWA, it now has a **native SwiftUI iOS app** as the primary client. The Next.js deployment serves as the backend API and a secondary web dashboard.

**Domain:** `usetiptrack.com`  
**iOS App Store ID:** `6771138274`  
**Bundle ID:** `com.steveafrost.tiptrack`  
**Pro Unlock:** $4.99 one-time via StoreKit (non-consumable product IDs: `com.steveafrost.tiptrack.pro.unlock.v2`, legacy `com.steveafrost.tiptrack.pro.unlock`)

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                  iOS App                      │
│  (SwiftUI, StoreKit, MapKit, UserDefaults)   │
│           ↕  /api/mobile/*                   │
├──────────────────────────────────────────────┤
│           Next.js Backend (Vercel)            │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ /api/web │  │/api/mobile│  │  Web App   │  │
│  │(Clerk    │  │(HMAC JWT) │  │(SPA /app   │  │
│  │  auth)   │  │  auth)   │  │ clerk auth)│  │
│  └──────────┘  └──────────┘  └────────────┘  │
│              ↕  Prisma ORM                    │
│           PostgreSQL (Vercel Postgres)        │
└──────────────────────────────────────────────┘
```

### Auth Architecture (Critical)

The app has **two independent auth systems** that converge on a shared user model:

| Feature | Web App | iOS App |
|---|---|---|
| Auth Provider | Clerk (Apple/Google OAuth) | Native Sign in with Apple / GoogleSignIn SDK |
| Token | Clerk session cookie | Custom HMAC JWT (`x-tip-track-session-token`) |
| User Model | `AppUser` via `AuthIdentity` | Same `AppUser` via `AuthIdentity` |
| Identity Linking | Clerk external accounts ↔ AuthIdentity | Native OAuth tokens verified server-side |

The backend resolves all identities through `lib/auth-resolver.ts` → `prisma.authIdentity` + `prisma.appUser`.

---

## Database Schema (Prisma + PostgreSQL)

5 models:

### `Location`
- `id`, `address` (unique), `coordinates` (Float[]), timestamps
- Has many `Order`s

### `Order`
- `id`, `externalId` (per-driver unique via `@@unique([createdBy, externalId])`), `tip` (Int? 0-4), `total` (Int?, unused)
- Belongs to `Location`, owned by `createdBy` (driver ID)
- Tip values: 0=No Tip, 1=<$5, 2=$5-10, 3=>$10, 4=>$20

### `AppUser`
- `id`, `displayName`, `primaryEmail`, timestamps
- Has many `AuthIdentity`s

### `AuthIdentity`
- Links `AppUser` to OAuth providers
- `@@unique([provider, providerSubject])` — `apple:<sub>`, `google:<sub>`, or `legacy:<key>`

### `AppStoreEntitlement`
- Tracks StoreKit Pro purchases per driver
- `@@unique([driverId, productId])`
- `transactionId` (unique), `originalTransactionId`, `environment`, `purchasedAt`, `revokedAt`

---

## Key Files

### Core Backend (`lib/`)
| File | Purpose |
|---|---|
| `lib/prisma.ts` | Singleton Prisma client |
| `lib/mobile-api.ts` | Shared API utilities: HMAC JWT tokens, request auth, error handling, order serialization |
| `lib/auth-resolver.ts` | Identity → AppUser resolution, linking, legacy migration |
| `lib/provider-identities.ts` | Routes Apple/Google identity verification |
| `lib/apple-sign-in.ts` | Verifies Apple identity tokens (RS256 JWKs from Apple) |
| `lib/google-sign-in.ts` | Verifies Google identity tokens (RS256 JWKs from Google) |
| `lib/web-auth.ts` | Clerk-based web auth → AppUser resolution |
| `lib/app-store-entitlements.ts` | StoreKit receipt verification + upsert using Apple App Store Server Library |
| `lib/utils.ts` | `cn()` utility for tailwind-merge |

### API Routes (`app/api/`)

**Web routes** (Clerk auth):
- `POST /api/web/session` — Returns current user session
- `GET/POST /api/web/orders` — List/create orders
- `PATCH /api/web/orders/[externalId]` — Update order
- `GET /api/web/locations` — List locations with orders
- `GET /api/web/entitlements` — Get StoreKit entitlement

**Mobile routes** (HMAC JWT + optional API token):
- `POST /api/mobile/session` — Sign in (Apple/Google/legacy name)
- `GET/POST /api/mobile/orders` — List/create orders
- `PATCH /api/mobile/orders/[externalId]` — Update order
- `GET /api/mobile/locations` — List locations
- `POST /api/mobile/identities/link` — Link additional provider
- `GET/POST /api/mobile/entitlements/apple` — Get/sync StoreKit entitlement

### Web App (`app/`)
| File | Purpose |
|---|---|
| `app/page.tsx` | Marketing homepage (landing page with App Store CTA) |
| `app/layout.tsx` | Root layout with ClerkProvider, Toaster, AppChrome |
| `app/submit/web-app.tsx` | **Main SPA (~1415 lines)** — full authenticated web app with 4 tabs (Add, Orders, Locations, Reports) |
| `app/app/page.tsx` | Entry → `WebApp` component |
| `app/submit/page.tsx` | Redirect → `/app` |
| `app/search/orders/page.tsx` | Redirect → `/app` (dead route) |
| `app/search/locations/page.tsx` | Redirect → `/app` (dead route) |
| `app/reports/page.tsx` | Redirect → `/app` (dead route) |
| `middleware.ts` | Clerk middleware with all app routes as public |

### iOS App (`ios/App/App/`)
| File | Lines | Purpose |
|---|---|---|
| `AppDelegate.swift` | 35 | App entry point, sets up TipTrackStore + MonetizationStore |
| `TipTrackAppView.swift` | 204 | Root view: sign-in gate → tab bar (Add/Orders/Locations/Reports) |
| `TipTrackStore.swift` | 335 | Central state: session, orders, location derivation, CRUD, UserDefaults persistence |
| `MonetizationStore.swift` | 251 | StoreKit: product loading with retry/timeout, purchase, restore, entitlement sync |
| `Screens.swift` | 1698 | All UI screens: SignInView, AddOrderView, OrderSearchView, LocationSearchView, ReportsView, PaywallView, HelpView, OrderEditor |
| `Components.swift` | 416 | Reusable UI: AddressLookupField, OrderCard, LocationCard, TipBadge, StatTile, etc. |
| `TipTrackAPIClient.swift` | 358 | HTTP client for all mobile API endpoints |
| `Models.swift` | 103 | Data models: TipOrder, TipLocation, DriverSession, TipCategory, AppTab |
| `AddressSearch.swift` | 73 | MapKit MKLocalSearchCompleter wrapper for native address autocomplete |

### Scripts (`scripts/`)
| File | Purpose |
|---|---|
| `scripts/check-app-store-status.mjs` | Checks App Store Connect for review status via API. Can send iMessage/Mac notifications on state change |
| `scripts/release-checks/order-scope-check.mjs` | Validates order uniqueness per-driver constraint in production |
| `scripts/backfill-auth-users.ts` | Migrates legacy owner keys (`apple:<sub>`, `google:<sub>`, raw IDs) into AppUser/AuthIdentity |

### Other
| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Test seed data (hardcoded IDs) |
| `next.config.mjs` | Image optimization + caching headers |
| `tailwind.config.ts` | shadcn/ui configuration with custom colors |
| `public/manifest.json` | PWA manifest |
| `store/index.ts` | Zustand store (used by old legacy pages only) |
| `components.json` | shadcn/ui config |

---

## Current State

### ✅ Working
- Full Next.js API backend (web + mobile routes)
- Apple & Google identity token verification (server-side)
- Auth identity system (create, link, resolve with race-condition handling)
- StoreKit receipt verification + entitlement upsert
- iOS app with full native UI (SwiftUI)
- Web SPA with Clerk auth, add/search/locations/reports flows
- Marketing homepage with App Store deep link
- PWA manifest + service worker ready
- Image optimization pipeline (AVIF + JPEG multi-format)
- Per-driver order ID uniqueness (recently deployed)
- Order scope validation script for pre-release
- App Store Connect status monitoring script
- Auth backfill migration script

### 🚧 In Progress / Active
- **iOS App Store Review** — App is in review (build 18). Recent commits focus on:
  - StoreKit product loading diagnostics and hardening
  - Order entry UX polish
  - App Review resubmission documentation
  - StoreKit IAP metadata repair (after rejection)
  - Per-driver order ID uniqueness (was a review issue)

### ⚠️ Issues / Gaps
1. **No test suite** — Zero unit, integration, or E2E tests anywhere in the repo
2. **No CI/CD pipeline** — No GitHub Actions, no Vercel config committed
3. **Deprecated ESLint** — `eslint-config-next` extends `next/core-web-vitals` (deprecated in Next 14)
4. **Massive monolithic component** — `web-app.tsx` is 1415 lines, should be split
5. **Dead routes** — `/search/orders`, `/search/locations`, `/reports`, `/submit` all just redirect to `/app`. The `Navigation` and `AppChrome` components are dead code for the new SPA
6. **StoreKit product flakiness** — IAP product loading has been unreliable; retry/timeout logic added but root cause (Paid Apps Agreement?) unclear
7. **Hardcoded seed data** — `prisma/seed.ts` uses hardcoded Clerk user IDs
8. **No error monitoring** — No Sentry, LogRocket, or similar
9. **No Dependabot/Renovate** — Dependencies not automatically updated
10. **VSCode settings** — `.vscode/settings.json` is empty
11. **`components/pie-chart.tsx`** — Exists but unused by the new SPA (the SPA uses bar charts inline)

---

## What Needs Work

### High Priority
1. **Tests** — Add Vitest/Jest for API route tests and iOS unit tests
2. **CI/CD** — GitHub Actions for: `pnpm lint && pnpm tsc --noEmit && pnpm build`, iOS Swift syntax check, Prisma schema validation
3. **ESLint upgrade** — Migrate from `next/core-web-vitals` to `@eslint/js` + `typescript-eslint`
4. **Dependency updates** — Add Dependabot or Renovate config
5. **Error monitoring** — Add Sentry for both Next.js and iOS

### Medium Priority
6. **Refactor web-app.tsx** — Split the 1415-line SPA into separate files per panel
7. **Clean up dead code** — Remove legacy routes, dead Navigation/AppChrome paths, unused components (pie-chart)
8. **Database migration testing** — Add automated migration testing
9. **StoreKit product loading** — Root-cause the intermittent IAP load failures
10. **API rate limiting** — Add rate limiting to mobile API routes

### Low Priority
11. **Seed data** — Make seed script configurable with env vars
12. **VSCode settings** — Add recommended extensions and settings
13. **Documentation** — Add API route documentation (OpenAPI/Swagger)
14. **Localization** — App is English-only currently

---

## Environment Variables

### Required for Web
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

### Required for Mobile API
```
MOBILE_SESSION_SECRET=
APPLE_SIGN_IN_AUDIENCE=com.steveafrost.tiptrack
GOOGLE_SIGN_IN_AUDIENCE=
MOBILE_REQUIRE_USER_AUTH=true
MOBILE_API_TOKEN=           (optional, shared secret)
MOBILE_ALLOW_LEGACY_DRIVER_HEADER=    (optional, dev only)
```

### Optional for Monitoring
```
APP_STORE_STATUS_IMESSAGE_TO=   (phone/email for iMessage alerts)
```

### iOS Info.plist Keys
```
TipTrackAPIBaseURL = https://usetiptrack.com
TipTrackAPIToken = (optional, matches MOBILE_API_TOKEN)
GIDClientID = (Google iOS client ID)
GIDServerClientID = (Google web server client ID)
```

---

## Automation Opportunities

### ✅ Existing Scripts
- `scripts/check-app-store-status.mjs` — Polls App Store Connect for review status
- `scripts/release-checks/order-scope-check.mjs` — Validates per-driver order uniqueness
- `scripts/backfill-auth-users.ts` — Migrates legacy owner keys

### Recommended Cron Jobs
| Schedule | Job | Purpose |
|---|---|---|
| Daily @ 08:00 | `cd /workspace/repos/tip-track && pnpm build` | Catch build regressions |
| Daily @ 08:00 | `cd /workspace/repos/tip-track && pnpm exec tsc --noEmit` | Catch type errors |
| Hourly | App Store Connect status check | Monitor review status |
| Weekly | `pnpm auth:backfill` | Ensure auth is synced |
| Weekly | Dependency audit | Check for known vulnerabilities |

### Recommended CI Checks (GitHub Actions)
1. **Build check** — `pnpm install && pnpm build` on every PR
2. **Type check** — `pnpm exec tsc --noEmit`
3. **Lint** — `pnpm lint`
4. **iOS parse check** — `swiftc -parse ios/App/App/AppDelegate.swift`
5. **Prisma migration check** — `prisma migrate dev` dry run
6. **Release validation** — `pnpm release:check:order-scope` against staging

### Proactive Monitoring
1. **StoreKit receipt validation audit** — Daily check for expired/revoked entitlements
2. **Database connection pool** — Monitor Vercel Postgres pool exhaustion
3. **API error rate** — Monitor 4xx/5xx rate on mobile API endpoints
4. **Free order limit** — Track users hitting the 20-order limit
5. **Auth identity conflicts** — Monitor for `409` on identity linking

---

## Development Quick Reference

```bash
# Install
pnpm install

# Dev
pnpm dev

# Build
pnpm build

# Type check
pnpm exec tsc --noEmit

# Lint
pnpm lint

# DB
pnpm db:push      # Push schema to DB
pnpm db:generate  # Generate Prisma client
pnpm db:seed      # Seed test data

# Auth backfill (idempotent)
pnpm auth:backfill

# Release checks
pnpm release:check:order-scope

# iOS build (simulator)
xcodebuild -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Debug \
  -destination 'platform=iOS Simulator,OS=26.5,name=iPhone 17 Pro' \
  -derivedDataPath /private/tmp/tip-track-derived \
  build
```

---

## Key Design Decisions

1. **API token + session token** — Mobile API uses a two-layer auth: shared `MOBILE_API_TOKEN` as a bearer token (optional, app-wide), plus per-user HMAC session tokens via `x-tip-track-session-token`
2. **Legacy driver header** — `MOBILE_ALLOW_LEGACY_DRIVER_HEADER` allows `x-tip-track-driver-id` header for backward compat (dev only)
3. **StoreKit on server** — Receipt verification happens server-side using Apple's signed transaction info, not on-device
4. **Dual product IDs** — The app supports both the new (`v2`) and legacy StoreKit product IDs for smooth migration
5. **Local-first iOS** — The iOS app works fully offline with UserDefaults; cloud sync is optional when `TipTrackAPIBaseURL` is configured
6. **iOS has no webview** — The iOS app is pure SwiftUI, not Capacitor/Cordova. The Next.js code is backend + web dashboard only
