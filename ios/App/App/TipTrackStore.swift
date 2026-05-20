import Combine
import Foundation

@MainActor
final class TipTrackStore: ObservableObject {
    @Published private(set) var session: DriverSession
    @Published private var allOrders: [TipOrder]

    private let apiClient: TipTrackAPIClient?
    private let sessionKey = "tip-track.session"
    private let ordersKey = "tip-track.orders"
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    var isCloudSyncEnabled: Bool {
        apiClient != nil
    }

    var orders: [TipOrder] {
        guard let userId = session.userId else { return [] }
        return allOrders.filter { $0.createdBy == userId }
    }

    var locations: [TipLocation] {
        Dictionary(grouping: orders, by: \.address)
            .map { address, orders in
                let first = orders.first
                return TipLocation(
                    address: address,
                    latitude: first?.latitude ?? 0,
                    longitude: first?.longitude ?? 0,
                    orders: orders.sorted { $0.createdAt > $1.createdAt }
                )
            }
            .sorted { $0.address.localizedCaseInsensitiveCompare($1.address) == .orderedAscending }
    }

    init(defaults: UserDefaults = .standard) {
        decoder.dateDecodingStrategy = .iso8601
        encoder.dateEncodingStrategy = .iso8601
        apiClient = TipTrackAPIConfiguration.bundled.map {
            TipTrackAPIClient(configuration: $0)
        }

#if DEBUG
        if ProcessInfo.processInfo.arguments.contains("--tiptrack-demo-data") {
            session = DriverSession(
                userId: "app-store-demo",
                displayName: "App Store Demo",
                sessionToken: "demo-session"
            )
            allOrders = TipTrackStore.makeDemoOrders()
            return
        }
#endif

        if let sessionData = defaults.data(forKey: sessionKey),
           let decodedSession = try? decoder.decode(DriverSession.self, from: sessionData) {
            session = decodedSession
        } else {
            session = DriverSession(userId: nil, displayName: nil, sessionToken: nil)
        }

        if let orderData = defaults.data(forKey: ordersKey),
           let decodedOrders = try? decoder.decode([TipOrder].self, from: orderData) {
            allOrders = decodedOrders.sorted { $0.createdAt > $1.createdAt }
        } else {
            allOrders = []
        }
    }

    func signInWithApple(identityToken: String, rawNonce: String, displayName: String?) async throws {
        guard let apiClient else {
            throw TipTrackAPIError.server("Cloud sync is not configured.")
        }

        session = try await apiClient.signInWithApple(
            identityToken: identityToken,
            rawNonce: rawNonce,
            displayName: displayName
        )
        saveSession()
        try await refreshOrders()
    }

    func signOut() {
        session = DriverSession(userId: nil, displayName: nil, sessionToken: nil)
        saveSession()
    }

    func hasOrder(externalId: String) -> Bool {
        orders.contains { $0.externalId.caseInsensitiveCompare(externalId) == .orderedSame }
    }

    func refreshOrders() async throws {
        guard let apiClient, session.isSignedIn else { return }
        allOrders = try await apiClient.fetchOrders(session: session)
        saveOrders()
    }

    func fetchAppleEntitlement() async throws -> StoreKitEntitlement? {
        guard let apiClient, session.isSignedIn else { return nil }
        return try await apiClient.fetchAppleEntitlement(session: session)
    }

    func syncAppleEntitlement(signedTransactionInfo: String) async throws -> StoreKitEntitlement? {
        guard let apiClient, session.isSignedIn else { return nil }
        return try await apiClient.syncAppleEntitlement(
            session: session,
            signedTransactionInfo: signedTransactionInfo
        )
    }

    func addOrder(address: String, latitude: Double, longitude: Double, externalId: String) async throws {
        guard let userId = session.userId else { return }

        if let apiClient {
            let order = try await apiClient.addOrder(
                session: session,
                address: address,
                latitude: latitude,
                longitude: longitude,
                externalId: externalId
            )
            upsert(order: order)
            saveOrders()

            return
        }

        let now = Date()
        let order = TipOrder(
            id: UUID().uuidString,
            externalId: externalId,
            address: address,
            latitude: latitude,
            longitude: longitude,
            tip: nil,
            createdBy: userId,
            createdAt: now,
            updatedAt: now
        )
        allOrders.insert(order, at: 0)
        saveOrders()
    }

    func updateOrder(id: String, address: String, latitude: Double, longitude: Double, tip: Int) async throws {
        guard let index = allOrders.firstIndex(where: { $0.id == id }) else { return }

        if let apiClient {
            let order = try await apiClient.updateOrder(
                session: session,
                order: allOrders[index],
                address: address,
                latitude: latitude,
                longitude: longitude,
                tip: tip
            )
            upsert(order: order)
            saveOrders()

            return
        }

        allOrders[index].address = address
        allOrders[index].latitude = latitude
        allOrders[index].longitude = longitude
        allOrders[index].tip = tip
        allOrders[index].updatedAt = Date()
        saveOrders()
    }

    private func upsert(order: TipOrder) {
        if let index = allOrders.firstIndex(where: { $0.id == order.id }) {
            allOrders[index] = order
        } else {
            allOrders.insert(order, at: 0)
        }
    }

    private func saveSession() {
        if let data = try? encoder.encode(session) {
            UserDefaults.standard.set(data, forKey: sessionKey)
        }
    }

    private func saveOrders() {
        if let data = try? encoder.encode(allOrders) {
            UserDefaults.standard.set(data, forKey: ordersKey)
        }
    }

#if DEBUG
    private static func makeDemoOrders() -> [TipOrder] {
        let formatter = ISO8601DateFormatter()
        return [
            TipOrder(
                id: "demo-1",
                externalId: "A1042",
                address: "315 Liberty St, Ann Arbor, MI",
                latitude: 42.2798,
                longitude: -83.7487,
                tip: 3,
                createdBy: "app-store-demo",
                createdAt: formatter.date(from: "2026-05-19T13:15:00Z") ?? Date(),
                updatedAt: formatter.date(from: "2026-05-19T13:45:00Z") ?? Date()
            ),
            TipOrder(
                id: "demo-2",
                externalId: "B2198",
                address: "515 E Washington St, Ann Arbor, MI",
                latitude: 42.2804,
                longitude: -83.7427,
                tip: 2,
                createdBy: "app-store-demo",
                createdAt: formatter.date(from: "2026-05-19T12:20:00Z") ?? Date(),
                updatedAt: formatter.date(from: "2026-05-19T12:50:00Z") ?? Date()
            ),
            TipOrder(
                id: "demo-3",
                externalId: "C3307",
                address: "315 Liberty St, Ann Arbor, MI",
                latitude: 42.2798,
                longitude: -83.7487,
                tip: 4,
                createdBy: "app-store-demo",
                createdAt: formatter.date(from: "2026-05-18T18:05:00Z") ?? Date(),
                updatedAt: formatter.date(from: "2026-05-18T18:30:00Z") ?? Date()
            )
        ]
    }
#endif
}
