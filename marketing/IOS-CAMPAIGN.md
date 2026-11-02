# TipTrack iOS App Store Campaign

## Campaign position

**TipTrack is the native iPhone delivery-history app for keeping order IDs, repeat addresses, and tip ranges usable after a shift.**

Lead with the practical loop: save the completed delivery, update a tip when it arrives later, and check the history you recorded for a repeat address. Do not claim exact earnings, mileage, tip predictions, platform-account connection, or a financial outcome.

## Live owned campaign surfaces

| Surface | Live URL | Campaign purpose |
| --- | --- | --- |
| Primary site | `https://usetiptrack.com/` | Brand/search landing and site-to-App-Store conversion |
| iPhone conversion page | `https://usetiptrack.com/delivery-tip-tracker` | Search intent: “delivery tip tracker for iPhone” |
| Helpful guide | `https://usetiptrack.com/blog/how-to-track-delivery-tips-on-iphone` | Search intent: “how to track delivery tips on iPhone” |
| Delayed-tip guide | `https://usetiptrack.com/blog/how-to-track-delayed-delivery-tips-on-iphone` | Search intent: delayed tip update workflow |
| Order-history guide | `https://usetiptrack.com/blog/delivery-order-history-without-spreadsheet` | Search intent: delivery order history without a spreadsheet |
| Repeat-address guide | `https://usetiptrack.com/blog/how-to-remember-repeat-delivery-addresses` | Search intent: repeat delivery address history |
| Press / creator kit | `https://usetiptrack.com/press` | Approved product facts and reusable visual assets |
| App Store listing | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274` | Installation |
| iOS share card | `https://usetiptrack.com/images/campaign/tiptrack-ios-share-card.png` | Link previews and feed posts |
| Vertical video frames | `https://usetiptrack.com/images/campaign/reels/tiptrack-ios-01.png` through `04.png` | Reels, Shorts, Stories, TikTok |
| Rendered Video 1 | `https://usetiptrack.com/videos/campaign/tiptrack-delayed-tip-video-01.mp4` | Upload-ready 540×960 vertical product video |
| App Store QR asset | `https://usetiptrack.com/images/campaign/tiptrack-ios-app-store-qr.png` | Offline or Story placement |

The production deployment is `tip-track-4rkermhck` and is aliased to `usetiptrack.com`. All live campaign URLs above returned HTTP 200 in the final verification.

## App Store attribution map

| Channel | Link |
| --- | --- |
| Homepage | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=website-home` |
| iPhone search guide | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=organic-iphone-guide` |
| Delivery-tip tracker page | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=organic-delivery-tip-tracker` |
| Delayed-tip guide | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=organic-delayed-tip-guide` |
| Order-history guide | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=organic-order-history-guide` |
| Repeat-address guide | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=organic-repeat-address-guide` |
| Press kit | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=press-kit` |
| X launch | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=x-launch-1` |
| X Video 1 | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=x-video-1` |
| Instagram Video 1 | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=instagram-video-1` |
| TikTok Video 1 | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=tiktok-video-1` |
| YouTube Shorts Video 1 | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=youtube-shorts-video-1` |
| Approved Reddit/community post | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=reddit-approved` |
| Short video | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=short-video` |
| QR code | `https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=qr-ios` |

## Launch assets

### Share card

`public/images/campaign/tiptrack-ios-share-card.png` is a **1200×630** iOS-focused Open Graph image. It uses actual TipTrack iPhone screens and the native app icon. Use it for every post that can attach one image.

Visible copy is intentionally limited to:

- `IPHONE DELIVERY TIP HISTORY`
- `Your delivery history, ready when you need it.`
- `Log an order quickly, recognize a repeat address, and update a tip after the delivery.`
- `Native iPhone app` · `Siri & Shortcuts` · `First 20 orders free`
- `usetiptrack.com` · `Available on the App Store`

### Vertical video sequence

The four 540×960 PNGs in `public/images/campaign/reels/` remain the source frames for the short-video sequence:

1. Log the delivery before it gets lost.
2. Return to a delivery when a tip updates later.
3. Look up saved repeat-address history.
4. End card: TipTrack on the App Store.

`public/videos/campaign/tiptrack-delayed-tip-video-01.mp4` is the rendered Video 1 deliverable: 540×960, 18.97 seconds, H.264 video, AAC voiceover, and a 646 KB local source file. The production URL returned HTTP 200 `video/mp4` and its downloaded bytes retained the expected dimensions, codecs, and duration. Attach the platform-specific Video 1 App Store link from the attribution map in the bio, caption, or landing-link field allowed by the platform.

## Distribution sequence

1. **Owned web — live:** guide, conversion page, sitemap, App Store links, share metadata, iOS share image, and analytics loader.
2. **App Store — owner action:** enter the ready-to-use subtitle, promotional text, description, and screenshot sequence from `ASO-APP-STORE.md`.
3. **One authorized social account:** publish the iOS share card with the X launch copy in `LAUNCH-KIT.md`; record the exact public post URL in `CAMPAIGN-TRACKER.md`.
4. **Short video:** upload the hosted Video 1 asset to an authorized account first; use actual in-app footage if a fuller demo is wanted.
5. **Communities/outreach:** only proceed after the current policy or contact route is verified and recorded. Never disguise self-promotion or use a fresh automated account.

## Measurement

- **Vercel Web Analytics:** wait for the dashboard to show actual visitors/referrers. A live loader does not prove traffic or conversion.
- **App Store Connect App Analytics:** review product-page views, downloads, conversion rate, and the campaign/source data attached to `ct` links.
- **Decision rule:** retain the channel/message that earns observable qualified store traffic; change one variable at a time. Do not infer success from impressions, provider acceptance, or a single anecdote.

## Human-only actions

- Publish from a real, existing social account; no bot-created launch accounts.
- Complete Apple App Store Connect updates, screenshots, and any store-review steps.
- Submit Google Search Console sitemap access and view private dashboards.
- Complete any password, SMS, CAPTCHA, billing, identity, or account-verification prompt.

The campaign is intentionally iOS-first: each public surface routes to the live App Store listing or an iPhone-focused page, and every distribution link is labeled for attribution.
