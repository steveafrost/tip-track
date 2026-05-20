# Tip Track

Tip Track is a native SwiftUI iOS app for delivery workers to log orders, remember addresses, record tip ranges, and review tip patterns by location.

The original Next.js implementation remains in the repo for reference, but the iOS target no longer hosts a webview or Capacitor bridge. The native app lives in `ios/App` and starts directly from SwiftUI.

## Native iOS App

- Bundle ID: `com.tiptrack.app`
- Minimum iOS target: 15.0
- Entry point: `ios/App/App/AppDelegate.swift`
- UI framework: SwiftUI
- Address search: MapKit `MKLocalSearchCompleter`
- Persistence: Postgres through the mobile API when configured, with on-device `UserDefaults` as the development fallback

## Native Functionality

- Driver sign-in gate
- Add orders by order ID and address
- Native address autocomplete
- Search saved orders
- Edit order address and tip range
- Search saved locations
- View previous tips for a location
- Edit tips from the location history
- View report counts for each tip range

## Build

Open `ios/App/App.xcodeproj` in Xcode, select your Apple Developer Team, then build or archive the `App` target.

Command-line simulator build:

```bash
xcodebuild -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Debug \
  -destination 'platform=iOS Simulator,OS=26.5,name=iPhone 17 Pro' \
  -derivedDataPath /private/tmp/tip-track-derived \
  build
```

## Backend

The Next.js app exposes native-friendly API routes under `/api/mobile`. They use the existing Prisma/Postgres `Order` and `Location` tables.

Set this on the deployed web/API app:

```bash
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
```

`MOBILE_API_TOKEN` is optional. When it is set on Vercel, the native client must send the same bearer token. When it is not set, the API accepts the app's driver-scoped requests without an app-wide shared secret.

Configure the native app in `ios/App/App/Info.plist`:

```xml
<key>TipTrackAPIBaseURL</key>
<string>https://usetiptrack.com</string>
<key>TipTrackAPIToken</key>
<string>optional same-value-as-MOBILE_API_TOKEN</string>
```

If `TipTrackAPIBaseURL` is blank, the iOS app stays local-only and persists data with `UserDefaults`.

### Mobile API

- `POST /api/mobile/session`
- `GET /api/mobile/orders`
- `POST /api/mobile/orders`
- `PATCH /api/mobile/orders/:externalId`
- `GET /api/mobile/locations`

When `MOBILE_API_TOKEN` is configured, all mobile API requests require:

```text
Authorization: Bearer <MOBILE_API_TOKEN>
```

All order/location requests also require:

```text
x-tip-track-driver-id: <driver-id>
```

## Legacy Web App

The original Next.js UI can still be run for comparison:

```bash
pnpm install
pnpm dev
```

The web app still requires:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

## Verification

```bash
pnpm run build
pnpm exec tsc --noEmit
swiftc -parse ios/App/App/AppDelegate.swift
plutil -lint ios/App/App.xcodeproj/project.pbxproj ios/App/App/Info.plist
```
