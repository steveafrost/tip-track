# TipTrack Marketing Pack

## Positioning

**TipTrack is the iPhone delivery-tip history that keeps order IDs, repeat addresses, and tip ranges usable after a shift.**

It is not a delivery-platform integration and does not calculate exact payout, mileage, or earnings. That restraint is part of the message: a driver controls a small, manual log, can update delayed tips, and can revisit the history for a repeat location.

## Campaign goal

Drive qualified iPhone delivery drivers to the App Store without making outcome claims, platform-affiliation claims, or false precision about money. The conversion path is:

1. Search, a transparent community mention, or short-form demo → `usetiptrack.com` or the App Store campaign link.
2. Landing page → clear capability, limitation, and pricing explanation.
3. App Store → install.
4. First saved order → later address lookup or delayed-tip update → review prompt after real value.
5. After 20 orders → one-time $4.99 Pro decision.

## Pack map

| File | Purpose |
| --- | --- |
| `../IDEAS.md` | Grounded product and growth backlog from the source audit. |
| `ASO-APP-STORE.md` | Ready-to-enter App Store metadata and screenshot story. |
| `app-store-screenshots/` | Five raw native captures and five captioned, upload-ready App Store screenshots. |
| `IOS-CAMPAIGN.md` | Live iOS-first campaign surfaces, assets, attribution, and distribution sequence. |
| `LAUNCH-KIT.md` | Policy-safe, ready-to-paste posts and short-video scripts. |
| `../app/press/page.tsx` | Public press and creator kit with approved product facts and asset links. |
| `OUTREACH-QUEUE.md` | Directly verified manual outreach routes and individualized one-to-one drafts. |
| `COMMUNITY-GATE.md` | Current community-rule checks and explicit no-go decisions. |
| `CAMPAIGN-TRACKER.md` | Live execution checklist, channel gates, and metrics. |
| `README.md` | This positioning/funnel/ownership guide. |

## Verified baseline

- `https://usetiptrack.com` currently returns HTTP 200 over HTTPS.
- The live App Store listing is **TipTrack Delivery Log** by Steve Frost, version 1.0.2, in Productivity. It currently has no public ratings or rating count.
- Production deployment `https://tip-track-4rkermhck-steve-frosts-projects.vercel.app` is Ready and aliased to `usetiptrack.com`. The homepage, `/delivery-tip-tracker`, the four iPhone guides, `/press`, `/robots.txt`, `/sitemap.xml`, the rendered short video, live campaign images, and the analytics loader were each verified live with HTTP 200.
- Vercel Analytics is enabled. The production `/_vercel/insights/script.js` loader now returns HTTP 200 JavaScript, and the Next.js app uses the official `@vercel/analytics` component. Dashboard traffic is not yet observable, so do not claim pageviews or referrers until the dashboard reports them.
- On 2026-07-28, Apple’s iTunes lookup API returned no `screenshotUrls`. A verified five-screen, captioned native screenshot pack is ready locally for the owner to upload and then review on the live storefront.
- At the initial audit, the repository had no marketing directory or campaign tracker. This pack is the source-of-truth going forward.

## What is live

- Accurate acquisition copy: the homepage no longer represents tip ranges as exact tips, or claims unavailable notes, mileage, shift totals, weekly reports, or earnings outcomes.
- Search/share infrastructure: canonical metadata, Open Graph/Twitter metadata using the verified iOS share card, `MobileApplication` structured data, `robots.ts`, and `sitemap.ts`.
- Search-intent landing page: `https://usetiptrack.com/delivery-tip-tracker` gives an accurate explanation and dedicated App Store campaign link.
- iPhone guide: `https://usetiptrack.com/blog/how-to-track-delivery-tips-on-iphone` is a public, canonicalized, sitemap-listed practical workflow with a separate App Store campaign token.
- Three additional public, canonicalized, sitemap-listed guides cover delayed tip updates, order history without a spreadsheet, and repeat delivery addresses. Each has a separate App Store campaign token.
- Press / creator kit: `https://usetiptrack.com/press` provides approved product facts, claim guardrails, the share card, and the hosted vertical Video 1 asset.
- Hosted vertical video: `https://usetiptrack.com/videos/campaign/tiptrack-delayed-tip-video-01.mp4` is a 540×960, 18.97-second H.264/AAC version of Video 1 built from verified TipTrack frames and an accurate voiceover. It is ready for manual upload to an authorized social account; it is not yet publicly posted on a social platform.
- iOS campaign creative: a live 1200×630 share card, four 540×960 vertical video frames, and a direct-App-Store QR asset are documented in `IOS-CAMPAIGN.md` and `LAUNCH-KIT.md`.
- App Store creative: five 1320×2868 captioned screenshots built from current native app screens are ready in `app-store-screenshots/final/`; they intentionally remain local until the account owner uploads them.
- Channel copy and App Store metadata that stay within verified capabilities.

## What needs a human

1. **Review the first Vercel Analytics data.** The loader is live; wait for genuine visits, then use the dashboard for visitors, referrers, and landing-page traffic rather than estimating results.
2. **Enter App Store Connect metadata and upload screenshots.** This needs the account owner; do not share Apple credentials or attempt account verification through an agent.
3. **Use an existing, real social account for public posts.** No authenticated X publishing client is configured (`xurl` is not installed). Never create throwaway accounts or evade verification to promote the domain.
4. **Community posting and outreach:** re-check each community’s current rules immediately before posting. If self-promotion requires moderator consent, obtain it first. Use a public campaign reply address only where a target’s published contact route permits it.
5. **Request ratings only after users have received product value.** Apple’s in-app rating prompt must be integrated and shown sparingly; it is not a bulk-review campaign.

## Measurement

Use real platform data rather than inferred success:

- **Vercel Web Analytics:** landing-page traffic and referrers after the dashboard enables it.
- **Apple App Store Connect → App Analytics:** product page views, downloads, conversion rate, sources, and campaign-token performance.
- **Product events after a privacy review:** first saved order, delayed-tip update, location lookup, free-limit reached, purchase, restore, and sync errors.
- **Manual tracker:** date, exact live URL, channel, campaign token, post status, and replies. Provider acceptance is not delivery, reads, or conversion.
