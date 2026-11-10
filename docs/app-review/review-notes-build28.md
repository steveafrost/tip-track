# App Review notes for TipTrack 1.0.3 build 28

Use this text after build 28 is uploaded and selected for version 1.0.3.

```
TipTrack Delivery Log can be reviewed without credentials. On the first screen, tap Preview demo log to open a sample driver account with existing orders, saved locations, reports, and local add/edit functionality. Reviewers may also use Sign in with Apple or Google to create a normal cloud-synced account.

Build 28 includes:
- A grouped Add Order form with a visible tip-range grid and accessible large-text layout.
- In-app account deletion at Account (person icon, top right) > Delete account. Reviewers can use this on a test cloud account. It permanently removes that TipTrack account's cloud orders, connected logins, and server-side Pro verification. It does not cancel or refund an App Store purchase. Signing in again creates a new empty TipTrack account.
- Clearer handling when two orders try to use the same order ID for one driver.
- The prior Sign in with Apple repeat-prompt fix, account-safe sync, and iOS 27 scene-lifecycle startup fix.

TipTrack Pro is opened from the person icon account menu (top right) > Upgrade to TipTrack Pro. The app allows the first 20 orders free. The one-time USD 4.99 non-consumable unlocks unlimited order logging, saved location history, and tip reports.

Both StoreKit products are approved in App Store Connect:
- com.steveafrost.tiptrack.pro.unlock.v2 (primary)
- com.steveafrost.tiptrack.pro.unlock (legacy entitlement recognition)

The attached screen recording was captured on a physical iPhone. It starts at the Home Screen, launches TipTrack, opens Preview demo log, demonstrates add/search/locations/reports, opens TipTrack Pro, completes a sandbox purchase, and shows the unlocked Pro state.
```

Before submitting, replace the recording sentence if the final recording differs.
