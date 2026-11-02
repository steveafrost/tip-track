# Native App Store Screenshot Capture Set

**Captured:** 2026-07-28  
**Status:** Captioned files prepared for human review/upload; **not** submitted to App Store Connect.  
**Capture source:** TipTrack’s native SwiftUI app, built successfully from this repository and captured with iOS Simulator’s native screenshot command.

## Technical validation

- Device: iPhone 17 Pro Max simulator (6.9-inch class)
- Dimensions: **1320 × 2868 px** for every PNG
- App state: the built-in **App Store Demo** log with sample delivery data
- The raw capture source has no composited or altered UI.
- `final/` contains the upload-ready treatment: a branded caption panel above a scaled, unaltered native screenshot. No app UI or sample data was fabricated or changed.
- These files are repository-only campaign artifacts under `marketing/` and are excluded from Vercel deployment.

## Recommended App Store screenshot sequence

| Upload order | Upload-ready file | Caption shown in the artwork | Why it leads |
|---:|---|---|---|
| 1 | `final/01-log-order.png` | **Log delivery orders before the shift moves on** | Establishes the primary logging workflow and delayed-tip option. |
| 2 | `final/02-update-tip.png` | **Update the tip range when it appears** | Shows the differentiated delayed-tip update flow. |
| 3 | `final/03-location-history.png` | **Remember the location history you logged** | Demonstrates retained address history without claiming predictions or exact earnings. |
| 4 | `final/04-find-order.png` | **Search by order ID or delivery address** | Supports the search/update workflow. |
| 5 | `final/05-tip-history-reports.png` | **Review tip ranges across saved orders** | Shows reports accurately as tip categories, not verified payouts or earnings totals. |

## Upload guardrails

- Upload only through the owner’s authenticated App Store Connect account.
- Keep the source UI, captions, and listing metadata aligned with the currently shipping build.
- Do not add claims about automatic platform imports, exact earnings/payouts, mileage, routes, or guaranteed outcomes.
- If App Store Connect presents a different device-size requirement, recapture on that required simulator rather than stretching these source images.
