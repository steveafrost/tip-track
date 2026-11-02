# TipTrack Ideas

## What TipTrack is today

TipTrack is an iPhone-first delivery-history app—not a delivery-platform integration or a precise earnings calculator. A driver saves an order ID, a MapKit-resolved address, and an optional **tip range**. They can update a delayed tip, look up repeat locations, view tip-range distribution, and use Shortcuts/Siri for common actions.

**Current differentiation:** a deliberately small, manual delivery log that turns repeat-address history into a useful decision aid. The pricing is unusually simple: 20 free orders, then a one-time $4.99 Pro unlock.

**Important product truth:** the data model stores tip categories, not exact tip/payout amounts. Public copy and product work should never imply mileage tracking, earnings totals, driver notes, delivery-platform integrations, or weekly/shift financial reports until those exist.

## Product opportunities

| Priority | Idea | Why it matters | First validation / smallest useful scope |
| --- | --- | --- | --- |
| P0 | **Exact earnings mode** | The largest gap between a delivery log and a practical shift tool is knowing real payout, tip, mileage, and profit. The current category-only model cannot answer those questions. | Interview 8–12 active drivers. Prototype optional fields for payout, exact tip, miles, platform, and completed-at time on a local branch; measure completion time and whether drivers return to reports. |
| P0 | **Shift sessions and date-filtered reports** | Orders already have timestamps, but the Reports screen aggregates every saved order. A driver needs to review a shift, day, or week without doing mental filtering. | Add Today / This week / All time filters and a manual “Start shift” / “End shift” tag before building complex analytics. |
| P0 | **Resolve local-first vs. sign-in product promise** | The README describes a local-only fallback, while the root SwiftUI view gates the app behind sign-in. This is a product and trust decision, not just documentation drift. | Decide whether anonymous local use is supported. Either implement an offline guest path with later account linking or remove the promise and explain account-backed sync clearly. |
| P1 | **Ship a real widget extension** | The repo contains a `WidgetConfigurationIntent` but no `WidgetBundle`, widget configuration, or widget UI. The concept is marketable only after it reaches the Home Screen. | Build one small widget: recent orders or a selected location’s saved tip pattern. Keep it read-only and test it against empty data. |
| P1 | **Address-confidence and duplicate handling** | Address history only becomes trustworthy when the same place consistently resolves to the same normalized location. | Show a confirmation when an entered address closely matches a saved location; offer a merge flow for genuine duplicates. |
| P1 | **Fast post-delivery capture** | The product wins or loses in the 10 seconds after a drop-off. Shortcuts exist, but the main app still asks for several inputs. | Test one-tap “Log with Later tip” from a Shortcut, then reduce fields and keyboard transitions in the native flow. |
| P1 | **A respectful in-app review request** | The public App Store listing currently has no ratings. A review request after a concrete value moment can establish early social proof without nagging new users. | Ask once only after a user has saved and revisited several orders/locations. Respect Apple’s review-prompt limits and provide a dismiss-forever choice. |
| P2 | **Export, delete, and account data controls** | Delivery addresses are sensitive personal-work data. Retention and portability become stronger reasons to trust the app as usage grows. | Start with an account screen that exports CSV/JSON and clearly deletes cloud data; document what remains locally. |
| P2 | **Location insight quality** | An average of tip categories can obscure a volatile address. Drivers need a pattern, not a falsely precise score. | Show sample size, the range distribution, and recency before introducing any “good/bad address” label. |
| P2 | **Platform and delivery context tags** | Different delivery apps, order types, and neighborhoods may behave differently, but today the model has no context to separate them. | Add optional platform and order-type tags only after testing whether drivers will enter them during a real shift. |

## Growth opportunities

| Priority | Idea | Why it matters | Proof before scaling |
| --- | --- | --- | --- |
| P0 | **Deploy the marketing foundation** | The current production site has no `robots.txt`, `sitemap.xml`, share-card metadata, or active analytics endpoint. Those are prerequisites for measurable organic traffic. | Deploy the included SEO changes, enable Vercel Web Analytics, then verify the live routes and share preview. |
| P0 | **App Store listing iteration** | The store page is the final conversion screen; a first release with no ratings needs clear screenshots, search language, and a sharply accurate value proposition. | Test the proposed subtitle, promotional text, and screenshot sequence in App Store Connect; track product-page views → downloads in App Analytics. |
| P1 | **Search-led education pages** | A durable search page can meet “how do I track delivery tips?” intent without pretending to calculate earnings or connect to gig platforms. | Launch the included `/delivery-tip-tracker` page, submit the sitemap in Search Console, and measure indexed queries before adding more articles. |
| P1 | **Transparent community participation** | Driver communities can be high-intent, but their self-promotion policies and account requirements vary. A rushed brand post can blacklist the domain. | Re-check rules and ask moderators where necessary; post only from a real, established account that transparently identifies TipTrack. |
| P1 | **Short-form product demos** | The “tip now or later → search order → check repeat address” workflow is visual and easy to explain in 20 seconds. | Make three genuine screen recordings with no earnings claims. Track each source through an App Store campaign token. |
| P2 | **Driver-school, fleet, and creator partnerships** | Partners can supply repeated, trusted discovery better than generic ads if the product is useful to their audience. | Research only public, topical contacts; verify each route and obtain an opt-in before any outreach. |

## Engineering enablers that unlock product and growth

1. **Tests and CI:** API, entitlement, and iOS model tests reduce the chance that acquisition exposes onboarding or purchase regressions.
2. **Error monitoring:** The first public users need a path to report sign-in, sync, and StoreKit failures with actionable diagnostics.
3. **Events with a privacy review:** Define a small funnel—landing view, App Store click, install, first saved order, first delayed-tip update, first location lookup, Pro purchase—before optimizing conversion.
4. **Schema migration plan:** Exact amounts, platforms, shifts, and export need a forward-compatible database/UI migration rather than one-off local state changes.

## Experiments to avoid until there is evidence

- Leaderboards, shared driver maps, “best neighborhood” rankings, or crowd-sourced address labels: they create privacy, moderation, and safety problems before TipTrack has enough trustworthy data.
- Delivery-platform scraping or credentials: it adds account/security risk and makes the product dependent on third-party terms.
- Subscription pricing: the existing one-time Pro unlock is a clear differentiator; do not trade it away without retention and support-cost evidence.
- Exact “earn more” promises: TipTrack can help users retain history and make their own decisions, but it has not established a causal earnings outcome.
