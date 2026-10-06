import GoogleSignIn
import SwiftUI
import UIKit

@UIApplicationMain
final class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        true
    }

    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        let configuration = UISceneConfiguration(
            name: "Default Configuration", sessionRole: connectingSceneSession.role
        )
        configuration.sceneClass = UIWindowScene.self
        configuration.delegateClass = TipTrackSceneDelegate.self
        return configuration
    }
}

final class TipTrackSceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let store = TipTrackStore()
        let monetizationStore = MonetizationStore()
        let rootView = TipTrackAppView()
            .environmentObject(store)
            .environmentObject(monetizationStore)

        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = UIHostingController(rootView: rootView)
        window.tintColor = UIColor(red: 0, green: 0.42, blue: 0.13, alpha: 1)
        window.makeKeyAndVisible()
        self.window = window
        handle(urlContexts: connectionOptions.urlContexts)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        handle(urlContexts: URLContexts)
    }

    private func handle(urlContexts: Set<UIOpenURLContext>) {
        for context in urlContexts {
            GIDSignIn.sharedInstance.handle(context.url)
        }
    }
}
