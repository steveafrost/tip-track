# TipTrack1.0.3/build27 startup repair

Build26 crashes before startup on iOS27 because its legacy AppDelegate window lifecycle lacks UIKit scene adoption. Two TestFlight crash logs match exact archived UUID74A1EEAF-293F-3CC2-9D1E-5606D12D96B7; isolated iOS27 build26 reproduces identical NoSceneLifecycleAdoption SIGTRAP. Do not submit build26.

Build27 uses AppDelegate scene configuration plus a UIWindowSceneDelegate in the existing source file and a single-scene manifest. Window creation and Google URL callbacks move to scene connection/openURL events. Existing account-safe cache fix, persisted keys/format, assets, API configuration, privacy manifest and StoreKit products remain unchanged. Base is merged main2ea0d9bd164b50ec7637637e3a88dd813eb6b1e0.

Validation:13 native mocks pass. Signed generic Release archive/export and strict/deep signature verification pass with existing Apple Distribution certificate/profile. iOS27 Release simulator tests pass production-configuration cold launch/relaunch, synthetic prior-format session/order upgrade with data preserved, cold/warm registered-scheme activation, offline tip edit and persistence after relaunch. No demo launch flag or removed backend configuration was used. Synthetic session has no cloud token; no backend writes/purchases occurred. App Intents metadata retains Open/Log/Update actions; actual Siri/Shortcuts execution, authenticated Google/Apple completion, physical TestFlight install and StoreKit checkout are not certified.

Native source matches the tested/signed build27; artifact hashes, crash logs, UI harness and xcresults are retained in task evidence. Entire earlier build26 archive/export is superseded due to the demonstrated startup defect. Original dirty marketing source untouched.

Build27 is local only. Publication/merge/upload and existing internal tester assignment require their exact approval; no App Review/public release authorization is implied. Main-only database scope check remains unvalidated: existing secrets resolve empty, and its script writes temporary rows. Do not add credentials or rerun against an unconfirmed target.
