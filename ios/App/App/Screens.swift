import AuthenticationServices
import CryptoKit
import GoogleSignIn
import StoreKit
import SwiftUI
import UIKit

private func isGoogleSignInCancellation(_ error: Error) -> Bool {
    let nsError = error as NSError
    return nsError.domain == kGIDSignInErrorDomain &&
        nsError.code == GIDSignInError.canceled.rawValue
}

private func isAppleSignInCancellation(_ error: Error) -> Bool {
    let nsError = error as NSError
    return nsError.domain == ASAuthorizationError.errorDomain &&
        nsError.code == ASAuthorizationError.canceled.rawValue
}

private func appleSignInErrorMessage(_ error: Error) -> String {
    let nsError = error as NSError

    if nsError.domain == ASAuthorizationError.errorDomain &&
        nsError.code == ASAuthorizationError.unknown.rawValue {
        return "Sign in to your Apple Account in Settings, then try again."
    }

    return error.localizedDescription
}

struct SignInView: View {
    @EnvironmentObject private var store: TipTrackStore
    @StateObject private var appleSignIn = AppleSignInCoordinator()
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    var body: some View {
        ZStack {
            AppBackground()

            VStack(alignment: .leading, spacing: 24) {
                Spacer()

                VStack(alignment: .leading, spacing: 18) {
                    AppIconTile(systemName: "map", tint: .tipGreen)
                        .scaleEffect(1.2, anchor: .leading)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Tip Track")
                            .font(.system(size: 46, weight: .bold))
                            .foregroundColor(.zinc900)
                            .lineLimit(1)
                            .minimumScaleFactor(0.82)
                        Text("A delivery log for orders, locations, and tip history.")
                            .font(.headline)
                            .foregroundColor(.zinc500)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }

                VStack(alignment: .leading, spacing: 16) {
                    if let errorMessage {
                        ErrorBanner(message: errorMessage)
                    }

                    AppleAuthorizationButton(type: .signIn) {
                        startAppleSignIn()
                    }
                    .frame(height: 52)
                    .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
                    .disabled(isSubmitting)

                    Button(action: signInWithGoogle) {
                        HStack {
                            Text("G")
                                .font(.headline.weight(.bold))
                            Text("Sign in with Google")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.large)
                    .disabled(isSubmitting)

                    Button(action: startDemo) {
                        HStack(spacing: 8) {
                            Image(systemName: "eye")
                            Text("Preview demo log")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(minHeight: 50)
                        .contentShape(Rectangle())
                        .onTapGesture {
                            startDemo()
                        }
                    }
                    .buttonStyle(.plain)
                    .foregroundColor(.zinc900)
                    .background(Color.zinc50)
                    .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
                    .overlay(AppBorder(cornerRadius: TipTrackTheme.controlRadius))
                    .disabled(isSubmitting)

                    if isSubmitting {
                        HStack(spacing: 8) {
                            ProgressView()
                            Text("Signing in")
                                .font(.footnote.weight(.medium))
                                .foregroundColor(.zinc500)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .appCard()

                Spacer()
            }
            .padding(TipTrackTheme.pagePadding)
        }
    }

    private func startAppleSignIn() {
        isSubmitting = true
        errorMessage = nil

        appleSignIn.start(requestedScopes: [.fullName, .email]) { result in
            handleAppleSignIn(result)
        }
    }

    private func startDemo() {
        store.startDemoSession()
    }

    private func signInWithGoogle() {
        guard isGoogleSignInConfigured else {
            errorMessage = "Google sign-in is not configured for this build."
            return
        }

        guard let presentingViewController = UIApplication.shared.tipTrackTopViewController else {
            errorMessage = "Could not present Google sign-in."
            return
        }

        isSubmitting = true
        errorMessage = nil

        GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController) { result, error in
            if let error {
                Task { @MainActor in
                    errorMessage = isGoogleSignInCancellation(error) ? nil : error.localizedDescription
                    isSubmitting = false
                }
                return
            }

            guard let user = result?.user,
                  let identityToken = user.idToken?.tokenString else {
                Task { @MainActor in
                    errorMessage = "Google did not return a valid sign-in token."
                    isSubmitting = false
                }
                return
            }

            Task { @MainActor in
                do {
                    try await store.signInWithGoogle(
                        identityToken: identityToken,
                        displayName: user.profile?.name
                    )
                } catch {
                    errorMessage = error.localizedDescription
                }

                isSubmitting = false
            }
        }
    }

    private func handleAppleSignIn(_ result: Result<AppleSignInCredential, Error>) {
        switch result {
        case .success(let credential):
            Task { @MainActor in
                do {
                    try await store.signInWithApple(
                        identityToken: credential.identityToken,
                        rawNonce: credential.rawNonce,
                        displayName: credential.displayName
                    )
                } catch {
                    errorMessage = error.localizedDescription
                }

                isSubmitting = false
            }
        case .failure(let error):
            if isAppleSignInCancellation(error) {
                errorMessage = nil
            } else {
                errorMessage = appleSignInErrorMessage(error)
            }

            isSubmitting = false
        }
    }

    private var isGoogleSignInConfigured: Bool {
        guard let clientID = Bundle.main.object(forInfoDictionaryKey: "GIDClientID") as? String else {
            return false
        }

        return !clientID.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

}

struct AccountConnectionsView: View {
    @EnvironmentObject private var store: TipTrackStore
    @Environment(\.dismiss) private var dismiss
    @StateObject private var appleSignIn = AppleSignInCoordinator()
    @State private var errorMessage: String?
    @State private var isSubmitting = false
    @State private var successMessage: String?

    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Connected logins", subtitle: "Connect Apple and Google to use the same TipTrack data from any sign-in method.")

                if let successMessage {
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.tipGreen)
                        Text(successMessage)
                            .font(.footnote.weight(.semibold))
                            .foregroundColor(.zinc900)
                        Spacer(minLength: 0)
                    }
                    .padding(12)
                    .background(Color.tipGreen.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
                }

                if let errorMessage {
                    ErrorBanner(message: errorMessage)
                }

                if store.session.isProviderConnected("apple") {
                    ConnectedProviderRow(systemImage: "apple.logo", title: "Apple connected")
                } else {
                    AppleAuthorizationButton(type: .continue) {
                        startAppleLink()
                    }
                    .frame(height: 52)
                    .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
                    .disabled(isSubmitting)
                }

                if store.session.isProviderConnected("google") {
                    ConnectedProviderRow(systemImage: "checkmark.circle.fill", title: "Google connected")
                } else {
                    Button(action: linkGoogle) {
                        HStack {
                            Text("G")
                                .font(.headline.weight(.bold))
                            Text("Connect Google")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.large)
                    .disabled(isSubmitting)
                }

                Spacer()
            }
            .padding(TipTrackTheme.pagePadding)
            .navigationTitle("Account")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }

    private func startAppleLink() {
        isSubmitting = true
        errorMessage = nil
        successMessage = nil

        appleSignIn.start(requestedScopes: [.fullName, .email]) { result in
            handleAppleLink(result)
        }
    }

    private func handleAppleLink(_ result: Result<AppleSignInCredential, Error>) {
        switch result {
        case .success(let credential):
            Task { @MainActor in
                do {
                    try await store.linkApple(
                        identityToken: credential.identityToken,
                        rawNonce: credential.rawNonce,
                        displayName: credential.displayName
                    )
                    successMessage = "Apple is connected."
                } catch {
                    errorMessage = error.localizedDescription
                }

                isSubmitting = false
            }
        case .failure(let error):
            if isAppleSignInCancellation(error) {
                errorMessage = nil
            } else {
                errorMessage = appleSignInErrorMessage(error)
            }

            isSubmitting = false
        }
    }

    private func linkGoogle() {
        guard isGoogleSignInConfigured else {
            errorMessage = "Google sign-in is not configured for this build."
            return
        }

        guard let presentingViewController = UIApplication.shared.tipTrackTopViewController else {
            errorMessage = "Could not present Google sign-in."
            return
        }

        isSubmitting = true
        errorMessage = nil
        successMessage = nil

        GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController) { result, error in
            if let error {
                Task { @MainActor in
                    errorMessage = isGoogleSignInCancellation(error) ? nil : error.localizedDescription
                    isSubmitting = false
                }
                return
            }

            guard let user = result?.user,
                  let identityToken = user.idToken?.tokenString else {
                Task { @MainActor in
                    errorMessage = "Google did not return a valid sign-in token."
                    isSubmitting = false
                }
                return
            }

            Task { @MainActor in
                do {
                    try await store.linkGoogle(
                        identityToken: identityToken,
                        displayName: user.profile?.name
                    )
                    successMessage = "Google is connected."
                } catch {
                    errorMessage = error.localizedDescription
                }

                isSubmitting = false
            }
        }
    }

    private var isGoogleSignInConfigured: Bool {
        guard let clientID = Bundle.main.object(forInfoDictionaryKey: "GIDClientID") as? String else {
            return false
        }

        return !clientID.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
}

private struct ConnectedProviderRow: View {
    let systemImage: String
    let title: String

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: systemImage)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.tipGreen)
                .frame(width: 24)
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.zinc900)
            Spacer(minLength: 0)
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.tipGreen)
        }
        .padding(.horizontal, 14)
        .frame(height: 52)
        .background(Color.tipGreen.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
        .overlay(
            RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius)
                .stroke(Color.tipGreen.opacity(0.18), lineWidth: 1)
        )
    }
}

