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
    @State private var selectedTab = AppTab.submit
    @State private var showingHelp = false

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
            AppHeader(selectedTab: selectedTab, showingHelp: $showingHelp)

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
        .task {
            try? await store.refreshOrders()
        }
    }
}

struct AppHeader: View {
    @EnvironmentObject private var store: TipTrackStore
    let selectedTab: AppTab
    @Binding var showingHelp: Bool

    var body: some View {
        HStack(spacing: 12) {
            AppIconTile(systemName: selectedTab.systemImage, tint: .tipGreen)
            VStack(alignment: .leading, spacing: 2) {
                Text(selectedTab.title)
                    .font(.title2.weight(.bold))
                    .foregroundColor(.zinc900)
                    .lineLimit(1)
                Text(store.session.displayName ?? "Tip Track")
                    .font(.caption.weight(.medium))
                    .foregroundColor(.zinc500)
                    .lineLimit(1)
            }
            Spacer()
            Button {
                showingHelp = true
            } label: {
                Image(systemName: "info.circle")
                    .font(.system(size: 18, weight: .semibold))
                    .frame(width: 36, height: 36)
                    .background(Color.zinc100)
                    .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
            }
            .accessibilityLabel("Help")

            Button {
                store.signOut()
            } label: {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 18, weight: .semibold))
                    .frame(width: 36, height: 36)
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
