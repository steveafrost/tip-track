// swift-tools-version: 5.9
import PackageDescription
let package = Package(
    name: "TipTrackNativeRegression",
    defaultLocalization: "en",
    platforms: [.macOS(.v13)],
    products: [.library(name: "TipTrackCore", targets: ["TipTrackCore"])],
    targets: [
        .target(name: "TipTrackCore", path: "ios/App/App", exclude: ["Base.lproj", "Assets.xcassets", "AddressSearch.swift", "App.entitlements", "AppDelegate.swift", "Components.swift", "Info.plist", "PrivacyInfo.xcprivacy", "MonetizationStore.swift", "Screens.swift", "TipTrackAppIntents.swift", "TipTrackAppView.swift", "TipTrackIntentRouting.swift"], sources: ["Models.swift", "TipTrackStore.swift", "TipTrackAPIClient.swift"]),
        .testTarget(name: "TipTrackCoreTests", dependencies: ["TipTrackCore"], path: "native-tests")
    ]
)