struct AppleSignInCredential {
    let identityToken: String
    let rawNonce: String
    let displayName: String?
}

final class AppleSignInCoordinator: NSObject, ObservableObject {
    private var currentNonce: String?
    private var completion: ((Result<AppleSignInCredential, Error>) -> Void)?

    func start(
        requestedScopes: [ASAuthorization.Scope],
        completion: @escaping (Result<AppleSignInCredential, Error>) -> Void
    ) {
        let nonce: String

        do {
            nonce = try randomNonce()
        } catch {
            completion(.failure(error))
            return
        }

        currentNonce = nonce
        self.completion = completion

        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = requestedScopes
        request.nonce = sha256(nonce)

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
    }

    private func finish(_ result: Result<AppleSignInCredential, Error>) {
        let completion = completion
        currentNonce = nil
        self.completion = nil
        completion?(result)
    }

    private func randomNonce(length: Int = 32) throws -> String {
        precondition(length > 0)
        let charset = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remainingLength = length

        while remainingLength > 0 {
            var random: UInt8 = 0
            let status = SecRandomCopyBytes(kSecRandomDefault, 1, &random)

            if status != errSecSuccess {
                throw TipTrackAppleSignInError.nonceGenerationFailed
            }

            if random < UInt8(charset.count) {
                result.append(charset[Int(random)])
                remainingLength -= 1
            }
        }

        return result
    }

    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashedData = SHA256.hash(data: inputData)

