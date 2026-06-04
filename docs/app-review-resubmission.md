# App Review Resubmission Checklist

Current App Store Connect state:

- App: TipTrack Delivery Log
- Bundle ID: `com.steveafrost.tiptrack`
- Version: `1.0`
- Attached build: `14`
- Build processing state: `VALID`
- In-app purchase: `com.steveafrost.tiptrack.pro.unlock`
- IAP state: `WAITING_FOR_REVIEW`
- IAP type: non-consumable

## Review Notes

Use this in the App Review Information notes field:

```
This resubmission addresses the issues reported for the prior reviewed build.

Changes in build 14:
- Sign in with Apple account connection state is now tracked using connected provider data, so users are not prompted to connect Apple again after signing in with Apple.
- The TipTrack Pro StoreKit product loader now has a timeout and user-facing fallback state instead of loading indefinitely.
- The submitted binary contains the non-consumable StoreKit product ID: com.steveafrost.tiptrack.pro.unlock.

The attached screen recording was captured on a physical device. It starts from the Home Screen, launches TipTrack, demonstrates the core app flow, and shows a successful sandbox purchase for TipTrack Pro Unlock.
```

## Required Recording

Apple specifically requested a screen recording captured on a physical device. Do not resubmit until this file is attached in App Review Information.

Recording must show:

- Start from the iOS Home Screen.
- Launch TipTrack.
- Sign in with the demo/review account provided in App Review Information.
- Demonstrate the core flow: add/log an order, view/search orders, view/search locations, and open reports.
- Open TipTrack Pro.
- Complete a successful sandbox purchase of TipTrack Pro Unlock.
- Show the app returning to an unlocked Pro state.

## Local Verification Already Completed

- `pnpm lint`
- `pnpm build`
- iOS Release archive/export for build 14
- StoreKit product ID present in archived binary
- Sign in with Apple entitlement present in archived binary
- iPad simulator Release launch
- iPadOS 26.5 simulator Release launch
- Local production route/API checks
- Live production route checks
- Desktop and mobile web screenshots

## Submit

After attaching the recording:

1. Confirm build `14` is still selected for version `1.0`.
2. Confirm `TipTrack Pro Unlock` is included with the submission.
3. Confirm App Review notes include the text above.
4. Submit for review.
