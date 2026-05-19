import SwiftUI

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

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationView {
                AddOrderView()
                    .appNavigationTitle("Add Order")
            }
            .tabItem { Label("Add", systemImage: "shippingbox.fill") }
            .tag(AppTab.submit)

            NavigationView {
                OrderSearchView()
                    .appNavigationTitle("Orders")
            }
            .tabItem { Label("Orders", systemImage: "magnifyingglass.circle.fill") }
            .tag(AppTab.orders)

            NavigationView {
                LocationSearchView()
                    .appNavigationTitle("Locations")
            }
            .tabItem { Label("Locations", systemImage: "building.2.fill") }
            .tag(AppTab.locations)

            NavigationView {
                ReportsView()
                    .appNavigationTitle("Reports")
            }
            .tabItem { Label("Reports", systemImage: "chart.pie.fill") }
            .tag(AppTab.reports)
        }
        .accentColor(.tipGreen)
        .safeAreaInset(edge: .top) {
            AppHeader(showingHelp: $showingHelp)
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
    @Binding var showingHelp: Bool

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "wallet.pass.fill")
                .font(.system(size: 34, weight: .bold))
            Text("Tip Track")
                .font(.largeTitle.weight(.bold))
                .lineLimit(1)
                .minimumScaleFactor(0.75)
            Spacer()
            Button {
                showingHelp = true
            } label: {
                Image(systemName: "info.circle.fill")
                    .font(.system(size: 28, weight: .semibold))
            }
            .accessibilityLabel("Help")

            Button {
                store.signOut()
            } label: {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 24, weight: .semibold))
            }
            .accessibilityLabel("Sign out")
        }
        .foregroundColor(.zinc900)
        .padding(.horizontal, 18)
        .padding(.vertical, 12)
        .background(.thinMaterial)
    }
}