        return hashedData.map { String(format: "%02x", $0) }.joined()
    }
}

extension AppleSignInCoordinator: ASAuthorizationControllerDelegate {
    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityTokenData = credential.identityToken,
              let identityToken = String(data: identityTokenData, encoding: .utf8),
              let nonce = currentNonce else {
            finish(.failure(TipTrackAppleSignInError.missingToken))
            return
        }

        let displayName = PersonNameComponentsFormatter()
            .string(from: credential.fullName ?? PersonNameComponents())

        finish(.success(AppleSignInCredential(
            identityToken: identityToken,
            rawNonce: nonce,
            displayName: displayName.isEmpty ? nil : displayName
        )))
    }

    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        finish(.failure(error))
    }
}

extension AppleSignInCoordinator: ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        UIApplication.shared.tipTrackKeyWindow ?? ASPresentationAnchor()
    }
}

private enum TipTrackAppleSignInError: LocalizedError {
    case nonceGenerationFailed
    case missingToken

    var errorDescription: String? {
        switch self {
        case .nonceGenerationFailed:
            return "Apple sign-in could not start securely. Please try again."
        case .missingToken:
            return "Apple did not return a valid sign-in token."
        }
    }
}

struct AppleAuthorizationButton: UIViewRepresentable {
    let type: ASAuthorizationAppleIDButton.ButtonType
    let action: () -> Void

    func makeUIView(context: Context) -> ASAuthorizationAppleIDButton {
        let button = ASAuthorizationAppleIDButton(type: type, style: .black)
        button.cornerRadius = TipTrackTheme.controlRadius
        button.addTarget(
            context.coordinator,
            action: #selector(Coordinator.performAction),
            for: .touchUpInside
        )
        return button
    }

    func updateUIView(_ uiView: ASAuthorizationAppleIDButton, context: Context) {
        context.coordinator.action = action
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(action: action)
    }

    final class Coordinator: NSObject {
        var action: () -> Void

        init(action: @escaping () -> Void) {
            self.action = action
        }

        @objc func performAction() {
            action()
        }
    }
}

private extension UIApplication {
    func dismissTipTrackKeyboard() {
        sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }

    var tipTrackKeyWindow: UIWindow? {
        connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first { $0.isKeyWindow }
    }

    var tipTrackTopViewController: UIViewController? {
        tipTrackKeyWindow?
            .rootViewController?
            .tipTrackTopMostViewController
    }
}

private extension UIViewController {
    var tipTrackTopMostViewController: UIViewController {
        if let presentedViewController {
            return presentedViewController.tipTrackTopMostViewController
        }

        if let navigationController = self as? UINavigationController,
           let visibleViewController = navigationController.visibleViewController {
            return visibleViewController.tipTrackTopMostViewController
        }

        if let tabBarController = self as? UITabBarController,
           let selectedViewController = tabBarController.selectedViewController {
            return selectedViewController.tipTrackTopMostViewController
        }

        return self
    }
}

struct AddOrderView: View {
    @EnvironmentObject private var store: TipTrackStore
    @EnvironmentObject private var monetizationStore: MonetizationStore
    @StateObject private var addressSearch = AddressSearch()
    @State private var address = ""
    @State private var latitude = 0.0
    @State private var longitude = 0.0
    @State private var orderId = ""
    @State private var selectedTip: TipCategory?
    @State private var errorMessage: String?
    @State private var didAddOrder = false
    @State private var isSubmitting = false
    @State private var showingPaywall = false

    var body: some View {
        PageScroll {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "New delivery", subtitle: "Log the order before the shift moves on.")

                AddressLookupField(
                    title: "Address",
                    address: $address,
                    latitude: $latitude,
                    longitude: $longitude,
                    search: addressSearch
                )

                FieldStack("Order ID") {
                    AppTextField(placeholder: "Enter an order ID", text: $orderId, systemImage: "number")
                        .textInputAutocapitalization(.characters)
                }

                InitialTipPickerCard(selectedTip: $selectedTip)

                if let errorMessage {
                    ErrorBanner(message: errorMessage)
                }

                Button {
                    UIApplication.shared.dismissTipTrackKeyboard()
                    addOrder()
                } label: {
                    HStack {
                        if isSubmitting {
                            ProgressView()
                        } else {
                            Image(systemName: "plus.circle.fill")
                        }
                        Text(isSubmitting ? "Saving" : "Save Order")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .tint(.tipGreen)
                .disabled(isSubmitting)
            }
            .appCard()

            DashboardSummary()
            TrialStatusCard(showingPaywall: $showingPaywall)
            RecentOrdersPreview()
        }
        .alert("Order added", isPresented: $didAddOrder) {
            Button("OK", role: .cancel) {}
        }
        .sheet(isPresented: $showingPaywall) {
            PaywallView()
        }
    }

