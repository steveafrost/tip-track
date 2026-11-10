# App Review Resubmission Checklist

## Current status (2026-11-06)

- App Store live version: `1.0.2`.
- Version `1.0.3` is `PREPARE_FOR_SUBMISSION`; it has not been submitted for App Review.
- Build `27` is `VALID` and attached to `1.0.3`; it is in internal TestFlight.
- Both Pro products are `APPROVED`: `com.steveafrost.tiptrack.pro.unlock.v2` and legacy `com.steveafrost.tiptrack.pro.unlock`.
- Build `27` predates the merged grouped Add form and privacy policy. Do not submit build `27`.
- Next candidate is a fresh build `28` from current source, including in-app account deletion.
- Required before submission: physical-device build/install, sandbox Pro purchase and restore, new physical-device screen recording, updated App Review notes, and build `28` selected for `1.0.3`.
- Pro is now opened from the person icon account menu, not a lock icon.

The build `16` instructions below are historical. Do not reuse their submission ID or build references.

## Historical build 16 state (June 2026)

## Review Notes

Use this in the App Review Information notes field:

Status: App Store Connect review notes must be updated for build `16` after upload.

```
This resubmission addresses the issues reported for the prior reviewed build.

Changes in build 16:
- Sign in with Apple account connection state is now tracked using connected provider data, so users are not prompted to connect Apple again after signing in with Apple.
- The TipTrack Pro StoreKit product loader now uses bounded retry attempts, a timeout, StoreKit logging, and a user-facing fallback state instead of loading indefinitely.
- The Xcode target explicitly enables the In-App Purchase capability for the submitted binary.
- The submitted binary contains the non-consumable StoreKit product ID: com.steveafrost.tiptrack.pro.unlock.
- App Store Connect metadata was repaired for TipTrack Pro Unlock: the rejected `en-US` IAP localization was deleted, recreated, and resubmitted for review.
- Order entry now supports adding a tip immediately or leaving it for later, dismisses the keyboard after saving, and shows clear selected states for tip choices.
- Order IDs are now unique per driver instead of globally unique, so review/demo accounts cannot collide with another driver's saved order number.

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
- iOS Release archive/export/upload for build 15
- iOS simulator build/run for build 16 after order-entry UX fixes
- iOS Release archive/export for build 16
- Web lint/build after order-entry UX fixes
- Production Prisma schema pushed for per-driver order ID uniqueness.
- `pnpm release:check:order-scope` passed against production with temporary rows cleaned up.
- StoreKit product ID present in exported build 16 IPA
- Sign in with Apple entitlement present in exported build 16 IPA
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

If all Business statuses are active/complete and Pro still fails to load after propagation, use `docs/app-review/storekit-escalation-note.md` as the support/review escalation text.

## Submit

After attaching the recording:

1. Confirm build `16` is selected for version `1.0`.
2. Confirm `TipTrack Pro Unlock` is included with the submission.
3. Confirm App Review notes include the text above.
4. Resubmit the existing unresolved review submission `1aa47c93-fbf8-4f26-839e-9f9e4dda74a9`. App Store Connect reports version `1.0` is already part of that submission, so do not use the empty draft submission `7cf36728-3927-49c2-abed-7538f80f79df`.
