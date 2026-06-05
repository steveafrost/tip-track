# App Review Resubmission Checklist

Current App Store Connect state:

- App: TipTrack Delivery Log
- Bundle ID: `com.steveafrost.tiptrack`
- Version: `1.0`
- Attached build: `15`
- Build processing state: `VALID`
- In-app purchase: `com.steveafrost.tiptrack.pro.unlock`
- IAP state: `WAITING_FOR_REVIEW`
- IAP type: non-consumable
- IAP primary `en-US` localization: replaced rejected localization and resubmitted; current state is `WAITING_FOR_REVIEW`

## Review Notes

Use this in the App Review Information notes field:

```
This resubmission addresses the issues reported for the prior reviewed build.

Changes in build 15:
- Sign in with Apple account connection state is now tracked using connected provider data, so users are not prompted to connect Apple again after signing in with Apple.
- The TipTrack Pro StoreKit product loader now uses bounded retry attempts, a timeout, StoreKit logging, and a user-facing fallback state instead of loading indefinitely.
- The submitted binary contains the non-consumable StoreKit product ID: com.steveafrost.tiptrack.pro.unlock.
- App Store Connect metadata was repaired for TipTrack Pro Unlock: the rejected `en-US` IAP localization was deleted, recreated, and resubmitted for review.

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
- Physical iPhone auth persistence check: force-close and reopen lands on the dashboard after Sign in with Apple.
- Physical iPhone StoreKit check: prior Pro unlock error reproduced before the App Store Connect IAP localization repair.
- Physical iPhone StoreKit check after localization repair and a fresh debug build: Pro unlock still fails to load the App Store product.

## StoreKit Metadata Repair

Completed on June 4, 2026:

- Deleted rejected `en-US` IAP localization `7cc76b98-95f5-4bc6-98ed-cd5148b9bc4c`.
- Created replacement `en-US` IAP localization `123c8f71-c5ff-46f6-8cc5-ae654fea8126`.
- Resubmitted IAP `6771212307`; product and both localizations are now `WAITING_FOR_REVIEW`.
- Verified USA availability and active manual USA price point `$4.99`.

Apple notes that IAP metadata changes can take up to 1 hour to appear in the sandbox environment. Re-test the Pro screen on the physical device after propagation before recording or resubmitting.

## Remaining StoreKit Gate

Before recording or resubmitting, confirm App Store Connect Business shows:

- Paid Applications Agreement: `Active`
- Banking: complete/active
- Tax forms: complete/active

Apple's sandbox troubleshooting guidance lists missing Paid Apps Agreement, incomplete banking, and incomplete tax information as reasons `Product.products(for:)` can return no in-app purchase products even when the product ID, price, localization, bundle ID, and In-App Purchase capability are correct.

## Submit

After attaching the recording:

1. Confirm build `15` is selected for version `1.0`.
2. Confirm `TipTrack Pro Unlock` is included with the submission.
3. Confirm App Review notes include the text above.
4. Submit for review.