    private func addOrder() {
        UIApplication.shared.dismissTipTrackKeyboard()

        guard monetizationStore.canAddOrder(currentOrderCount: store.orders.count) else {
            showingPaywall = true
            return
        }

        let trimmedAddress = address.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedOrderId = orderId.trimmingCharacters(in: .whitespacesAndNewlines)

        guard trimmedAddress.count >= 2 else {
            errorMessage = "Please choose a location from the list."
            return
        }
        guard trimmedOrderId.count >= 2 else {
            errorMessage = "Order ID must contain at least 2 characters."
            return
        }
        guard !store.hasOrder(externalId: trimmedOrderId) else {
            errorMessage = "That order ID is already saved."
            return
        }

        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                try await store.addOrder(
                    address: trimmedAddress,
                    latitude: latitude,
                    longitude: longitude,
                    externalId: trimmedOrderId,
                    tip: selectedTip?.rawValue
                )
                UIApplication.shared.dismissTipTrackKeyboard()
                address = ""
                latitude = 0
                longitude = 0
                orderId = ""
                selectedTip = nil
                didAddOrder = true
            } catch {
                errorMessage = error.localizedDescription
            }

            isSubmitting = false
        }
    }
}

struct OrderSearchView: View {
    @EnvironmentObject private var store: TipTrackStore
    @State private var query = ""
    @State private var selectedOrder: TipOrder?
    @State private var editingOrder: TipOrder?

    private var matches: [TipOrder] {
        store.orders
            .filter { order in
                query.isEmpty
                    || order.externalId.localizedCaseInsensitiveContains(query)
                    || order.address.localizedCaseInsensitiveContains(query)
            }
            .prefix(5)
            .map { $0 }
    }

    var body: some View {
        PageScroll {
            SectionHeader(title: "Find an order", subtitle: "Search by order ID or delivery address to update delayed tips.")

            SearchField("Enter order ID or address", text: $query)

            if store.orders.isEmpty {
                EmptyPrompt("No orders saved yet.")
            } else {
                ResultsList(items: matches, emptyText: "No orders found") { order in
                    Button {
                        selectedOrder = order
                        query = order.externalId
                    } label: {
                        HStack(spacing: 12) {
                            AppIconTile(systemName: "receipt", tint: .tipBlue)
                            VStack(alignment: .leading, spacing: 3) {
                                Text("Order #\(order.externalId)")
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(.zinc900)
                                Text(order.address)
                                    .font(.caption)
                                    .foregroundColor(.zinc500)
                                    .lineLimit(1)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.caption.weight(.bold))
                                .foregroundColor(.zinc400)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .contentShape(Rectangle())
                    }
                }
            }

            if let selectedOrder {
                OrderCard(order: selectedOrder) {
                    editingOrder = selectedOrder
                }
            }
        }
        .sheet(item: $editingOrder, onDismiss: refreshSelection) { order in
            OrderEditor(order: order, allowsLocationEditing: true)
        }
    }

    private func refreshSelection() {
        guard let selectedOrder else { return }
        self.selectedOrder = store.orders.first { $0.id == selectedOrder.id }
    }
}

struct LocationSearchView: View {
    @EnvironmentObject private var store: TipTrackStore
    @State private var query = ""
    @State private var selectedLocation: TipLocation?
    @State private var editingOrder: TipOrder?

    private var matches: [TipLocation] {
        store.locations
            .filter { location in
                query.isEmpty
                    || location.address.localizedCaseInsensitiveContains(query)
                    || location.orders.contains { $0.externalId.localizedCaseInsensitiveContains(query) }
            }
            .prefix(5)
            .map { $0 }
    }

    var body: some View {
        PageScroll {
            SectionHeader(title: "Location history", subtitle: "Review repeat addresses and saved tip patterns.")

            SearchField("Enter address", text: $query)

            if store.locations.isEmpty {
                EmptyPrompt("No locations saved yet.")
            } else {
                ResultsList(items: matches, emptyText: "No location found") { location in
                    Button {
                        selectedLocation = location
                        query = location.address
                    } label: {
                        HStack(spacing: 12) {
                            AppIconTile(systemName: "building.2", tint: .tipGreen)
                            VStack(alignment: .leading, spacing: 3) {
                                Text(location.address)
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(.zinc900)
                                    .lineLimit(1)
                                Text(location.orders.map(\.externalId).joined(separator: " | "))
                                    .font(.caption)
                                    .foregroundColor(.zinc500)
                                    .lineLimit(1)
                            }
                            Spacer()
                            TipBadge(category: location.averageTip, compact: true)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .contentShape(Rectangle())
                    }
                }
            }

            if let selectedLocation {
                LocationCard(location: selectedLocation, editingOrder: $editingOrder)
            }
        }
        .sheet(item: $editingOrder, onDismiss: refreshSelection) { order in
            OrderEditor(order: order, allowsLocationEditing: false)
        }
    }

    private func refreshSelection() {
        guard let selectedLocation else { return }
        self.selectedLocation = store.locations.first { $0.id == selectedLocation.id }
    }
}

struct ReportsView: View {
    @EnvironmentObject private var store: TipTrackStore

    private var buckets: [TipBucket] {
        TipCategory.allCases.map { category in
            TipBucket(category: category, count: store.orders.filter { ($0.tip ?? 0) == category.rawValue }.count)
        }
    }

    private var maxCount: Int {
        max(buckets.map(\.count).max() ?? 0, 1)
    }

