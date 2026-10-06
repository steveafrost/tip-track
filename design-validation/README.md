# Native grouped-form validation

This standalone XCTest UI harness targets the installed TipTrack bundle. It does not change the app's production scheme or add CI jobs.

Use a newly created, owned simulator and pass its explicit UUID to xcodebuild. Never use `booted`, erase shared devices, or seed a real account. First install the unsigned Release app with its normal configuration and run only `testProductionColdLaunch` on a clean local container; it checks sign-in screen launch without authenticating.

For synthetic flows, copy the built app and remove `TipTrackAPIBaseURL` and `TipTrackAPIToken` only from the copied Info.plist, keeping the native executable identical. Install that isolated copy and seed a synthetic-only local session plus three orders across two locations. The flow expects C3307 to be unused and the guided tour already seen. Do not point this artifact at production or use real sign-in tokens, purchases, delivery logs or provider account deletion.

Build the harness with `xcodebuild -project design-validation/RuntimeUI.xcodeproj -scheme RuntimeUI -destination 'platform=iOS Simulator,id=<owned UUID>' -derivedDataPath <isolated path> CODE_SIGNING_ALLOWED=NO build-for-testing`, then run one named test with `test-without-building` and a new result bundle path. Jobs run sequentially.

`testGroupedFormAndPersistence` checks all six selections, add, edit, persisted history after process relaunch and all tabs. `testCaptureAppearanceAndKeyboard` checks field editing, keyboard dismissal, selected state, scrolling to Save and tab reachability; run under light/dark and the largest accessibility content size. XCTest attachments retain native screenshots. Production OAuth completion, purchase completion and physical-device VoiceOver are outside this synthetic harness.
