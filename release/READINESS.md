# TipTrack 1.0.3 / build 26 candidate

Scoped fix: reject stale order-refresh success/failure after sign-out, account/token replacement or a newer refresh. Preserve other-account caches and same-instance or independent-store edits/additions/removals made during a fetch; use injected preferences consistently. No backend or marketing change is part of this release diff.

## Baseline and provenance

ASC/public listing verify live1.0.2, newest uploaded build25, bundle com.steveafrost.tiptrack. New candidate1.0.3/build26 was selected after that read. Follow-up branch is based on observed upstream main 5539543df457d6d1a8900d295d6d1d7b66e03f09 after PR38 merged, preserving its neutral demo values. Historical original local HEAD37ea778 was not cryptographically linked to the uploaded binary; do not claim exact source-to-store receipt.

Existing App Store assets are preserved. The required-reason manifest declares only own-app UserDefaults CA92.1; it does not invent Data Not Collected, tracking or other ASC privacy answers. Existing API base URL and Google public client configuration remain in the signed release artifact. Original dirty web/marketing work was not overwritten or staged.

## Verified validation

- Thirteen mocked-network native account tests passed after adding shared-cache reconciliation. Separate-store Shortcut edits, cache additions/removals, other-account cache changes, and independent sign-out/account/token changes are covered. Fixtures use tiptrack.invalid, no production request.
- Sequential simulator smoke passed demo navigation, Reports/Locations, saved-order search, tip-category editing and sign-out; isolated demo cache confirms changed category persisted and userId nil. That UI run preceded upstream's demo-only data neutralization; no runtime was rerun after the slot was released. Backend configuration was removed only from the smoke artifact, not release source/artifact.
- Previous signed generic-device Release archive1.0.3/build26 succeeded with Xcode27.0/27A266a. Strict/deep codesign verification passed. Existing Apple Distribution identity/team4QJ25Y85MX and profile TipTrack App Store Profile2026-05-21 (dd020d37-c9dd-4456-85f7-6a7eb82f12cd, expires2027-05-19) match app identity and Sign in with Apple entitlement. Profile get-task-allow is false.
- Built app contains the exact UserDefaults reason manifest, existing Assets.car, correct version/build, resolved Google client IDs and existing API URL. Binary/source hashes and archive evidence are retained in the task workspace, not published as a source-to-store claim.
- No real account switch/cloud integration, production backend write, device StoreKit checkout or purchase was tested. No archive/upload, signing or privacy fact implies those tests passed.

## Remaining release steps

Review this focused diff. Recheck existing sign-in/cloud and purchase restoration with authorized test accounts/device handling before deciding submission readiness. Confirm the new version's metadata and privacy remain accurate. Signed artifacts are local only; no ASC version mutation, upload or App Review submission is authorized by their creation. Do not introduce new telemetry or change Analytics permissions to bypass the existing403.

Suggested What's New: “Improved order sync reliability when switching accounts and updating deliveries.”

## Reproduce locally

```sh
CLANG_MODULE_CACHE_PATH=/tmp/tiptrack-clang-cache SWIFTPM_MODULECACHE_OVERRIDE=/tmp/tiptrack-swift-cache swift test --scratch-path /tmp/tiptrack-native-tests --cache-path /tmp/tiptrack-package-cache --disable-sandbox
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath /tmp/TipTrack-1.0.3-26.xcarchive -clonedSourcePackagesDirPath /tmp/tiptrack-source-packages -disableAutomaticPackageResolution archive
```

Archive reproduction requires the existing signing profile/keychain identity, not new credential creation. Host tests compile only actual Models, TipTrackStore and TipTrackAPIClient. All runtime work remains stopped after the exclusive slot was released.

## Cross-instance follow-up

The PR38 candidate could overwrite a completed Shortcut edit with a stale foreground GET. The follow-up snapshots persisted orders/session before the GET, reconciles persisted changes and local changes after it, and discards success or failure if another store changed the persisted session. There is no app delete endpoint; removal coverage models an independently completed cache removal. No simulator runtime was performed for this follow-up. The previous archive predates this fix and must not be uploaded as the corrected candidate. Current signed artifact provenance is recorded outside the repository in the task evidence.

The corrected native source matches the signed cross-instance archive built from local commit bcbcbf6bd97157c270f06dfee71b8e475794aae5; the follow-up adds only a CI workflow correction and readiness documentation beyond that source. CI uses the existing hash-qualified packageManager pin without a duplicate action version and runs Node22.23.1 instead of incompatible Node20.11.0. No database release script was executed locally.