    var body: some View {
        PageScroll {
            DashboardSummary()

            if store.orders.isEmpty {
                EmptyPrompt("No report data yet.")
            } else {
                TipDistributionCard(buckets: buckets, maxCount: maxCount)
            }
        }
    }
}

struct OrderEditor: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var store: TipTrackStore
    @StateObject private var addressSearch = AddressSearch()
    @State private var address: String
    @State private var latitude: Double
    @State private var longitude: Double
    @State private var selectedTip: TipCategory
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    let order: TipOrder
    let allowsLocationEditing: Bool

    init(order: TipOrder, allowsLocationEditing: Bool) {
        self.order = order
        self.allowsLocationEditing = allowsLocationEditing
        _address = State(initialValue: order.address)
        _latitude = State(initialValue: order.latitude)
        _longitude = State(initialValue: order.longitude)
        _selectedTip = State(initialValue: TipCategory(rawValue: order.tip ?? 0) ?? .none)
    }

    var body: some View {
        NavigationView {
            ZStack {
                AppBackground()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        SectionHeader(
                            title: allowsLocationEditing ? "Edit Order #\(order.externalId)" : "Order #\(order.externalId)",
                            subtitle: order.address
                        )

                        if allowsLocationEditing {
                            AddressLookupField(
                                title: "Address",
                                address: $address,
                                latitude: $latitude,
                                longitude: $longitude,
                                search: addressSearch
                            )
                            .appCard()
                        }

                        TipPickerCard(selectedTip: $selectedTip, title: "Tip Amount")

                        if let errorMessage {
                            ErrorBanner(message: errorMessage)
                        }
                    }
                    .padding(TipTrackTheme.pagePadding)
                }
            }
            .navigationTitle(allowsLocationEditing ? "Edit Order" : "Update Tip")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(isSubmitting ? "Updating" : "Update") { update() }
                        .disabled(isSubmitting)
                }
            }
        }
    }

    private func update() {
        UIApplication.shared.dismissTipTrackKeyboard()

        let trimmedAddress = address.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !allowsLocationEditing || trimmedAddress.count >= 2 else {
            errorMessage = "Please choose a location from the list."
            return
        }

        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                try await store.updateOrder(
                    id: order.id,
                    address: allowsLocationEditing ? trimmedAddress : order.address,
                    latitude: allowsLocationEditing ? latitude : order.latitude,
                    longitude: allowsLocationEditing ? longitude : order.longitude,
                    tip: selectedTip.rawValue
                )
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }

            isSubmitting = false
        }
    }
}

private struct TipPickerCard: View {
    @Binding var selectedTip: TipCategory
    let title: String
    var subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.zinc800)
                if let subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.zinc500)
                }
            }

            VStack(spacing: 8) {
                ForEach(TipCategory.allCases) { category in
                    Button {
                        selectedTip = category
                    } label: {
                        HStack(spacing: 10) {
                            TipBadge(category: category, compact: true)
                            Text(category.label)
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(selectedTip == category ? .tipGreen : .zinc900)
                            Spacer()
                            Image(systemName: selectedTip == category ? "check.circle.fill" : "circle")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(selectedTip == category ? .tipGreen : .zinc400)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius)
                                .fill(selectedTip == category ? Color.tipGreen.opacity(0.14) : Color.zinc50)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius)
                                .strokeBorder(selectedTip == category ? Color.tipGreen : Color.zinc200, lineWidth: selectedTip == category ? 1.5 : 1)
                        )
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("\(category.label)\(selectedTip == category ? ", selected" : "")")
                }
            }
        }
        .appCard()
    }
}

private struct InitialTipPickerCard: View {
    @Binding var selectedTip: TipCategory?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                Text("Tip Amount")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.zinc800)
                Text("Choose one now, or leave it for later and update the order after delivery.")
                    .font(.caption)
                    .foregroundColor(.zinc500)
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    TipChoiceButton(
                        title: "Later",
                        systemName: "clock",
                        isSelected: selectedTip == nil
                    ) {
                        selectedTip = nil
                    }
                    .frame(width: 112)

                    ForEach(TipCategory.allCases) { category in
                        TipChoiceButton(
                            title: category.shortLabel,
                            badgeCategory: category,
                            isSelected: selectedTip == category
                        ) {
                            selectedTip = category
                        }
                        .frame(width: 112)
                    }
                }
            }
        }
        .appCard()
    }
}

private extension TipCategory {
    var shortLabel: String {
        switch self {
        case .none:
            return "No"
        case .underFive:
            return "<$5"
        case .fiveToTen:
            return "$5-10"
        case .overTen:
            return "$10+"
        case .overTwenty:
            return "$20+"
        }
    }
}

private struct TipChoiceButton: View {
    let title: String
    var systemName: String?
    var badgeCategory: TipCategory?
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let badgeCategory {
                    TipBadge(category: badgeCategory, compact: true)
                } else if let systemName {
                    AppIconTile(systemName: systemName, tint: .zinc500)
                        .scaleEffect(0.72)
                }

                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(isSelected ? .tipGreen : .zinc900)
                    .lineLimit(1)
                    .minimumScaleFactor(0.88)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Image(systemName: isSelected ? "check.circle.fill" : "circle")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(isSelected ? .tipGreen : .zinc400)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .frame(maxWidth: .infinity, minHeight: 46, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius)
                    .fill(isSelected ? Color.tipGreen.opacity(0.14) : Color.zinc50)
            )
            .overlay(
                RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius)
                    .strokeBorder(isSelected ? Color.tipGreen : Color.zinc200, lineWidth: isSelected ? 1.5 : 1)
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(title)\(isSelected ? ", selected" : "")")
    }
}

