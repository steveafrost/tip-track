# TipTrack Manual Outreach Queue

**Research date:** 2026-07-28  
**Scope:** iOS-first delivery-driver and Apple-app discovery outlets.  
**Rule:** individualized outreach only. Direct email targets require a current, explicit public mailbox; web forms require a separate review of the live form and its instructions.

## Verification method

`outreach_targets.csv` was repaired and parsed as valid CSV (10 rows) on 2026-07-28. Each listed contact or pitch URL was fetched directly with a normal desktop user agent. A contact page returning HTTP 200 proves the route is live; it does **not** prove a pitch is welcome or grant permission to submit through a form. Re-open the page immediately before human submission and follow any then-current instructions.

## Approved for human review and individualized submission

| Priority | Target | Verified route | Direct result | Positioning / campaign link | Submission gate |
| --- | --- | --- | --- | --- | --- |
| 1 | Gridwise | <https://gridwise.io/contact> | HTTP 200 — `Contact us \| Gridwise` | Delivery-driver audience. <https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=outreach-gridwise> | General contact form; no published app-pitch rule identified. Owner reviews before submitting. |
| 2 | The Rideshare Guy | <https://therideshareguy.com/contact/> | HTTP 200 — `Contact` | Rideshare/delivery community and related podcast network. <https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=outreach-rideshare-guy> | Use the contact route only if its current labels/instructions fit a transparent app/resource pitch. |
| 3 | Ridester | <https://www.ridester.com/contact-support/> | HTTP 200 — `Contact Support \| Ridester` | Delivery and rideshare resource readers. <https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=outreach-ridester> | General/support form; do not treat it as editorial permission without current confirmation. |
| 4 | Gigworker | <https://gigworker.com/contact-us/> | HTTP 200 — `Contact Us \| Gigworker` | Gig-worker resource audience. <https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=outreach-gigworker> | Published contact route. Do not bulk-send or use the public email without human review. |
| 5 | iDownloadBlog | <https://www.idownloadblog.com/contact/> | HTTP 200 — `Contact Us` | iOS-app discovery angle. <https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=outreach-idownloadblog> | Contact page is live; no verified editorial submission policy. Use a short, relevant one-to-one pitch only. |

## Hold / do not contact from the current data

| Target | Current finding | Decision |
| --- | --- | --- |
| Show Me The Money Club | Related page returned HTTP 200, but the listed reach path is The Rideshare Guy network rather than an independent pitch route. | **Hold** — avoid duplicate outreach; mention only if The Rideshare Guy asks for related podcast context. |
| iPhoneLife | Listed contact URL returned HTTP 404. | **No go** until a fresh official contact/pitch route is found. |
| AppAdvice | Listed host failed DNS resolution in this environment. | **No go** until a current official route is confirmed. |
| NerdWallet — Gig Economy | Listed contact URL returned HTTP 404. | **No go** until a current, editorially appropriate route is confirmed. |
| DriverReach | Listed URL redirected to Tenstreet; the original driver-recruiting context is stale and not a direct delivery-driver match. | **No go**. |

## Individualized pitch drafts

Each draft must be adapted to the target’s live form and sent once at most. Do not promise a review, imply affiliation with delivery platforms, or pitch financial outcomes.

### Gridwise

**Subject:** An iPhone delivery-history tool for delayed tips and repeat addresses

> Hi Gridwise team — I built TipTrack, a native iPhone delivery log for the details that are easy to lose by the end of a shift: order IDs, delivery addresses, and tip ranges. A driver can save an order when it is completed, update a delayed tip later, and look up the history they recorded for a repeat address.
>
> It is intentionally manual: TipTrack does not connect to delivery-platform accounts, predict tips, or calculate exact earnings or mileage. It starts with 20 free orders; Pro is a one-time $4.99 unlock. If it is relevant to your delivery-driver resource coverage, the App Store listing is here: <https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=outreach-gridwise>.
>
> Thank you for considering it.

### The Rideshare Guy

**Subject:** Possible iPhone resource for drivers who keep a manual tip history

