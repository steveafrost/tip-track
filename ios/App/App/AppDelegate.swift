import SwiftUI
import UIKit

@UIApplicationMain
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let store = TipTrackStore()
        let monetizationStore = MonetizationStore()
        let rootView = TipTrackAppView()
            .environmentObject(store)
            .environmentObject(monetizationStore)

        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = UIHostingController(rootView: rootView)
        window.tintColor = UIColor(red: 0, green: 0.42, blue: 0.13, alpha: 1)
        window.makeKeyAndVisible()
        self.window = window

        return true
    }
}