struct HelpView: View {
    var body: some View {
        GuidedTourView(
            title: "How TipTrack Works",
            subtitle: "Use your own order history to make better delivery decisions.",
            doneTitle: "Done"
        )
    }
}

struct GuidedTourView: View {
    @Environment(\.dismiss) private var dismiss

    var title = "Welcome to TipTrack"
    var subtitle = "Build a private tip history as you drive, then use it to spot the orders worth taking."
    var doneTitle = "Done"
    var onDone: (() -> Void)?

    var body: some View {
        NavigationView {
            ZStack {
                AppBackground()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        VStack(alignment: .leading, spacing: 12) {
                            AppIconTile(systemName: "sparkles", tint: .tipGreen)
                                .scaleEffect(1.16, anchor: .leading)
                            Text(title)
                                .font(.title2.weight(.bold))
                                .foregroundColor(.zinc900)
                                .fixedSize(horizontal: false, vertical: true)
                            Text(subtitle)
                                .font(.subheadline)
                                .foregroundColor(.zinc500)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .appCard()

                        VStack(spacing: 12) {
                            GuidedTourStep(
                                number: "1",
                                systemName: "shippingbox.fill",
                                tint: .tipGreen,
                                title: "Log every completed order",
                                text: "Add the order number and address as soon as you complete the delivery so the shift does not move on without it."
                            )

                            GuidedTourStep(
                                number: "2",
                                systemName: "clock.badge.checkmark",
                                tint: .tipAmber,
                                title: "Choose a tip now or later",
                                text: "If the tip is already reported, pick the range right away. If the customer tips hours later, leave Tip Amount on Later and update it when the tip appears."
                            )

                            GuidedTourStep(
                                number: "3",
                                systemName: "magnifyingglass.circle.fill",
                                tint: .tipBlue,
                                title: "Update delayed tips from Orders",
                                text: "Search the Orders screen by order number or delivery address, open the saved order, and record the tip once it is reported."
                            )

                            GuidedTourStep(
                                number: "4",
                                systemName: "building.2.fill",
                                tint: .tipGreen,
                                title: "Check locations before accepting",
                                text: "When a new offer comes in, look up the address in Locations to see how that location has tipped before and decide whether the order is worth taking."
                            )

                            GuidedTourStep(
                                number: "5",
                                systemName: "chart.pie.fill",
                                tint: .tipRose,
                                title: "Review your shift reports",
                                text: "After a few orders are saved, Reports summarizes your shift totals and tip patterns so you can learn what is working."
                            )

                            GuidedTourStep(
                                number: "6",
                                systemName: "checkmark.seal.fill",
                                tint: .tipGreen,
                                title: "Try 20 orders before Pro",
                                text: "The trial lets you save 20 orders and feel the value first. TipTrack Pro is a one-time $4.99 unlock for unlimited order logging."
                            )
                        }

                        Button {
                            finish()
                        } label: {
                            Text(doneTitle)
                                .font(.headline.weight(.semibold))
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                        .tint(.tipGreen)
                    }
                    .padding(TipTrackTheme.pagePadding)
                }
            }
            .navigationTitle(title == "Welcome to TipTrack" ? "Guided Tour" : "Help")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(doneTitle) { finish() }
                }
            }
        }
    }

    private func finish() {
        if let onDone {
            onDone()
        } else {
            dismiss()
        }
    }
}

private struct GuidedTourStep: View {
    let number: String
    let systemName: String
    let tint: Color
    let title: String
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(number)
                .font(.caption.weight(.bold))
                .foregroundColor(tint)
                .frame(width: 26, height: 26)
                .background(tint.opacity(0.12))
                .clipShape(Circle())

            AppIconTile(systemName: systemName, tint: tint)

            VStack(alignment: .leading, spacing: 5) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.zinc900)
                    .fixedSize(horizontal: false, vertical: true)
                Text(text)
                    .font(.caption)
                    .foregroundColor(.zinc500)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard()
    }
}

