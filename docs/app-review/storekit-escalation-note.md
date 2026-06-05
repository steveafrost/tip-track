# StoreKit Escalation Note

Use this only if App Store Connect Business confirms the Paid Applications Agreement, banking, and tax information are all active/complete, but `com.steveafrost.tiptrack.pro.unlock` still does not load in sandbox/TestFlight/App Review.

```
Hello App Review,

We are resubmitting TipTrack Delivery Log 1.0 with build 15 and need help verifying why the non-consumable in-app purchase is not being returned by StoreKit in sandbox/App Review.

Product:
- App: TipTrack Delivery Log
- Bundle ID: com.steveafrost.tiptrack
- App Store version: 1.0
- Build: 15
- IAP product ID: com.steveafrost.tiptrack.pro.unlock
- IAP type: Non-consumable
- IAP state: Waiting for Review
- Price: USA $4.99

Configuration verified:
- The submitted build contains the exact product ID `com.steveafrost.tiptrack.pro.unlock`.
- The Bundle ID has the In-App Purchase capability enabled.
- The IAP has a completed review screenshot.
- The rejected primary en-US localization was deleted and recreated.
- The en-US and en-GB localizations are both Waiting for Review.
- USA availability is active, and the product is available in 175 territories.
- Build 15 is valid and attached to version 1.0.
- App Review notes include the product ID and the path to open TipTrack Pro.
- Paid Applications Agreement, banking, and tax information have been confirmed active/complete in App Store Connect Business.

Build 15 includes bounded StoreKit product-loading retries and a timeout fallback. On a physical iPhone using the sandbox environment, the app still receives no product for `com.steveafrost.tiptrack.pro.unlock`, so the Pro screen cannot show the App Store purchase button.

Could you please confirm whether this first-time IAP is correctly associated with the app review submission and visible to the App Review sandbox?
```

