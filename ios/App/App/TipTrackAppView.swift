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
        .preferredColorScheme(.light)
    }
}

struct AppShell: View {
    @EnvironmentObject private var store: TipTrackStore
    @EnvironmentObject private var monetizationStore: MonetizationStore
    @State private var selectedTab = AppTab.submit
    @AppStorage("tipTrackHasSeenGuidedTour") private var hasSeenGuidedTour = false
    @State private var showingHelp = false
    @State private var showingPaywall = false
    @State private var showingAccount = false
    @State private var showingGuidedTour = false

    init() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(Color.white)
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
                AddOrderView()
                    .tabItem { Label("Add", systemImage: "shippingbox.fill") }
                    .tag(AppTab.submit)

                OrderSearchView()
                    .tabItem { Label("Orders", systemImage: "magnifyingglass.circle.fill") }
                    .tag(AppTab.orders)

                LocationSearchView()
                    .tabItem { Label("Locations", systemImage: "building.2.fill") }
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
    }

    private func markGuidedTourSeen() {
        hasSeenGuidedTour = true
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

    private let headerIconSize: CGFloat = 36
    private let actionButtonSize: CGFloat = 34

    var body: some View {
        HStack(spacing: 8) {
            AppIconTile(systemName: selectedTab.systemImage, tint: .tipGreen)
                .frame(width: headerIconSize, height: headerIconSize)
            VStack(alignment: .leading, spacing: 2) {
                Text(selectedTab.title)
                    .font(.title2.weight(.bold))
                    .foregroundColor(.zinc900)
                    .lineLimit(1)
                    .minimumScaleFactor(0.82)
                    .layoutPriority(2)
                Text(store.session.displayName ?? "Tip Track")
                    .font(.caption.weight(.medium))
                    .foregroundColor(.zinc500)
                    .lineLimit(1)
                    .minimumScaleFactor(0.88)
            }
            .layoutPriority(1)
            Spacer()
            Button {
                showingPaywall = true
            } label: {
                Image(systemName: monetizationStore.isPro ? "checkmark.seal.fill" : "lock.open")
                    .font(.system(size: 18, weight: .semibold))
                    .frame(width: actionButtonSize, height: actionButtonSize)
                    .background(monetizationStore.isPro ? Color.tipGreen.opacity(0.12) : Color.zinc100)
                    .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
            }
            .foregroundColor(monetizationStore.isPro ? .tipGreen : .zinc900)
            .accessibilityLabel(monetizationStore.isPro ? "TipTrack Pro active" : "Upgrade to TipTrack Pro")

            Button {
                showingAccount = true
            } label: {
                Image(systemName: "person.crop.circle")
                    .font(.system(size: 18, weight: .semibold))
                    .frame(width: actionButtonSize, height: actionButtonSize)
                    .background(Color.zinc100)
                    .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
            }
            .accessibilityLabel("Account")

            Button {
                showingHelp = true
            } label: {
                Image(systemName: "info.circle")
                    .font(.system(size: 18, weight: .semibold))
                    .frame(width: actionButtonSize, height: actionButtonSize)
                    .background(Color.zinc100)
                    .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
            }
            .accessibilityLabel("Help")

            Button {
                showingSignOutConfirmation = true
            } label: {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 18, weight: .semibold))
                    .frame(width: actionButtonSize, height: actionButtonSize)
                    .background(Color.zinc100)
                    .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
            }
            .accessibilityLabel("Sign out")
        }
        .foregroundColor(.zinc900)
        .padding(.horizontal, TipTrackTheme.pagePadding)
        .padding(.vertical, 10)
        .background(Color.white.opacity(0.96))
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(Color.zinc200)
                .frame(height: 1)
        }
        .confirmationDialog("Sign out?", isPresented: $showingSignOutConfirmation, titleVisibility: .visible) {
            Button("Sign out", role: .destructive) {
                store.signOut()
            }
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