struct PaywallView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var monetizationStore: MonetizationStore
    @EnvironmentObject private var store: TipTrackStore

    var body: some View {
        NavigationView {
            ZStack {
                AppBackground()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        VStack(alignment: .leading, spacing: 14) {
                            AppIconTile(systemName: "checkmark.seal", tint: .tipGreen)
                                .scaleEffect(1.12, anchor: .leading)

                            VStack(alignment: .leading, spacing: 8) {
                                Text(monetizationStore.isPro ? "TipTrack Pro is active" : "Keep logging with Pro")
                                    .font(.title2.weight(.bold))
                                    .foregroundColor(.zinc900)
                                    .fixedSize(horizontal: false, vertical: true)
                                Text("Log your first 20 orders free, then upgrade when TipTrack is earning its place on your shift.")
                                    .font(.subheadline)
                                    .foregroundColor(.zinc500)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                        .appCard()

                        VStack(alignment: .leading, spacing: 12) {
                            PaywallFeatureRow(systemImage: "infinity", text: "Unlimited order logging")
                            PaywallFeatureRow(systemImage: "building.2", text: "Location history across repeat addresses")
                            PaywallFeatureRow(systemImage: "chart.pie", text: "Tip pattern reports for every saved order")
                            PaywallFeatureRow(systemImage: "checkmark.seal", text: "One-time unlock. No subscription.")
                        }
                        .appCard()

                        if monetizationStore.isPro {
                            SuccessBanner(message: "You have unlimited access on this Apple ID.")
                        } else if monetizationStore.sortedProducts.isEmpty {
                            ProductUnavailableCard()
                        } else {
                            VStack(spacing: 10) {
                                ForEach(monetizationStore.sortedProducts, id: \.id) { product in
                                    ProductOptionButton(product: product)
                                }
                            }
                        }

                        if let errorMessage = monetizationStore.errorMessage {
                            ErrorBanner(message: errorMessage)
                        }

                        Button {
                            Task {
                                await monetizationStore.restorePurchases()
                                await monetizationStore.syncActiveEntitlements(with: store)
                            }
                        } label: {
                            Text("Restore Purchases")
                                .font(.subheadline.weight(.semibold))
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.large)
                        .tint(.zinc800)
                        .disabled(monetizationStore.isLoading)

                        Text("Purchases are handled by the App Store. The one-time price is shown before confirmation and can be restored from your Apple Account.")
                            .font(.caption)
                            .foregroundColor(.zinc500)
                            .fixedSize(horizontal: false, vertical: true)
                            .padding(.horizontal, 4)
                    }
                    .padding(TipTrackTheme.pagePadding)
                }
            }
            .navigationTitle("TipTrack Pro")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
            .task {
                await monetizationStore.refreshProducts()
            }
        }
    }
}

private struct TrialStatusCard: View {
    @EnvironmentObject private var store: TipTrackStore
    @EnvironmentObject private var monetizationStore: MonetizationStore
    @Binding var showingPaywall: Bool

    var body: some View {
        HStack(spacing: 12) {
            AppIconTile(
                systemName: monetizationStore.isPro ? "checkmark.seal" : "lock.open",
                tint: monetizationStore.isPro ? .tipGreen : .tipAmber
            )

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.zinc900)
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.zinc500)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 8)

            Button {
                showingPaywall = true
            } label: {
                Text(monetizationStore.isPro ? "Active" : "Pro")
                    .font(.caption.weight(.bold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .foregroundColor(monetizationStore.isPro ? .tipGreen : .zinc900)
                    .background((monetizationStore.isPro ? Color.tipGreen : Color.tipAmber).opacity(0.12))
                    .clipShape(Capsule())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(monetizationStore.isPro ? "TipTrack Pro active" : "Upgrade to TipTrack Pro")
        }
        .appCard(padding: 12)
    }

    private var title: String {
        if monetizationStore.isPro {
            return "TipTrack Pro"
        }

        let remaining = monetizationStore.remainingFreeOrders(currentOrderCount: store.orders.count)
        return "\(remaining) free order\(remaining == 1 ? "" : "s") left"
    }

    private var subtitle: String {
        if monetizationStore.isPro {
            return "Unlimited logging is unlocked."
        }

        return "Use the log first. Upgrade when it becomes part of your shift."
    }
}

private struct ProductUnavailableCard: View {
    @EnvironmentObject private var monetizationStore: MonetizationStore

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: title, subtitle: subtitle)

            Button {
                Task {
                    await monetizationStore.refreshProducts(force: true)
                }
            } label: {
                Text(monetizationStore.isLoading ? "Loading" : "Try Again")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .tint(.tipGreen)
            .disabled(monetizationStore.isLoading)

            if let diagnostic = monetizationStore.productLoadDiagnostic {
                Text(diagnostic)
                    .font(.caption2)
                    .foregroundColor(.zinc500)
                    .fixedSize(horizontal: false, vertical: true)
                    .textSelection(.enabled)
            }
        }
        .appCard()
    }

    private var title: String {
        monetizationStore.isLoading ? "Loading TipTrack Pro" : "TipTrack Pro could not load"
    }

    private var subtitle: String {
        if monetizationStore.isLoading {
            return "The App Store is preparing the current purchase option."
        }

        return "Check your connection and try again. Purchases are loaded directly from the App Store."
    }
}

private struct ProductOptionButton: View {
    @EnvironmentObject private var monetizationStore: MonetizationStore
    @EnvironmentObject private var store: TipTrackStore
    let product: Product

    var body: some View {
        Button {
            Task {
                await monetizationStore.purchase(product)
                await monetizationStore.syncActiveEntitlements(with: store)
            }
        } label: {
            HStack(spacing: 12) {
                AppIconTile(systemName: iconName, tint: tint)
                VStack(alignment: .leading, spacing: 3) {
                    Text(product.displayName)
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(.zinc900)
                    Text(optionDetail)
                        .font(.caption)
                        .foregroundColor(.zinc500)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
                Text(product.displayPrice)
                    .font(.subheadline.weight(.bold))
                    .foregroundColor(.zinc900)
            }
            .appCard(padding: 12)
        }
        .buttonStyle(.plain)
        .disabled(monetizationStore.isLoading)
    }

    private var iconName: String {
        switch product.id {
        case MonetizationStore.unlockProductID, MonetizationStore.legacyUnlockProductID:
            return "sparkles"
        default:
            return "checkmark.seal"
        }
    }

    private var tint: Color {
        switch product.id {
        case MonetizationStore.unlockProductID:
            return .tipAmber
        case MonetizationStore.legacyUnlockProductID:
            return .tipGreen
        default:
            return .tipGreen
        }
    }

    private var optionDetail: String {
        "Pay once and keep Pro for this Apple ID."
    }
}

private struct PaywallFeatureRow: View {
    let systemImage: String
    let text: String

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: systemImage)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.tipGreen)
                .frame(width: 24)
            Text(text)
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.zinc900)
            Spacer(minLength: 0)
        }
    }
}

