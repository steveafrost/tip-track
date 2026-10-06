import SwiftUI
import UIKit

struct TipTrackAppView: View {
    @EnvironmentObject private var store: TipTrackStore

    var body: some View {
        Group {
            if store.session.isSignedIn {
                AppShell()
            } else {
                SignInView()
            }
        }
    }
}

struct AppShell: View {
    @EnvironmentObject private var store: TipTrackStore
    @EnvironmentObject private var monetizationStore: MonetizationStore
    @StateObject private var intentRouter = TipTrackIntentRouter.shared
    @State private var selectedTab = AppTab.submit
    @State private var intentOrderDraft: TipTrackOrderDraft?
    @State private var intentOrderID: String?
    @State private var intentLocationAddress: String?
    @AppStorage("tipTrackHasSeenGuidedTour") private var hasSeenGuidedTour = false
    @State private var showingHelp = false
    @State private var showingPaywall = false
    @State private var showingAccount = false
    @State private var showingGuidedTour = false

    init() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor.systemBackground
        appearance.shadowColor = UIColor(Color.zinc200)
        UITabBar.appearance().standardAppearance = appearance
        if #available(iOS 15.0, *) {
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            AppHeader(
                selectedTab: selectedTab,
                showingHelp: $showingHelp,
                showingPaywall: $showingPaywall,
                showingAccount: $showingAccount
            )

            TabView(selection: $selectedTab) {
                AddOrderView(intentDraft: $intentOrderDraft)
                    .tabItem { Label("Add", systemImage: "shippingbox") }
                    .tag(AppTab.submit)

                OrderSearchView(intentOrderID: $intentOrderID)
                    .tabItem { Label("Orders", systemImage: "magnifyingglass") }
                    .tag(AppTab.orders)

                LocationSearchView(intentLocationAddress: $intentLocationAddress)
                    .tabItem { Label("Locations", systemImage: "building.2") }
                    .tag(AppTab.locations)

                ReportsView()
                    .tabItem { Label("Reports", systemImage: "chart.pie.fill") }
                    .tag(AppTab.reports)
            }
            .accentColor(.tipGreen)
        }
        .sheet(isPresented: $showingHelp) {
            HelpView()
        }
        .sheet(isPresented: $showingPaywall) {
            PaywallView()
        }
        .sheet(isPresented: $showingAccount) {
            AccountConnectionsView()
        }
        .sheet(isPresented: $showingGuidedTour, onDismiss: markGuidedTourSeen) {
            GuidedTourView(doneTitle: "Start Logging") {
                markGuidedTourSeen()
                showingGuidedTour = false
            }
        }
        .onAppear {
            if !hasSeenGuidedTour {
                showingGuidedTour = true
            }
        }
        .task {
            await monetizationStore.start()
            await monetizationStore.syncActiveEntitlements(with: store)
            try? await store.refreshOrders()
        }
        .onReceive(intentRouter.$route.compactMap { $0 }) { route in
            handleIntentRoute(route)
        }
    }

    private func markGuidedTourSeen() {
        hasSeenGuidedTour = true
    }

    private func handleIntentRoute(_ route: TipTrackIntentRoute) {
        switch route.destination {
        case .tab(let tab):
            selectedTab = tab
        case .addOrder(let draft):
            selectedTab = .submit
            intentOrderDraft = draft
        case .order(let id):
            selectedTab = .orders
            intentOrderID = id
        case .location(let address):
            selectedTab = .locations
            intentLocationAddress = address
        }
    }
}

struct AppHeader: View {
    @EnvironmentObject private var store: TipTrackStore
    @EnvironmentObject private var monetizationStore: MonetizationStore
    let selectedTab: AppTab
    @Binding var showingHelp: Bool
    @Binding var showingPaywall: Bool
    @Binding var showingAccount: Bool
    @State private var showingSignOutConfirmation = false

    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack(alignment: .center, spacing: 10) {
                Text(selectedTab.title)
                    .font(dynamicTypeSize.isAccessibilitySize ? .headline : .title.weight(.bold))
                    .foregroundStyle(Color.zinc900)
                    .fixedSize(horizontal: false, vertical: true)
                    .accessibilityAddTraits(.isHeader)
                Spacer(minLength: 4)
                Menu {
                    Button("Account", systemImage: "person.crop.circle") { showingAccount = true }
                    Button(monetizationStore.isPro ? "TipTrack Pro active" : "Upgrade to TipTrack Pro", systemImage: "checkmark.seal") { showingPaywall = true }
                    Button("Sign out", systemImage: "rectangle.portrait.and.arrow.right", role: .destructive) { showingSignOutConfirmation = true }
                } label: {
                    Image(systemName: "person.crop.circle")
                        .font(.system(size: 22))
                        .frame(width: 44, height: 44)
                        .background(Color.zinc100, in: Circle())
                }
                .accessibilityLabel("Account and Pro options")
                Button { showingHelp = true } label: {
                    Image(systemName: "questionmark.circle")
                        .font(.system(size: 22))
                        .frame(width: 44, height: 44)
                        .background(Color.zinc100, in: Circle())
                }
                .accessibilityLabel("Help")
            }
            if selectedTab == .submit && !dynamicTypeSize.isAccessibilitySize {
                Text("Log the order before the shift moves on.")
                    .font(.footnote)
                    .foregroundStyle(Color.zinc500)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .foregroundStyle(Color.zinc900)
        .padding(.horizontal, 18)
        .padding(.top, 12)
        .padding(.bottom, 16)
        .background(Color.appBackground)
        .confirmationDialog("Sign out?", isPresented: $showingSignOutConfirmation, titleVisibility: .visible) {
            Button("Sign out", role: .destructive) { store.signOut() }
            Button("Cancel", role: .cancel) {}
        }
    }
}

extension AppTab {
    var title: String {
        switch self {
        case .submit:
            return "Add Order"
        case .orders:
            return "Orders"
        case .locations:
            return "Locations"
        case .reports:
            return "Reports"
        }
    }

    var systemImage: String {
        switch self {
        case .submit:
            return "shippingbox"
        case .orders:
            return "magnifyingglass"
        case .locations:
            return "building.2"
        case .reports:
            return "chart.pie"
        }
    }
}