> Hi — I made TipTrack for a small post-delivery routine: save the order ID and address, choose a tip range or leave it for later, then update it when a delayed tip arrives. It also lets drivers review the history they personally saved for a repeat location.
>
> TipTrack is a native iPhone app, not a delivery-platform integration or an earnings calculator. It has 20 free orders and a one-time $4.99 Pro unlock. If a transparent tool mention is useful for your delivery-driver audience or podcast network, here is the listing: <https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=outreach-rideshare-guy>.
>
> Thank you for your time.

### Ridester

**Subject:** A small iPhone delivery-log resource for repeat addresses and delayed tips

> Hi Ridester team — I wanted to share TipTrack, a native iPhone app for drivers who want to keep their own simple history of delivery order IDs, addresses, and tip ranges.
>
> The practical workflow is: save a completed delivery, update the saved tip range if it arrives later, and check the history you recorded when the address appears again. It does not connect to delivery accounts or claim to calculate earnings. The App Store listing is <https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=outreach-ridester>.
>
> If this is not the right route for app/resource suggestions, please disregard it. Thank you.

### Gigworker

**Subject:** TipTrack — an iPhone delivery-history app for drivers

> Hi Gigworker team — TipTrack is a new native iPhone app for keeping a delivery history: drivers save an order ID, address, and tip range, update a delayed tip later, and can look up the history they recorded for a repeat location.
>
> It is deliberately a manual personal log, not a delivery-platform integration, tip predictor, or exact-earnings tracker. The first 20 orders are free and the Pro unlock is one-time. If it is relevant to your gig-worker resource coverage, the App Store link is <https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=outreach-gigworker>.
>
> Thank you for considering it.

### iDownloadBlog

**Subject:** TipTrack: a native iPhone delivery-history app, now on the App Store

> Hi iDownloadBlog team — I made TipTrack, a native iPhone app that helps delivery drivers keep the small details that are easy to lose after a shift: saved order IDs, repeat addresses, and tip ranges.
>
> Drivers can update a tip later when it is reported and search the history they personally logged for a repeat location. It is not a platform integration or earnings calculator. TipTrack starts with 20 free orders, then offers a one-time $4.99 Pro unlock. The App Store listing is <https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=outreach-idownloadblog>.
>
> Thanks for taking a look.

## Execution record — 2026-07-29 UTC

The user explicitly authorized individually addressed email outreach and directed the agent to use the already configured local AgentMail sender. No contact forms or community posts were submitted.

### Gigworker

- **Sent at:** `2026-07-29T03:07:00.879Z`
- **Recipient / current source:** `editorial@gigworker.com` from the public Gigworker contact page (`https://gigworker.com/contact-us/`), rechecked immediately before sending.
- **Subject:** `TipTrack — a native iPhone delivery-history app for drivers`
- **App Store attribution:** `ct=outreach-gigworker`
- **Provider evidence:** AgentMail accepted the message with ID `<0100019fabd6fbbc-0c5d325c-03bd-415c-811b-c9221968a15e-000000@email.amazonses.com>` and thread ID `92697f80-9864-45a0-b518-ac7b64054eb3`.
- **Follow-up check:** no bounce was present after 30 seconds. This is **not** evidence of inbox delivery, readership, coverage, or endorsement.

### iDownloadBlog

- **Attempted at:** `2026-07-29T03:07:17.294Z`
- **Recipient / current source:** `info@idownloadblog.com`, a `mailto:` address from the public iDownloadBlog contact page (`https://www.idownloadblog.com/contact/`) rechecked immediately before sending.
- **Subject:** `TipTrack: a native iPhone delivery-history app, now on the App Store`
- **App Store attribution:** `ct=outreach-idownloadblog`
- **Result:** the provider accepted the attempt (message ID `<0100019fabd73bd6-a85d48e0-d87d-4f3d-8030-76b2ad5baa12-000000@email.amazonses.com>`, thread ID `88a06846-5c7f-4557-927d-20905cd836db`), then immediately returned an `Address not found` hard bounce (`5.1.3`). No retry will be sent to that address.
- **Next action:** treat iDownloadBlog as contact-form-only until a fresh, editorially appropriate direct mailbox is independently verified.

## Logging requirements

When the owner submits any one of these drafts, record in `CAMPAIGN-TRACKER.md`:

- UTC date/time and target
- exact contact route used
- exact App Store `ct` token
- proof of submission or public message URL
- any reply, opt-out, or policy restriction

Never infer delivery, readership, installs, or endorsement from a successful form submission.