private struct SuccessBanner: View {
    let message: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.tipGreen)
            Text(message)
                .font(.footnote.weight(.semibold))
                .foregroundColor(.zinc900)
            Spacer(minLength: 0)
        }
        .padding(12)
        .background(Color.tipGreen.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
        .overlay(
            RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius)
                .stroke(Color.tipGreen.opacity(0.18), lineWidth: 1)
        )
    }
}

struct HelpSection: View {
    let title: String
    let text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.headline)
            Text(text)
        }
        .padding(.vertical, 6)
    }
}

private struct PageScroll<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                content
            }
            .padding(TipTrackTheme.pagePadding)
            .padding(.top, 8)
            .padding(.bottom, 96)
        }
        .background(AppBackground())
    }
}

private struct SectionHeader: View {
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.title3.weight(.bold))
                .foregroundColor(.zinc900)
            Text(subtitle)
                .font(.subheadline)
                .foregroundColor(.zinc500)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct ErrorBanner: View {
    let message: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.tipRose)
            Text(message)
                .font(.footnote.weight(.semibold))
                .foregroundColor(.zinc900)
            Spacer(minLength: 0)
        }
        .padding(12)
        .background(Color.tipRose.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
        .overlay(
            RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius)
                .stroke(Color.tipRose.opacity(0.18), lineWidth: 1)
        )
    }
}

private struct DashboardSummary: View {
    @EnvironmentObject private var store: TipTrackStore

    private var recordedTips: Int {
        store.orders.filter { $0.tip != nil }.count
    }

    private var topCategory: TipCategory {
        let categories = TipCategory.allCases
        return categories.max { left, right in
            store.orders.filter { ($0.tip ?? 0) == left.rawValue }.count
                < store.orders.filter { ($0.tip ?? 0) == right.rawValue }.count
        } ?? .none
    }

    private var topCategoryValue: String {
        switch topCategory {
        case .none:
            return "No tip"
        case .underFive:
            return "< $5"
        case .fiveToTen:
            return "$5-$10"
        case .overTen:
            return "> $10"
        case .overTwenty:
            return "> $20"
        }
    }

    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
            StatTile(title: "Orders", value: "\(store.orders.count)", systemImage: "shippingbox", tint: .tipGreen)
            StatTile(title: "Locations", value: "\(store.locations.count)", systemImage: "building.2", tint: .tipBlue)
            StatTile(title: "Tips Logged", value: "\(recordedTips)", systemImage: "checkmark.seal", tint: .tipAmber)
            StatTile(title: "Common Tip", value: topCategoryValue, systemImage: topCategory.symbolName, tint: .tipRose)
        }
    }
}

private struct RecentOrdersPreview: View {
    @EnvironmentObject private var store: TipTrackStore

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Recent orders", subtitle: "Latest saved delivery entries.")

            if store.orders.isEmpty {
                EmptyPrompt("No orders saved yet.")
            } else {
                VStack(spacing: 10) {
                    ForEach(store.orders.prefix(3)) { order in
                        HStack(spacing: 12) {
                            AppIconTile(systemName: "receipt", tint: .tipBlue)
                            VStack(alignment: .leading, spacing: 3) {
                                Text("Order #\(order.externalId)")
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(.zinc900)
                                Text(order.address)
                                    .font(.caption)
                                    .foregroundColor(.zinc500)
                                    .lineLimit(1)
                            }
                            Spacer()
                            TipBadge(category: TipCategory(rawValue: order.tip ?? -1), compact: true)
                        }
                        .appCard(padding: 12)
                    }
                }
            }
        }
    }
}

private struct TipDistributionCard: View {
    let buckets: [TipBucket]
    let maxCount: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            SectionHeader(title: "Tips by type", subtitle: "Distribution across saved orders.")

            VStack(spacing: 14) {
                ForEach(buckets) { bucket in
                    TipBucketRow(bucket: bucket, maxCount: maxCount)
                }
            }
        }
        .appCard()
    }
}

private struct TipBucketRow: View {
    let bucket: TipBucket
    let maxCount: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                TipBadge(category: bucket.category, compact: true)
                Text(bucket.category.label)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.zinc900)
                Spacer()
                Text("\(bucket.count)")
                    .font(.subheadline.weight(.bold))
                    .foregroundColor(.zinc900)
            }

            GeometryReader { proxy in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 5)
                        .fill(Color.zinc100)
                    RoundedRectangle(cornerRadius: 5)
                        .fill(rowTint)
                        .frame(width: proxy.size.width * CGFloat(bucket.count) / CGFloat(maxCount))
                }
            }
            .frame(height: 10)
        }
    }

    private var rowTint: Color {
        switch bucket.category {
        case .none:
            return .zinc400
        case .underFive:
            return .tipAmber
        case .fiveToTen:
            return .tipBlue
        case .overTen:
            return .tipGreen
        case .overTwenty:
            return .tipRose
        }
    }
}
