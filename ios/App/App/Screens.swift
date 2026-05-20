import AuthenticationServices
import CryptoKit
import StoreKit
import SwiftUI

struct SignInView: View {
    @EnvironmentObject private var store: TipTrackStore
    @State private var errorMessage: String?
    @State private var isSubmitting = false
    @State private var currentNonce: String?

    var body: some View {
        ZStack {
            AppBackground()

            VStack(alignment: .leading, spacing: 24) {
                Spacer()

                VStack(alignment: .leading, spacing: 18) {
                    AppIconTile(systemName: "wallet.pass", tint: .tipGreen)
                        .scaleEffect(1.2, anchor: .leading)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Tip Track")
                            .font(.system(size: 46, weight: .bold))
                            .foregroundColor(.zinc900)
                            .lineLimit(1)
                            .minimumScaleFactor(0.82)
                        Text("A shift ledger for delivery orders, locations, and tip history.")
                            .font(.headline)
                            .foregroundColor(.zinc500)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }

                VStack(alignment: .leading, spacing: 16) {
                    if let errorMessage {
                        ErrorBanner(message: errorMessage)
                    }

                    SignInWithAppleButton(.signIn) { request in
                        let nonce = randomNonce()
                        currentNonce = nonce
                        request.requestedScopes = [.fullName, .email]
                        request.nonce = sha256(nonce)
                        isSubmitting = true
                        errorMessage = nil
                    } onCompletion: { result in
                        handleAppleSignIn(result)
                    }
                    .signInWithAppleButtonStyle(.black)
                    .frame(height: 52)
                    .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
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

    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
                  let identityTokenData = credential.identityToken,
                  let identityToken = String(data: identityTokenData, encoding: .utf8),
                  let nonce = currentNonce else {
                errorMessage = "Apple did not return a valid sign-in token."
                isSubmitting = false
                return
            }

            let displayName = PersonNameComponentsFormatter().string(from: credential.fullName ?? PersonNameComponents())

            Task {
                do {
                    try await store.signInWithApple(
                        identityToken: identityToken,
                        rawNonce: nonce,
                        displayName: displayName.isEmpty ? nil : displayName
                    )
                } catch {
                    errorMessage = error.localizedDescription
                }

                isSubmitting = false
                currentNonce = nil
            }
        case .failure(let error):
            if let authorizationError = error as? ASAuthorizationError,
               authorizationError.code == .canceled {
                errorMessage = nil
            } else {
                errorMessage = error.localizedDescription
            }

            isSubmitting = false
            currentNonce = nil
        }
    }

    private func randomNonce(length: Int = 32) -> String {
        precondition(length > 0)
        let charset = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remainingLength = length

        while remainingLength > 0 {
            var random: UInt8 = 0
            let status = SecRandomCopyBytes(kSecRandomDefault, 1, &random)

            if status != errSecSuccess {
                fatalError("Unable to generate nonce.")
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

struct AddOrderView: View {
    @EnvironmentObject private var store: TipTrackStore
    @EnvironmentObject private var monetizationStore: MonetizationStore
    @StateObject private var addressSearch = AddressSearch()
    @State private var address = ""
    @State private var latitude = 0.0
    @State private var longitude = 0.0
    @State private var orderId = ""
    @State private var errorMessage: String?
    @State private var didAddOrder = false
    @State private var isSubmitting = false
    @State private var showingPaywall = false

    var body: some View {
        PageScroll {
            DashboardSummary()
            TrialStatusCard(showingPaywall: $showingPaywall)

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

                if let errorMessage {
                    ErrorBanner(message: errorMessage)
                }

                Button {
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
                    externalId: trimmedOrderId
                )
                address = ""
                latitude = 0
                longitude = 0
                orderId = ""
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
            .filter { query.isEmpty || $0.externalId.localizedCaseInsensitiveContains(query) }
            .prefix(5)
            .map { $0 }
    }

    var body: some View {
        PageScroll {
            SectionHeader(title: "Find an order", subtitle: "Search by the customer-facing order ID.")

            SearchField("Enter Order ID", text: $query)

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

                        VStack(alignment: .leading, spacing: 14) {
                            Text("Tip Amount")
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(.zinc800)

                            VStack(spacing: 8) {
                                ForEach(TipCategory.allCases) { category in
                                    Button {
                                        selectedTip = category
                                    } label: {
                                        HStack(spacing: 10) {
                                            TipBadge(category: category, compact: true)
                                            Text(category.label)
                                                .font(.subheadline.weight(.semibold))
                                                .foregroundColor(.zinc900)
                                            Spacer()
                                            if selectedTip == category {
                                                Image(systemName: "check.circle.fill")
                                                    .foregroundColor(.tipGreen)
                                            }
                                        }
                                        .padding(.vertical, 8)
                                    }
                                    .buttonStyle(.plain)

                                    if category.id != TipCategory.allCases.last?.id {
                                        Divider()
                                    }
                                }
                            }
                        }
                        .appCard()

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

struct HelpView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            List {
                HelpSection(title: "Track Orders", text: "Add each order with its delivery address.")
                HelpSection(title: "Record Tips", text: "Update the tip after delivery or at the end of a shift.")
                HelpSection(title: "Review Locations", text: "Use saved locations to spot repeat addresses and average tip patterns.")
            }
            .navigationTitle("Help")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
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

        return "Use the ledger first. Upgrade when it becomes part of your shift."
    }
}

private struct ProductUnavailableCard: View {
    @EnvironmentObject private var monetizationStore: MonetizationStore

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Pro plans are loading", subtitle: "The App Store is preparing the current purchase options.")

            Button {
                Task {
                    await monetizationStore.refreshProducts()
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
        }
        .appCard()
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
        case MonetizationStore.unlockProductID:
            return "sparkles"
        default:
            return "checkmark.seal"
        }
    }

    private var tint: Color {
        switch product.id {
        case MonetizationStore.unlockProductID:
            return .tipAmber
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
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
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
