# TipTrack Launch Kit

## Claim inventory

| Public statement | Evidence | Status |
| --- | --- | --- |
| iPhone-native delivery log | `README.md`; SwiftUI app target | Verified |
| Save order IDs, addresses, and optional tip ranges | `ios/App/App/Screens.swift` → `AddOrderView`; `Models.swift` → `TipOrder` | Verified |
| Update delayed tips later | `Screens.swift` → `OrderSearchView` / `OrderEditor` | Verified |
| Review repeat address history | `Screens.swift` → `LocationSearchView` | Verified |
| View saved-order tip-range distribution | `Screens.swift` → `ReportsView` / `TipDistributionCard` | Verified |
| Log/update via Shortcuts and Siri | `TipTrackAppIntents.swift` | Verified |
| 20 free orders and one-time $4.99 Pro | `Screens.swift` → `GuidedTourView` / `PaywallView`; homepage | Verified |
| Exact payout, mileage, earnings, notes, platform import, weekly reports | Not implemented in the current data model/UI | Do not claim |

## iOS campaign assets — generated and verified

| Asset | Use | Exact destination |
| --- | --- | --- |
| `public/images/campaign/tiptrack-ios-share-card.png` | X, Facebook, community posts, link previews | `https://usetiptrack.com/images/campaign/tiptrack-ios-share-card.png` |
| `public/images/campaign/reels/tiptrack-ios-01.png` through `04.png` | Source frames for Video 1 | Use for a future edit or platform-native story sequence. |
| `public/videos/campaign/tiptrack-delayed-tip-video-01.mp4` | Rendered vertical Video 1 | `https://usetiptrack.com/videos/campaign/tiptrack-delayed-tip-video-01.mp4` — 540×960, 18.97 seconds, H.264/AAC. Upload manually with the `short-video` App Store link. |
| `public/images/campaign/tiptrack-ios-app-store-qr.png` | QR placement in a flyer, story, or physical card | Direct App Store link with `ct=qr-ios`. |

The share card and vertical frames use actual TipTrack iPhone screens and the native app icon. Their text was vision-checked for spelling, legibility, URL accuracy, and product-claim accuracy. Do not replace the attached assets with a mock dashboard, exact payout total, or delivery-platform logo.

## X post — ready after account check

**Required before publishing:** use a real, authenticated account that the owner authorizes for TipTrack. The local `xurl` CLI is not installed, so do not claim this has been posted.

> Delivery drivers: TipTrack is an iPhone log for the details that get lost by the end of a shift—order IDs, saved addresses, and tip ranges. Update a delayed tip later, check a repeat location’s history, and log faster with Shortcuts or Siri. First 20 orders are free; Pro is a one-time $4.99. https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=x-launch-1

**Follow-up reply, posted only after the launch post is live:**

> TipTrack is deliberately manual: it does not connect to delivery-platform accounts or pretend to calculate exact earnings. It helps you keep the location and tip-range history you choose to save.

## Reddit — draft only, never post before a live rule check

Community rules were not retrievable from the public rules endpoints during preflight. Re-open each target’s current `/about/rules/`, check account/flair/promo constraints, and ask moderators if policy is ambiguous.

> I use a small post-delivery routine to stop repeat addresses and delayed tips from turning into guesswork: save the order ID/address, pick a tip range or leave it for later, then update it when the tip arrives. I made TipTrack to keep that history on iPhone and look up repeat locations. It’s manual—no account connection or earnings promises. If a mod confirms sharing is okay, I can add the App Store link in a comment.

Use this only where the rule check specifically permits it. Do not conceal the app relationship or link around a self-promotion rule.

## Facebook group — draft only, never post before a live rule check

> Delivery drivers: what do you use to remember an address when it shows up again? TipTrack is a simple iPhone log for order IDs, addresses, and tip ranges. You can update a delayed tip later and look up the history you saved for a repeat location. It starts with 20 free orders and has a one-time $4.99 Pro unlock—no subscription. https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=facebook-approved

Attach a genuine screenshot of the **Location history** or **Reports** screen. Do not use a mock payout-total image.

## Short-video scripts

### Video 1 — “The delayed-tip problem” (rendered: 18.97 seconds)

1. **Hook (0–3s):** Screen text: `Tip came in hours later?` Voice: “If a delivery app reports a tip later, I don’t want to lose the order.”
2. **Show (3–11s):** Record Add Order → choose `Later`. Voice: “I save the order number and address right after delivery, then leave the tip for later.”
3. **Show (11–18s):** Record Orders search → update tip range. Voice: “When it shows up, I find the order and update the tip range.”
4. **CTA (18–24s):** Record Reports / App Store listing. Voice: “TipTrack is on iPhone: 20 orders free, then one-time Pro.”

**Rendered asset:** `public/videos/campaign/tiptrack-delayed-tip-video-01.mp4` uses the four verified frames with an accurate spoken track: “Tip came in hours later? Save the order number and address right after delivery, then leave the tip for later. When the tip is reported, find the saved order and update its tip range. TipTrack is an iPhone delivery history app. Start with twenty orders free, then unlock TipTrack Pro once.” The production MP4 was downloaded and verified as 540×960 H.264/AAC, 18.97 seconds. It has not been posted to a social platform.

### Video 2 — “Repeat-address memory” (20–25 seconds)

1. **Hook:** `That address again?`
2. **Show:** Record Locations search and a saved location with its tip history.
3. **Voice:** “TipTrack lets me look up the history I recorded for a repeat delivery address. It’s not a prediction—it’s my own saved log.”
4. **CTA:** “Find TipTrack Delivery Log on the App Store.”

### Video 3 — “No subscription delivery log” (15–20 seconds)

1. **Hook:** `A delivery log without another subscription.`
2. **Show:** Record the first-run tour or Pro screen with actual price.
3. **Voice:** “Log 20 orders free. If it earns a place in your shift, TipTrack Pro is a one-time unlock for unlimited logging.”
4. **CTA:** use the short-video campaign link from `ASO-APP-STORE.md`.

## Search-led page

The accurate, evergreen page to promote is:

`https://usetiptrack.com/delivery-tip-tracker`

Suggested title for a non-social public article: **How to Keep a Delivery Tip History on iPhone**

Lead with the practical routine—save the completed delivery, update delayed tips, check a repeat location—not with a claimed income result. Link to the page or the appropriately tagged App Store link after deployment.

## Four-week cadence

| Window | Action | Gate |
| --- | --- | --- |
| Launch | Deploy site/SEO; enable analytics; publish one authorized X post | Production URLs and account authorization verified |
| Days 2–7 | Record Video 1; request one eligible community permission; review App Store screenshots | Live community rules and account requirements checked |
| Week 2 | Record Video 2; enter App Store metadata; monitor Search Console/App Analytics | Metrics available; no claims of results without data |
| Weeks 3–4 | Record Video 3; post only in specifically approved communities; iterate store screenshots | Use a real account and exact allowed format |

## Source-of-truth limits

No post, comment, outreach message, or public page should claim that TipTrack increases earnings, predicts tips, knows delivery-platform data, tracks exact pay/mileage, or contains user notes. Public response must be transparent that TipTrack is a user-maintained history tool.
